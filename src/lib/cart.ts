export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantId?: string;
  variantName?: string;
  stock: number;
}

const CART_KEY = "ecomm_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(item: CartItem): CartItem[] {
  const cart = getCart();
  const existing = cart.find(
    (i) => i.productId === item.productId && i.variantId === item.variantId
  );
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  return cart;
}

export function updateQuantity(
  productId: string,
  quantity: number,
  variantId?: string
): CartItem[] {
  const cart = getCart();
  const item = cart.find(
    (i) => i.productId === productId && i.variantId === variantId
  );
  if (item) {
    item.quantity = quantity;
    if (quantity <= 0) {
      return removeFromCart(productId, variantId);
    }
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(
  productId: string,
  variantId?: string
): CartItem[] {
  const cart = getCart().filter(
    (i) => !(i.productId === productId && i.variantId === variantId)
  );
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}
