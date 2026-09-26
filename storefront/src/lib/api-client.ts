"use client";

import { authStore } from "./auth-store";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = false, headers: customHeaders, ...restOptions } = options;

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((customHeaders as Record<string, string>) || {}),
  };

  const token = authStore.getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers,
      ...restOptions,
    });
  } catch (err: any) {
    throw new ApiError(
      err?.message || "Network request failed. Is the API Gateway running?",
      0
    );
  }

  if (response.status === 401) {
    authStore.clearAuth();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = `/login?redirect=${encodeURIComponent(
        window.location.pathname
      )}`;
    }
    throw new ApiError("Session expired or unauthorized. Please log in again.", 401);
  }

  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    const message =
      (typeof errorData === "object" && errorData?.message) ||
      (typeof errorData === "string" && errorData) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, errorData);
  }

  // If 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  return text as unknown as T;
}
