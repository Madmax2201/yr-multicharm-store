"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Heart,
  ShoppingBag,
  User,
  ChevronDown,
  LogOut,
  Package,
  Settings,
} from "lucide-react";
import { useApp } from "./AppProvider";
import { useLanguage } from "@/lib/i18n/context";
import { getTokenFromCookie } from "@/lib/auth";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Dropdown } from "./ui/dropdown";
import { categories } from "@/lib/utils";

const navLinks = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.shop", href: "/products" },
  { labelKey: "footer.contact", href: "/contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, wishlistCount } = useApp();
  const { t } = useLanguage();

  useEffect(() => {
    const token = getTokenFromCookie();
    setLoggedIn(!!token);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(payload.role === "ADMIN");
      } catch {
        setIsAdmin(false);
      }
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const userMenuItems = [
    { label: t("nav.myAccount"), href: "/account", icon: <User size={16} /> },
    { label: t("nav.myOrders"), href: "/account/orders", icon: <Package size={16} /> },
    { divider: true, label: "" },
    {
      label: t("nav.signOut"),
      onClick: () => {
        document.cookie = "token=; path=/; max-age=0";
        window.location.href = "/auth/login";
      },
      icon: <LogOut size={16} />,
    },
  ];

  const adminMenuItems = [
    { label: "Admin Dashboard", href: "/admin", icon: <Settings size={16} /> },
    { label: t("nav.myOrders"), href: "/account/orders", icon: <Package size={16} /> },
    { divider: true, label: "" },
    {
      label: t("nav.signOut"),
      onClick: () => {
        document.cookie = "token=; path=/; max-age=0";
        window.location.href = "/auth/login";
      },
      icon: <LogOut size={16} />,
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-[var(--border)] transition-all duration-300 ${
        scrolled
          ? "bg-[var(--card)]/80 shadow-sm backdrop-blur-lg"
          : "bg-[var(--card)]"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/images/Logo.jpg" alt="YR MULTICHARM store" className="h-16 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href
                  ? "text-primary"
                  : "text-[var(--fg)]"
              }`}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden md:block">
            <SearchBar className="w-48 lg:w-64" />
          </div>

          <LanguageSwitcher />
          <ThemeToggle />

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--muted-bg)] hover:text-primary"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--muted-bg)] hover:text-primary"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User (desktop) */}
          <div className="hidden md:block">
            {loggedIn ? (
              <Dropdown
                trigger={
                  <div className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--muted-bg)] hover:text-primary">
                    <User size={20} />
                  </div>
                }
                items={isAdmin ? adminMenuItems : userMenuItems}
                align="right"
              />
            ) : (
              <Link
                href="/auth/login"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--muted-bg)] hover:text-primary"
              >
                <User size={20} />
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--muted-bg)] hover:text-primary md:hidden"
            aria-label={t("common.menu")}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--card)] md:hidden">
          <div className="space-y-1 px-4 py-4">
            <SearchBar className="mb-4 w-full" />
            {[
              { labelKey: "nav.home", href: "/" },
              { labelKey: "nav.shop", href: "/products" },
              { labelKey: "nav.allCategories", href: "/products" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-primary-light text-primary"
                    : "text-[var(--fg)] hover:bg-[var(--muted-bg)]"
                }`}
              >
                {t(link.labelKey)}
              </Link>
            ))}
            <div className="border-t border-[var(--border)] pt-2">
              <Link
                href={loggedIn ? (isAdmin ? "/admin" : "/account") : "/auth/login"}
                className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-[var(--fg)] transition-colors hover:bg-[var(--muted-bg)]"
              >
                <User size={16} /> {loggedIn ? (isAdmin ? "Admin Dashboard" : t("nav.myAccount")) : t("nav.signIn")}
              </Link>
              {loggedIn && (
                <button
                  onClick={() => {
                    document.cookie = "token=; path=/; max-age=0";
                    window.location.href = "/auth/login";
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-[var(--fg)] transition-colors hover:bg-[var(--muted-bg)]"
                >
                  <LogOut size={16} /> {t("nav.signOut")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
