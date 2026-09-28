import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getImageUrl } from "@/lib/utils";
import { KodoLanding } from "@/components/kodo/KodoLanding";

export const dynamic = "force-dynamic";

const FALLBACK_IMAGE =
  "https://w4eimkemawe31c3q.public.blob.vercel-storage.com/products/kodo.jpg";

export default async function KodoLandingPage() {
  const [product, setting] = await Promise.all([
    prisma.product.findUnique({
      where: { slug: "kodo" },
      include: {
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 6,
          include: { user: { select: { name: true } } },
        },
      },
    }),
    prisma.siteSetting.findUnique({ where: { key: "kodoLandingImage" } }),
  ]);

  if (!product) notFound();

  const productImages = getImageUrl(product.images);

  const reviews = product.reviews
    .filter((r) => r.comment && r.comment.trim().length > 0)
    .map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment as string,
      author: r.user.name,
      createdAt: r.createdAt.toISOString(),
    }));

  return (
    <KodoLanding
      image={setting?.value || productImages[0] || FALLBACK_IMAGE}
      name={product.name}
      price={product.price}
      comparePrice={product.comparePrice}
      howToUse={product.howToUse}
      reviews={reviews}
    />
  );
}
