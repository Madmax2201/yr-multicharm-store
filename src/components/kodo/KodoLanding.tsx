"use client";

import { useEffect, useState } from "react";
import { formatPrice, getPromotion } from "@/lib/utils";
import { WILAYAS } from "@/lib/wilayas";
import { useLanguage } from "@/lib/i18n/context";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Lock,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
  Zap,
} from "lucide-react";

export interface KodoReview {
  id: string;
  rating: number;
  comment: string;
  author: string;
  createdAt: string;
}

export function KodoLanding({
  image,
  name,
  price,
  comparePrice,
  howToUse,
  reviews,
}: {
  image: string;
  name: string;
  price: number;
  comparePrice?: number | null;
  howToUse: string | null;
  reviews: KodoReview[];
}) {
  const { t, locale, dir } = useLanguage();
  const promotion = getPromotion(price, comparePrice);

  const faqs = [
    { q: t("kodo.faq1Q"), a: t("kodo.faq1A") },
    { q: t("kodo.faq2Q"), a: t("kodo.faq2A") },
    { q: t("kodo.faq3Q"), a: t("kodo.faq3A") },
    { q: t("kodo.faq4Q"), a: t("kodo.faq4A") },
    { q: t("kodo.faq5Q"), a: t("kodo.faq5A") },
    { q: t("kodo.faq6Q"), a: t("kodo.faq6A") },
    { q: t("kodo.faq7Q"), a: t("kodo.faq7A") },
  ];

  const specs = [
    { title: t("kodo.spec1Title"), body: t("kodo.spec1Body") },
    { title: t("kodo.spec2Title"), body: t("kodo.spec2Body") },
    { title: t("kodo.spec3Title"), body: t("kodo.spec3Body") },
    { title: t("kodo.spec4Title"), body: t("kodo.spec4Body") },
  ];

  const usage = [
    { title: t("kodo.usage1Title"), body: t("kodo.usage1Body") },
    { title: t("kodo.usage2Title"), body: t("kodo.usage2Body") },
    { title: t("kodo.usage3Title"), body: t("kodo.usage3Body") },
  ];

  const steps = [
    { title: t("kodo.step1Title"), body: t("kodo.step1Body") },
    { title: t("kodo.step2Title"), body: t("kodo.step2Body") },
    { title: t("kodo.step3Title"), body: t("kodo.step3Body") },
  ];

  const stats = [
    { value: t("kodo.stat1Value"), label: t("kodo.stat1Label") },
    { value: t("kodo.stat2Value"), label: t("kodo.stat2Label") },
    { value: t("kodo.stat3Value"), label: t("kodo.stat3Label") },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24 md:pb-0">
      {/* Announcement + header stay visible so the order CTA is always one tap away. */}
      <div className="sticky top-0 z-50">
        <div className="bg-[var(--fg)] px-4 py-2 text-center text-[11px] font-semibold tracking-wide text-white md:text-xs">
          {t("kodo.announce")}
        </div>
        <header className="border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <span className="font-serif text-lg font-bold text-[var(--fg)]">
              KODO
            </span>
            <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--muted)] md:flex">
              <a href="#specs" className="transition-colors hover:text-[var(--fg)]">
                {t("kodo.navSpecs")}
              </a>
              <a href="#usage" className="transition-colors hover:text-[var(--fg)]">
                {t("kodo.navUsage")}
              </a>
              <a href="#faq" className="transition-colors hover:text-[var(--fg)]">
                {t("kodo.navFaq")}
              </a>
            </nav>
            <a
              href="#order"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-primary-dark md:text-sm"
            >
              {t("kodo.orderNow")}
              <ArrowRight size={15} className="rtl:rotate-180" />
            </a>
          </div>
        </header>
      </div>

      {/* Hero + order form */}
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Sparkles size={13} />
              {t("kodo.eyebrow")}
            </span>

            <h1 className="mt-5 font-serif text-3xl font-bold leading-tight text-[var(--fg)] md:text-[2.6rem]">
              {t("kodo.title")}
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)] md:text-lg">
              {t("kodo.subtitle")}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {[t("kodo.chipFlashes"), t("kodo.chipHeads"), t("kodo.chipCod")].map(
                (chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-3.5 py-1.5 text-xs font-semibold text-[var(--fg)]"
                  >
                    <Check size={13} className="text-primary" />
                    {chip}
                  </span>
                )
              )}
            </div>

            <ul className="mt-7 space-y-2.5">
              {[t("kodo.bullet1"), t("kodo.bullet2"), t("kodo.bullet3")].map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-[var(--fg)]">
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-primary"
                  />
                  <span className="leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>

            {/* Offer box: the old price only appears when one is really configured. */}
            <div className="mt-8 rounded-2xl border-2 border-primary/25 bg-[var(--card)] p-5 md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                {t("kodo.offerLabel")}
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="font-serif text-4xl font-bold text-[var(--fg)] md:text-5xl">
                  {formatPrice(price)}
                </span>
                {promotion && (
                  <>
                    <span className="pb-1 text-xs text-[var(--muted)]">
                      {t("kodo.wasLabel")}
                    </span>
                    <span className="text-base text-[var(--muted)] line-through">
                      {formatPrice(promotion.oldPrice)}
                    </span>
                    <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                      {t("kodo.saveLabel")} {promotion.percentOff}%
                    </span>
                  </>
                )}
              </div>
              <p className="mt-3 flex items-center gap-2 text-sm text-[var(--muted)]">
                <Truck size={15} className="shrink-0" />
                {t("kodo.offerBox")}
              </p>
              <a
                href="#order"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
              >
                {t("kodo.ctaMain")}
                <ArrowRight size={16} className="rtl:rotate-180" />
              </a>
              <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-[var(--muted)]">
                <Lock size={13} className="mt-0.5 shrink-0" />
                {t("kodo.reassure")}
              </p>
              <p className="mt-1.5 flex items-start gap-2 text-xs leading-relaxed text-[var(--muted)]">
                <Phone size={13} className="mt-0.5 shrink-0" />
                {t("kodo.reassure2")}
              </p>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[300px] overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--card)] shadow-xl sm:max-w-[340px]">
              <img
                src={image}
                alt={name}
                width={900}
                height={1600}
                className="aspect-[9/16] h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <OrderForm
        price={price}
        comparePrice={comparePrice}
        image={image}
        name={name}
      />

      {/* Specs */}
      <section id="specs" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-14 md:py-20">
        <SectionHead title={t("kodo.specsTitle")} lead={t("kodo.specsLead")} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {specs.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-light">
                <Zap size={17} className="text-primary" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[var(--fg)]">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {s.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--muted-bg)] px-5 py-4 text-sm leading-relaxed text-[var(--muted)]">
          {t("kodo.specsNote")}
        </p>
      </section>

      {/* How to use */}
      <section id="usage" className="scroll-mt-28 bg-[var(--muted-bg)] py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHead title={t("kodo.usageTitle")} lead={t("kodo.usageLead")} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {usage.map((u, i) => (
              <div
                key={u.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-serif text-lg font-bold text-[var(--fg)]">
                  {u.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {u.body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
            {t("kodo.usageNote")}
          </p>
          {howToUse && (
            <p
              className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 text-sm leading-relaxed text-[var(--muted)]"
              dir={dir}
            >
              {howToUse}
            </p>
          )}
        </div>
      </section>

      {/* Order process */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <SectionHead title={t("kodo.stepsTitle")} />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary text-sm font-bold text-primary">
                {i + 1}
              </span>
              <div>
                <h3 className="font-serif text-base font-bold text-[var(--fg)]">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 flex items-center gap-2 text-sm font-medium text-[var(--fg)]">
          <ShieldCheck size={16} className="text-primary" />
          {t("kodo.noCard")}
        </p>
      </section>

      {/* Stats */}
      <section className="bg-primary py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4 px-4 text-center">
          {stats.map((s, i) => {
            const Icon = [MapPin, Zap, ShieldCheck][i] ?? Zap;
            return (
              <div key={s.label}>
                <Icon size={18} className="mx-auto mb-1.5 text-white/80" />
                <p className="font-serif text-2xl font-bold text-white md:text-3xl">
                  {s.value}
                </p>
                <p className="mt-1 text-[11px] font-medium text-white/85 md:text-sm">
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Transparency */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <SectionHead title={t("kodo.transpTitle")} />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-[var(--fg)]">
              <X size={18} className="text-red-500" />
              {t("kodo.neverTitle")}
            </h3>
            <ul className="mt-4 space-y-3">
              {[t("kodo.never1"), t("kodo.never2"), t("kodo.never3")].map((n) => (
                <li key={n} className="flex items-start gap-2.5 text-sm text-[var(--muted)]">
                  <X size={15} className="mt-0.5 shrink-0 text-red-500" />
                  <span className="leading-relaxed">{n}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h3 className="font-serif text-lg font-bold text-[var(--fg)]">
              {t("kodo.alwaysTitle")}
            </h3>
            <ul className="mt-4 space-y-3">
              {[t("kodo.always1"), t("kodo.always2"), t("kodo.always3")].map((n) => (
                <li key={n} className="flex items-start gap-2.5 text-sm text-[var(--muted)]">
                  <Check size={15} className="mt-0.5 shrink-0 text-green-600" />
                  <span className="leading-relaxed">{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Only real, verified reviews are rendered. With none, the block is skipped. */}
      {reviews.length > 0 && (
        <section className="bg-[var(--muted-bg)] py-14 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionHead
              title={t("kodo.reviewsTitle")}
              lead={t("kodo.reviewsNote")}
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <figure
                  key={r.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
                >
                  <Stars rating={r.rating} />
                  <blockquote className="mt-3 text-sm leading-relaxed text-[var(--fg)]">
                    {r.comment}
                  </blockquote>
                  <figcaption className="mt-4 text-xs font-medium text-[var(--muted)]">
                    {r.author}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Precautions */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <SectionHead title={t("kodo.precaTitle")} />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
            <h3 className="font-serif text-base font-bold text-green-900">
              {t("kodo.precaOkTitle")}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {[t("kodo.precaOk1"), t("kodo.precaOk2"), t("kodo.precaOk3")].map((n) => (
                <li key={n} className="flex items-start gap-2.5 text-sm text-green-900">
                  <Check size={15} className="mt-0.5 shrink-0 text-green-600" />
                  <span className="leading-relaxed">{n}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h3 className="font-serif text-base font-bold text-amber-900">
              {t("kodo.precaAskTitle")}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {[
                t("kodo.precaAsk1"),
                t("kodo.precaAsk2"),
                t("kodo.precaAsk3"),
                t("kodo.precaAsk4"),
              ].map((n) => (
                <li key={n} className="flex items-start gap-2.5 text-sm text-amber-900">
                  <Phone size={15} className="mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 text-sm leading-relaxed text-[var(--muted)]">
          {t("kodo.precaLegal")}
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-28 bg-[var(--muted-bg)] py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center font-serif text-2xl font-bold text-[var(--fg)] md:text-3xl">
            {t("kodo.faqTitle")}
          </h2>
          <div className="mt-8 space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[var(--fg)]">
                  {f.q}
                  <ChevronDown
                    size={17}
                    className="shrink-0 text-primary transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-3xl px-4 py-14 text-center md:py-20">
        <h2 className="font-serif text-2xl font-bold text-[var(--fg)] md:text-3xl">
          {t("kodo.finalTitle")}
        </h2>
        <p className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-[var(--muted)]">
          <Truck size={14} className="shrink-0" />
          {t("kodo.finalNote")}
        </p>
        <a
          href="#order"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
        >
          {t("kodo.ctaMain")}
          <ArrowRight size={16} className="rtl:rotate-180" />
        </a>
      </section>

      <footer className="border-t border-[var(--border)] px-4 py-8 text-center">
        <p className="text-xs leading-relaxed text-[var(--muted)]">
          {t("kodo.footerNote")}
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">{t("kodo.copyright")}</p>
        <a
          href="/products"
          className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
        >
          {t("kodo.backToShop")}
        </a>
      </footer>

      <StickyCta price={price} />
    </div>
  );
}

function SectionHead({ title, lead }: { title: string; lead?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="font-serif text-2xl font-bold text-[var(--fg)] md:text-3xl">
        {title}
      </h2>
      {lead && (
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] md:text-base">
          {lead}
        </p>
      )}
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} / 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden>
          {i < rating ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

function StickyCta({ price }: { price: number }) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--card)]/97 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <p className="font-serif text-lg font-bold leading-none text-[var(--fg)]">
            {formatPrice(price)}
          </p>
          <p className="mt-1 text-[10px] text-[var(--muted)]">
            {t("kodo.chipCod")}
          </p>
        </div>
        <a
          href="#order"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white"
        >
          {t("kodo.ctaMain")}
          <ArrowRight size={15} className="rtl:rotate-180" />
        </a>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  name: "",
  phone: "",
  wilaya: "",
  email: "",
  quantity: "",
  message: "",
  company: "",
};

function OrderForm({
  price,
  comparePrice,
  image,
  name,
}: {
  price: number;
  comparePrice?: number | null;
  image: string;
  name: string;
}) {
  const { t, locale } = useLanguage();
  const promotion = getPromotion(price, comparePrice);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Autofocus is deliberately skipped: a form that grabs the keyboard on a phone
  // interrupts the offer before it has been read.
  useEffect(() => {
    if (done) {
      document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [done]);

  const update = (key: keyof typeof EMPTY_FORM, value: string) =>
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
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section id="order" className="mx-auto max-w-3xl scroll-mt-28 px-4 py-14">
        <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center md:p-10">
          <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check size={30} className="text-green-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[var(--fg)]">
            {t("kodo.successTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            {t("kodo.successBody")}
          </p>
          <p className="mt-4 text-sm font-semibold text-green-900">
            {formatPrice(price)} · {t("kodo.chipCod")}
          </p>
          <button
            onClick={() => {
              setDone(false);
              setForm(EMPTY_FORM);
            }}
            className="mt-6 text-sm font-medium text-primary hover:underline"
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
    <section id="order" className="scroll-mt-28 px-4 py-6 md:py-10">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-9">
          <h2 className="font-serif text-2xl font-bold text-[var(--fg)]">
            {t("kodo.formTitle")}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            {t("kodo.formLead")}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className={label} htmlFor="kodo-name">
                {t("kodo.name")} <span className="text-red-500">*</span>
              </label>
              <input
                id="kodo-name"
                type="text"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={field}
              />
            </div>

            <div>
              <label className={label} htmlFor="kodo-phone">
                {t("kodo.phone")} <span className="text-red-500">*</span>
              </label>
              <input
                id="kodo-phone"
                type="tel"
                required
                dir="ltr"
                autoComplete="tel"
                placeholder="0555 12 34 56"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={`${field} text-start`}
              />
              <p className="mt-1.5 text-xs text-[var(--muted)]">
                {t("kodo.phoneHint")}
              </p>
            </div>

            <div>
              <label className={label} htmlFor="kodo-wilaya">
                {t("kodo.wilaya")}
              </label>
              <select
                id="kodo-wilaya"
                value={form.wilaya}
                onChange={(e) => update("wilaya", e.target.value)}
                className={field}
              >
                <option value="">{t("kodo.wilayaPlaceholder")}</option>
                {WILAYAS.map((w) => (
                  <option key={w.code} value={w.code}>
                    {locale === "ar" ? `${w.code} - ${w.ar}` : `${w.code} - ${w.en}`}
                  </option>
                ))}
              </select>
            </div>

            {expanded ? (
              <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--muted-bg)] p-4">
                <div>
                  <label className={label} htmlFor="kodo-email">
                    {t("kodo.email")}
                  </label>
                  <input
                    id="kodo-email"
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={field}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="kodo-quantity">
                    {t("kodo.quantity")}
                  </label>
                  <input
                    id="kodo-quantity"
                    type="number"
                    min="1"
                    inputMode="numeric"
                    value={form.quantity}
                    onChange={(e) => update("quantity", e.target.value)}
                    className={field}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="kodo-message">
                    {t("kodo.message")}
                  </label>
                  <textarea
                    id="kodo-message"
                    rows={3}
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    className={`${field} resize-y`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {t("kodo.moreDetails")}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="text-sm font-medium text-primary hover:underline"
              >
                + {t("kodo.moreDetails")}
              </button>
            )}

            {/* Honeypot: hidden from people, irresistible to bots. */}
            <div className="absolute -left-[9999px]" aria-hidden>
              <label htmlFor="kodo-company">{t("kodo.hp")}</label>
              <input
                id="kodo-company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
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
                  {t("kodo.submitMain")}
                  <ArrowRight size={16} className="rtl:rotate-180" />
                </>
              )}
            </button>

            <p className="text-center text-xs leading-relaxed text-[var(--muted)]">
              {t("kodo.submitSub")}
            </p>
          </form>
        </div>

        {/* Order summary */}
        <aside className="h-fit rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 lg:sticky lg:top-28">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            {t("kodo.offerLabel")}
          </p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--border)]">
            <img
              src={image}
              alt={name}
              width={900}
              height={1600}
              className="aspect-[9/16] w-full object-cover"
            />
          </div>
          <div className="mt-4 flex items-end justify-between gap-3">
            <span className="font-serif text-2xl font-bold text-[var(--fg)]">
              {formatPrice(price)}
            </span>
            {promotion && (
              <span className="text-sm text-[var(--muted)] line-through">
                {formatPrice(promotion.oldPrice)}
              </span>
            )}
          </div>
          <ul className="mt-5 space-y-2.5">
            {[t("kodo.chipFlashes"), t("kodo.chipHeads"), t("kodo.chipCod")].map(
              (row) => (
                <li
                  key={row}
                  className="flex items-center gap-2 text-xs text-[var(--muted)]"
                >
                  <Check size={14} className="shrink-0 text-primary" />
                  {row}
                </li>
              )
            )}
          </ul>
          <p className="mt-5 border-t border-[var(--border)] pt-4 text-xs leading-relaxed text-[var(--muted)]">
            {t("kodo.formTimeline")}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <ShieldCheck size={13} />
            {t("kodo.savedNote")}
          </p>
        </aside>
      </div>
    </section>
  );
}
