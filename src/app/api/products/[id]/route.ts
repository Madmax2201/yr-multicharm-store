import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
        product.reviews.length
      : null;

  return NextResponse.json({ ...product, avgRating }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
