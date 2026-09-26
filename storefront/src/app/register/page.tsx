"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight } from "@phosphor-icons/react";
import { useRegister, useLogin } from "@/hooks/useApi";
import { authStore } from "@/lib/auth-store";

const registerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const registerMutation = useRegister();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerMutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
      });

      setSuccessMessage("Account created. Authenticating session...");

      // Automatically sign in
      try {
        const loginResp = await loginMutation.mutateAsync({
          email: values.email,
          password: values.password,
        });
        authStore.setAuth(loginResp);
        setTimeout(() => {
          router.push("/products");
        }, 700);
      } catch {
        router.push("/login");
      }
    } catch (err: any) {
      setServerError(
        err?.message || "Registration failed. That email may already be registered."
      );
    }
  };

  return (
    <div className="min-h-[calc(100dvh-160px)] flex items-center justify-center py-16 px-4 md:px-8">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-tinted space-y-6">
        {/* Header */}
        <div className="space-y-1 text-left">
          <span className="text-xs font-mono text-text-secondary">NEW REGISTRATION</span>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text-primary">
            Create an Account
          </h1>
          <p className="text-sm text-text-secondary">
            Keep track of active hardware orders, delivery confirmations, and inventory updates.
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
          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-text-primary"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Maya Chen"
              {...register("name")}
              className={`w-full bg-surface border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none transition-colors ${
                errors.name
                  ? "border-error focus:border-error"
                  : "border-border focus:border-border-strong"
              }`}
            />
            {errors.name ? (
              <span className="text-xs text-error">{errors.name.message}</span>
            ) : (
              <span className="text-xs text-text-secondary">
                Your first and last name for dispatch labels.
              </span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-text-primary"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@domain.com"
              {...register("email")}
              className={`w-full bg-surface border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none transition-colors ${
                errors.email
                  ? "border-error focus:border-error"
                  : "border-border focus:border-border-strong"
              }`}
            />
            {errors.email ? (
              <span className="text-xs text-error">{errors.email.message}</span>
            ) : (
              <span className="text-xs text-text-secondary">
                Used for order confirmations and tracking receipts.
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-text-primary"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
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

          {/* Phone (Optional) */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-text-primary"
            >
              Contact Number (Optional)
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              {...register("phone")}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-border-strong transition-colors"
            />
            <span className="text-xs text-text-secondary">
              For SMS delivery alerts via Notification Service.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || registerMutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-accent text-white hover:bg-accent-hover disabled:bg-surface-sunken disabled:text-text-disabled disabled:cursor-not-allowed rounded-lg px-5 py-2.5 text-sm font-medium transition-colors active:scale-[0.98]"
          >
            {isSubmitting || registerMutation.isPending ? (
              "Creating Profile..."
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer link */}
        <div className="pt-4 border-t border-border text-center text-xs text-text-secondary">
          Already registered?{" "}
          <Link
            href="/login"
            className="text-accent font-medium hover:underline"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
