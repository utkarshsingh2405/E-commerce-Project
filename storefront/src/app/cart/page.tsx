"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Trash, Plus, Minus, ArrowRight, ShieldCheck, Truck } from "@phosphor-icons/react";
import { cartStore } from "@/lib/cart-store";
import { CartItem } from "@/types/api";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(cartStore.getItems());
    setMounted(true);

    const handleCartChange = () => {
      setItems(cartStore.getItems());
    };

    window.addEventListener("cart-changed", handleCartChange);
    return () => window.removeEventListener("cart-changed", handleCartChange);
  }, []);

  const handleQuantityChange = (productId: number, newQty: number) => {
    cartStore.updateQuantity(productId, newQty);
  };

  const handleRemove = (productId: number) => {
    cartStore.removeItem(productId);
  };

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        <div className="h-8 w-48 bg-surface-sunken animate-pulse rounded-lg mb-8" />
        <div className="space-y-4">
          <div className="h-24 bg-surface-sunken animate-pulse rounded-2xl" />
          <div className="h-24 bg-surface-sunken animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  const subtotal = cartStore.getSubtotal();
  const shippingFee = subtotal > 5000 || subtotal === 0 ? 0 : 350;
  const grandTotal = subtotal + shippingFee;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16 space-y-10">
      <div className="space-y-1">
        <span className="text-xs font-mono text-text-secondary tracking-wide">
          CONSIGNMENT REVIEW
        </span>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
          Shopping Bag
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-text-primary">
              Your bag is currently empty
            </h2>
            <p className="text-sm text-text-secondary max-w-sm mx-auto">
              Hardware articles added to your order will appear here for verification prior to checkout.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-accent text-white hover:bg-accent-hover rounded-lg px-6 py-3 text-sm font-medium transition-colors"
          >
            <span>Explore Catalogue</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Items List (7 cols) */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {items.map((item) => {
              const unitPrice =
                item.product.discountPrice && item.product.discountPrice > 0
                  ? item.product.discountPrice
                  : item.product.price;
              const lineTotal = unitPrice * item.quantity;

              return (
                <div
                  key={item.product.id}
                  className="p-4 sm:p-6 flex items-start gap-4"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-surface-sunken rounded-lg overflow-hidden border border-border shrink-0">
                    <img
                      src={
                        item.product.imageUrl ||
                        `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80`
                      }
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                        <Link
                          href={`/products/${item.product.id}`}
                          className="hover:text-accent transition-colors"
                        >
                          {item.product.name}
                        </Link>
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.product.id)}
                        className="text-text-disabled hover:text-error transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash size={16} />
                      </button>
                    </div>

                    <div className="text-xs font-mono text-text-secondary">
                      {item.product.skuCode || `SKU-VAL-0${item.product.id}`}
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      {/* Quantity Modifier */}
                      <div className="flex items-center border border-border rounded-lg bg-surface">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              item.product.id,
                              item.quantity - 1
                            )
                          }
                          className="p-1.5 text-text-secondary hover:text-text-primary"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2.5 font-mono text-xs tabular-nums font-medium text-text-primary">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                          className="p-1.5 text-text-secondary hover:text-text-primary"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="font-mono text-sm tabular-nums font-medium text-text-primary">
                        ₹{lineTotal.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Column (5 cols) */}
          <div className="lg:col-span-5 bg-surface-sunken border border-border rounded-2xl p-6 space-y-6">
            <h2 className="text-base font-semibold text-text-primary">
              Order Breakdown
            </h2>

            <div className="space-y-3 text-sm font-mono tabular-nums text-text-secondary">
              <div className="flex justify-between">
                <span>Article Subtotal</span>
                <span className="text-text-primary">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Insured Surface Transit</span>
                <span>
                  {shippingFee === 0 ? "Complimentary" : `₹${shippingFee}`}
                </span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between text-base font-medium text-text-primary">
                <span>Grand Total</span>
                <span className="text-accent">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-accent text-white hover:bg-accent-hover rounded-lg px-6 py-3.5 text-sm font-medium transition-colors active:scale-[0.98]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </Link>

              <p className="text-[11px] text-text-secondary text-center">
                Inventory held in active reservation for 30 minutes.
              </p>
            </div>

            <div className="pt-4 border-t border-border space-y-2 text-xs text-text-secondary">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-accent" />
                <span>Orders above ₹5,000 qualify for complimentary courier delivery.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-accent" />
                <span>Zero transactional processing fee on UPI or Debit/Credit.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
