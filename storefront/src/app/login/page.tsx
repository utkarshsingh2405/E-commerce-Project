"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, Lock, EnvelopeSimple } from "@phosphor-icons/react";
import { useLogin } from "@/hooks/useApi";
import { authStore } from "@/lib/auth-store";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/products";

  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const response = await loginMutation.mutateAsync(values);
      authStore.setAuth(response);
      setSuccessMessage("Authentication verified. Redirecting to catalog...");
      setTimeout(() => {
        router.push(redirect);
      }, 700);
    } catch (err: any) {
      setServerError(
        err?.message || "Invalid credentials. Please verify your email and password."
      );
    }
  };

  return (
    <div className="min-h-[calc(100dvh-160px)] flex items-center justify-center py-16 px-4 md:px-8">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-tinted space-y-6">
        {/* Header */}
        <div className="space-y-1 text-left">
          <span className="text-xs font-mono text-text-secondary">ACCOUNT ACCESS</span>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text-primary">
            Sign in to Valence
          </h1>
          <p className="text-sm text-text-secondary">
            Access your order dispatches, saved destinations, and hardware reservations.
          </p>
        </div>

        {/* Inline Server Error */}
        {serverError && (
          <div className="p-3 bg-error-tint border border-error/20 rounded-lg text-xs text-error">
            {serverError}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="p-3 bg-success-tint border border-success/20 rounded-lg text-xs text-success">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-text-primary"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@domain.com"
                {...register("email")}
                className={`w-full bg-surface border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none transition-colors ${
                  errors.email
                    ? "border-error focus:border-error"
                    : "border-border focus:border-border-strong"
                }`}
              />
            </div>
            {errors.email ? (
              <span className="text-xs text-error">{errors.email.message}</span>
            ) : (
              <span className="text-xs text-text-secondary">
                The address tied to your customer profile.
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-text-primary"
              >
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              className={`w-full bg-surface border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none transition-colors ${
                errors.password
                  ? "border-error focus:border-error"
                  : "border-border focus:border-border-strong"
              }`}
            />
            {errors.password ? (
              <span className="text-xs text-error">{errors.password.message}</span>
            ) : (
              <span className="text-xs text-text-secondary">
                Minimum 6 characters.
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || loginMutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-accent text-white hover:bg-accent-hover disabled:bg-surface-sunken disabled:text-text-disabled disabled:cursor-not-allowed rounded-lg px-5 py-2.5 text-sm font-medium transition-colors active:scale-[0.98]"
          >
            {isSubmitting || loginMutation.isPending ? (
              "Verifying..."
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer link */}
        <div className="pt-4 border-t border-border text-center text-xs text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-accent font-medium hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
