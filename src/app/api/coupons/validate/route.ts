import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { code, total } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    const coupon = await (prisma.coupon.findUnique as any)({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 400 }
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { error: "This coupon is no longer active" },
        { status: 400 }
      );
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This coupon has expired" },
        { status: 400 }
      );
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { error: "This coupon has reached its usage limit" },
        { status: 400 }
      );
    }

    if (coupon.minAmount && total < coupon.minAmount) {
      return NextResponse.json(
        {
          error: `Minimum order amount of $${coupon.minAmount.toFixed(2)} required`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = total * (coupon.discount / 100);
    } else {
      discount = coupon.discount;
    }

    return NextResponse.json({
      valid: true,
      discount: Math.min(discount, total),
      coupon: {
        code: coupon.code,
        type: coupon.type,
        discount: coupon.discount,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
