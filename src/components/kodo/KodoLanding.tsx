"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { WILAYAS } from "@/lib/wilayas";
import { useLanguage } from "@/lib/i18n/context";
import {
  Sparkles,
  Check,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export function KodoLanding({
  image,
  name,
  price,
  howToUse,
}: {
  image: string;
  name: string;
  price: number;
  howToUse: string | null;
}) {
  const { t, locale, dir } = useLanguage();

  const features = [
    { title: t("kodo.f1Title"), body: t("kodo.f1Body") },
    { title: t("kodo.f2Title"), body: t("kodo.f2Body") },
    { title: t("kodo.f3Title"), body: t("kodo.f3Body") },
    { title: t("kodo.f4Title"), body: t("kodo.f4Body") },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})`, opacity: 0.18 }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)]/70 via-[var(--bg)]/85 to-[var(--bg)]" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles size={14} />
                {t("kodo.badge")}
              </span>

              <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-[var(--fg)] md:text-5xl">
                {t("kodo.title")}
              </h1>

              <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
                {t("kodo.subtitle")}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <a
                  href="#sponsor"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark hover:shadow-lg"
                >
                  {t("kodo.cta")}
                  <ArrowRight size={16} className="rtl:rotate-180" />
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-7 py-3.5 text-sm font-semibold text-[var(--fg)] transition-colors hover:bg-[var(--muted-bg)]"
                >
                  {t("kodo.ctaSecondary")}
                </a>
              </div>

              <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    {t("kodo.priceLabel")}
                  </p>
                  <p className="font-serif text-2xl font-bold text-[var(--fg)]">
                    {formatPrice(price)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
                <img src={image} alt={name} className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-light">
                <Check size={18} className="text-primary" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[var(--fg)]">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                {f.body}
              </p>
            </div>
          ))}
        </div>

        {howToUse && (
          <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
            <h3 className="font-serif text-xl font-bold text-[var(--fg)]">
              {t("kodo.howTitle")}
            </h3>
            <p
              className="mt-3 text-sm leading-relaxed text-[var(--muted)]"
              dir={dir}
            >
              {howToUse}
            </p>
          </div>
        )}
      </section>

      <SponsorForm wilayaLang={locale} />
    </div>
  );
}

function SponsorForm({ wilayaLang }: { wilayaLang: string }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    wilaya: "",
    quantity: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section id="sponsor" className="mx-auto max-w-3xl px-4 pb-20">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
          <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check size={30} className="text-green-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[var(--fg)]">
            {t("kodo.successTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            {t("kodo.successBody")}
          </p>
          <button
            onClick={() => {
              setDone(false);
              setForm({
                name: "",
                phone: "",
                email: "",
                wilaya: "",
                quantity: "",
                message: "",
              });
            }}
            className="mt-7 text-sm font-medium text-primary hover:underline"
          >
            {t("kodo.another")}
          </button>
        </div>
      </section>
    );
  }

  const field =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] placeholder:text-[var(--muted)] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
  const label = "mb-1.5 block text-sm font-medium text-[var(--fg)]";

  return (
    <section id="sponsor" className="mx-auto max-w-3xl px-4 pb-20">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-10">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-2xl font-bold text-[var(--fg)] md:text-3xl">
            {t("kodo.formTitle")}
          </h2>
          <p className="mx-auto mt-2.5 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
            {t("kodo.formSubtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="lead-name">
                {t("kodo.name")} <span className="text-red-500">*</span>
              </label>
              <input
                id="lead-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="lead-phone">
                {t("kodo.phone")} <span className="text-red-500">*</span>
              </label>
              <input
                id="lead-phone"
                type="tel"
                required
                dir="ltr"
                placeholder="0555 12 34 56"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={field}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="lead-email">
                {t("kodo.email")}
              </label>
              <input
                id="lead-email"
                type="email"
                dir="ltr"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="lead-wilaya">
                {t("kodo.wilaya")} <span className="text-red-500">*</span>
              </label>
              <select
                id="lead-wilaya"
                required
                value={form.wilaya}
                onChange={(e) => update("wilaya", e.target.value)}
                className={field}
              >
                <option value="">{t("kodo.wilayaPlaceholder")}</option>
                {WILAYAS.map((w) => (
                  <option key={w.code} value={w.ar}>
                    {wilayaLang === "ar"
                      ? `${w.code} - ${w.ar}`
                      : `${w.code} - ${w.en}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={label} htmlFor="lead-quantity">
              {t("kodo.quantity")}
            </label>
            <input
              id="lead-quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label className={label} htmlFor="lead-message">
              {t("kodo.message")}
            </label>
            <textarea
              id="lead-message"
              rows={4}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder={t("kodo.messagePlaceholder")}
              className={`${field} resize-y`}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t("kodo.submitting")}
              </>
            ) : (
              <>
                {t("kodo.submit")}
                <ArrowRight size={16} className="rtl:rotate-180" />
              </>
            )}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-[var(--muted)]">
            <ShieldCheck size={14} />
            {t("kodo.privacy")}
          </p>
        </form>
      </div>
    </section>
  );
}
