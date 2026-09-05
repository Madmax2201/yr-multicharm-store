"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { use, useCallback } from "react";
import { ChevronLeft, Plus, Trash2, Upload, X } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";

const categories = [
  "Face", "Eyes", "Lips", "Skincare", "Nails", "Tools", "Fragrance", "Bath & Body",
];

interface Variant {
  id?: string;
  name: string;
  price: string;
  stock: string;
  sku: string;
}

interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string;
  category: string;
  subcategory: string | null;
  brand: string | null;
  ingredients: string | null;
  howToUse: string | null;
  stock: number;
  isActive: boolean;
  featured: boolean;
  variants: Variant[];
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

function parseImages(images: string): string[] {
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [""];
  } catch {
    return [images || ""];
  }
}

export default function EditProduct({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = useLanguage();
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  const fetchProduct = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/products/${id}`);
      const product: ProductData = await res.json();
      setForm({
        name: product.name,
        description: product.description,
        price: String(product.price),
        comparePrice: product.comparePrice ? String(product.comparePrice) : "",
        category: product.category,
        subcategory: product.subcategory || "",
        brand: product.brand || "",
        stock: String(product.stock),
        ingredients: product.ingredients || "",
        howToUse: product.howToUse || "",
        featured: product.featured,
        isActive: product.isActive,
        images: parseImages(product.images),
        variants: product.variants.length > 0
          ? product.variants.map((v) => ({
              id: v.id,
              name: v.name,
              price: v.price ? String(v.price) : "",
              stock: String(v.stock),
              sku: v.sku,
            }))
          : [],
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

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
      variants: [...prev.variants, { name: "", price: "", stock: "0", sku: "" }],
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
    const errs: Partial<Record<string, string>> = {};
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
          id: v.id,
          name: v.name,
          price: v.price ? Number(v.price) : null,
          stock: Number(v.stock),
          sku: v.sku,
        })),
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update product");
      router.push("/admin/products");
    } catch {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) router.push("/admin/products");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-purple-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="rounded-lg p-2 text-purple-400 transition-colors hover:bg-purple-100 hover:text-purple-600"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="font-serif text-2xl font-bold text-purple-900">{t("admin.productForm.editTitle")}</h1>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
        >
          {t("admin.productForm.deleteProduct")}
        </button>
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
              <label className="mb-1 block text-sm font-medium text-purple-700">{t("admin.productForm.ingredients")}</label>
              <textarea
                value={form.ingredients}
                onChange={(e) => update("ingredients", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-purple-700">{t("admin.productForm.howToUse")}</label>
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
            <h2 className="font-serif text-lg font-semibold text-purple-900">{t("admin.productForm.images")}</h2>
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

        <div className="rounded-xl border border-purple-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-purple-900">{t("admin.productForm.variants")}</h2>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-800"
            >
              <Plus size={14} />
              {t("admin.productForm.addVariant")}
            </button>
          </div>
          {form.variants.length === 0 ? (
            <p className="text-sm text-purple-400">{t("admin.productForm.noVariants")}</p>
          ) : (
            <div className="space-y-3">
              {form.variants.map((v, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-end gap-2 rounded-lg border border-purple-100 bg-purple-50 p-3"
                >
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-purple-500">{t("admin.productForm.variantName")}</label>
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => updateVariant(idx, "name", e.target.value)}
                      className="w-full rounded-lg border border-purple-200 bg-white px-2 py-1.5 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="w-24">
                    <label className="mb-1 block text-xs text-purple-500">{t("admin.productForm.variantPrice")}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={v.price}
                      onChange={(e) => updateVariant(idx, "price", e.target.value)}
                      className="w-full rounded-lg border border-purple-200 bg-white px-2 py-1.5 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="w-20">
                    <label className="mb-1 block text-xs text-purple-500">{t("admin.productForm.variantStock")}</label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                      className="w-full rounded-lg border border-purple-200 bg-white px-2 py-1.5 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-purple-500">{t("admin.productForm.variantSku")}</label>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                      className="w-full rounded-lg border border-purple-200 bg-white px-2 py-1.5 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="rounded-lg p-2 text-purple-400 hover:bg-red-100 hover:text-red-600"
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
            className="rounded-lg border border-purple-200 px-6 py-2.5 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-50"
          >
            {t("admin.productForm.cancel")}
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
          >
            {submitting ? t("admin.productForm.updating") : t("admin.productForm.update")}
          </button>
        </div>
      </form>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-serif text-lg font-semibold text-purple-900">
              {t("admin.products.deleteTitle")}
            </h3>
            <p className="mt-2 text-sm text-purple-500">
              {t("admin.products.deleteDesc")}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-purple-200 px-4 py-2 text-sm text-purple-700 transition-colors hover:bg-purple-50"
              >
                {t("admin.products.cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? t("admin.products.deleting") : t("admin.products.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
