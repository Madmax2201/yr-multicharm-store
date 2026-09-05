"use client";

import Link from "next/link";
import { Heart, Mail } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

const quickLinks = [
  { labelKey: "footer.home", href: "/" },
  { labelKey: "footer.shopAll", href: "/products" },
  { labelKey: "footer.newArrivals", href: "/products?sort=newest" },
  { labelKey: "footer.bestSellers", href: "/products?sort=bestsellers" },
  { labelKey: "footer.aboutUs", href: "/about" },
  { labelKey: "footer.contact", href: "/contact" },
];

const customerLinks = [
  { labelKey: "footer.shippingInfo", href: "/shipping" },
  { labelKey: "footer.returns", href: "/returns" },
  { labelKey: "footer.faq", href: "/faq" },
  { labelKey: "footer.privacyPolicy", href: "/privacy" },
  { labelKey: "footer.termsOfService", href: "/terms" },
];

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block">
              <img src="/images/Logo.jpg" alt="YR MULTICHARM store" className="h-16 w-auto" />
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              {t("footer.brandDesc")}
            </p>
            <div className="mt-4 flex gap-3">
              {["Instagram", "Pinterest", "TikTok", "YouTube"].map((social) => (
                <span
                  key={social}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted-bg)] text-xs font-medium text-[var(--muted)] transition-colors hover:bg-primary hover:text-white cursor-default"
                  title={social}
                >
                  {social[0]}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-serif text-lg font-semibold text-[var(--fg)]">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] transition-colors hover:text-primary"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="mb-4 font-serif text-lg font-semibold text-[var(--fg)]">
              {t("footer.customerService")}
            </h4>
            <ul className="space-y-2.5">
              {customerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] transition-colors hover:text-primary"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-4 font-serif text-lg font-semibold text-[var(--fg)]">
              {t("footer.newsletterTitle")}
            </h4>
            <p className="mb-4 text-sm text-[var(--muted)]">
              {t("footer.newsletterDesc")}
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                />
                <input
                  type="email"
                  placeholder={t("footer.newsletterPlaceholder")}
                  className="w-full rounded-full border border-[var(--border)] bg-[var(--bg)] py-2.5 pl-10 pr-4 text-sm text-[var(--fg)] outline-none placeholder:text-[var(--muted)] focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
              >
                {t("footer.subscribe")}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-6 sm:flex-row">
          <p className="text-xs text-[var(--muted)]">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="flex items-center gap-1 text-xs text-[var(--muted)]">
            {t("footer.madeWith")} <Heart size={12} className="text-accent" /> {t("footer.forBeautyLovers")}
          </p>
        </div>
      </div>
    </footer>
  );
}
