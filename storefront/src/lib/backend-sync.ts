"use client";

import { apiClient, API_BASE_URL } from "./api-client";
import { COMMERCE_CATEGORIES, COMMERCE_PRODUCTS } from "@/data/products";

export interface SyncStatus {
  isGatewayOnline: boolean;
  productCount: number;
  categoryCount: number;
  lastChecked: string;
}

export async function checkBackendHealth(): Promise<{
  online: boolean;
  productCount: number;
}> {
  try {
    const res = await fetch("/api/products?page=0&size=1", {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return {
        online: true,
        productCount: data?.totalElements ?? data?.content?.length ?? 0,
      };
    }
    return { online: false, productCount: 0 };
  } catch {
    return { online: false, productCount: 0 };
  }
}

export async function seedBackendDatabase(): Promise<{
  success: boolean;
  categoriesCreated: number;
  productsCreated: number;
  inventoryCreated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let categoriesCreated = 0;
  let productsCreated = 0;
  let inventoryCreated = 0;

  // 1. Seed Categories
  for (const cat of COMMERCE_CATEGORIES) {
    try {
      await apiClient("/api/categories", {
        method: "POST",
        body: JSON.stringify({
          name: cat.name,
          description: cat.description,
        }),
      });
      categoriesCreated++;
    } catch (e: any) {
      errors.push(`Category ${cat.name}: ${e?.message}`);
    }
  }

  // 2. Seed Products
  for (const prod of COMMERCE_PRODUCTS) {
    try {
      await apiClient("/api/products", {
        method: "POST",
        body: JSON.stringify({
          name: prod.name,
          description: prod.description,
          price: prod.price,
          discountPrice: prod.discountPrice || prod.price,
          quantity: prod.quantity,
          brand: prod.brand,
          imageUrl: prod.imageUrl,
          categoryId: prod.categoryId,
        }),
      });
      productsCreated++;
    } catch (e: any) {
      errors.push(`Product ${prod.name}: ${e?.message}`);
    }

    // 3. Seed Inventory
    if (prod.skuCode) {
      try {
        await apiClient("/api/inventory", {
          method: "POST",
          body: JSON.stringify({
            skuCode: prod.skuCode,
            quantity: prod.quantity,
          }),
        });
        inventoryCreated++;
      } catch (e: any) {
        errors.push(`Inventory ${prod.skuCode}: ${e?.message}`);
      }
    }
  }

  return {
    success: productsCreated > 0,
    categoriesCreated,
    productsCreated,
    inventoryCreated,
    errors,
  };
}
