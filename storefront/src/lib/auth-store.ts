"use client";

import { jwtDecode } from "jwt-decode";
import { User, LoginResponse } from "@/types/api";

const TOKEN_KEY = "storefront_jwt_token";
const USER_KEY = "storefront_user_profile";

interface JwtPayload {
  sub?: string;
  role?: string;
  roles?: string[];
  exp?: number;
  userId?: number;
  email?: string;
}

export const authStore = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.role) return decoded.role;
      if (Array.isArray(decoded.roles) && decoded.roles.length > 0) return decoded.roles[0];
      return "ROLE_USER";
    } catch {
      return null;
    }
  },

  setAuth(data: LoginResponse) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, data.token);
    
    let decodedRole = "ROLE_USER";
    try {
      const decoded = jwtDecode<JwtPayload>(data.token);
      if (decoded.role) decodedRole = decoded.role;
      else if (Array.isArray(decoded.roles) && decoded.roles.length > 0) decodedRole = decoded.roles[0];
    } catch {
      // fallback
    }

    const user: User = {
      userId: data.userId,
      id: data.userId,
      name: data.name,
      email: data.email,
      role: decodedRole,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("auth-changed"));
  },

  clearAuth() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("auth-changed"));
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        this.clearAuth();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },
};
