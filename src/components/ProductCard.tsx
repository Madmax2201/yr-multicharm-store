"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { StarRating } from "./StarRating";
import { addToCart, type CartItem } from "@/lib/cart";
import { formatPrice, getImageUrl, truncate } from "@/lib/utils";
import { useApp } from "./AppProvider";
import { useLanguage } from "@/lib/i18n/context";

interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  images: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  slug?: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useLanguage();
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const { refreshCart } = useApp();
  const images = getImageUrl(product.images);
  const outOfStock = product.stock === 0;
  const lowStock = product.stock !== undefined && product.stock > 0 && product.stock < 10;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || adding) return;
    setAdding(true);
    const item: CartItem = {
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images[0] || "/placeholder.svg",
      quantity: 1,
      stock: product.stock || 99,
    };
    addToCart(item);
    refreshCart();
    window.dispatchEvent(new Event("cartUpdated"));
    setTimeout(() => setAdding(false), 600);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(!wishlisted);
  };

  const productSlug = product.slug || product.id;

  return (
    <Link
      href={`/products/${productSlug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--muted-bg)]">
        <img
          src={images[0] || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-gray-900 shadow">
              {t("product.outOfStockBadge")}
            </span>
          </div>
        )}

        {/* Category badge */}
        {product.category && !outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-gray-700 backdrop-blur-sm">
            {product.category}
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full transition-all ${
            wishlisted
              ? "bg-accent text-white shadow-md"
              : "bg-white/80 text-gray-600 opacity-0 backdrop-blur-sm group-hover:opacity-100"
          }`}
        >
          <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
        </button>

        {/* Quick add button */}
        {!outOfStock && (
          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-medium text-white shadow-lg transition-colors hover:bg-primary-dark disabled:opacity-70"
            >
              <ShoppingBag size={15} />
              {adding ? t("product.adding") : t("product.addToCart")}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.category && (
          <span className="text-xs font-medium uppercase tracking-wider text-primary">
            {product.category}
          </span>
        )}
        <h3 className="font-serif text-base font-semibold leading-snug text-[var(--fg)]">
          {truncate(product.name, 50)}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={product.rating} size={14} />
            {product.reviewCount && (
              <span className="text-xs text-[var(--muted)]">
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto flex items-center gap-2">
          <span className="font-serif text-lg font-bold text-[var(--fg)]">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-[var(--muted)] line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>

        {/* Stock indicator */}
        {lowStock && (
          <span className="text-xs font-medium text-accent">{t("product.lowStockBadge")}</span>
        )}
      </div>
    </Link>
  );
}
