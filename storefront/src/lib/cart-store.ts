"use client";

import { CartItem, Product } from "@/types/api";

const CART_KEY = "storefront_cart_items";

export const cartStore = {
  getItems(): CartItem[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  addItem(product: Product, quantity = 1) {
    if (typeof window === "undefined") return;
    const items = this.getItems();
    const existingIndex = items.findIndex((i) => i.product.id === product.id);

    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({ product, quantity });
    }

    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("cart-changed"));
  },

  updateQuantity(productId: number, quantity: number) {
    if (typeof window === "undefined") return;
    let items = this.getItems();
    if (quantity <= 0) {
      items = items.filter((i) => i.product.id !== productId);
    } else {
      const target = items.find((i) => i.product.id === productId);
      if (target) {
        target.quantity = quantity;
      }
    }
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("cart-changed"));
  },

  removeItem(productId: number) {
    if (typeof window === "undefined") return;
    const items = this.getItems().filter((i) => i.product.id !== productId);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("cart-changed"));
  },

  clearCart() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event("cart-changed"));
  },

  getTotalCount(): number {
    return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal(): number {
    return this.getItems().reduce((sum, item) => {
      const price = item.product.discountPrice && item.product.discountPrice > 0
        ? item.product.discountPrice
        : item.product.price;
      return sum + price * item.quantity;
    }, 0);
  },
};
