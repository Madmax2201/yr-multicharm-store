"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { useLanguage } from "@/lib/i18n/context";
import { getCart, getCartTotal, clearCart, type CartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag,
  CreditCard,
  MapPin,
  Mail,
  Tag,
  Loader2,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { refreshCart } = useApp();
  const { t } = useLanguage();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const items = getCart();
    if (items.length === 0) {
      router.push("/cart");
      return;
    }
    setCart(items);
  }, [router]);

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

  const handlePlaceOrder = async () => {
    if (!fullName || !street || !city || !state || !zipCode || !phone) {
      setError(t("checkout.validationError"));
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.productId,
            productName: item.name,
            variantId: item.variantId || null,
            variantName: item.variantName || null,
            price: item.price,
            quantity: item.quantity,
          })),
          fullName,
          email: email || undefined,
          street,
          city,
          state,
          zipCode,
          phone,
          notes: notes || undefined,
          couponCode: couponDiscount > 0 ? couponCode : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      clearCart();
      refreshCart();
      window.dispatchEvent(new Event("cartUpdated"));
      router.push(`/checkout/success?order=${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = getCartTotal(cart);
  const total = Math.max(0, subtotal - couponDiscount);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--fg)]">
          <ChevronLeft size={16} /> {t("checkout.backToCart")}
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-bold text-[var(--fg)]">{t("checkout.title")}</h1>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-8 lg:col-span-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <div className="mb-6 flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              <h3 className="font-semibold text-[var(--fg)]">{t("checkout.shipping")}</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">{t("checkout.fullName")}</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--fg)] outline-none transition-colors focus:border-primary" placeholder={t("checkout.fullNamePlaceholder")} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">{t("checkout.email")}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--fg)] outline-none transition-colors focus:border-primary" placeholder={t("checkout.emailPlaceholder")} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">{t("checkout.address")}</label>
                <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--fg)] outline-none transition-colors focus:border-primary" placeholder={t("checkout.addressPlaceholder")} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">{t("checkout.city")}</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--fg)] outline-none transition-colors focus:border-primary" placeholder={t("checkout.cityPlaceholder")} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">{t("checkout.state")}</label>
                <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--fg)] outline-none transition-colors focus:border-primary" placeholder={t("checkout.statePlaceholder")} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">{t("checkout.zip")}</label>
                <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--fg)] outline-none transition-colors focus:border-primary" placeholder={t("checkout.zipPlaceholder")} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">{t("checkout.phone")}</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--fg)] outline-none transition-colors focus:border-primary" placeholder={t("checkout.phonePlaceholder")} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">{t("checkout.notes")}</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--fg)] outline-none transition-colors focus:border-primary" placeholder={t("checkout.notesPlaceholder")} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-primary" />
              <h3 className="font-semibold text-[var(--fg)]">{t("checkout.payment")}</h3>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-primary bg-primary-light/20 p-4">
              <input type="radio" checked={true} readOnly className="h-4 w-4 accent-primary" />
              <div>
                <p className="text-sm font-medium text-[var(--fg)]">{t("checkout.cod")}</p>
                <p className="text-xs text-[var(--muted)]">{t("checkout.codDesc")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h3 className="mb-4 font-serif text-lg font-semibold text-[var(--fg)]">{t("checkout.summary")}</h3>

            <div className="mb-6 max-h-64 space-y-3 overflow-y-auto">
              {cart.map((item) => {
                const itemKey = item.productId + (item.variantId || "");
                return (
                  <div key={itemKey} className="flex gap-3">
                    <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-14 w-14 shrink-0 rounded-lg bg-[var(--muted-bg)] object-cover" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-[var(--fg)]">{item.name}</p>
                      {item.variantName && <p className="text-xs text-[var(--muted)]">{item.variantName}</p>}
                      <p className="text-xs text-[var(--muted)]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-[var(--fg)]">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                );
              })}
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{t("checkout.couponCode")}</label>
              <div className="flex gap-2">
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder={t("checkout.couponPlaceholder")} className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--fg)] outline-none transition-colors focus:border-primary" />
                <button onClick={applyCoupon} disabled={applying || !couponCode.trim()} className="inline-flex items-center gap-1 rounded-lg bg-[var(--muted-bg)] px-3 py-2 text-sm font-medium text-[var(--fg)] transition-colors hover:bg-[var(--border)] disabled:opacity-50">
                  {applying ? <Loader2 size={14} className="animate-spin" /> : <Tag size={14} />} {t("checkout.apply")}
                </button>
              </div>
              {couponError && <p className="mt-1 text-xs text-red-500">{couponError}</p>}
              {couponDiscount > 0 && <p className="mt-1 text-xs font-medium text-green-600">{t("checkout.couponApplied", { price: formatPrice(couponDiscount) })}</p>}
            </div>

            <div className="space-y-2 border-t border-[var(--border)] pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">{t("checkout.subtotal")}</span>
                <span className="font-medium text-[var(--fg)]">{formatPrice(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">{t("checkout.discount")}</span>
                  <span className="font-medium text-green-600">-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[var(--border)] pt-2">
                <span className="font-semibold text-[var(--fg)]">{t("checkout.total")}</span>
                <span className="font-serif text-xl font-bold text-[var(--fg)]">{formatPrice(total)}</span>
              </div>
            </div>

            <p className="mt-3 text-xs text-[var(--muted)]">{t("checkout.codInfo")}</p>

            <button onClick={handlePlaceOrder} disabled={submitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-semibold text-white shadow-md transition-all hover:bg-primary-dark hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> {t("checkout.processing")}</>
              ) : (
                <><CheckCircle size={18} /> {t("checkout.placeOrder", { price: formatPrice(total) })}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
