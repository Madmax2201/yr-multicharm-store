"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import { formatPrice } from "@/lib/utils";
import {
  Package,
  ChevronLeft,
  MapPin,
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
  productId: string;
  productName: string;
  variantName?: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  items: OrderItem[];
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) {
          router.push(`/auth/login?redirect=/account/orders/${id}`);
          return null;
        }
        return r.json();
      })
      .then((userData) => {
        if (!userData) return;
        return fetch(`/api/orders/${id}`)
          .then((r) => {
            if (!r.ok) throw new Error("Order not found");
            return r.json();
          });
      })
      .then((data) => {
        if (data === undefined || data === null) return;
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center px-4">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <div className="flex flex-col items-center justify-center text-center">
          <PackageOpen size={64} strokeWidth={1} className="mb-4 text-[var(--muted)]" />
          <h2 className="mb-2 font-serif text-2xl font-bold text-[var(--fg)]">{t("account.orders.notFound")}</h2>
          <p className="mb-8 text-sm text-[var(--muted)]">{error || t("account.orders.notFoundDesc")}</p>
          <Link
            href="/account/orders"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            {t("account.orders.backToOrders")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/account/orders"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
      >
        <ChevronLeft size={16} />
        {t("account.orders.back")}
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--fg)]">
            Order {order.orderNumber}
          </h1>
        </div>
        <span
          className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider ${
            STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-[var(--fg)]">
              <Package size={18} className="text-primary" />
              {t("account.orders.itemsTitle", { count: order.items.length })}
            </h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-[var(--border)] pb-4 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.productId}`}
                      className="font-medium text-[var(--fg)] transition-colors hover:text-primary"
                    >
                      {item.productName}
                    </Link>
                    {item.variantName && (
                      <p className="text-xs text-[var(--muted)]">{item.variantName}</p>
                    )}
                    <p className="mt-0.5 text-xs text-[var(--muted)]">{t("account.orders.qty", { count: item.quantity })}</p>
                  </div>
                  <p className="text-sm font-medium text-[var(--fg)]">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {order.fullName && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-[var(--fg)]">
                <MapPin size={18} className="text-primary" />
                {t("account.orders.shipping")}
              </h3>
              <div className="text-sm text-[var(--fg)]">
                <p className="font-medium">{order.fullName}</p>
                <p className="text-[var(--muted)]">{order.street}</p>
                <p className="text-[var(--muted)]">
                  {order.city}, {order.state} {order.zipCode}
                </p>
                <p className="text-[var(--muted)]">{order.phone}</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h3 className="mb-4 font-semibold text-[var(--fg)]">{t("account.orders.summary")}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-t border-[var(--border)] pt-2">
                <span className="font-semibold text-[var(--fg)]">{t("account.orders.total")}</span>
                <span className="font-serif text-lg font-bold text-[var(--fg)]">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
