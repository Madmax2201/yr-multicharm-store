import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const brand = searchParams.get("brand");

  const where: any = { isActive: true };

  if (category) where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { brand: { contains: search } },
    ];
  }
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }
  if (brand) where.brand = brand;

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };
  if (sort === "name") orderBy = { name: "asc" };

  const [products, total, reviewAggs] = await Promise.all([
    (prisma.product.findMany as any)({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        variants: true,
        _count: { select: { reviews: true } },
      },
    }),
    (prisma.product.count as any)({ where }),
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

  return NextResponse.json({
    products: productsWithRating,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
