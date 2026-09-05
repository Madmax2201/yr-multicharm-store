"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { CheckCircle, ArrowRight, Package } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const orderId = searchParams.get("order");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 rounded-full bg-green-100 p-4">
        <CheckCircle size={48} className="text-green-500" />
      </div>
      <h1 className="font-serif text-3xl font-bold text-[var(--fg)]">{t("checkout.success.title")}</h1>
      <p className="mt-2 text-[var(--muted)]">{t("checkout.success.desc")}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {t("checkout.success.codInfo")}
      </p>
      {orderId && (
        <Link
          href={`/account/orders/${orderId}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-pink-600 px-6 py-3 font-medium text-white shadow-md transition-all hover:bg-pink-700"
        >
          <Package size={18} /> {t("checkout.success.viewOrder")} <ArrowRight size={18} />
        </Link>
      )}
      <Link
        href="/products"
        className="mt-4 inline-flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700"
      >
        {t("checkout.success.continue")} <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export default function CheckoutSuccess() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="py-20 text-center text-[var(--muted)]">{t("checkout.success.loading")}</div>}>
      <SuccessContent />
    </Suspense>
  );
}
