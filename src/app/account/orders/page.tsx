"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n/context";
import { EmptyState } from "@/components/EmptyState";
import { formatPrice, formatDate, orderStatuses } from "@/lib/utils";
import {
  Package,
  ChevronRight,
  Loader2,
  PackageOpen,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

interface OrderItem {
  id: string;
  productName: string;
  variantName?: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  discount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/auth/login?redirect=/account/orders");
      return;
    }

    fetch("/api/orders")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center px-4">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Link
          href="/account"
          className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
        >
          Account
        </Link>
        <span className="text-[var(--muted)]">/</span>
        <h1 className="font-serif text-2xl font-bold text-[var(--fg)]">{t("account.breadcrumb.orders")}</h1>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<PackageOpen size={64} strokeWidth={1} />}
          title={t("account.orders.empty")}
          description={t("account.orders.emptyDesc")}
          actionLabel={t("account.orders.startShopping")}
          actionHref="/products"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-[var(--fg)]">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`rounded-full px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                        STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
                    <span>{formatDate(order.createdAt)}</span>
                    <span>{t("account.orders.items", { count: itemCount })}</span>
                    <span className="font-medium text-[var(--fg)]">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="shrink-0 text-[var(--muted)]" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
