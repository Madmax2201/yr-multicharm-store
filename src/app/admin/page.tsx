"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  AlertTriangle,
  Eye,
  TrendingUp,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";

interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    fullName: string;
    status: string;
    total: number;
  }[];
  lowStock: {
    id: string;
    name: string;
    stock: number;
  }[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
}) {
  return (
    <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-purple-500">{title}</p>
          <p className="mt-2 font-serif text-3xl font-bold text-purple-900">
            {value}
          </p>
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
              <TrendingUp size={12} />
              {trend}
            </div>
          )}
        </div>
        <div className={`rounded-2xl p-4 ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-purple-200 ${className || ""}`}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-purple-100 bg-white p-6">
            <Skeleton className="mb-3 h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-purple-100 bg-white p-6">
          <Skeleton className="mb-4 h-6 w-40" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-purple-100 bg-white p-6">
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dashboard");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-purple-600">Error: {error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-purple-900">{t("admin.dashboard.title")}</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
          >
            <Package size={16} />
            Manage Products
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-50"
          >
            <ShoppingCart size={16} />
            View Orders
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={data.totalProducts}
          icon={Package}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Total Orders"
          value={data.totalOrders}
          icon={ShoppingCart}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Total Users"
          value={data.totalUsers}
          icon={Users}
          color="bg-violet-100 text-violet-600"
        />
        <StatCard
          title="Total Revenue"
          value={`${data.totalRevenue.toFixed(2)} DA`}
          icon={DollarSign}
          color="bg-green-100 text-green-600"
          trend="+12.5% this month"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-purple-100 bg-white p-4">
          <div className="rounded-xl bg-purple-100 p-3">
            <BarChart3 className="text-purple-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-purple-500">Avg. Order Value</p>
            <p className="font-serif text-lg font-bold text-purple-900">
              {data.totalOrders > 0 ? (data.totalRevenue / data.totalOrders).toFixed(2) : "0"} DA
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-purple-100 bg-white p-4">
          <div className="rounded-xl bg-blue-100 p-3">
            <ShoppingCart className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-blue-500">Pending Orders</p>
            <p className="font-serif text-lg font-bold text-blue-900">
              {data.recentOrders.filter(o => o.status === "PENDING").length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-purple-100 bg-white p-4">
          <div className="rounded-xl bg-red-100 p-3">
            <AlertTriangle className="text-red-600" size={20} />
          </div>
          <div>
            <p className="text-xs text-red-500">Low Stock Items</p>
            <p className="font-serif text-lg font-bold text-red-900">
              {data.lowStock.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-purple-900">
              Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-sm font-medium text-purple-600 hover:text-purple-800">
              View All →
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-purple-400">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-purple-100 text-purple-500">
                    <th className="pb-2 font-medium">Order</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Total</th>
                    <th className="pb-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-purple-50 transition-colors hover:bg-purple-50"
                    >
                      <td className="py-3 font-medium text-purple-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 text-purple-700">{order.fullName}</td>
                      <td className="py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            statusColors[order.status] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium text-purple-900">
                        {order.total.toFixed(2)} DA
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800"
                        >
                          <Eye size={14} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-purple-900">
              Low Stock Alert
            </h2>
            <Link href="/admin/products" className="text-sm font-medium text-purple-600 hover:text-purple-800">
              Manage →
            </Link>
          </div>
          {data.lowStock.length === 0 ? (
            <p className="text-sm text-purple-400">All products are well stocked</p>
          ) : (
            <div className="space-y-3">
              {data.lowStock.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}/edit`}
                  className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 transition-colors hover:bg-red-100"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={18} className="text-red-500" />
                    <span className="text-sm font-medium text-purple-900">
                      {product.name}
                    </span>
                  </div>
                  <span className="inline-flex items-center justify-center rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
                    {product.stock}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
