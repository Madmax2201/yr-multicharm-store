import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const totalProducts = await prisma.product.count({ where: { isActive: true } });
    const totalOrders = await prisma.order.count();
    const totalUsers = await prisma.user.count();

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { id: "desc" },
      include: { address: true },
    });

    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lte: 5 }, isActive: true },
      take: 5,
      select: { id: true, name: true, stock: true },
    });

    const revenueResult = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "DELIVERED" },
    });

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: Number(revenueResult._sum.total || 0),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        fullName: o.address?.fullName || "Guest",
        status: o.status,
        total: Number(o.total),
        createdAt: o.id,
      })),
      lowStock: lowStockProducts.map((p) => ({
        id: p.id,
        name: p.name,
        stock: Number(p.stock),
      })),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
