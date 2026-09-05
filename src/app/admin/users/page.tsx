"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Search, UsersIcon } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useLanguage } from "@/lib/i18n/context";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count?: {
    orders: number;
    reviews: number;
  };
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminUsers() {
  const { t } = useLanguage();
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (search) params.set("q", search);

      const res = await fetch(`/api/admin/users?${params}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-bold text-rose-900">{t("admin.users.title")}</h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.users.search")}
            className="w-full rounded-lg border border-pink-200 bg-white py-2 pl-10 pr-4 text-sm text-rose-900 placeholder-rose-300 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-pink-100 px-4 py-2 text-sm font-medium text-pink-700 transition-colors hover:bg-pink-200"
        >
          {t("admin.users.searchBtn")}
        </button>
      </form>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-rose-100" />
          ))}
        </div>
      ) : !data || data.users.length === 0 ? (
        <EmptyState
          title={t("admin.users.empty")}
          description={search ? t("admin.users.emptySearch") : t("admin.users.emptyAll")}
          icon={<UsersIcon size={48} strokeWidth={1} />}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-pink-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-pink-100 bg-rose-50 text-rose-500">
                  <th className="px-4 py-3 font-medium">{t("admin.users.name")}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.users.email")}</th>
                  <th className="px-4 py-3 font-medium text-center">{t("admin.users.role")}</th>
                  <th className="px-4 py-3 font-medium text-center">{t("admin.users.orders")}</th>
                  <th className="px-4 py-3 font-medium text-center">{t("admin.users.reviews")}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.users.joined")}</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-pink-50 transition-colors hover:bg-rose-50"
                  >
                    <td className="px-4 py-3 font-medium text-rose-900">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-rose-600">{user.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-pink-100 text-pink-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-rose-700">
                      {user._count?.orders ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center text-rose-700">
                      {user._count?.reviews ?? 0}
                    </td>
                    <td className="px-4 py-3 text-rose-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-rose-700 transition-colors hover:bg-pink-100 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                {t("admin.users.previous")}
              </button>
              <span className="text-sm text-rose-500">
                {t("admin.users.page")} {data.page} {t("admin.users.of")} {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-rose-700 transition-colors hover:bg-pink-100 disabled:opacity-50"
              >
                {t("admin.users.next")}
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
