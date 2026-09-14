"use client";

import { useState, useEffect } from "react";
import { Folder, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: slug || name.toLowerCase().replace(/\s+/g, "-") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add category");
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      setSlug("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will not delete products in this category.")) return;
    try {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-bold text-purple-900">Manage Categories</h1>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex gap-3 rounded-2xl border border-purple-100 bg-white p-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          required
          className="flex-1 rounded-lg border border-purple-200 px-4 py-2.5 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug (auto-generated)"
          className="w-48 rounded-lg border border-purple-200 px-4 py-2.5 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-60"
        >
          <Plus size={16} />
          {submitting ? "Adding..." : "Add Category"}
        </button>
      </form>

      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-xl border border-purple-100 bg-white px-5 py-4 transition-colors hover:bg-purple-50"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Folder size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-purple-900">{cat.name}</p>
                <p className="text-xs text-purple-500">/{cat.slug}</p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(cat.id)}
              className="rounded-lg p-2 text-purple-400 transition-colors hover:bg-red-100 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="py-8 text-center text-sm text-purple-400">No categories yet</p>
        )}
      </div>
    </div>
  );
}
