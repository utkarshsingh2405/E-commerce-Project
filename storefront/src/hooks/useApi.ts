"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  Product,
  Category,
  PageResponse,
  InventoryResponse,
  OrderRequest,
  OrderResponse,
  RequestPayment,
  PaymentResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
} from "@/types/api";

// 1. Products Hooks
export function useProducts(
  page = 0,
  size = 12,
  sortBy = "id",
  sortDir = "desc"
) {
  return useQuery({
    queryKey: ["products", page, size, sortBy, sortDir],
    queryFn: () =>
      apiClient<PageResponse<Product>>(
        `/api/products?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
      ),
  });
}

export function useProduct(id: string | number | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => apiClient<Product>(`/api/products/${id}`),
    enabled: Boolean(id),
  });
}

export function useSearchProducts(keyword: string, page = 0, size = 12) {
  return useQuery({
    queryKey: ["products", "search", keyword, page, size],
    queryFn: () =>
      apiClient<PageResponse<Product>>(
        `/api/products/search?keyword=${encodeURIComponent(
          keyword
        )}&page=${page}&size=${size}`
      ),
    enabled: Boolean(keyword.trim()),
  });
}

export function useFilterProducts(params: {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}) {
  const { categoryId, minPrice, maxPrice, page = 0, size = 12 } = params;
  const searchParams = new URLSearchParams();
  if (categoryId) searchParams.append("categoryId", categoryId.toString());
  if (minPrice !== undefined && minPrice > 0)
    searchParams.append("minPrice", minPrice.toString());
  if (maxPrice !== undefined && maxPrice > 0)
    searchParams.append("maxPrice", maxPrice.toString());
  searchParams.append("page", page.toString());
  searchParams.append("size", size.toString());

  return useQuery({
    queryKey: ["products", "filter", categoryId, minPrice, maxPrice, page, size],
    queryFn: () =>
      apiClient<PageResponse<Product>>(
        `/api/products/filter?${searchParams.toString()}`
      ),
  });
}

// 2. Categories Hooks
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient<Category[]>("/api/categories"),
  });
}

// 3. Inventory Hook
export function useInventory(skuCode: string | undefined) {
  return useQuery({
    queryKey: ["inventory", skuCode],
    queryFn: () =>
      apiClient<InventoryResponse>(`/api/inventory/${skuCode}`),
    enabled: Boolean(skuCode),
  });
}

// 4. Order Hook
export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderData: OrderRequest) => {
      // First try /api/order, fallback to /api/orders if needed
      try {
        return await apiClient<OrderResponse>("/api/order", {
          method: "POST",
          body: JSON.stringify(orderData),
          requiresAuth: true,
        });
      } catch (err: any) {
        if (err?.status === 404) {
          return await apiClient<OrderResponse>("/api/orders", {
            method: "POST",
            body: JSON.stringify(orderData),
            requiresAuth: true,
          });
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

// 5. Payment Hooks
export function useCreatePayment() {
  return useMutation({
    mutationFn: (paymentData: RequestPayment) =>
      apiClient<PaymentResponse>("/api/payments", {
        method: "POST",
        body: JSON.stringify(paymentData),
        requiresAuth: true,
      }),
  });
}

export function usePaymentByOrderId(orderId: string | undefined) {
  return useQuery({
    queryKey: ["payment", "order", orderId],
    queryFn: () =>
      apiClient<PaymentResponse>(`/api/payments/order/${orderId}`, {
        requiresAuth: true,
      }),
    enabled: Boolean(orderId),
  });
}

// 6. User Auth Hooks
export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginRequest) =>
      apiClient<LoginResponse>("/api/users/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (userData: RegisterRequest) =>
      apiClient<User>("/api/users/register", {
        method: "POST",
        body: JSON.stringify(userData),
      }),
  });
}

export function useCurrentUser(userId: number | undefined) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () =>
      apiClient<User>(`/api/users/${userId}`, {
        requiresAuth: true,
      }),
    enabled: Boolean(userId),
  });
}
