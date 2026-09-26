"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShoppingBag,
  Check,
  Star,
  Heart,
  Eye,
} from "@phosphor-icons/react";
import { Product } from "@/types/api";
import { cartStore } from "@/lib/cart-store";
import { ExtendedProduct } from "@/data/products";

interface ProductCardProps {
  product: Product | ExtendedProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Extend with defaults if plain backend Product
  const ext = product as ExtendedProduct;
  const rating = ext.rating || 4.8;
  const reviewCount = ext.reviewCount || 84;
  const badge = ext.badge;

  const currentPrice =
    product.discountPrice && product.discountPrice > 0
      ? product.discountPrice
      : product.price;
  const originalPrice =
    product.discountPrice && product.discountPrice > 0 ? product.price : null;
  const discountPercent =
    originalPrice && currentPrice < originalPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : ext.discountPercent;

  const isOutOfStock = product.quantity === 0;
  const isLowStock = product.quantity > 0 && product.quantity <= 5;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    cartStore.addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="group relative bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-tinted transition-all duration-200 flex flex-col justify-between">
      {/* 1. Image Container */}
      <div className="relative aspect-[4/5] bg-surface-sunken overflow-hidden">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          <img
            src={product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent && discountPercent > 0 && (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide bg-error text-white uppercase shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {badge && (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide bg-accent text-white uppercase">
              {badge}
            </span>
          )}
          {isOutOfStock ? (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-error-tint text-error">
              Out of stock
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-warning-tint text-warning">
              Only {product.quantity} left
            </span>
          ) : null}
        </div>

        {/* Top Right Wishlist Button */}
        <button
          type="button"
          onClick={toggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors z-10 ${
            isWishlisted
              ? "bg-surface text-error shadow-sm"
              : "bg-surface/80 text-text-secondary hover:text-text-primary hover:bg-surface"
          }`}
          aria-label="Save to wishlist"
        >
          <Heart size={16} weight={isWishlisted ? "fill" : "regular"} />
        </button>

        {/* Quick View Link on hover */}
        <Link
          href={`/products/${product.id}`}
          className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex items-center justify-center gap-1.5 bg-surface/90 hover:bg-surface text-text-primary text-xs font-medium py-2 rounded-lg backdrop-blur-sm border border-border shadow-sm"
        >
          <Eye size={15} />
          <span>Quick View</span>
        </Link>
      </div>

      {/* 2. Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          {/* Brand & Rating Row */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-text-secondary uppercase tracking-wider text-[11px]">
              {product.brand || "STORE SELECT"}
            </span>

            <div className="flex items-center gap-1 text-warning">
              <Star size={13} weight="fill" />
              <span className="font-mono text-xs tabular-nums text-text-primary font-medium">
                {rating.toFixed(1)}
              </span>
              <span className="text-[11px] text-text-secondary">({reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-semibold text-text-primary tracking-tight line-clamp-2 leading-snug group-hover:text-accent transition-colors">
            <Link href={`/products/${product.id}`}>{product.name}</Link>
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-text-secondary line-clamp-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
              <span className="text-base sm:text-lg font-semibold text-text-primary">
                ₹{currentPrice.toLocaleString("en-IN")}
              </span>
              {originalPrice && (
                <span className="text-xs text-text-secondary line-through">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            {discountPercent && discountPercent > 0 && (
              <span className="text-[10px] font-mono text-success font-medium">
                Save ₹{(originalPrice! - currentPrice).toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleQuickAdd}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-[0.98] ${
              isOutOfStock
                ? "bg-surface-sunken text-text-disabled cursor-not-allowed border border-border"
                : added
                ? "bg-success text-white"
                : "bg-accent text-white hover:bg-accent-hover shadow-sm"
            }`}
            title={isOutOfStock ? "Out of stock" : "Add to shopping cart"}
          >
            {added ? (
              <>
                <Check size={14} weight="bold" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} weight="bold" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
