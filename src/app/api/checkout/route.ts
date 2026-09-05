import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmation } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { items, fullName, email, street, city, state, zipCode, phone, notes, couponCode } =
      await request.json();

    if (!items?.length || !fullName || !street || !city || !state || !zipCode || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let total = 0;
    let discount = 0;

    for (const item of items) {
      const product = await (prisma.product.findUnique as any)({
        where: { id: item.productId },
      });
      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found or inactive` },
          { status: 400 }
        );
      }

      let itemPrice = product.price;
      if (item.variantId) {
        const variant = await (prisma.productVariant.findUnique as any)({
          where: { id: item.variantId },
        });
        if (variant) {
          itemPrice = variant.price ?? product.price;
        }
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      total += itemPrice * item.quantity;
    }

    if (couponCode) {
      const coupon = await (prisma.coupon.findUnique as any)({
        where: { code: couponCode },
      });
      if (
        coupon &&
        coupon.isActive &&
        (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) &&
        (!coupon.maxUses || coupon.usedCount < coupon.maxUses) &&
        (!coupon.minAmount || total >= coupon.minAmount)
      ) {
        if (coupon.type === "PERCENTAGE") {
          discount = total * (coupon.discount / 100);
        } else {
          discount = coupon.discount;
        }
        discount = Math.min(discount, total);

        await (prisma.coupon.update as any)({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    const orderNumber = generateOrderNumber();
    const finalTotal = total - discount;

    const order = await (prisma.order.create as any)({
      data: {
        orderNumber,
        userId: user?.userId || null,
        total: finalTotal,
        discount,
        couponCode,
        paymentMethod: "COD",
        paymentStatus: "UNPAID",
        fullName,
        street,
        city,
        state,
        zipCode,
        phone,
        notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            productName: item.productName,
            variantName: item.variantName || null,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    for (const item of items) {
      await (prisma.product.update as any)({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const customerEmail = email || (user ? (await (prisma.user.findUnique as any)({ where: { id: user.userId } }))?.email : null);

    if (customerEmail) {
      sendOrderConfirmation({
        orderNumber,
        email: customerEmail,
        fullName,
        total: finalTotal,
        items: (order.items as any[]).map((i: any) => ({
          productName: i.productName,
          quantity: i.quantity,
          price: i.price,
        })),
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
