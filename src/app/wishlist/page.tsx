"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";

export default function WishlistRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/account/wishlist");
  }, [router]);

  return null;
}
