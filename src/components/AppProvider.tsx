"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getCart, getCartCount, type CartItem } from "@/lib/cart";

interface AppContextType {
  cartCount: number;
  cartItems: CartItem[];
  refreshCart: () => void;
  isDark: boolean;
  toggleDark: () => void;
  wishlistCount: number;
  setWishlistCount: (count: number) => void;
}

const AppContext = createContext<AppContextType>({
  cartCount: 0,
  cartItems: [],
  refreshCart: () => {},
  isDark: false,
  toggleDark: () => {},
  wishlistCount: 0,
  setWishlistCount: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const isDark = mounted ? document.documentElement.classList.contains("dark") : false;

  const toggleDark = () => {
    const newDark = !isDark;
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("darkMode", String(newDark));
    setMounted(false);
    setTimeout(() => setMounted(true), 0);
  };

  const refreshCart = () => {
    const items = getCart();
    setCartItems(items);
    setCartCount(getCartCount(items));
  };

  useEffect(() => {
    refreshCart();
    const handleStorage = () => refreshCart();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("cartUpdated", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cartUpdated", handleStorage);
    };
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <AppContext.Provider value={{ cartCount, cartItems, refreshCart, isDark, toggleDark, wishlistCount, setWishlistCount }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
