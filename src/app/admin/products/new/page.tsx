"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronLeft, Upload, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";

const categories = [
  "Face", "Eyes", "Lips", "Skincare", "Nails", "Tools", "Fragrance", "Bath & Body",
];

interface Variant {
  name: string;
  price: string;
  stock: string;
  sku: string;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  category: string;
  subcategory: string;
  brand: string;
  stock: string;
  ingredients: string;
  howToUse: string;
  featured: boolean;
  isActive: boolean;
  images: string[];
  variants: Variant[];
}

const emptyVariant = { name: "", price: "", stock: "", sku: "" };

export default function NewProduct() {
  const { t } = useLanguage();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [uploading, setUploading] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    comparePrice: "",
    category: "",
    subcategory: "",
    brand: "",
    stock: "0",
    ingredients: "",
    howToUse: "",
    featured: false,
    isActive: true,
    images: [""],
    variants: [],
  });

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const addImage = () => {
    setForm((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const updateImage = (idx: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === idx ? value : img)),
    }));
  };

  const handleFileUpload = async (idx: number, file: File) => {
    setUploading(idx);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      updateImage(idx, data.url);
    } catch {
      alert("Failed to upload image");
    } finally {
      setUploading(null);
    }
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...emptyVariant }],
    }));
  };

  const removeVariant = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx),
    }));
  };

  const updateVariant = (idx: number, key: keyof Variant, value: string) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === idx ? { ...v, [key]: value } : v
      ),
    }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.price || Number(form.price) <= 0) errs.price = "Valid price is required";
    if (!form.category) errs.category = "Category is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
        stock: Number(form.stock),
        images: JSON.stringify(form.images.filter(Boolean)),
        variants: form.variants.map((v) => ({
          ...v,
          price: v.price ? Number(v.price) : null,
          stock: Number(v.stock),
        })),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create product");
      router.push("/admin/products");
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="rounded-lg p-2 text-purple-400 transition-colors hover:bg-purple-100 hover:text-purple-600"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-serif text-2xl font-bold text-purple-900">{t("admin.productForm.newTitle")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-xl border border-purple-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-serif text-lg font-semibold text-purple-900">{t("admin.productForm.basicInfo")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-purple-700">
                {t("admin.productForm.name")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-purple-900 focus:outline-none focus:ring-1 ${
                  errors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-purple-700">
                {t("admin.productForm.description")} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-purple-900 focus:outline-none focus:ring-1 ${
                  errors.description
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-purple-700">
                {t("admin.productForm.price")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-purple-900 focus:outline-none focus:ring-1 ${
                  errors.price
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-500">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-purple-700">
                {t("admin.productForm.comparePrice")}
              </label>
              <input
                type="number"
                step="0.01"
                value={form.comparePrice}
                onChange={(e) => update("comparePrice", e.target.value)}
                className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-purple-700">
                {t("admin.productForm.category")} <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-purple-900 focus:outline-none focus:ring-1 ${
                  errors.category
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                }`}
              >
                <option value="">{t("admin.productForm.selectCategory")}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-500">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-purple-700">
                {t("admin.productForm.subcategory")}
              </label>
              <input
                type="text"
                value={form.subcategory}
                onChange={(e) => update("subcategory", e.target.value)}
                className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-purple-700">
                {t("admin.productForm.brand")}
              </label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
                className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-purple-700">
                {t("admin.productForm.stock")}
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => update("stock", e.target.value)}
                className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-purple-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-serif text-lg font-semibold text-purple-900">{t("admin.productForm.details")}</h2>
          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-purple-700">
                {t("admin.productForm.ingredients")}
              </label>
              <textarea
                value={form.ingredients}
                onChange={(e) => update("ingredients", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-purple-700">
                {t("admin.productForm.howToUse")}
              </label>
              <textarea
                value={form.howToUse}
                onChange={(e) => update("howToUse", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-purple-700">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => update("featured", e.target.checked)}
                className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
              />
              {t("admin.productForm.featured")}
            </label>
            <label className="flex items-center gap-2 text-sm text-purple-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => update("isActive", e.target.checked)}
                className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
              />
              {t("admin.productForm.active")}
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-purple-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-purple-900">
              {t("admin.productForm.images")}
            </h2>
            <button
              type="button"
              onClick={addImage}
              className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-800"
            >
              <Plus size={14} />
              {t("admin.productForm.addImage")}
            </button>
          </div>
          <div className="space-y-3">
            {form.images.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {url ? (
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-purple-200">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => updateImage(idx, "")}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-20 w-20 flex-shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 transition-colors hover:border-purple-400 hover:bg-purple-100">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(idx, file);
                      }}
                    />
                    {uploading === idx ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                    ) : (
                      <>
                        <Upload size={18} className="text-purple-400" />
                        <span className="mt-1 text-[10px] text-purple-500">Upload</span>
                      </>
                    )}
                  </label>
                )}
                <input
                  type="text"
                  value={url}
                  onChange={(e) => updateImage(idx, e.target.value)}
                  placeholder="Image URL or upload above"
                  className="flex-1 rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                {form.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="rounded-lg p-2 text-purple-400 hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-pink-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-rose-900">
              {t("admin.productForm.variants")}
            </h2>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center gap-1 text-sm font-medium text-pink-600 hover:text-pink-800"
            >
              <Plus size={14} />
              {t("admin.productForm.addVariant")}
            </button>
          </div>
          {form.variants.length === 0 ? (
            <p className="text-sm text-rose-400">
              {t("admin.productForm.noVariants")}
            </p>
          ) : (
            <div className="space-y-3">
              {form.variants.map((v, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-end gap-2 rounded-lg border border-pink-100 bg-rose-50 p-3"
                >
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-rose-500">{t("admin.productForm.variantName")}</label>
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => updateVariant(idx, "name", e.target.value)}
                      className="w-full rounded-lg border border-pink-200 bg-white px-2 py-1.5 text-sm text-rose-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                  <div className="w-24">
                    <label className="mb-1 block text-xs text-rose-500">{t("admin.productForm.variantPrice")}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={v.price}
                      onChange={(e) => updateVariant(idx, "price", e.target.value)}
                      className="w-full rounded-lg border border-pink-200 bg-white px-2 py-1.5 text-sm text-rose-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                  <div className="w-20">
                    <label className="mb-1 block text-xs text-rose-500">{t("admin.productForm.variantStock")}</label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                      className="w-full rounded-lg border border-pink-200 bg-white px-2 py-1.5 text-sm text-rose-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-rose-500">{t("admin.productForm.variantSku")}</label>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                      className="w-full rounded-lg border border-pink-200 bg-white px-2 py-1.5 text-sm text-rose-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="rounded-lg p-2 text-rose-400 hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/products"
            className="rounded-lg border border-pink-200 px-6 py-2.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
          >
            {t("admin.productForm.cancel")}
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-pink-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-pink-700 disabled:opacity-50"
          >
            {submitting ? t("admin.productForm.creating") : t("admin.productForm.create")}
          </button>
        </div>
      </form>
    </div>
  );
}
