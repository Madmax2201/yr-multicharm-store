import { prisma } from "@/lib/db";

export function slugify(text: string): string {
  return (
    String(text || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product"
  );
}

export async function uniqueProductSlug(
  name: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(name);

  const taken = await prisma.product.findMany({
    where: {
      slug: { startsWith: base },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { slug: true },
  });

  const used = new Set(taken.map((p) => p.slug));
  if (!used.has(base)) return base;

  let n = 2;
  while (used.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
