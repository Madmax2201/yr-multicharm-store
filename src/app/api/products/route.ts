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

  const [products, total] = await Promise.all([
    (prisma.product.findMany as any)({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { variants: true, reviews: true },
    }),
    (prisma.product.count as any)({ where }),
  ]);

  const productsWithRating = (products as any[]).map((p: any) => {
    const avgRating =
      p.reviews?.length > 0
        ? p.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / p.reviews.length
        : null;
    return { ...p, avgRating, reviewCount: p.reviews?.length || 0 };
  });

  return NextResponse.json({
    products: productsWithRating,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
