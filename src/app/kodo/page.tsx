import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getImageUrl } from "@/lib/utils";
import { KodoLanding } from "@/components/kodo/KodoLanding";

export const dynamic = "force-dynamic";

const FALLBACK_IMAGE =
  "https://w4eimkemawe31c3q.public.blob.vercel-storage.com/products/kodo.jpg";

export default async function KodoLandingPage() {
  const [product, setting] = await Promise.all([
    prisma.product.findUnique({ where: { slug: "kodo" } }),
    prisma.siteSetting.findUnique({ where: { key: "kodoLandingImage" } }),
  ]);

  if (!product) notFound();

  const productImages = getImageUrl(product.images);

  return (
    <KodoLanding
      image={setting?.value || productImages[0] || FALLBACK_IMAGE}
      name={product.name}
      price={product.price}
      howToUse={product.howToUse}
    />
  );
}
