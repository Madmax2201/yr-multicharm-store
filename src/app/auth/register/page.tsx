"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { useLanguage } from "@/lib/i18n/context";
import { Eye, EyeOff, Loader2, AlertCircle, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshCart } = useApp();
  const { t } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError(t("auth.register.fillFields"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth.register.passwordLength"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.register.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      refreshCart();
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <Sparkles size={32} className="mx-auto mb-3 text-primary" />
        <h1 className="font-serif text-3xl font-bold text-[var(--fg)]">{t("auth.register.title")}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{t("auth.register.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3.5 text-sm text-red-600">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">{t("auth.register.fullName")}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("auth.register.fullNamePlaceholder")}
            autoComplete="name"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition-colors focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">{t("auth.register.email")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.register.emailPlaceholder")}
            autoComplete="email"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition-colors focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">{t("auth.register.password")}</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.register.passwordPlaceholder")}
              autoComplete="new-password"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 pr-11 text-sm text-[var(--fg)] outline-none transition-colors focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--fg)]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">{t("auth.register.confirmPassword")}</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t("auth.register.confirmPasswordPlaceholder")}
            autoComplete="new-password"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition-colors focus:border-primary"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-semibold text-white shadow-md transition-all hover:bg-primary-dark hover:shadow-lg disabled:opacity-60"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          {loading ? t("auth.register.creating") : t("auth.register.create")}
        </button>
      </form>

      <p className="mt-6 text-sm text-[var(--muted)]">
        {t("auth.register.hasAccount")}{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:text-primary-dark">
          {t("auth.register.signIn")}
        </Link>
      </p>
    </div>
  );
}
