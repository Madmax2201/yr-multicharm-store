import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      address: true,
    },
  });

  if (!order || (order.userId !== user.userId && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...order,
    fullName: order.address?.fullName || "",
    street: order.address?.street || "",
    city: order.address?.city || "",
    state: order.address?.state || "",
    zipCode: order.address?.zipCode || "",
    phone: order.address?.phone || "",
  });
}
