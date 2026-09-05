import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const addresses = await (prisma.address.findMany as any)({
    where: { userId: user.userId },
    orderBy: { isDefault: "desc" },
  });

  return NextResponse.json(addresses);
}

export async function POST(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fullName, street, city, state, zipCode, phone, isDefault } =
    await request.json();

  if (!fullName || !street || !city || !state || !zipCode || !phone) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.userId },
      data: { isDefault: false },
    });
  }

  const address = await (prisma.address.create as any)({
    data: {
      fullName,
      street,
      city,
      state,
      zipCode,
      phone,
      isDefault: isDefault || false,
      userId: user.userId,
    },
  });

  return NextResponse.json(address, { status: 201 });
}
