import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, rating, comment } = await request.json();

  if (!productId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Invalid rating (1-5 required)" },
      { status: 400 }
    );
  }

  const existing = await (prisma.review.findUnique as any)({
    where: { userId_productId: { userId: user.userId, productId } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You already reviewed this product" },
      { status: 400 }
    );
  }

  const review = await (prisma.review.create as any)({
    data: {
      rating,
      comment,
      userId: user.userId,
      productId,
    },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json(review, { status: 201 });
}
