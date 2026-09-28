import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const VALID_STATUS = ["PENDING", "APPROVED", "REJECTED", "CONTACTED"];

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: any = {};
  if (status && status !== "ALL") {
    if (!VALID_STATUS.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    where.status = status;
  }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
      { wilaya: { contains: search } },
    ];
  }

  const [leads, counts] = await Promise.all([
    (prisma.lead.findMany as any)({
      where,
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    (prisma.lead.groupBy as any)({ by: ["status"], _count: { _all: true } }),
  ]);

  const summary = { PENDING: 0, APPROVED: 0, REJECTED: 0, CONTACTED: 0, total: 0 };
  for (const c of counts) {
    const key = c.status as keyof typeof summary;
    if (key in summary) summary[key] = c._count._all;
    summary.total += c._count._all;
  }

  return NextResponse.json({ leads, summary });
}
