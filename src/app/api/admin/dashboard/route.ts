import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const totalProducts = await prisma.product.count({ where: { isActive: true } });
  const totalOrders = await prisma.order.count();
  const totalUsers = await prisma.user.count();

  const recentOrdersRaw = await prisma.$queryRawUnsafe<any[]>(
    'SELECT id, orderNumber, fullName, status, total, createdAt FROM "Order" ORDER BY createdAt DESC LIMIT 5'
  );
  const lowStockRaw = await prisma.$queryRawUnsafe<any[]>(
    'SELECT id, name, stock FROM "Product" WHERE stock <= 5 AND isActive = 1 LIMIT 5'
  );
  const revenueRaw = await prisma.$queryRawUnsafe<any[]>(
    'SELECT COALESCE(SUM(total), 0) as revenue FROM "Order" WHERE status = ?',
    "DELIVERED"
  );

  return NextResponse.json({
    totalProducts,
    totalOrders,
    totalUsers,
    totalRevenue: Number(revenueRaw[0]?.revenue || 0),
    recentOrders: recentOrdersRaw.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      fullName: o.fullName,
      status: o.status,
      total: Number(o.total),
      createdAt: o.createdAt,
    })),
    lowStock: lowStockRaw.map((p) => ({
      id: p.id,
      name: p.name,
      stock: Number(p.stock),
    })),
  });
}
