export function generateOrderNumber(): string {
  const prefix = "GB";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function formatPrice(price: number): string {
  return `${price.toFixed(2)} DA`;
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getImageUrl(images: string): string[] {
  try {
    return JSON.parse(images);
  } catch {
    return [images || "/placeholder.svg"];
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const categories = [
  { name: "Face", slug: "face" },
  { name: "Eyes", slug: "eyes" },
  { name: "Lips", slug: "lips" },
  { name: "Skincare", slug: "skincare" },
  { name: "Nails", slug: "nails" },
  { name: "Tools & Brushes", slug: "tools" },
  { name: "Fragrance", slug: "fragrance" },
  { name: "Bath & Body", slug: "bath-body" },
];

export const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
