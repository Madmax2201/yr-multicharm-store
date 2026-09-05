import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await params;

  const item = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: { userId: user.userId, productId },
    },
  });

  return NextResponse.json({ wishlisted: !!item });
}
