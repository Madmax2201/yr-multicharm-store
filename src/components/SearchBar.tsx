"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ placeholder, className = "", onSearch }: SearchBarProps) {
  const { t } = useLanguage();
  placeholder = placeholder ?? t("products.searchPlaceholder");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (onSearch) {
      onSearch(q);
    } else {
      router.push(`/products?q=${encodeURIComponent(q)}`);
    }
  };

  const clear = () => setQuery("");

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center ${className}`}
    >
      <Search
        size={16}
        className={`absolute left-3 transition-colors ${
          focused ? "text-primary" : "text-[var(--muted)]"
        }`}
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={`w-full rounded-full border bg-[var(--card)] py-2.5 pl-10 pr-10 text-sm text-[var(--fg)] outline-none transition-all placeholder:text-[var(--muted)] ${
          focused
            ? "border-primary ring-2 ring-primary/20"
            : "border-[var(--border)]"
        }`}
      />
      {query && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-3 text-[var(--muted)] hover:text-[var(--fg)]"
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
}
