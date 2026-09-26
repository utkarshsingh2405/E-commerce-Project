"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MagnifyingGlass,
  Funnel,
  ArrowClockwise,
  X,
  CaretLeft,
  CaretRight,
  ArrowsClockwise,
  CheckCircle,
} from "@phosphor-icons/react";
import { useFilterProducts, useCategories } from "@/hooks/useApi";
import ProductCard from "@/components/products/ProductCard";
import { COMMERCE_PRODUCTS, COMMERCE_CATEGORIES, ExtendedProduct } from "@/data/products";
import { checkBackendHealth, seedBackendDatabase } from "@/lib/backend-sync";
import { Product } from "@/types/api";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlCategory = searchParams.get("categoryId");
  const urlKeyword = searchParams.get("keyword") || "";
  const urlMinPrice = searchParams.get("minPrice");
  const urlMaxPrice = searchParams.get("maxPrice");
  const urlSort = searchParams.get("sortBy") || "featured";

  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    urlCategory ? parseInt(urlCategory, 10) : undefined
  );
  const [minPrice, setMinPrice] = useState<string>(urlMinPrice || "");
  const [maxPrice, setMaxPrice] = useState<string>(urlMaxPrice || "");
  const [searchTerm, setSearchTerm] = useState<string>(urlKeyword);
  const [sortBy, setSortBy] = useState<string>(urlSort);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Backend Sync State
  const [isGatewayOnline, setIsGatewayOnline] = useState<boolean | null>(null);
  const [backendCount, setBackendCount] = useState<number>(0);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const { data: apiCategories = [] } = useCategories();
  const { data: apiProducts, isLoading, isError, error, refetch } = useFilterProducts({
    categoryId: selectedCategory,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
  });

  useEffect(() => {
    setSelectedCategory(urlCategory ? parseInt(urlCategory, 10) : undefined);
    setSearchTerm(urlKeyword);
    setMinPrice(urlMinPrice || "");
    setMaxPrice(urlMaxPrice || "");
    setSortBy(urlSort);

    checkBackendHealth().then((res) => {
      setIsGatewayOnline(res.online);
      setBackendCount(res.productCount);
    });
  }, [urlCategory, urlKeyword, urlMinPrice, urlMaxPrice, urlSort]);

  const updateFilters = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v !== undefined && v !== "") {
        params.set(k, v);
      } else {
        params.delete(k);
      }
    });
    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryClick = (catId: number | undefined) => {
    setSelectedCategory(catId);
    updateFilters({ categoryId: catId ? catId.toString() : undefined });
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ keyword: searchTerm || undefined });
  };

  const handleClearFilters = () => {
    setSelectedCategory(undefined);
    setMinPrice("");
    setMaxPrice("");
    setSearchTerm("");
    setSortBy("featured");
    router.push("/products");
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await seedBackendDatabase();
      if (res.success) {
        setSeedResult(`Seeded ${res.productsCreated} products into backend database!`);
        refetch();
      } else {
        setSeedResult("Gateway reachable, ensure MySQL containers/services are active.");
      }
    } catch {
      setSeedResult("Error contacting gateway.");
    } finally {
      setIsSeeding(false);
      setTimeout(() => setSeedResult(null), 5000);
    }
  };

  // Determine items to display
  let itemsToDisplay: (Product | ExtendedProduct)[] = [];
  if (apiProducts?.content && apiProducts.content.length > 0) {
    itemsToDisplay = apiProducts.content;
  } else {
    itemsToDisplay = COMMERCE_PRODUCTS;
  }

  // Filter in memory for instantaneous user interaction
  let filtered = itemsToDisplay.filter((p) => {
    if (selectedCategory && p.categoryId !== selectedCategory) return false;
    const effectivePrice = p.discountPrice || p.price;
    if (minPrice && effectivePrice < parseFloat(minPrice)) return false;
    if (maxPrice && effectivePrice > parseFloat(maxPrice)) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.skuCode?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort logic
  if (sortBy === "price-low") {
    filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (sortBy === "price-high") {
    filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else if (sortBy === "bestselling") {
    filtered.sort((a, b) => {
      const ea = a as ExtendedProduct;
      const eb = b as ExtendedProduct;
      return (eb.reviewCount || 0) - (ea.reviewCount || 0);
    });
  }

  const categories =
    apiCategories.length > 0 ? apiCategories : COMMERCE_CATEGORIES;

  const hasActiveFilters = Boolean(
    selectedCategory || minPrice || maxPrice || searchTerm
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8">
      {/* 1. BREADCRUMBS & TITLE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Link href="/" className="hover:text-text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-text-primary font-medium">All Products</span>
          {selectedCategory && (
            <>
              <span>/</span>
              <span className="text-accent font-semibold">
                {categories.find((c) => c.id === selectedCategory)?.name || "Category"}
              </span>
            </>
          )}
        </div>

        {/* Header Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name
                : "Explore All Products"}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              Showing {filtered.length} products with live inventory verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-text-secondary font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateFilters({ sortBy: e.target.value });
                }}
                className="bg-surface border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent text-xs font-medium cursor-pointer"
              >
                <option value="featured">Featured Deals</option>
                <option value="bestselling">Bestsellers & Reviews</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Mobile filter toggle */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex items-center gap-1.5 text-xs font-semibold bg-surface border border-border px-3 py-2 rounded-xl"
            >
              <Funnel size={14} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Backend Database Seed Banner */}
        {isGatewayOnline && backendCount === 0 && (
          <div className="p-4 bg-accent-tint border border-accent/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-accent font-medium">
              <CheckCircle size={18} weight="fill" />
              <span>
                Connected to Spring Boot API Gateway (Port 8080). MySQL tables are ready for data.
              </span>
            </div>
            <button
              type="button"
              disabled={isSeeding}
              onClick={handleSeed}
              className="bg-accent text-white hover:bg-accent-hover font-semibold px-4 py-2 rounded-xl transition-all shadow-sm shrink-0"
            >
              {isSeeding ? "Syncing..." : "Seed Catalog to MySQL DB"}
            </button>
          </div>
        )}

        {seedResult && (
          <div className="p-3 bg-success-tint border border-success/30 text-success rounded-xl text-xs font-medium text-center">
            {seedResult}
          </div>
        )}
      </div>

      {/* 2. MAIN LAYOUT: SIDEBAR + PRODUCT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filters */}
        <aside
          className={`${
            mobileFilterOpen ? "block" : "hidden"
          } md:block md:col-span-3 bg-surface border border-border rounded-2xl p-6 space-y-6 shadow-sm`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Filters
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-accent font-semibold hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Search in Catalog */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              Search Keywords
            </label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Headphones, sneakers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface-sunken border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
              />
              <MagnifyingGlass
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary"
              />
            </form>
          </div>

          {/* Categories */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              Categories
            </h4>
            <div className="flex flex-col space-y-1 text-xs">
              <button
                type="button"
                onClick={() => handleCategoryClick(undefined)}
                className={`text-left py-2 px-3 rounded-xl font-medium transition-colors ${
                  selectedCategory === undefined
                    ? "bg-accent text-white"
                    : "text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
                }`}
              >
                All Categories ({COMMERCE_PRODUCTS.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCategoryClick(c.id)}
                  className={`text-left py-2 px-3 rounded-xl font-medium transition-colors ${
                    selectedCategory === c.id
                      ? "bg-accent text-white"
                      : "text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              Price Range (₹)
            </h4>
            <form onSubmit={handlePriceApply} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-surface-sunken border border-border rounded-xl px-3 py-2 text-xs font-mono tabular-nums text-text-primary"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-surface-sunken border border-border rounded-xl px-3 py-2 text-xs font-mono tabular-nums text-text-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-surface-sunken hover:bg-surface border border-border hover:border-accent text-text-primary font-semibold rounded-xl py-2 text-xs transition-colors"
              >
                Apply Range
              </button>
            </form>
          </div>
        </aside>

        {/* 3. PRODUCT GRID */}
        <div className="md:col-span-9 space-y-8">
          {filtered.length === 0 ? (
            <div className="bg-surface border border-border rounded-3xl p-12 text-center space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-text-primary">
                No matching articles found
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                No products matched your exact filter parameters. Clear your filters to explore our full inventory.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="bg-accent text-white hover:bg-accent-hover text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
