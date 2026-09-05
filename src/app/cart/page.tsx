"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { useLanguage } from "@/lib/i18n/context";
import { EmptyState } from "@/components/EmptyState";
import {
  getCart,
  updateQuantity,
  removeFromCart,
  getCartTotal,
  type CartItem,
} from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Tag,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { refreshCart } = useApp();
  const { t } = useLanguage();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [applying, setApplying] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const refresh = () => {
    const items = getCart();
    setCart(items);
    refreshCart();
  };

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, []);

  const handleQuantity = (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    if (newQty > item.stock) return;
    updateQuantity(item.productId, newQty, item.variantId);
    refresh();
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleRemove = (item: CartItem) => {
    if (removeId === item.productId + (item.variantId || "")) {
      removeFromCart(item.productId, item.variantId);
      setRemoveId(null);
      refresh();
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      setRemoveId(item.productId + (item.variantId || ""));
      setTimeout(() => setRemoveId(null), 3000);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplying(true);
    setCouponError("");
    try {
      const subtotal = getCartTotal(cart);
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, total: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || t("cart.invalidCoupon"));
        setCouponDiscount(0);
      } else {
        setCouponDiscount(data.discount);
      }
    } catch {
      setCouponError(t("cart.couponFailed"));
    } finally {
      setApplying(false);
    }
  };

  const subtotal = getCartTotal(cart);
  const total = Math.max(0, subtotal - couponDiscount);

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          icon={<ShoppingBag size={64} strokeWidth={1} />}
          title={t("cart.empty")}
          description={t("cart.emptyDesc")}
          actionLabel={t("cart.startShopping")}
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-[var(--fg)]">{t("cart.title")}</h1>
        <span className="text-sm text-[var(--muted)]">
          {t("cart.items", { count: cart.reduce((s, i) => s + i.quantity, 0) })}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {cart.map((item) => {
            const itemKey = item.productId + (item.variantId || "");
            return (
              <div
                key={itemKey}
                className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all"
              >
                <Link
                  href={`/products/${item.productId}`}
                  className="shrink-0 overflow-hidden rounded-xl bg-[var(--muted-bg)]"
                >
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="h-24 w-24 object-cover md:h-28 md:w-28"
                  />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.productId}`}
                      className="font-serif text-base font-semibold text-[var(--fg)] transition-colors hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    {item.variantName && (
                      <p className="mt-0.5 text-xs text-[var(--muted)]">{item.variantName}</p>
                    )}
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex items-center gap-2">
                      <QuantityControls
                        quantity={item.quantity}
                        max={item.stock}
                        onDecrement={() => handleQuantity(item, -1)}
                        onIncrement={() => handleQuantity(item, 1)}
                      />
                      <button
                        onClick={() => handleRemove(item)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                          removeId === itemKey
                            ? "bg-accent text-white"
                            : "text-[var(--muted)] hover:bg-red-50 hover:text-accent"
                        }`}
                        title={removeId === itemKey ? t("cart.clickToConfirm") : t("cart.removeItem")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--fg)]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {t("cart.each", { price: formatPrice(item.price) })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <Link
            href="/products"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
          >
            <ArrowLeft size={16} />
            {t("cart.continueShopping")}
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h3 className="mb-6 font-serif text-lg font-semibold text-[var(--fg)]">{t("cart.summary")}</h3>

            {/* Coupon */}
            <div className="mb-6">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                {t("cart.couponCode")}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder={t("cart.couponPlaceholder")}
                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--fg)] outline-none transition-colors focus:border-primary"
                />
                <button
                  onClick={applyCoupon}
                  disabled={applying || !couponCode.trim()}
                  className="inline-flex items-center gap-1 rounded-lg bg-[var(--muted-bg)] px-3 py-2 text-sm font-medium text-[var(--fg)] transition-colors hover:bg-[var(--border)] disabled:opacity-50"
                >
                  {applying ? <Loader2 size={14} className="animate-spin" /> : <Tag size={14} />}
                  {t("cart.apply")}
                </button>
              </div>
              {couponError && (
                <p className="mt-1 text-xs text-red-500">{couponError}</p>
              )}
              {couponDiscount > 0 && (
                <p className="mt-1 text-xs font-medium text-green-600">
                  {t("cart.couponApplied", { price: formatPrice(couponDiscount) })}
                </p>
              )}
            </div>

            <div className="space-y-3 border-t border-[var(--border)] pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">{t("cart.subtotal")}</span>
                <span className="font-medium text-[var(--fg)]">{formatPrice(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">{t("cart.discount")}</span>
                  <span className="font-medium text-green-600">-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">{t("cart.shipping")}</span>
                <span className="font-medium text-[var(--fg)]">{t("cart.shippingCalc")}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--border)] pt-3">
                <span className="font-semibold text-[var(--fg)]">{t("cart.total")}</span>
                <span className="font-serif text-xl font-bold text-[var(--fg)]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-semibold text-white shadow-md transition-all hover:bg-primary-dark hover:shadow-lg"
            >
              {t("cart.checkout")}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuantityControls({
  quantity,
  max,
  onDecrement,
  onIncrement,
}: {
  quantity: number;
  max: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-[var(--border)]">
      <button
        onClick={onDecrement}
        disabled={quantity <= 1}
        className="flex h-8 w-8 items-center justify-center text-[var(--muted)] transition-colors hover:text-[var(--fg)] disabled:opacity-40"
      >
        <Minus size={14} />
      </button>
      <span className="flex h-8 w-10 items-center justify-center text-sm font-medium text-[var(--fg)]">
        {quantity}
      </span>
      <button
        onClick={onIncrement}
        disabled={quantity >= max}
        className="flex h-8 w-8 items-center justify-center text-[var(--muted)] transition-colors hover:text-[var(--fg)] disabled:opacity-40"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
