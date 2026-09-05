"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { categories, formatPrice } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  PackageOpen,
} from "lucide-react";

const BRANDS = [
  "Glow Labs",
  "Luxe Beauty",
  "Rose Petal",
  "Velvet Touch",
  "Pure Radiance",
  "Gold Dust",
];

function ProductsContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const SORT_OPTIONS = [
    { value: "newest", label: t("products.sortNewest") },
    { value: "price-asc", label: t("products.sortLowToHigh") },
    { value: "price-desc", label: t("products.sortHighToLow") },
    { value: "name", label: t("products.sortAZ") },
  ];

  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const currentParams = {
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    sort: searchParams.get("sort") || "newest",
    page: parseInt(searchParams.get("page") || "1"),
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    brand: searchParams.get("brand") || "",
    inStock: searchParams.get("inStock") || "",
  };

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (updates.page === undefined && !updates.hasOwnProperty("page")) {
        params.set("page", "1");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (currentParams.q) params.set("search", currentParams.q);
    if (currentParams.category) params.set("category", currentParams.category);
    if (currentParams.sort) params.set("sort", currentParams.sort);
    if (currentParams.page) params.set("page", String(currentParams.page));
    if (currentParams.minPrice) params.set("minPrice", currentParams.minPrice);
    if (currentParams.maxPrice) params.set("maxPrice", currentParams.maxPrice);
    if (currentParams.brand) params.set("brand", currentParams.brand);
    params.set("limit", "12");

    fetch(`/api/products?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchParams.toString()]);

  const activeFilters: { label: string; onRemove: () => void }[] = [];
  if (currentParams.q) {
    const v = currentParams.q;
    activeFilters.push({ label: `Search: "${v}"`, onRemove: () => updateParams({ q: "" }) });
  }
  if (currentParams.category) {
    const cat = categories.find((c) => c.slug === currentParams.category);
    activeFilters.push({
      label: cat?.name || currentParams.category,
      onRemove: () => updateParams({ category: "" }),
    });
  }
  if (currentParams.brand) {
    activeFilters.push({
      label: currentParams.brand,
      onRemove: () => updateParams({ brand: "" }),
    });
  }
  if (currentParams.minPrice || currentParams.maxPrice) {
    activeFilters.push({
      label: `${currentParams.minPrice || "0"} DA - ${currentParams.maxPrice || "∞"} DA`,
      onRemove: () => updateParams({ minPrice: "", maxPrice: "" }),
    });
  }

  const FilterSidebar = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
          {t("products.category")}
        </h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.slug} className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--fg)]">
              <input
                type="checkbox"
                checked={currentParams.category === cat.slug}
                onChange={() =>
                  updateParams({
                    category: currentParams.category === cat.slug ? "" : cat.slug,
                  })
                }
                className="h-4 w-4 rounded border-[var(--border)] text-primary accent-primary"
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
          {t("products.priceRange")}
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={t("products.min")}
            value={currentParams.minPrice}
            onChange={(e) => updateParams({ minPrice: e.target.value })}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-primary"
          />
          <span className="text-[var(--muted)]">-</span>
          <input
            type="number"
            placeholder={t("products.max")}
            value={currentParams.maxPrice}
            onChange={(e) => updateParams({ maxPrice: e.target.value })}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Brand */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
          {t("products.brand")}
        </h4>
        <div className="space-y-2">
          {BRANDS.map((brand) => (
            <label key={brand} className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--fg)]">
              <input
                type="checkbox"
                checked={currentParams.brand === brand}
                onChange={() =>
                  updateParams({
                    brand: currentParams.brand === brand ? "" : brand,
                  })
                }
                className="h-4 w-4 rounded border-[var(--border)] text-primary accent-primary"
              />
              {brand}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[var(--fg)] md:text-4xl">
          {currentParams.category
            ? categories.find((c) => c.slug === currentParams.category)?.name || "Products"
            : t("products.title")}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {loading ? t("products.searching") : `${total} ${total === 1 ? t("products.count", { count: total }) : t("products.count_plural", { count: total })}`}
        </p>
      </div>

      {/* Search & Sort Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 md:max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder={t("products.searchPlaceholder")}
            value={currentParams.q}
            onChange={(e) => updateParams({ q: e.target.value })}
            className="w-full rounded-full border border-[var(--border)] bg-[var(--card)] py-2.5 pl-10 pr-4 text-sm text-[var(--fg)] outline-none transition-colors focus:border-primary"
          />
        </div>
        <div className="relative">
          <select
            value={currentParams.sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="appearance-none rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 pr-10 text-sm text-[var(--fg)] outline-none transition-colors focus:border-primary"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
        </div>
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--fg)] transition-colors hover:bg-[var(--muted-bg)] md:hidden"
        >
          <SlidersHorizontal size={16} />
          {t("products.filters")}
        </button>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {activeFilters.map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3.5 py-1.5 text-xs font-medium text-primary"
            >
              {f.label}
              <button onClick={f.onRemove} className="hover:text-primary-dark">
                <X size={14} />
              </button>
            </span>
          ))}
          <button
            onClick={() =>
              router.push("/products")
            }
            className="text-xs font-medium text-[var(--muted)] underline transition-colors hover:text-[var(--fg)]"
          >
            {t("products.clearAll")}
          </button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden w-56 shrink-0 md:block">
          <FilterSidebar />
        </aside>

        {/* Mobile Filter Overlay */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-72 overflow-y-auto bg-[var(--card)] p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-semibold text-[var(--fg)]">{t("products.filters")}</h3>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <X size={20} className="text-[var(--muted)]" />
                </button>
              </div>
              <FilterSidebar />
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-[var(--muted-bg)] p-4">
                  <div className="mb-4 aspect-[3/4] rounded-xl bg-[var(--border)]" />
                  <div className="mb-2 h-4 w-3/4 rounded bg-[var(--border)]" />
                  <div className="h-4 w-1/2 rounded bg-[var(--border)]" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<PackageOpen size={64} strokeWidth={1} />}
              title={t("products.empty")}
              description={t("products.emptyDesc")}
              actionLabel={t("products.clearFilters")}
              actionHref="/products"
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() => updateParams({ page: String(currentParams.page - 1) })}
                    disabled={currentParams.page <= 1}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--fg)] transition-colors hover:bg-[var(--muted-bg)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentParams.page <= 4) {
                      pageNum = i + 1;
                    } else if (currentParams.page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentParams.page - 3 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateParams({ page: String(pageNum) })}
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                          currentParams.page === pageNum
                            ? "bg-primary text-white"
                            : "border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--muted-bg)]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => updateParams({ page: String(currentParams.page + 1) })}
                    disabled={currentParams.page >= totalPages}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--fg)] transition-colors hover:bg-[var(--muted-bg)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="py-20 text-center text-[var(--muted)]">{t("products.loading")}</div>}>
      <ProductsContent />
    </Suspense>
  );
}
