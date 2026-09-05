import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { fullName, street, city, state, zipCode, phone, isDefault } =
    await request.json();

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.userId },
      data: { isDefault: false },
    });
  }

  const address = await (prisma.address.update as any)({
    where: { id, userId: user.userId },
    data: { fullName, street, city, state, zipCode, phone, isDefault },
  });

  return NextResponse.json(address);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await (prisma.address.delete as any)({
    where: { id, userId: user.userId },
  });

  return NextResponse.json({ success: true });
}
