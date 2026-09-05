import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const data = await request.json();

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      price: typeof data.price === "string" ? parseFloat(data.price) : Number(data.price),
      comparePrice: data.comparePrice ? (typeof data.comparePrice === "string" ? parseFloat(data.comparePrice) : Number(data.comparePrice)) : null,
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

  if (data.variants) {
    await prisma.productVariant.deleteMany({ where: { productId: id } });
    if (data.variants.length) {
      await prisma.productVariant.createMany({
        data: data.variants.map((v: any) => ({
          productId: id,
          name: v.name,
          price: v.price ? parseFloat(v.price) : null,
          stock: parseInt(v.stock || "0"),
          sku: v.sku || `${id}-${v.name.replace(/\s+/g, "-").toLowerCase()}`,
        })),
      });
    }
  }

  return NextResponse.json(product);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.productVariant.deleteMany({ where: { productId: id } });
  await prisma.review.deleteMany({ where: { productId: id } });
  await prisma.wishlistItem.deleteMany({ where: { productId: id } });
  await prisma.orderItem.deleteMany({ where: { productId: id } });
  await prisma.couponProduct.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, reviews: { include: { user: { select: { name: true } } } } },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
