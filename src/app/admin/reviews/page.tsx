"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Trash2, Loader2, AlertCircle, Save, X, MessageSquare, Search } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
  product: { id: string; name: string; images: string };
}

function firstImage(raw: string): string {
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? String(arr[0] ?? "") : String(raw);
  } catch {
    return String(raw);
  }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ rating: 5, comment: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (term: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/reviews?search=${encodeURIComponent(term)}`);
      if (res.status === 401) {
        setError("You must be signed in as an admin");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  const startEdit = (r: Review) => {
    setEditing(r.id);
    setDraft({ rating: r.rating, comment: r.comment || "" });
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update review");
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, rating: data.rating, comment: data.comment } : r))
      );
      setEditing(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete review");
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const avg =
    reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-purple-900">Customer Reviews</h1>
          <p className="mt-1 text-sm text-purple-500">
            {reviews.length} review{reviews.length === 1 ? "" : "s"} · average {avg} stars
          </p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews, products, customers"
            className="w-72 rounded-full border border-purple-200 bg-white py-2.5 pl-9 pr-4 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-purple-100 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <img
                    src={firstImage(r.product.images)}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-purple-900">{r.product.name}</p>
                    <p className="text-xs text-purple-500">
                      {r.user.name} · {r.user.email} ·{" "}
                      {new Date(r.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <div className="mt-1.5 flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i <= r.rating ? "fill-amber-400 text-amber-400" : "text-purple-200"}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(r)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 px-4 py-2 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-50"
                  >
                    <MessageSquare size={14} /> Edit
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    className="rounded-full p-2 text-purple-400 transition-colors hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {editing === r.id ? (
                <div className="mt-4 space-y-3 rounded-xl bg-purple-50 p-4">
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-purple-700">Rating</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button key={i} type="button" onClick={() => setDraft((d) => ({ ...d, rating: i }))}>
                          <Star
                            size={22}
                            className={i <= draft.rating ? "fill-amber-400 text-amber-400" : "text-purple-200"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-purple-700">Comment</p>
                    <textarea
                      value={draft.comment}
                      onChange={(e) => setDraft((d) => ({ ...d, comment: e.target.value }))}
                      rows={3}
                      className="w-full rounded-lg border border-purple-200 px-3 py-2 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(r.id)}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-60"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 px-4 py-2 text-xs font-medium text-purple-700 transition-colors hover:bg-white"
                    >
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                r.comment && (
                  <p dir="auto" className="mt-3 border-l-2 border-purple-200 pl-4 text-sm leading-relaxed text-purple-800">
                    {r.comment}
                  </p>
                )
              )}
            </div>
          ))}

          {reviews.length === 0 && (
            <p className="py-12 text-center text-sm text-purple-400">No reviews found</p>
          )}
        </div>
      )}
    </div>
  );
}
