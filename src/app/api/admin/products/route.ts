import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const [products, total] = await Promise.all([
    (prisma.product.findMany as any)({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { variants: true, _count: { select: { reviews: true, orderItems: true } } },
    }),
    (prisma.product.count as any)(),
  ]);

  return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  const product = await (prisma.product.create as any)({
    data: {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
      images: typeof data.images === "string" ? data.images : JSON.stringify(data.images || ["/placeholder.svg"]),
      category: data.category,
      subcategory: data.subcategory || null,
      brand: data.brand || null,
      ingredients: data.ingredients || null,
      howToUse: data.howToUse || null,
      stock: parseInt(data.stock || "0"),
      featured: data.featured || false,
      isActive: data.isActive !== false,
    },
  });

  if (data.variants?.length) {
    await prisma.productVariant.createMany({
      data: data.variants.map((v: any) => ({
        productId: product.id,
        name: v.name,
        price: v.price ? parseFloat(v.price) : null,
        stock: parseInt(v.stock || "0"),
        sku: v.sku || `${product.id}-${v.name.replace(/\s+/g, "-").toLowerCase()}`,
      })),
    });
  }

  return NextResponse.json(product, { status: 201 });
}
