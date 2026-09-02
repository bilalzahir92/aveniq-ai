"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!data?.session) {
        setCheckEmail(true);
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (authError) {
      setError(
        authError?.message ||
          "Unable to create your account. Please try again."
      );
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] shadow-[0_8px_30px_rgba(37,99,235,0.08)]">
            <span className="text-lg font-bold tracking-tight text-[#2563EB]">
              A
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#0F172A]">
            Check your email
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#64748B]">
            We sent a confirmation link to{" "}
            <span className="font-medium text-[#334155]">
              {email}
            </span>
            . Click the link to confirm your
            account, then sign in.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
          >
            Back to sign in
          </Link>
        </div>
      </main>
    );
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
            Create your account
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#64748B]">
            Set up your private real estate
            knowledge workspace.
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
                autoComplete="new-password"
                placeholder="At least 6 characters"
                className="mt-2 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] outline-none transition-all duration-200 placeholder:text-[#94A3B8] focus:border-[#93C5FD] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/5"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="text-xs font-medium text-[#334155]"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                autoComplete="new-password"
                placeholder="Re-enter your password"
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
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[#64748B]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
