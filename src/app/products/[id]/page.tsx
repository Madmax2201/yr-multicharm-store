"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { StarRating } from "@/components/StarRating";
import { useApp } from "@/components/AppProvider";
import { addToCart, type CartItem } from "@/lib/cart";
import { formatPrice, getImageUrl, formatDate, categories } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import {
  Heart,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Star,
  Check,
  AlertCircle,
  PackageOpen,
} from "lucide-react";

function ReviewForm({
  productId,
  onReviewAdded,
}: {
  productId: string;
  onReviewAdded: () => void;
}) {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError(t("product.ratingRequired"));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }
      setSuccess(true);
      setRating(0);
      setComment("");
      onReviewAdded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-700">
        <Check size={18} />
        {t("product.reviewSuccess")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-[var(--border)] p-6">
      <h4 className="font-semibold text-[var(--fg)]">{t("product.writeReview")}</h4>
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--fg)]">{t("product.rating")}</label>
        <StarRating rating={rating} interactive onChange={setRating} size={28} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--fg)]">{t("product.comment")}</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder={t("product.commentPlaceholder")}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm text-[var(--fg)] outline-none transition-colors focus:border-primary"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {submitting ? t("product.submitting") : t("product.submitReview")}
      </button>
    </form>
  );
}

function QuantitySelector({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-[var(--border)]">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="flex h-10 w-10 items-center justify-center text-[var(--muted)] transition-colors hover:text-[var(--fg)] disabled:opacity-40"
      >
        <Minus size={16} />
      </button>
      <span className="flex h-10 w-12 items-center justify-center text-sm font-medium text-[var(--fg)]">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-10 w-10 items-center justify-center text-[var(--muted)] transition-colors hover:text-[var(--fg)] disabled:opacity-40"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function Accordion({
  title,
  children,
  defaultOpen,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div className="border-b border-[var(--border)]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left font-medium text-[var(--fg)]"
      >
        {title}
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <div className="pb-4 text-sm leading-relaxed text-[var(--muted)]">{children}</div>}
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useLanguage();
  const router = useRouter();
  const { refreshCart } = useApp();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const fetchProduct = () => {
    fetch(`/api/products/${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
        if (data.variants?.length > 0) {
          setSelectedVariant(data.variants[0].id);
        }

        if (data.category) {
          fetch(`/api/products?category=${data.category}&limit=5`)
            .then((r) => r.json())
            .then((res) => {
              setRelatedProducts(
                ((res.products || []) as any[]).filter((p: any) => p.id !== data.id)
              );
            })
            .catch(() => {});
        }
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const images = product ? getImageUrl(product.images) : [];
  const activeVariant = product?.variants?.find((v: any) => v.id === selectedVariant);
  const currentPrice = activeVariant?.price ?? product?.price ?? 0;
  const currentStock = activeVariant?.stock ?? product?.stock ?? 0;
  const outOfStock = currentStock === 0;
  const hasDiscount = product?.compareAtPrice && product?.compareAtPrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - currentPrice) / product.compareAtPrice) * 100)
    : 0;
  const reviewCount = product?.reviewCount || product?.reviews?.length || 0;

  const handleAddToCart = () => {
    if (outOfStock || adding) return;
    setAdding(true);
    const item: CartItem = {
      id: product.id,
      productId: product.id,
      name: product.name,
      price: currentPrice,
      image: images[0] || "/placeholder.svg",
      quantity,
      stock: currentStock,
      variantId: selectedVariant || undefined,
      variantName: activeVariant?.name || undefined,
    };
    addToCart(item);
    refreshCart();
    window.dispatchEvent(new Event("cartUpdated"));
    setTimeout(() => setAdding(false), 600);
  };

  const toggleWishlist = async () => {
    setWishlistLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      setWishlisted(data.wishlisted);
    } catch {
      // ignore
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="animate-pulse">
          <div className="mb-8 h-6 w-48 rounded bg-[var(--border)]" />
          <div className="grid gap-8 md:grid-cols-2">
            <div className="aspect-[3/4] rounded-2xl bg-[var(--muted-bg)]" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 rounded bg-[var(--border)]" />
              <div className="h-6 w-1/3 rounded bg-[var(--border)]" />
              <div className="h-24 rounded bg-[var(--border)]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex flex-col items-center justify-center text-center">
          <PackageOpen size={64} strokeWidth={1} className="mb-4 text-[var(--muted)]" />
          <h2 className="mb-2 font-serif text-2xl font-bold text-[var(--fg)]">{t("product.notFound")}</h2>
          <p className="mb-8 text-sm text-[var(--muted)]">{t("product.notFoundDesc")}</p>
          <Link
            href="/products"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            {t("product.browseProducts")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--fg)]">{t("product.breadcrumb.home")}</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-[var(--fg)]">{t("product.breadcrumb.products")}</Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/products?category=${product.category}`} className="hover:text-[var(--fg)]">
              {categories.find((c) => c.slug === product.category)?.name || product.category}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Image Gallery */}
        <div>
          <div className="mb-4 overflow-hidden rounded-2xl bg-[var(--muted-bg)]">
            <img
              src={images[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              className="h-full w-full object-cover transition-all duration-500"
              style={{ maxHeight: "500px" }}
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    i === selectedImage
                      ? "border-primary"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    className="h-20 w-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div>
            {product.category && (
              <Link
                href={`/products?category=${product.category}`}
                className="mb-3 inline-block rounded-full bg-primary-light px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
              >
                {categories.find((c) => c.slug === product.category)?.name || product.category}
              </Link>
            )}
            <h1 className="font-serif text-3xl font-bold text-[var(--fg)] md:text-4xl">
              {product.name}
            </h1>
            {product.brand && (
              <p className="mt-1 text-sm text-[var(--muted)]">{t("product.by", { brand: product.brand })}</p>
            )}
          </div>

          {/* Rating */}
          {product.avgRating && (
            <div className="flex items-center gap-2">
              <StarRating rating={product.avgRating} size={18} />
              <span className="text-sm font-medium text-[var(--fg)]">
                {product.avgRating.toFixed(1)}
              </span>
              <span className="text-sm text-[var(--muted)]">
                ({reviewCount} {reviewCount === 1 ? t("product.reviews", { count: reviewCount }) : t("product.reviews_plural", { count: reviewCount })})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="font-serif text-3xl font-bold text-[var(--fg)]">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-[var(--muted)] line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="rounded-full bg-accent/10 px-3 py-0.5 text-xs font-semibold text-accent">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="leading-relaxed text-[var(--muted)]">{product.description}</p>
          )}

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-[var(--fg)]">
                {product.variantLabel || t("product.options")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.id)}
                    className={`rounded-full border px-5 py-2 text-sm font-medium transition-all ${
                      selectedVariant === v.id
                        ? "border-primary bg-primary text-white"
                        : "border-[var(--border)] text-[var(--fg)] hover:border-primary"
                    }`}
                  >
                    {v.name}
                    {v.price && v.price !== product.price && (
                      <span className="ml-1">({formatPrice(v.price)})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4">
            <QuantitySelector value={quantity} onChange={setQuantity} max={currentStock || 99} />
            <button
              onClick={handleAddToCart}
              disabled={outOfStock || adding}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-semibold text-white shadow-md transition-all hover:bg-primary-dark hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag size={18} />
              {outOfStock ? t("product.outOfStock") : adding ? t("product.adding") : t("product.addToCart")}
            </button>
            <button
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all ${
                wishlisted
                  ? "border-accent bg-accent text-white"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-accent hover:text-accent"
              }`}
            >
              <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Stock info */}
          {currentStock > 0 && currentStock < 20 && (
            <p className="flex items-center gap-1.5 text-sm text-accent">
              <AlertCircle size={14} />
              {t("product.lowStock", { count: currentStock })}
            </p>
          )}

          {/* Accordion sections */}
          {product.ingredients && (
            <Accordion title={t("product.ingredients")}>
              <p className="whitespace-pre-line">{product.ingredients}</p>
            </Accordion>
          )}
          {product.howToUse && (
            <Accordion title={t("product.howToUse")}>
              <p className="whitespace-pre-line">{product.howToUse}</p>
            </Accordion>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-16">
        <h2 className="mb-8 font-serif text-2xl font-bold text-[var(--fg)]">
          {t("product.reviewsTitle")}
        </h2>
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {product.reviews?.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                          {(review.user?.name || "A")[0]}
                        </div>
                        <span className="text-sm font-medium text-[var(--fg)]">
                          {review.user?.name || "Anonymous"}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--muted)]">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <StarRating rating={review.rating} size={14} />
                    {review.comment && (
                      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--border)] py-12">
                <Star size={32} className="mb-3 text-[var(--muted)]" />
                <p className="text-sm text-[var(--muted)]">{t("product.noReviews")}</p>
              </div>
            )}
          </div>
          <div className="lg:col-span-2">
            <ReviewForm productId={product.id} onReviewAdded={fetchProduct} />
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-8 font-serif text-2xl font-bold text-[var(--fg)]">
            {t("product.relatedTitle")}
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
