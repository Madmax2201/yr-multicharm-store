import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [products, reviewAggs] = await Promise.all([
    (prisma.product.findMany as any)({
      where: { isActive: true, featured: true },
      take: 8,
      include: {
        variants: true,
        _count: { select: { reviews: true } },
      },
    }),
    prisma.review.groupBy({
      by: ["productId"],
      _avg: { rating: true },
    }),
  ]);

  const ratingMap = new Map(
    reviewAggs.map((r: any) => [r.productId, r._avg.rating])
  );

  const productsWithRating = (products as any[]).map((p: any) => ({
    ...p,
    avgRating: ratingMap.get(p.id) ?? null,
    reviewCount: p._count?.reviews || 0,
  }));

  return NextResponse.json(productsWithRating, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
