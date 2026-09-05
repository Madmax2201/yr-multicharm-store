"use client";

import { useLanguage } from "@/lib/i18n/context";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "ar" : "en")}
      className="flex h-9 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--muted-bg)] hover:text-primary"
      aria-label="Switch language"
    >
      <Globe size={14} />
      {locale === "en" ? "AR" : "EN"}
    </button>
  );
}
