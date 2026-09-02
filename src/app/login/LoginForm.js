"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginForm({ next = "/" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    setLoading(true);

    try {
      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError) {
        throw new Error(
          authError.message ===
            "Invalid login credentials"
            ? "Incorrect email or password."
            : authError.message
        );
      }

      router.push(next);
      router.refresh();
    } catch (authError) {
      setError(
        authError?.message ||
          "Unable to sign in. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] shadow-[0_8px_30px_rgba(37,99,235,0.08)]">
            <span className="text-lg font-bold tracking-tight text-[#2563EB]">
              A
            </span>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#64748B]">
            AVENIQ Intelligence
          </p>

          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#0F172A]">
            Welcome back
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#64748B]">
            Sign in to access your real estate
            knowledge and documents.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-xs font-medium text-[#334155]"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] outline-none transition-all duration-200 placeholder:text-[#94A3B8] focus:border-[#93C5FD] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/5"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-xs font-medium text-[#334155]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] outline-none transition-all duration-200 placeholder:text-[#94A3B8] focus:border-[#93C5FD] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/5"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(37,99,235,0.15)] transition-all duration-200 hover:bg-[#1D4ED8] hover:shadow-[0_7px_18px_rgba(37,99,235,0.18)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}

              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[#64748B]">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
