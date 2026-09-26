"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User as UserIcon, Package, SignOut, ArrowRight, ShieldCheck } from "@phosphor-icons/react";
import { authStore } from "@/lib/auth-store";
import { orderHistoryStore } from "@/lib/order-history-store";
import { User } from "@/types/api";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const currentUser = authStore.getUser();
    setUser(currentUser);
    setOrderCount(orderHistoryStore.getOrders().length);
    setMounted(true);
  }, []);

  const handleLogout = () => {
    authStore.clearAuth();
    router.push("/login");
  };

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        <div className="h-8 w-48 bg-surface-sunken animate-pulse rounded-lg mb-8" />
        <div className="h-40 bg-surface-sunken animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-text-primary">
            Authentication Required
          </h1>
          <p className="text-sm text-text-secondary">
            Sign in to view your profile settings, order consignments, and saved addresses.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link
            href="/login"
            className="bg-accent text-white hover:bg-accent-hover px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-surface border border-border hover:border-accent text-text-primary px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-16 space-y-10">
      <div className="space-y-1">
        <span className="text-xs font-mono text-text-secondary tracking-wide">
          PROFILE & CONFIGURATION
        </span>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
          Customer Account
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 bg-surface border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-tinted">
          <div className="flex items-center gap-4 pb-6 border-b border-border">
            <div className="w-14 h-14 rounded-xl bg-surface-sunken border border-border flex items-center justify-center text-accent">
              <UserIcon size={28} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{user.name}</h2>
              <p className="text-xs font-mono text-text-secondary">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono text-text-secondary">
            <div>
              <span className="block text-text-disabled">ACCOUNT IDENTIFIER</span>
              <span className="font-medium text-text-primary">
                USR-{user.userId || user.id || "001"}
              </span>
            </div>
            <div>
              <span className="block text-text-disabled">AUTHORIZATION ROLE</span>
              <span className="font-medium text-text-primary">
                {user.role || "ROLE_USER"}
              </span>
            </div>
            <div>
              <span className="block text-text-disabled">SESSION SECURITY</span>
              <span className="font-medium text-success">JWT Verified</span>
            </div>
            <div>
              <span className="block text-text-disabled">ORDER TELEMETRY</span>
              <span className="font-medium text-text-primary">
                {orderCount} Recorded
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-xs font-medium text-error hover:bg-error-tint px-3 py-2 rounded-lg transition-colors"
            >
              <SignOut size={16} />
              <span>Sign Out of Valence</span>
            </button>
          </div>
        </div>

        {/* Quick Navigation Card */}
        <div className="space-y-4">
          <Link
            href="/account/orders"
            className="block bg-surface-sunken border border-border hover:border-accent rounded-2xl p-6 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <Package size={22} className="text-accent" />
              <ArrowRight size={16} className="text-text-secondary group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">Order History</h3>
            <p className="text-xs text-text-secondary mt-1">
              Inspect {orderCount} past dispatches and telemetry tracking.
            </p>
          </Link>

          <Link
            href="/products"
            className="block bg-surface-sunken border border-border hover:border-accent rounded-2xl p-6 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <ShieldCheck size={22} className="text-accent" />
              <ArrowRight size={16} className="text-text-secondary group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">Catalogue</h3>
            <p className="text-xs text-text-secondary mt-1">
              Explore newly consigned articles and hardware runs.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
