"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useLanguage } from "@/lib/i18n/context";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: string;
  minAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

interface CouponForm {
  code: string;
  discount: string;
  type: "PERCENTAGE" | "FIXED";
  minAmount: string;
  maxUses: string;
  expiresAt: string;
  isActive: boolean;
}

const emptyForm: CouponForm = {
  code: "",
  discount: "",
  type: "PERCENTAGE",
  minAmount: "",
  maxUses: "",
  expiresAt: "",
  isActive: true,
};

export default function AdminCoupons() {
  const { t } = useLanguage();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const json = await res.json();
      setCoupons(json);
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setFormError(null);
  };

  const openEdit = (coupon: Coupon) => {
    setForm({
      code: coupon.code,
      discount: String(coupon.discount),
      type: coupon.type as "PERCENTAGE" | "FIXED",
      minAmount: coupon.minAmount ? String(coupon.minAmount) : "",
      maxUses: coupon.maxUses ? String(coupon.maxUses) : "",
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().split("T")[0]
        : "",
      isActive: coupon.isActive,
    });
    setEditingId(coupon.id);
    setShowForm(true);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.code.trim()) {
      setFormError(t("admin.coupons.codeRequired"));
      return;
    }
    if (!form.discount || Number(form.discount) <= 0) {
      setFormError(t("admin.coupons.discountRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discount: Number(form.discount),
        type: form.type,
        minAmount: form.minAmount ? Number(form.minAmount) : null,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        isActive: form.isActive,
      };

      const url = editingId
        ? `/api/admin/coupons/${editingId}`
        : "/api/admin/coupons";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save coupon");
      }

      resetForm();
      setShowForm(false);
      fetchCoupons();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/coupons/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteId(null);
        fetchCoupons();
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-rose-900">{t("admin.coupons.title")}</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-700"
        >
          <Plus size={16} />
          {t("admin.coupons.add")}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-pink-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-serif text-lg font-semibold text-rose-900">
            {editingId ? t("admin.coupons.editTitle") : t("admin.coupons.newTitle")}
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-rose-700">{t("admin.coupons.code")}</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                className="w-full rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-rose-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                placeholder={t("admin.coupons.codePlaceholder")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-rose-700">{t("admin.coupons.discount")}</label>
              <input
                type="number"
                step="0.01"
                value={form.discount}
                onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))}
                className="w-full rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-rose-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-rose-700">{t("admin.coupons.type")}</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "PERCENTAGE" | "FIXED" }))}
                className="w-full rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-rose-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              >
                <option value="PERCENTAGE">{t("admin.coupons.percentage")}</option>
                <option value="FIXED">{t("admin.coupons.fixed")}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-rose-700">{t("admin.coupons.minAmount")}</label>
              <input
                type="number"
                step="0.01"
                value={form.minAmount}
                onChange={(e) => setForm((p) => ({ ...p, minAmount: e.target.value }))}
                className="w-full rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-rose-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-rose-700">{t("admin.coupons.maxUses")}</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))}
                className="w-full rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-rose-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-rose-700">{t("admin.coupons.expiryDate")}</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                className="w-full rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-rose-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-sm text-rose-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                  className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                />
                {t("admin.coupons.active")}
              </label>
            </div>

            {formError && (
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-sm text-red-500">{formError}</p>
              </div>
            )}

            <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-pink-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-700 disabled:opacity-50"
              >
                {submitting ? t("admin.coupons.saving") : editingId ? t("admin.coupons.update") : t("admin.coupons.create")}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="rounded-lg border border-pink-200 px-6 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
              >
                {t("admin.coupons.cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-rose-100" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <EmptyState
          title={t("admin.coupons.empty")}
          description={t("admin.coupons.emptyDesc")}
          actionLabel={t("admin.coupons.add")}
          onAction={() => {
            resetForm();
            setShowForm(true);
          }}
          icon={<Tag size={48} strokeWidth={1} />}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-pink-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-pink-100 bg-rose-50 text-rose-500">
                <th className="px-4 py-3 font-medium">{t("admin.coupons.tableCode")}</th>
                <th className="px-4 py-3 font-medium text-right">{t("admin.coupons.tableDiscount")}</th>
                <th className="px-4 py-3 font-medium text-center">{t("admin.coupons.tableType")}</th>
                <th className="px-4 py-3 font-medium text-center">{t("admin.coupons.tableUsage")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.coupons.tableExpires")}</th>
                <th className="px-4 py-3 font-medium text-center">{t("admin.coupons.tableStatus")}</th>
                <th className="px-4 py-3 font-medium text-right">{t("admin.coupons.tableActions")}</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr
                  key={coupon.id}
                  className="border-b border-pink-50 transition-colors hover:bg-rose-50"
                >
                  <td className="px-4 py-3 font-mono font-medium text-rose-900">
                    {coupon.code}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-rose-900">
                    {coupon.type === "PERCENTAGE"
                      ? `${coupon.discount}%`
                      : `${coupon.discount.toFixed(2)} DA`}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-700">
                      {coupon.type === "PERCENTAGE" ? "%" : "DA"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-rose-700">
                    {coupon.usedCount}
                    {coupon.maxUses ? ` / ${coupon.maxUses}` : " / ∞"}
                  </td>
                  <td className="px-4 py-3 text-rose-500">
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleDateString()
                      : t("admin.coupons.noExpiry")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        coupon.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {coupon.isActive ? t("admin.coupons.statusActive") : t("admin.coupons.statusInactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(coupon)}
                        className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-pink-100 hover:text-pink-600"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteId(coupon.id)}
                        className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-serif text-lg font-semibold text-rose-900">
              {t("admin.coupons.deleteTitle")}
            </h3>
            <p className="mt-2 text-sm text-rose-500">
              {t("admin.coupons.deleteDesc")}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-pink-200 px-4 py-2 text-sm text-rose-700 transition-colors hover:bg-rose-50"
              >
                {t("admin.coupons.cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
              >
                {t("admin.coupons.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
