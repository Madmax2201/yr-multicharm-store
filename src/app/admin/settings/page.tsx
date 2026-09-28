"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Upload, Loader2, AlertCircle, RotateCcw, ExternalLink } from "lucide-react";

const DEFAULT_HERO = "/images/hero-bg.jpg";

export default function AdminSettingsPage() {
  const [heroImage, setHeroImage] = useState(DEFAULT_HERO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.heroImage) setHeroImage(data.heroImage);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setHeroImage(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroImage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
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
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-purple-900">Store Settings</h1>
        <p className="mt-1 text-sm text-purple-500">Control how your storefront looks.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="rounded-2xl border border-purple-100 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-purple-100 p-2">
            <ImageIcon size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-purple-900">Homepage hero background</p>
            <p className="text-xs text-purple-500">Shown behind the main banner on the first page</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-purple-100">
          <div className="relative h-56 w-full bg-purple-50">
            <img
              src={heroImage}
              alt="Hero background preview"
              className="h-full w-full object-cover"
              onError={() => setHeroImage(DEFAULT_HERO)}
            />
          </div>
        </div>

        <p className="mt-2 break-all text-xs text-purple-400">{heroImage}</p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? "Uploading..." : "Upload new image"}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>

          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-full bg-pink-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-pink-700 disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? "Saving..." : "Save changes"}
          </button>

          <button
            onClick={() => setHeroImage(DEFAULT_HERO)}
            className="inline-flex items-center gap-2 rounded-full border border-purple-200 px-5 py-2.5 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-50"
          >
            <RotateCcw size={16} /> Reset to default
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-purple-200 px-5 py-2.5 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-50"
          >
            <ExternalLink size={16} /> View homepage
          </a>
        </div>

        {saved && (
          <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
            Saved. Your homepage background is updated.
          </p>
        )}
      </div>
    </div>
  );
}
