"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useLanguage } from "@/lib/i18n/context";

interface Product {
  id: string;
  name: string;
  images: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

function StockBadge({ stock }: { stock: number }) {
  let color: string;
  if (stock <= 0) color = "bg-red-100 text-red-700";
  else if (stock <= 5) color = "bg-yellow-100 text-yellow-700";
  else color = "bg-green-100 text-green-700";

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {stock}
    </span>
  );
}

function AdminProductsContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (search) params.set("q", search);

      const res = await fetch(`/api/admin/products?${params}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteId(null);
        fetchProducts();
      }
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (product: Product) => {
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      fetchProducts();
    } catch {
      // ignore
    }
  };

  const getImageSrc = (images: string): string => {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed[0]
        : "/placeholder.svg";
    } catch {
      return images || "/placeholder.svg";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-2xl font-bold text-rose-900">{t("admin.products.title")}</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-700"
        >
          <Plus size={16} />
          {t("admin.products.add")}
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.products.search")}
            className="w-full rounded-lg border border-pink-200 bg-white py-2 pl-10 pr-4 text-sm text-rose-900 placeholder-rose-300 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-pink-100 px-4 py-2 text-sm font-medium text-pink-700 transition-colors hover:bg-pink-200"
        >
          {t("admin.products.searchBtn")}
        </button>
      </form>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-rose-100"
            />
          ))}
        </div>
      ) : !data || data.products.length === 0 ? (
        <EmptyState
          title={t("admin.products.empty")}
          description={search ? t("admin.products.emptySearch") : t("admin.products.emptyFirst")}
          actionLabel={search ? undefined : "Add Product"}
          actionHref={search ? undefined : "/admin/products/new"}
          icon={<Package size={48} strokeWidth={1} />}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-pink-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-pink-100 bg-rose-50 text-rose-500">
                  <th className="px-4 py-3 font-medium">{t("admin.products.product")}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.products.category")}</th>
                  <th className="px-4 py-3 font-medium text-right">{t("admin.products.price")}</th>
                  <th className="px-4 py-3 font-medium text-center">{t("admin.products.stock")}</th>
                  <th className="px-4 py-3 font-medium text-center">{t("admin.products.status")}</th>
                  <th className="px-4 py-3 font-medium text-right">{t("admin.products.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-pink-50 transition-colors hover:bg-rose-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageSrc(product.images)}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg border border-pink-100 object-cover"
                        />
                        <span className="font-medium text-rose-900">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-rose-600">{product.category}</td>
                    <td className="px-4 py-3 text-right font-medium text-rose-900">
                      {product.price.toFixed(2)} DA
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StockBadge stock={product.stock} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleStatus(product)}
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          product.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {product.isActive ? t("admin.products.active") : t("admin.products.inactive")}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-pink-100 hover:text-pink-600"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => setDeleteId(product.id)}
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

          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-rose-700 transition-colors hover:bg-pink-100 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                {t("admin.products.previous")}
              </button>
              <span className="text-sm text-rose-500">
                {t("admin.products.page")} {data.page} {t("admin.products.of")} {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-rose-700 transition-colors hover:bg-pink-100 disabled:opacity-50"
              >
                {t("admin.products.next")}
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-serif text-lg font-semibold text-rose-900">
              {t("admin.products.deleteTitle")}
            </h3>
            <p className="mt-2 text-sm text-rose-500">
              {t("admin.products.deleteDesc")}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-pink-200 px-4 py-2 text-sm text-rose-700 transition-colors hover:bg-rose-50"
              >
                {t("admin.products.cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? t("admin.products.deleting") : t("admin.products.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProducts() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="py-8 text-center text-rose-400">{t("admin.products.loading")}</div>}>
      <AdminProductsContent />
    </Suspense>
  );
}
