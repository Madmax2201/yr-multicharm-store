import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const products = await (prisma.product.findMany as any)({
    where: { isActive: true, featured: true },
    take: 8,
    include: { reviews: true, variants: true },
  });

  const productsWithRating = (products as any[]).map((p: any) => {
    const avgRating =
      p.reviews?.length > 0
        ? p.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / p.reviews.length
        : null;
    return { ...p, avgRating, reviewCount: p.reviews?.length || 0 };
  });

  return NextResponse.json(productsWithRating, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
