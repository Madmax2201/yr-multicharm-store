import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(brands, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
  });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, slug } = await request.json();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const finalSlug = slug || String(name).toLowerCase().trim().replace(/\s+/g, "-");

  const existing = await prisma.brand.findUnique({ where: { slug: finalSlug } });
  if (existing) {
    return NextResponse.json({ error: "A brand with this slug already exists" }, { status: 400 });
  }

  const brand = await prisma.brand.create({ data: { name, slug: finalSlug } });

  return NextResponse.json(brand, { status: 201 });
}
