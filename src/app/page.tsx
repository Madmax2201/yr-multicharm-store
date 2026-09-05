"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice } from "@/lib/utils";
import {
  Sparkles,
  Truck,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  Mail,
  ArrowRight,
} from "lucide-react";

function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products/featured", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-[var(--muted-bg)] p-4">
            <div className="mb-4 aspect-[3/4] rounded-xl bg-[var(--border)]" />
            <div className="mb-2 h-4 w-3/4 rounded bg-[var(--border)]" />
            <div className="h-4 w-1/2 rounded bg-[var(--border)]" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function CategoryCard({
  name,
  slug,
  gradient,
  icon: Icon,
}: {
  name: string;
  slug: string;
  gradient: string;
  icon: any;
}) {
  const { t } = useLanguage();
  return (
    <Link
      href={`/products?category=${slug}`}
      className={`group relative flex flex-col items-center justify-center rounded-2xl p-8 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${gradient}`}
    >
      <Icon size={40} className="mb-4 opacity-80 transition-transform group-hover:scale-110" />
      <span className="font-serif text-lg font-semibold">{name}</span>
      <span className="mt-2 flex items-center gap-1 text-sm font-medium opacity-0 transition-all group-hover:opacity-80">
        {t("home.categories.shopNow")} <ChevronRight size={14} />
      </span>
    </Link>
  );
}

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-6 font-serif text-5xl font-bold leading-tight text-white md:text-7xl">
            {t("home.hero.title1")}
            <br />
            <span className="text-pink-200">{t("home.hero.title2")}</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-white/80 md:text-xl">
            {t("home.hero.subtitle")}
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-pink-600 shadow-lg transition-all hover:bg-pink-50 hover:shadow-xl"
            >
              {t("home.hero.cta")}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/products?sort=newest"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-8 py-3.5 font-medium text-white transition-all hover:border-white/80 hover:bg-white/10"
            >
              <Sparkles size={18} />
              {t("home.hero.secondary")}
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg)] to-transparent" />
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-widest text-primary">
              Featured
            </span>
            <h2 className="font-serif text-3xl font-bold text-[var(--fg)] md:text-4xl">
              {t("home.featured.title")}
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-dark sm:flex"
          >
            {t("home.featured.viewAll")} <ChevronRight size={16} />
          </Link>
        </div>
        <FeaturedProducts />
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-6 py-2.5 text-sm font-medium text-[var(--fg)] transition-colors hover:bg-[var(--muted-bg)]"
          >
            {t("products.viewAll")} <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Category Showcase */}
      <section className="bg-[var(--muted-bg)] py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-widest text-primary">
              {t("home.categories.title")}
            </span>
            <h2 className="font-serif text-3xl font-bold text-[var(--fg)] md:text-4xl">
              {t("home.categories.title")}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CategoryCard
              name={t("category.face")}
              slug="face"
              gradient="bg-gradient-to-br from-violet-400 to-purple-500"
              icon={Sparkles}
            />
            <CategoryCard
              name={t("category.eyes")}
              slug="eyes"
              gradient="bg-gradient-to-br from-purple-500 to-fuchsia-600"
              icon={Sparkles}
            />
            <CategoryCard
              name={t("category.lips")}
              slug="lips"
              gradient="bg-gradient-to-br from-fuchsia-400 to-pink-500"
              icon={Sparkles}
            />
            <CategoryCard
              name={t("category.skincare")}
              slug="skincare"
              gradient="bg-gradient-to-br from-teal-400 to-emerald-500"
              icon={Sparkles}
            />
            <CategoryCard
              name={t("category.nails")}
              slug="nails"
              gradient="bg-gradient-to-br from-pink-400 to-fuchsia-500"
              icon={Sparkles}
            />
            <CategoryCard
              name={t("category.fragrance")}
              slug="fragrance"
              gradient="bg-gradient-to-br from-amber-400 to-orange-500"
              icon={Sparkles}
            />
          </div>
        </div>
      </section>

      {/* Brand Promise */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Truck,
              titleKey: "home.promises.freeShipping",
              descKey: "home.promises.freeShippingDesc",
            },
            {
              icon: RefreshCw,
              titleKey: "home.promises.easyReturns",
              descKey: "home.promises.easyReturnsDesc",
            },
            {
              icon: ShieldCheck,
              titleKey: "home.promises.secureCheckout",
              descKey: "home.promises.secureCheckoutDesc",
            },
          ].map((item) => (
            <div
              key={item.titleKey}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <item.icon size={26} />
              </div>
              <h3 className="mb-2 font-serif text-xl font-semibold text-[var(--fg)]">
                {t(item.titleKey)}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--muted)]">{t(item.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gradient-to-r from-purple-500 to-violet-600 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <Mail size={40} className="mx-auto mb-6 text-white/60" />
          <h2 className="mb-4 font-serif text-3xl font-bold text-white md:text-4xl">
            {t("home.newsletter.title")}
          </h2>
          <p className="mb-8 text-white/80">
            {t("home.newsletter.subtitle")}
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto flex max-w-md gap-3"
          >
            <input
              type="email"
              placeholder={t("home.newsletter.placeholder")}
              className="flex-1 rounded-full border-0 bg-white/20 px-6 py-3 text-sm text-white placeholder-white/60 backdrop-blur-sm outline-none ring-0 focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-purple-600 transition-colors hover:bg-purple-50"
            >
              {t("home.newsletter.subscribe")}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
