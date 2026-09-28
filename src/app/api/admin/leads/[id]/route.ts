import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const VALID_STATUS = ["PENDING", "APPROVED", "REJECTED", "CONTACTED"];

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

  if (data.status && !VALID_STATUS.includes(data.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(data.status ? { status: data.status } : {}),
      ...(data.notes !== undefined
        ? { notes: data.notes ? String(data.notes).trim() || null : null }
        : {}),
    },
  });

  return NextResponse.json(lead);
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
  await prisma.lead.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
