import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await (prisma.user.findUnique as any)({
    where: { id: user.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      addresses: true,
    },
  });

  return NextResponse.json(dbUser);
}
