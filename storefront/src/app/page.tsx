"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Lightning,
  Headphones,
  ShoppingBag,
  Star,
  Check,
  Fire,
} from "@phosphor-icons/react";
import { useProducts, useCategories } from "@/hooks/useApi";
import ProductCard from "@/components/products/ProductCard";
import {
  COMMERCE_PRODUCTS,
  CATEGORY_PILLS,
  COMMERCE_CATEGORIES,
} from "@/data/products";
import { cartStore } from "@/lib/cart-store";

export default function HomePage() {
  const { data: apiProducts, isLoading } = useProducts(0, 8);
  const { data: apiCategories } = useCategories();
  const [heroAdded, setHeroAdded] = useState(false);

  // Combine live backend products or fallback with rich data
  const products =
    apiProducts?.content && apiProducts.content.length > 0
      ? apiProducts.content
      : COMMERCE_PRODUCTS;

  const featuredDeal = COMMERCE_PRODUCTS[0]; // Aura Pro Headphones

  const handleHeroQuickAdd = () => {
    cartStore.addItem(featuredDeal, 1);
    setHeroAdded(true);
    setTimeout(() => setHeroAdded(false), 1500);
  };

  return (
    <div className="space-y-16 md:space-y-24 pb-20">
      {/* 1. HERO PROMOTIONAL BANNER (E-Commerce Flagship Showcase) */}
      <section className="bg-surface border-b border-border py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Promotional Copy (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide bg-error text-white uppercase">
                <Lightning size={14} weight="fill" />
                <span>SPRING MEGA DEAL · 21% OFF</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary leading-[1.05]">
                Aura Pro Wireless ANC Studio Headphones
              </h1>

              <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-[55ch]">
                Custom 40mm beryllium drivers with hybrid active noise cancellation, 38-hour battery life, and ultra-breathable memory foam ear cushions.
              </p>

              {/* Price & Star Rating */}
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-baseline gap-2 font-mono tabular-nums">
                  <span className="text-3xl font-bold text-text-primary">
                    ₹14,999
                  </span>
                  <span className="text-lg text-text-secondary line-through">
                    ₹18,999
                  </span>
                  <span className="text-xs font-semibold text-error bg-error-tint px-2 py-0.5 rounded-full">
                    Save ₹4,000
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-secondary border-l border-border pl-6">
                  <div className="flex text-warning">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} weight="fill" />
                    ))}
                  </div>
                  <span className="font-semibold text-text-primary">4.9</span>
                  <span>(142 Verified Reviews)</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleHeroQuickAdd}
                  className="inline-flex items-center justify-center gap-2 bg-accent text-white hover:bg-accent-hover rounded-xl px-7 py-4 text-sm font-semibold transition-all active:scale-[0.98] shadow-sm"
                >
                  {heroAdded ? (
                    <>
                      <Check size={18} weight="bold" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} weight="bold" />
                      <span>Add to Bag — ₹14,999</span>
                    </>
                  )}
                </button>

                <Link
                  href="/products?categoryId=1"
                  className="inline-flex items-center justify-center gap-2 bg-surface-sunken hover:bg-surface border border-border text-text-primary rounded-xl px-7 py-4 text-sm font-semibold transition-colors"
                >
                  <span>Explore Audio Range</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Feature bullet list */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-border text-xs text-text-secondary font-medium">
                <div>✓ 38-Hour Battery Endurance</div>
                <div>✓ 2-Year Direct Warranty</div>
                <div>✓ Free Next-Day Dispatch</div>
              </div>
            </div>

            {/* Right Product Hero Visual (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-[4/5] rounded-3xl overflow-hidden border border-border bg-surface-sunken shadow-tinted group">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=85"
                  alt="Aura Pro Wireless Headphones"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Floating stock pill */}
                <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-md border border-border px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-success">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span>18 In Stock · Ready to Dispatch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY CIRCLES STRIP (Nike / Amazon / ASOS style) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-text-primary">
            Shop by Category
          </h2>
          <Link
            href="/products"
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
          >
            <span>All Categories</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {CATEGORY_PILLS.map((pill) => (
            <Link
              key={pill.id}
              href={`/products?categoryId=${pill.id}`}
              className="group bg-surface border border-border hover:border-accent rounded-2xl p-4 flex flex-col items-center text-center transition-all hover:shadow-tinted"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-surface-sunken mb-3 border border-border group-hover:scale-105 transition-transform duration-200">
                <img
                  src={pill.image}
                  alt={pill.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">
                {pill.name}
              </span>
              <span className="text-[11px] font-mono text-text-secondary">
                {pill.itemCount}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. TRENDING BESTSELLERS / FLASH DEALS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error text-white uppercase">
                <Fire size={14} weight="fill" />
                <span>TRENDING NOW</span>
              </span>
              <span className="text-xs font-mono text-text-secondary">UPDATED TODAY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Bestsellers & Deals of the Week
            </h2>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-hover transition-colors"
          >
            <span>View All ({products.length} Products)</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. DUAL PROMO BANNERS (Footwear & Watches) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Banner 1: Footwear */}
          <Link
            href="/products?categoryId=2"
            className="group relative rounded-3xl overflow-hidden bg-surface-sunken border border-border min-h-[300px] flex flex-col justify-end p-8 hover:shadow-tinted transition-all"
          >
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80"
              alt="Performance Footwear"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-text-primary/85 via-text-primary/40 to-transparent" />

            <div className="relative z-10 text-white space-y-2">
              <span className="text-xs font-mono tracking-wider opacity-90 uppercase bg-accent/80 px-2 py-0.5 rounded">
                FOOTWEAR DROP
              </span>
              <h3 className="text-2xl font-bold">Carbon Propulsion Runners</h3>
              <p className="text-xs text-white/80 max-w-sm">
                Engineered with nitrogen foam cushioning and full carbon plates for racing speed.
              </p>
              <div className="pt-2 text-xs font-semibold inline-flex items-center gap-1 hover:underline">
                <span>Shop Footwear</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* Banner 2: Timepieces */}
          <Link
            href="/products?categoryId=3"
            className="group relative rounded-3xl overflow-hidden bg-surface-sunken border border-border min-h-[300px] flex flex-col justify-end p-8 hover:shadow-tinted transition-all"
          >
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80"
              alt="Chronograph Watches"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-text-primary/85 via-text-primary/40 to-transparent" />

            <div className="relative z-10 text-white space-y-2">
              <span className="text-xs font-mono tracking-wider opacity-90 uppercase bg-accent/80 px-2 py-0.5 rounded">
                HOROLOGY LAB
              </span>
              <h3 className="text-2xl font-bold">Chronograph & Automatic Series</h3>
              <p className="text-xs text-white/80 max-w-sm">
                Sapphire crystal with Japanese mechanical movements and vegetable-tanned straps.
              </p>
              <div className="pt-2 text-xs font-semibold inline-flex items-center gap-1 hover:underline">
                <span>Explore Timepieces</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. E-COMMERCE VALUE & TRUST PROPOSITIONS */}
      <section className="bg-surface border-y border-border py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-accent-tint flex items-center justify-center text-accent">
                <Truck size={22} weight="bold" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">Free Express Shipping</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Complimentary delivery on all domestic orders exceeding ₹2,999.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-accent-tint flex items-center justify-center text-accent">
                <ShieldCheck size={22} weight="bold" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">30-Day Easy Returns</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Hassle-free return pickups with instant refunds to original payment method.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-accent-tint flex items-center justify-center text-accent">
                <Lightning size={22} weight="bold" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">Real-Time Inventory</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Direct consensus with Spring Boot Inventory Service for zero backorders.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-accent-tint flex items-center justify-center text-accent">
                <Headphones size={22} weight="bold" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">Direct Hardware Support</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Dedicated support specialists available 7 days a week for any product questions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
