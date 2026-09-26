"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  User as UserIcon,
  MagnifyingGlass,
  List,
  X,
  SignOut,
  CaretDown,
  Lightning,
  ArrowsClockwise,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import { authStore } from "@/lib/auth-store";
import { cartStore } from "@/lib/cart-store";
import { checkBackendHealth, seedBackendDatabase } from "@/lib/backend-sync";
import { User } from "@/types/api";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Backend Sync State
  const [gatewayOnline, setGatewayOnline] = useState<boolean | null>(null);
  const [backendProductsCount, setBackendProductsCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    setUser(authStore.getUser());
    setCartCount(cartStore.getTotalCount());

    const handleAuthChange = () => setUser(authStore.getUser());
    const handleCartChange = () => setCartCount(cartStore.getTotalCount());

    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("cart-changed", handleCartChange);

    // Initial check of backend gateway
    checkBackendHealth().then((res) => {
      setGatewayOnline(res.online);
      setBackendProductsCount(res.productCount);
    });

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("cart-changed", handleCartChange);
    };
  }, []);

  const handleLogout = () => {
    authStore.clearAuth();
    setUserDropdownOpen(false);
    router.push("/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleSeedBackend = async () => {
    setIsSyncing(true);
    setSyncNotice(null);
    try {
      const res = await seedBackendDatabase();
      if (res.success) {
        setSyncNotice(`Synced ${res.productsCreated} products to Spring Boot backend!`);
        setBackendProductsCount(res.productsCreated);
      } else {
        setSyncNotice("Gateway online. Verify MySQL service credentials.");
      }
    } catch {
      setSyncNotice("Failed to sync with gateway.");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

  const categoriesNav = [
    { label: "All Products", href: "/products" },
    { label: "Audio & Tech", href: "/products?categoryId=1" },
    { label: "Footwear", href: "/products?categoryId=2" },
    { label: "Watches", href: "/products?categoryId=3" },
    { label: "Bags & Carry", href: "/products?categoryId=4" },
    { label: "Apparel", href: "/products?categoryId=5" },
  ];

  return (
    <header className="w-full bg-surface border-b border-border sticky top-0 z-40">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-text-primary text-white text-[11px] sm:text-xs py-1.5 px-4 font-medium flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-accent-tint">
              <Lightning size={14} weight="fill" />
              <span>SPRING FLASH SALE:</span>
            </span>
            <span className="hidden sm:inline opacity-90">
              Up to 35% off selected tech & apparel. Free shipping over ₹2,999.
            </span>
            <span className="sm:hidden opacity-90">Up to 35% off + Free Shipping</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Backend Gateway Live Indicator */}
            {gatewayOnline === true ? (
              <div className="flex items-center gap-1.5 text-success-tint">
                <CheckCircle size={13} weight="fill" />
                <span className="hidden md:inline">API Gateway :8080 Active</span>
                {backendProductsCount === 0 && (
                  <button
                    onClick={handleSeedBackend}
                    disabled={isSyncing}
                    className="underline text-white font-sans ml-1 hover:text-accent-tint"
                  >
                    {isSyncing ? "Seeding..." : "Seed MySQL DB"}
                  </button>
                )}
              </div>
            ) : (
              <span className="text-white/60 hidden md:inline text-[11px]">
                API Gateway: Standby (:8080)
              </span>
            )}
            <Link href="/account/orders" className="hover:underline hidden sm:inline">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {syncNotice && (
        <div className="bg-success-tint border-b border-success/20 text-success text-xs py-1 text-center font-medium">
          {syncNotice}
        </div>
      )}

      {/* 2. MAIN HEADER BAR */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
              VALENCE
            </span>
            <span className="text-[10px] font-mono tracking-widest bg-accent text-white px-1.5 py-0.5 rounded font-semibold">
              STORE
            </span>
          </Link>

          {/* Large Center Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search products, brands, sneakers, headphones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-sunken border border-border rounded-xl pl-10 pr-20 py-2.5 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-accent transition-colors"
              />
              <MagnifyingGlass
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-accent text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-accent-hover transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* User Controls: Account & Cart */}
          <div className="flex items-center gap-3">
            {/* Account dropdown / login */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-2 px-3 rounded-xl border border-border hover:border-accent text-text-primary transition-colors text-sm font-medium"
                >
                  <UserIcon size={18} weight="bold" className="text-accent" />
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <CaretDown size={12} className="text-text-secondary" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-surface border border-border rounded-2xl shadow-tinted py-2 z-50 animate-in fade-in">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-[11px] text-text-secondary font-mono">AUTHENTICATED USER</p>
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {user.name}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-text-primary hover:bg-surface-sunken"
                    >
                      Account Dashboard
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-text-primary hover:bg-surface-sunken"
                    >
                      My Orders
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error-tint"
                    >
                      <SignOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex bg-accent text-white hover:bg-accent-hover text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Shopping Bag / Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 p-2.5 rounded-xl border border-border hover:border-accent text-text-primary hover:text-accent transition-colors"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag size={20} weight={cartCount > 0 ? "bold" : "regular"} />
              <span className="hidden lg:inline text-xs font-semibold">Cart</span>
              {cartCount > 0 && (
                <span className="bg-accent text-white text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-text-primary hover:bg-surface-sunken"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={22} /> : <List size={22} />}
            </button>
          </div>
        </div>

        {/* 3. CATEGORY NAVIGATION STRIP (Amazon / ASOS / Nike style) */}
        <div className="hidden md:flex items-center gap-6 py-2.5 border-t border-border/60 text-xs font-medium">
          {categoriesNav.map((cat) => {
            const isActive = pathname === cat.href;
            return (
              <Link
                key={cat.href}
                href={cat.href}
                className={`transition-colors py-1 ${
                  isActive
                    ? "text-accent font-semibold border-b-2 border-accent"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-sunken border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary"
              />
              <MagnifyingGlass
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              />
            </form>

            <nav className="flex flex-col space-y-1">
              {categoriesNav.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-text-primary hover:text-accent py-2 transition-colors"
                >
                  {cat.label}
                </Link>
              ))}

              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-sm py-2 text-text-primary"
                >
                  <span>Shopping Cart</span>
                  <span className="font-mono bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                </Link>
                {!user ? (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center py-2 border border-border rounded-xl text-sm font-medium"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center py-2 bg-accent text-white rounded-xl text-sm font-medium"
                    >
                      Create Account
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="text-left text-sm text-error py-2"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
