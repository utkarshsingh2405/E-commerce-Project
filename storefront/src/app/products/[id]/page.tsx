"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  CaretLeft,
  Plus,
  Minus,
  Check,
  Truck,
  ShieldCheck,
  Star,
  Heart,
  ShoppingBag,
  Lightning,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { useProduct, useInventory } from "@/hooks/useApi";
import { cartStore } from "@/lib/cart-store";
import { COMMERCE_PRODUCTS, ExtendedProduct } from "@/data/products";
import ProductCard from "@/components/products/ProductCard";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { data: apiProduct, isLoading: productLoading } = useProduct(productId);

  // Find fallback from curated Unsplash product catalog
  const fallbackProduct =
    COMMERCE_PRODUCTS.find((p) => p.id.toString() === productId) ||
    COMMERCE_PRODUCTS[0];

  const product: ExtendedProduct = (apiProduct ? {
    ...fallbackProduct,
    ...apiProduct,
  } : fallbackProduct) as ExtendedProduct;

  const effectiveSku = product.skuCode || `SKU-VAL-0${product.id}`;
  const { data: inventoryData } = useInventory(effectiveSku);

  // Stock evaluation
  const isOutOfStock =
    (inventoryData && !inventoryData.inStock) ||
    (inventoryData?.quantity !== undefined && inventoryData.quantity <= 0) ||
    product.quantity === 0;

  const stockCount = inventoryData?.quantity ?? product.quantity ?? 15;
  const isLowStock = !isOutOfStock && stockCount > 0 && stockCount <= 5;

  const currentPrice =
    product.discountPrice && product.discountPrice > 0
      ? product.discountPrice
      : product.price;
  const originalPrice =
    product.discountPrice && product.discountPrice > 0 ? product.price : null;
  const discountPercent =
    originalPrice && currentPrice < originalPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : product.discountPercent;

  // Unsplash gallery images
  const galleryImages = [
    product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80",
  ];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    cartStore.addItem(product, selectedQuantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    cartStore.addItem(product, selectedQuantity);
    router.push("/checkout");
  };

  const relatedProducts = COMMERCE_PRODUCTS.filter(
    (p) => p.categoryId === product.categoryId && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-14 space-y-16">
      {/* 1. BREADCRUMBS */}
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <Link href="/" className="hover:text-text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-text-primary transition-colors">
          Catalogue
        </Link>
        <span>/</span>
        <span className="text-text-primary font-medium truncate max-w-[250px]">
          {product.name}
        </span>
      </div>

      {/* 2. MAIN PRODUCT VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/5] bg-surface-sunken border border-border rounded-3xl overflow-hidden shadow-tinted group">
            <img
              src={galleryImages[activeImageIdx]}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {discountPercent && discountPercent > 0 && (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-error text-white uppercase shadow-sm">
                  {discountPercent}% OFF
                </span>
              )}
              {product.badge && (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-accent text-white uppercase shadow-sm">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Wishlist button */}
            <button
              type="button"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-colors z-10 ${
                isWishlisted
                  ? "bg-surface text-error shadow-sm"
                  : "bg-surface/80 text-text-secondary hover:text-text-primary"
              }`}
              aria-label="Save to Wishlist"
            >
              <Heart size={20} weight={isWishlisted ? "fill" : "regular"} />
            </button>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-3 gap-4">
            {galleryImages.map((src, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIdx(idx)}
                className={`relative aspect-[4/5] rounded-2xl overflow-hidden border-2 transition-all ${
                  activeImageIdx === idx
                    ? "border-accent ring-2 ring-accent/20"
                    : "border-border opacity-70 hover:opacity-100"
                }`}
              >
                <img src={src} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Info & Purchase (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3 pb-6 border-b border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-text-secondary uppercase tracking-widest font-semibold">
                {product.brand || "STORE ORIGINAL"}
              </span>
              <span className="font-mono text-text-disabled">{effectiveSku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary leading-snug">
              {product.name}
            </h1>

            {/* Ratings row */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-warning">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={15} weight="fill" />
                ))}
              </div>
              <span className="font-bold text-text-primary">
                {(product.rating || 4.8).toFixed(1)}
              </span>
              <span className="text-text-secondary">
                ({product.reviewCount || 124} Verified Buyer Ratings)
              </span>
            </div>

            {/* Price Box */}
            <div className="pt-2 flex items-baseline gap-3 font-mono tabular-nums">
              <span className="text-3xl font-bold text-text-primary">
                ₹{currentPrice.toLocaleString("en-IN")}
              </span>
              {originalPrice && (
                <span className="text-lg text-text-secondary line-through">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </span>
              )}
              {discountPercent && discountPercent > 0 && (
                <span className="text-xs font-bold text-error bg-error-tint px-2.5 py-1 rounded-full">
                  Save ₹{(originalPrice! - currentPrice).toLocaleString("en-IN")} ({discountPercent}% off)
                </span>
              )}
            </div>

            {/* Live Inventory Status Pill */}
            <div className="pt-2">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-error bg-error-tint px-3 py-1 rounded-full">
                  Out of Stock · Restock Scheduled
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning bg-warning-tint px-3 py-1 rounded-full">
                  ⚠️ Only {stockCount} units remaining in stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success-tint px-3 py-1 rounded-full">
                  ✓ In Stock ({stockCount} units) · Dispatches in 24 hours
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Product Overview
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Features Highlights */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Key Highlights
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-secondary font-medium">
                {product.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-4 border-t border-border">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-text-primary uppercase">
                  Select Quantity:
                </span>
                <div className="flex items-center border border-border rounded-xl bg-surface">
                  <button
                    type="button"
                    disabled={selectedQuantity <= 1}
                    onClick={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3.5 font-mono text-sm tabular-nums font-semibold text-text-primary">
                    {selectedQuantity}
                  </span>
                  <button
                    type="button"
                    disabled={selectedQuantity >= (stockCount || 99)}
                    onClick={() => setSelectedQuantity((q) => q + 1)}
                    className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Main Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 bg-surface hover:bg-surface-sunken border-2 border-accent text-accent font-semibold rounded-xl py-3.5 text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addedNotice ? (
                  <>
                    <Check size={18} weight="bold" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} weight="bold" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl py-3.5 text-sm transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lightning size={18} weight="fill" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Value Props Strip */}
          <div className="pt-6 border-t border-border grid grid-cols-2 gap-4 text-xs text-text-secondary">
            <div className="flex items-start gap-2.5">
              <Truck size={18} className="text-accent shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-text-primary block">Express Delivery</span>
                <span>Free delivery across India for orders above ₹2,999.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-accent shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-text-primary block">Authentic Guarantee</span>
                <span>Direct brand consignment with 2-year warranty.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RELATED PRODUCTS RECOMMENDATION STRIP */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-border space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">
              Customers Also Viewed
            </h2>
            <Link
              href={`/products?categoryId=${product.categoryId}`}
              className="text-xs font-semibold text-accent hover:underline"
            >
              View More in Category
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
