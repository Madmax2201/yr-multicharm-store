"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Menu,
  X,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/coupons", label: "Coupons", icon: Tag },
  ];

  return (
    <div className="flex min-h-screen bg-purple-50">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-purple-950 text-white transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between border-b border-purple-800 px-6">
          <Link href="/admin" className="font-serif text-xl font-bold tracking-tight">
            <img src="/images/Logo.jpg" alt="YR MULTICHARM store" className="h-10 w-auto" />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-purple-600 text-white"
                    : "text-purple-200 hover:bg-purple-900 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-purple-300 transition-colors hover:bg-purple-900 hover:text-white"
          >
            <ExternalLink size={16} />
            Back to Store
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-purple-200 bg-white px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu size={22} className="text-purple-700" />
          </button>
          <div className="flex items-center gap-2">
            <ChevronLeft size={18} className="text-purple-400" />
            <span className="font-serif text-lg font-semibold text-purple-900">
              Admin Panel
            </span>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
