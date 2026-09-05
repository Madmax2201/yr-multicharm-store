import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const coupons = await (prisma.coupon.findMany as any)({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(coupons);
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  const coupon = await (prisma.coupon.create as any)({
    data: {
      code: data.code.toUpperCase(),
      discount: parseFloat(data.discount),
      type: data.type || "PERCENTAGE",
      minAmount: data.minAmount ? parseFloat(data.minAmount) : null,
      maxUses: data.maxUses ? parseInt(data.maxUses) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: data.isActive !== false,
    },
  });

  return NextResponse.json(coupon, { status: 201 });
}
