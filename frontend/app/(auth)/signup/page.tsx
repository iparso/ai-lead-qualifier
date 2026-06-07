"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-10 justify-center">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 0L7.5 4H12L8.5 6.5L10 10.5L6 8L2 10.5L3.5 6.5L0 4H4.5L6 0Z"
                  fill="#C6E030"
                />
              </svg>
            </div>
            <span className="font-sans font-semibold text-primary text-sm tracking-tight">
              Lead Qualifier
            </span>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-8 text-center animate-fade-in">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="font-display text-xl text-primary mb-2">Check your email</h2>
            <p className="text-sm text-body">
              We sent a confirmation link to{" "}
              <span className="font-medium text-primary">{email}</span>. Click it
              to activate your account.
            </p>
            <Link
              href="/login"
              className="inline-block mt-6 text-xs text-muted hover:text-primary transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 0L7.5 4H12L8.5 6.5L10 10.5L6 8L2 10.5L3.5 6.5L0 4H4.5L6 0Z"
                fill="#C6E030"
              />
            </svg>
          </div>
          <span className="font-sans font-semibold text-primary text-sm tracking-tight">
            Lead Qualifier
          </span>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 animate-fade-in">
          <h1 className="font-display text-2xl text-primary mb-1">
            Create an account
          </h1>
          <p className="text-sm text-muted mb-7">
            Start qualifying leads in seconds.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-primary mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-primary placeholder:text-muted focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-primary mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                placeholder="Min. 6 characters"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-primary placeholder:text-muted focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
            </div>

            {error && (
              <p className="text-xs text-hot bg-hot-muted border border-hot/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-accent font-sans font-semibold text-sm py-2.5 rounded-lg hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-xs text-muted text-center mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
