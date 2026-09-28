import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PHONE_RE = /^[0-9+\s().-]{6,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Keeps a single browser from flooding the inbox.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const recent = new Map<string, number[]>();

function tooManyFrom(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > RATE_LIMIT;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (tooManyFrom(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "").trim();
  const wilaya = String(body.wilaya || "").trim();
  const message = String(body.message || "").trim();
  const quantityRaw = body.quantity;
  const quantity =
    quantityRaw === "" || quantityRaw == null ? null : parseInt(quantityRaw, 10);

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  }
  if (!PHONE_RE.test(phone)) {
    return NextResponse.json(
      { error: "Please enter a valid phone number." },
      { status: 400 }
    );
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (quantity != null && (Number.isNaN(quantity) || quantity < 1 || quantity > 10000)) {
    return NextResponse.json({ error: "Please enter a valid quantity." }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      name,
      phone,
      email: email || null,
      wilaya: wilaya || null,
      quantity: Number.isNaN(quantity as number) ? null : quantity,
      message: message || null,
      status: "PENDING",
    },
  });

  return NextResponse.json(
    { success: true, id: lead.id },
    { status: 201 }
  );
}
