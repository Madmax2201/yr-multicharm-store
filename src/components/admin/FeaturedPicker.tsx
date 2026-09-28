"use client";

import { useState, useEffect } from "react";
import { Star, Loader2, AlertCircle, Check } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

const MAX = 4;

interface Product {
  id: string;
  name: string;
  images: string;
  featured: boolean;
  stock: number;
}

export default function FeaturedPicker() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/featured")
      .then((r) => r.json())
      .then((data) => {
        const list: Product[] = Array.isArray(data) ? data : [];
        setProducts(list);
        setSelected(list.filter((p) => p.featured).slice(0, MAX).map((p) => p.id));
      })
      .catch(() => setError("Could not load products"))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => {
    setSaved(false);
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX) {
        setError(`Only ${MAX} products can be featured. Remove one first.`);
        return prev;
      }
      setError("");
      return [...prev, id];
    });
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/featured", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setProducts(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={28} className="animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-purple-100 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-purple-100 p-2">
            <Star size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-purple-900">Bestsellers &amp; Favorites</p>
            <p className="text-xs text-purple-500">
              Pick the {MAX} products shown in this section on the homepage
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            selected.length === MAX
              ? "bg-green-100 text-green-700"
              : "bg-purple-100 text-purple-700"
          }`}
        >
          {selected.length} / {MAX} selected
        </span>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => {
          const isOn = selected.includes(p.id);
          const img = getImageUrl(p.images)[0];
          const position = selected.indexOf(p.id) + 1;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              className={`group relative overflow-hidden rounded-xl border-2 text-left transition-all ${
                isOn
                  ? "border-purple-500 ring-2 ring-purple-200"
                  : "border-purple-100 hover:border-purple-300"
              }`}
            >
              <div className="aspect-[3/4] w-full overflow-hidden bg-purple-50">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-purple-300">
                    No image
                  </div>
                )}
              </div>

              {isOn && (
                <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-white shadow">
                  <Check size={15} />
                </span>
              )}

              <div className="flex items-center justify-between gap-1 px-2.5 py-2">
                <p className="truncate text-xs font-medium text-purple-900">{p.name}</p>
                {isOn && <span className="text-[10px] font-semibold text-purple-500">#{position}</span>}
              </div>
            </button>
          );
        })}
      </div>

      {products.length === 0 && (
        <p className="py-8 text-center text-sm text-purple-400">No active products yet</p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-pink-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-pink-700 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          {saving ? "Saving..." : "Save selection"}
        </button>

        {saved && <p className="text-sm text-green-600">Saved. Homepage updated.</p>}
      </div>
    </div>
  );
}
