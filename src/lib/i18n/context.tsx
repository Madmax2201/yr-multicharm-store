"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { type Locale, defaultLocale, isRtl } from "./config";
import en from "./en";
import ar from "./ar";

type TranslationMap = Record<string, string>;

const translations: Record<Locale, TranslationMap> = { en, ar };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const stored = localStorage.getItem("locale") as Locale | null;
  if (stored && (stored === "en" || stored === "ar")) return stored;
  const browserLang = navigator.language?.startsWith("ar") ? "ar" : "en";
  return browserLang;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const initial = getInitialLocale();
    setLocaleState(initial);
    document.documentElement.dir = isRtl[initial] ? "rtl" : "ltr";
    document.documentElement.lang = initial;
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
    document.documentElement.dir = isRtl[newLocale] ? "rtl" : "ltr";
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = translations[locale]?.[key] ?? translations[defaultLocale]?.[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{${k}}`, String(v));
        }
      }
      return value;
    },
    [locale]
  );

  const dir = isRtl[locale] ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
