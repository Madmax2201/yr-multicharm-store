"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n/context";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { Heart, Loader2 } from "lucide-react";

export default function WishlistPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    fetch("/api/wishlist")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        const user = getCurrentUser();
        if (!user) {
          router.push("/auth/login?redirect=/account/wishlist");
        }
      });
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/auth/login?redirect=/account/wishlist");
      return;
    }
    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Link
          href="/account"
          className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
        >
          Account
        </Link>
        <span className="text-[var(--muted)]">/</span>
        <h1 className="font-serif text-2xl font-bold text-[var(--fg)]">{t("account.wishlist.title")}</h1>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Heart size={64} strokeWidth={1} />}
          title={t("account.wishlist.empty")}
          description={t("account.wishlist.emptyDesc")}
          actionLabel={t("account.wishlist.browse")}
          actionHref="/products"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}
