"use client";

import { useEffect, useState } from "react";
import { use, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

interface OrderItem {
  id: string;
  productName: string;
  variantName?: string | null;
  price: number;
  quantity: number;
}

interface OrderUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  discount: number;
  couponCode?: string | null;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  notes?: string | null;
  createdAt: string;
  user: OrderUser;
  items: OrderItem[];
}

export default function OrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = useLanguage();
  const { id } = use(params);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const json = await res.json();
      setOrder(json);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-rose-100" />
        ))}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-rose-500">{t("admin.orderDetail.notFound")}</p>
      </div>
    );
  }

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-pink-100 hover:text-pink-600"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-serif text-2xl font-bold text-rose-900">
          Order {order.orderNumber}
        </h1>
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
            statusColors[order.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-pink-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-serif text-lg font-semibold text-rose-900">
              {t("admin.orderDetail.orderInfo")}
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-rose-400">{t("admin.orderDetail.orderNumber")}</span>
                <p className="font-medium text-rose-900">{order.orderNumber}</p>
              </div>
              <div>
                <span className="text-rose-400">{t("admin.orderDetail.date")}</span>
                <p className="font-medium text-rose-900">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <span className="text-rose-400">{t("admin.orderDetail.paymentMethod")}</span>
                <p className="font-medium text-rose-900">
                  {order.paymentMethod}
                </p>
              </div>
              <div>
                <span className="text-rose-400">{t("admin.orderDetail.paymentStatus")}</span>
                <p className="font-medium text-rose-900">
                  {order.paymentStatus}
                </p>
              </div>
              <div>
                <span className="text-rose-400">{t("admin.orderDetail.status")}</span>
                <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(e.target.value)}
                    disabled={updating}
                    className="rounded-lg border border-pink-200 bg-white px-2 py-1 text-sm text-rose-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {updating && (
                    <span className="text-xs text-rose-400">{t("admin.orderDetail.updating")}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-pink-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-serif text-lg font-semibold text-rose-900">
              {t("admin.orderDetail.orderItems")}
            </h2>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-pink-100 text-rose-400">
                  <th className="pb-2 font-medium">{t("admin.orderDetail.product")}</th>
                  <th className="pb-2 font-medium text-right">{t("admin.orderDetail.price")}</th>
                  <th className="pb-2 font-medium text-center">{t("admin.orderDetail.qty")}</th>
                  <th className="pb-2 font-medium text-right">{t("admin.orderDetail.subtotal")}</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-pink-50"
                  >
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-rose-900">
                          {item.productName}
                        </p>
                        {item.variantName && (
                          <p className="text-xs text-rose-400">
                            {item.variantName}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-right text-rose-700">
                      {item.price.toFixed(2)} DA
                    </td>
                    <td className="py-3 text-center text-rose-700">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-right font-medium text-rose-900">
                      {(item.price * item.quantity).toFixed(2)} DA
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-3 text-right text-rose-500">
                    {t("admin.orderDetail.subtotalLabel")}
                  </td>
                  <td className="pt-3 text-right text-rose-900">
                    {subtotal.toFixed(2)} DA
                  </td>
                </tr>
                {order.discount > 0 && (
                  <tr>
                    <td colSpan={3} className="pt-1 text-right text-rose-500">
                      {t("admin.orderDetail.discount")}
                      {order.couponCode && (
                        <span className="ml-1 text-xs">
                          ({order.couponCode})
                        </span>
                      )}
                    </td>
                    <td className="pt-1 text-right text-green-600">
                      -{order.discount.toFixed(2)} DA
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="pt-2 text-right font-semibold text-rose-700">
                    {t("admin.orderDetail.total")}
                  </td>
                  <td className="pt-2 text-right font-bold text-rose-900">
                    {order.total.toFixed(2)} DA
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-pink-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-serif text-lg font-semibold text-rose-900">
              {t("admin.orderDetail.customer")}
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-rose-400">{t("admin.orderDetail.name")}</span>
                <p className="font-medium text-rose-900">{order.user.name}</p>
              </div>
              <div>
                <span className="text-rose-400">{t("admin.orderDetail.email")}</span>
                <p className="font-medium text-rose-900">{order.user.email}</p>
              </div>
              <div>
                <span className="text-rose-400">{t("admin.orderDetail.phone")}</span>
                <p className="font-medium text-rose-900">
                  {order.user.phone || order.phone || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-pink-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-serif text-lg font-semibold text-rose-900">
              {t("admin.orderDetail.shippingAddress")}
            </h2>
            <div className="space-y-1 text-sm text-rose-700">
              <p className="font-medium text-rose-900">{order.fullName}</p>
              <p>{order.street}</p>
              <p>
                {order.city}, {order.state} {order.zipCode}
              </p>
              <p>{order.phone}</p>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-xl border border-pink-200 bg-white p-6 shadow-sm">
              <h2 className="mb-2 font-serif text-lg font-semibold text-rose-900">
                {t("admin.orderDetail.notes")}
              </h2>
              <p className="text-sm text-rose-700">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
