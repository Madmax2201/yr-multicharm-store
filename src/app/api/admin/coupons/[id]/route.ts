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

  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      code: data.code?.toUpperCase(),
      discount: data.discount ? parseFloat(data.discount) : undefined,
      type: data.type,
      minAmount: data.minAmount !== undefined ? parseFloat(data.minAmount) : null,
      maxUses: data.maxUses !== undefined ? parseInt(data.maxUses) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: data.isActive,
    },
  });

  return NextResponse.json(coupon);
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
  await prisma.couponProduct.deleteMany({ where: { couponId: id } });
  await prisma.coupon.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
