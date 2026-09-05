"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useLanguage } from "@/lib/i18n/context";

const statuses = [
  "ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED",
] as const;

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

interface Order {
  id: string;
  orderNumber: string;
  fullName: string;
  status: string;
  total: number;
  createdAt: string;
  _count?: { items: number };
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

function AdminOrdersContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (status !== "ALL") params.set("status", status);
      const res = await fetch(`/api/admin/orders?${params}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = (s: string) => { setStatus(s); setPage(1); };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-bold text-rose-900">{t("admin.orders.title")}</h1>
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button key={s} onClick={() => handleStatusChange(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${status === s ? "bg-pink-600 text-white" : "border border-pink-200 bg-white text-rose-600 hover:bg-pink-100"}`}>
            {s === "ALL" ? t("admin.orders.all") : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-rose-100" />)}
        </div>
      ) : !data || data.orders.length === 0 ? (
        <EmptyState title={t("admin.orders.empty")} description={status !== "ALL" ? `No orders with status "${status.toLowerCase()}".` : t("admin.orders.emptyDesc")} icon={<ShoppingCart size={48} strokeWidth={1} />} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-pink-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-pink-100 bg-rose-50 text-rose-500">
                  <th className="px-4 py-3 font-medium">{t("admin.orders.orderNumber")}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.orders.customer")}</th>
                  <th className="px-4 py-3 font-medium text-center">{t("admin.orders.items")}</th>
                  <th className="px-4 py-3 font-medium text-right">{t("admin.orders.total")}</th>
                  <th className="px-4 py-3 font-medium text-center">{t("admin.orders.status")}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.orders.date")}</th>
                  <th className="px-4 py-3 font-medium text-right">{t("admin.orders.action")}</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => (
                  <tr key={order.id} className="border-b border-pink-50 transition-colors hover:bg-rose-50">
                    <td className="px-4 py-3 font-medium text-rose-900">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-rose-700">{order.fullName}</td>
                    <td className="px-4 py-3 text-center text-rose-600">{order._count?.items ?? "-"}</td>
                    <td className="px-4 py-3 text-right font-medium text-rose-900">{order.total.toFixed(2)} DA</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-rose-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-pink-600 transition-colors hover:bg-pink-100">
                        <Eye size={14} /> {t("admin.orders.view")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="inline-flex items-center gap-1 rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-rose-700 transition-colors hover:bg-pink-100 disabled:opacity-50">
                <ChevronLeft size={16} /> {t("admin.orders.previous")}
              </button>
              <span className="text-sm text-rose-500">{t("admin.orders.page")} {data.page} {t("admin.orders.of")} {data.totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages} className="inline-flex items-center gap-1 rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-rose-700 transition-colors hover:bg-pink-100 disabled:opacity-50">
                {t("admin.orders.next")} <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="py-8 text-center text-rose-400">{t("admin.orders.loading")}</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
