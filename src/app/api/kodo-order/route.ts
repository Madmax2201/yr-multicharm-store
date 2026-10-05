import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Order endpoint for the standalone KODO landing page served at /kodo.
 *
 * The static page posts { fullName, phone, wilaya, municipality, address }.
 * This route validates that shape server side and stores it as a Lead, so
 * orders still land in the same admin inbox as /api/leads.
 *
 * The client supplied priceDzd is deliberately ignored: product and price are
 * set on the server, never trusted from the browser.
 */

const PHONE_RE = /^[0-9+\s().-]{6,20}$/;

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

function text(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (tooManyFrom(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = text(body.fullName, 100);
  const phone = text(body.phone, 20);
  const wilaya = text(body.wilaya, 60);
  const municipality = text(body.municipality, 60);
  const address = text(body.address, 180);

  if (name.length < 2) {
    return NextResponse.json(
      { error: "Please enter your full name." },
      { status: 400 }
    );
  }
  if (!PHONE_RE.test(phone)) {
    return NextResponse.json(
      { error: "Please enter a valid phone number." },
      { status: 400 }
    );
  }
  if (!wilaya) {
    return NextResponse.json(
      { error: "Please select your wilaya." },
      { status: 400 }
    );
  }

  const details = [
    municipality && `البلدية: ${municipality}`,
    address && `العنوان: ${address}`,
  ].filter(Boolean);

  const lead = await prisma.lead.create({
    data: {
      name,
      phone,
      wilaya,
      quantity: 1,
      message: ["KODO", ...details].join(" — "),
      status: "PENDING",
    },
  });

  return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
}
