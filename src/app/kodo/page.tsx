import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getImageUrl } from "@/lib/utils";
import { KodoLanding } from "@/components/kodo/KodoLanding";

export const dynamic = "force-dynamic";

const FALLBACK_IMAGE =
  "https://w4eimkemawe31c3q.public.blob.vercel-storage.com/products/kodo.jpg";

export default async function KodoLandingPage() {
  const product = await prisma.product.findUnique({
    where: { slug: "kodo" },
  });

  if (!product) notFound();

  const images = getImageUrl(product.images);

  return (
    <KodoLanding
      image={images[0] || FALLBACK_IMAGE}
      name={product.name}
      price={product.price}
      howToUse={product.howToUse}
    />
  );
}
