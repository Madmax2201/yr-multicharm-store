import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await (prisma.wishlistItem.findMany as any)({
    where: { userId: user.userId },
    include: {
      product: {
        include: { reviews: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const itemsWithRating = (items as any[]).map((item: any) => {
    const avgRating =
      item.product?.reviews?.length > 0
        ? item.product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          item.product.reviews.length
        : null;
    return { ...item, product: { ...item.product, avgRating } };
  });

  return NextResponse.json(itemsWithRating);
}

export async function POST(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await request.json();

  const existing = await (prisma.wishlistItem.findUnique as any)({
    where: { userId_productId: { userId: user.userId, productId } },
  });

  if (existing) {
    await (prisma.wishlistItem.delete as any)({ where: { id: existing.id } });
    return NextResponse.json({ wishlisted: false });
  }

  await (prisma.wishlistItem.create as any)({
    data: { userId: user.userId, productId },
  });

  return NextResponse.json({ wishlisted: true });
}
