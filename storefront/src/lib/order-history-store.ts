"use client";

import { OrderHistoryItem } from "@/types/api";

const ORDER_HISTORY_KEY = "storefront_order_history";

export const orderHistoryStore = {
  getOrders(): OrderHistoryItem[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(ORDER_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  addOrder(order: OrderHistoryItem) {
    if (typeof window === "undefined") return;
    const orders = this.getOrders();
    // Prepend new order
    orders.unshift(order);
    localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event("orders-changed"));
  },

  getOrderById(orderNumber: string): OrderHistoryItem | undefined {
    return this.getOrders().find((o) => o.orderNumber === orderNumber);
  },
};
