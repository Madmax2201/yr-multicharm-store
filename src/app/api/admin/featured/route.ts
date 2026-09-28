import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const MAX_FEATURED = 4;

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, images: true, featured: true, stock: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ids } = await request.json();

  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "ids must be an array" }, { status: 400 });
  }

  const selected = [...new Set(ids.filter((id: any) => typeof id === "string"))];

  if (selected.length > MAX_FEATURED) {
    return NextResponse.json(
      { error: `You can feature at most ${MAX_FEATURED} products` },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.product.updateMany({
      where: { featured: true, id: { notIn: selected } },
      data: { featured: false },
    }),
    ...selected.map((id) =>
      prisma.product.update({ where: { id }, data: { featured: true } })
    ),
  ]);

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, images: true, featured: true, stock: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}
