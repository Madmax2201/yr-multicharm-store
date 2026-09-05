"use client";

import { Sun, Moon } from "lucide-react";
import { useApp } from "./AppProvider";
import { useLanguage } from "@/lib/i18n/context";

export function ThemeToggle() {
  const { isDark, toggleDark } = useApp();
  const { t } = useLanguage();

  return (
    <button
      onClick={toggleDark}
      className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--muted-bg)] hover:text-primary"
      aria-label={t("common.toggleDark")}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
