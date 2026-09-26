// Core API Types matching Spring Boot Microservices

export interface User {
  id?: number;
  userId?: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  userId: number;
  email: string;
  name: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  brand: string;
  imageUrl?: string;
  categoryId: number;
  skuCode?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface InventoryResponse {
  skuCode: string;
  quantity?: number;
  inStock: boolean;
}

export interface OrderItem {
  skuCode: string;
  quantity: number;
  price: number;
}

export interface OrderRequest {
  skuCode: string;
  quantity: number;
  price: number;
  userEmail?: string;
  shippingAddress?: string;
}

export interface OrderResponse {
  orderNumber: string;
  orderStatus: string;
}

export type PaymentMethod = "CARD" | "UPI" | "NET_BANKING" | "WALLET" | "COD";
export type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING";

export interface RequestPayment {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface PaymentResponse {
  paymentId?: number;
  orderId: string;
  amount: number;
  paymentStatus: PaymentStatus;
  transactionId?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderHistoryItem {
  orderNumber: string;
  date: string;
  status: "CONFIRMED" | "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  total: number;
  items: {
    productName: string;
    skuCode: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress?: string;
  paymentMethod?: string;
}
