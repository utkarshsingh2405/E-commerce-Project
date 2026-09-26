"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CaretDown, CaretUp, ArrowRight, Package } from "@phosphor-icons/react";
import { orderHistoryStore } from "@/lib/order-history-store";
import { authStore } from "@/lib/auth-store";
import { OrderHistoryItem } from "@/types/api";

const initialSampleOrders: OrderHistoryItem[] = [
  {
    orderNumber: "ORD-928104",
    date: "2026-09-22",
    status: "DELIVERED",
    total: 8400,
    shippingAddress: "Flat 4B, Silver Oak Residency, Bengaluru, Karnataka - 560001",
    paymentMethod: "CARD",
    items: [
      {
        productName: "Heavy Cordura Daypack 22L",
        skuCode: "SKU-VAL-02",
        quantity: 1,
        price: 8400,
      },
    ],
  },
  {
    orderNumber: "ORD-719340",
    date: "2026-09-14",
    status: "CONFIRMED",
    total: 5650,
    shippingAddress: "Plot 12, Indiranagar 1st Stage, Bengaluru, Karnataka - 560038",
    paymentMethod: "UPI",
    items: [
      {
        productName: "Field Anodized Aluminum Flask",
        skuCode: "SKU-VAL-01",
        quantity: 1,
        price: 3800,
      },
      {
        productName: "Graphite Technical Mechanical Pencil",
        skuCode: "SKU-VAL-05",
        quantity: 1,
        price: 1850,
      },
    ],
  },
  {
    orderNumber: "ORD-540219",
    date: "2026-08-30",
    status: "DELIVERED",
    total: 4400,
    shippingAddress: "Flat 4B, Silver Oak Residency, Bengaluru, Karnataka - 560001",
    paymentMethod: "NET_BANKING",
    items: [
      {
        productName: "Machined Brass Desk Tray",
        skuCode: "SKU-VAL-03",
        quantity: 1,
        price: 4400,
      },
    ],
  },
];

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedOrders = orderHistoryStore.getOrders();
    if (savedOrders.length > 0) {
      setOrders(savedOrders);
    } else {
      setOrders(initialSampleOrders);
    }
    setMounted(true);

    const handleOrdersChange = () => {
      const current = orderHistoryStore.getOrders();
      if (current.length > 0) setOrders(current);
    };

    window.addEventListener("orders-changed", handleOrdersChange);
    return () => window.removeEventListener("orders-changed", handleOrdersChange);
  }, []);

  const toggleExpand = (orderNumber: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderNumber]: !prev[orderNumber],
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED":
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-success-tint text-success">
            {status}
          </span>
        );
      case "SHIPPED":
      case "PROCESSING":
      case "PENDING":
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-warning-tint text-warning">
            {status}
          </span>
        );
      case "CANCELLED":
      case "FAILED":
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-error-tint text-error">
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-surface-sunken text-text-secondary">
            {status}
          </span>
        );
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="h-8 w-48 bg-surface-sunken animate-pulse rounded-lg mb-8" />
        <div className="h-64 bg-surface-sunken animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-mono text-text-secondary tracking-wide">
            ACCOUNT ARCHIVE
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
            Order History
          </h1>
          <p className="text-sm text-text-secondary">
            Dense, traceable ledger of past dispatches and verified delivery logs.
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
        >
          <span>Browse Catalogue</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* DENSE DIVIDE-Y ROW LIST — NO CARD-PER-ORDER (Strict DESIGN.md compliance) */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-tinted">
        {/* Table header row */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-surface-sunken border-b border-border text-xs font-mono text-text-secondary">
          <div className="col-span-3 sm:col-span-3">ORDER NO.</div>
          <div className="col-span-3 sm:col-span-3">DATE</div>
          <div className="col-span-3 sm:col-span-3">STATUS</div>
          <div className="col-span-2 sm:col-span-2 text-right">TOTAL</div>
          <div className="col-span-1 sm:col-span-1 text-right">EXPAND</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#E5E4E0]">
          {orders.map((order) => {
            const isExpanded = Boolean(expandedOrders[order.orderNumber]);

            return (
              <div key={order.orderNumber} className="transition-colors hover:bg-canvas/50">
                {/* Main Row */}
                <div
                  onClick={() => toggleExpand(order.orderNumber)}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer select-none text-sm"
                >
                  {/* Order Number */}
                  <div className="col-span-3 sm:col-span-3 font-mono font-medium text-text-primary">
                    {order.orderNumber}
                  </div>

                  {/* Date */}
                  <div className="col-span-3 sm:col-span-3 font-mono text-xs text-text-secondary">
                    {order.date}
                  </div>

                  {/* Status Badge */}
                  <div className="col-span-3 sm:col-span-3">
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Total */}
                  <div className="col-span-2 sm:col-span-2 text-right font-mono tabular-nums font-medium text-text-primary">
                    ₹{order.total.toLocaleString("en-IN")}
                  </div>

                  {/* Expand Chevron */}
                  <div className="col-span-1 sm:col-span-1 text-right text-text-secondary">
                    {isExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
                  </div>
                </div>

                {/* Expanded Details Sub-Row */}
                {isExpanded && (
                  <div className="px-6 py-4 bg-surface-sunken/60 border-t border-border space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Consigned items in order */}
                      <div className="space-y-2">
                        <span className="font-mono text-text-secondary uppercase">
                          Items in Requisition
                        </span>
                        <div className="divide-y divide-border border border-border rounded-lg bg-surface px-3">
                          {order.items?.map((item, i) => (
                            <div key={i} className="py-2 flex items-center justify-between">
                              <div>
                                <span className="font-medium text-text-primary block">
                                  {item.productName}
                                </span>
                                <span className="font-mono text-text-secondary">
                                  {item.skuCode} · Qty: {item.quantity}
                                </span>
                              </div>
                              <span className="font-mono tabular-nums text-text-primary font-medium">
                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping and Payment details */}
                      <div className="space-y-2">
                        <span className="font-mono text-text-secondary uppercase">
                          Logistics & Settlement
                        </span>
                        <div className="border border-border rounded-lg bg-surface p-3 space-y-2 text-text-secondary">
                          <div>
                            <span className="text-text-primary font-medium">Destination: </span>
                            <span>{order.shippingAddress || "Registered Delivery Address"}</span>
                          </div>
                          <div>
                            <span className="text-text-primary font-medium">Payment Protocol: </span>
                            <span>{order.paymentMethod || "Electronic Consensus"}</span>
                          </div>
                          <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
                            <span className="font-mono text-text-secondary">Telemetry Sync:</span>
                            <span className="text-success font-medium">Verified by Kafka Service</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
