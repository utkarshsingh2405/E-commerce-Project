"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Check, ArrowRight, Package, Clock, ShieldCheck } from "@phosphor-icons/react";
import { orderHistoryStore } from "@/lib/order-history-store";
import { useState, useEffect } from "react";
import { OrderHistoryItem } from "@/types/api";

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = (params?.id as string) || "ORD-RECENT";

  const [order, setOrder] = useState<OrderHistoryItem | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const found = orderHistoryStore.getOrderById(orderId);
    setOrder(found);
    setMounted(true);
  }, [orderId]);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24 space-y-12">
      {/* Calm Confirmation Moment (No confetti, no fireworks, dignified retail assurance) */}
      <div className="space-y-4 text-left">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-mono bg-success-tint text-success">
          <Check size={14} weight="bold" />
          <span>ORDER CONCLUDED & SECURED</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
          Dispatch Scheduled
        </h1>

        <p className="text-sm md:text-base text-text-secondary leading-relaxed max-w-[55ch]">
          Your hardware requisition has been registered in the order registry. Packing and verification are currently underway at our domestic fulfilment centre.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-tinted">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="space-y-1">
            <span className="text-xs font-mono text-text-secondary">ORDER REFERENCE</span>
            <div className="font-mono text-lg font-medium text-text-primary">
              {orderId}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-success-tint text-success">
              Confirmed
            </span>
            <span className="text-xs font-mono text-text-secondary">
              {order?.date || new Date().toISOString().split("T")[0]}
            </span>
          </div>
        </div>

        {/* Consignment Items */}
        {order?.items && order.items.length > 0 && (
          <div className="space-y-3 pb-6 border-b border-border">
            <span className="text-xs font-mono text-text-secondary">CONSIGNED HARDWARE</span>
            <div className="divide-y divide-border">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-medium text-text-primary">{item.productName}</span>
                    <span className="font-mono text-text-secondary block">
                      {item.skuCode} · Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums text-text-primary">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shipping Destination Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-text-secondary">
          <div className="space-y-1">
            <span className="font-mono text-text-primary block">DELIVERY DESTINATION</span>
            <p className="leading-relaxed">
              {order?.shippingAddress || "Registered shipping address verified on file"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-mono text-text-primary block">PAYMENT SETTLEMENT</span>
            <p className="leading-relaxed">
              Method: {order?.paymentMethod || "Verified Electronic Settlement"}
            </p>
            {order?.total && (
              <p className="font-mono tabular-nums text-text-primary font-medium pt-1">
                Settled: ₹{order.total.toLocaleString("en-IN")}
              </p>
            )}
          </div>
        </div>

        {/* Reassurance notes */}
        <div className="pt-4 border-t border-border flex items-center gap-4 text-xs text-text-secondary">
          <Clock size={16} className="text-accent shrink-0" />
          <span>Estimated handover to surface courier within 18 hours. Tracking details will be dispatched to your email.</span>
        </div>
      </div>

      {/* Action links */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/account/orders"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent text-white hover:bg-accent-hover rounded-lg px-6 py-3 text-sm font-medium transition-colors"
        >
          <span>View in Order History</span>
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/products"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border border-border-strong text-text-primary hover:border-accent hover:text-accent rounded-lg px-6 py-3 text-sm font-medium transition-colors"
        >
          <span>Continue Browsing Catalogue</span>
        </Link>
      </div>
    </div>
  );
}
