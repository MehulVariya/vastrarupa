"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRoute = searchParams.get("next") || "/profile";
  const { initialize } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Map Supabase error codes to friendly messages — never throw, always show inline
        if (
          error.message.toLowerCase().includes("invalid login credentials") ||
          error.message.toLowerCase().includes("invalid credentials") ||
          error.message.toLowerCase().includes("email not confirmed")
        ) {
          setErrorMsg("Incorrect email or password. Please try again.");
        } else if (error.message.toLowerCase().includes("too many requests")) {
          setErrorMsg("Too many attempts. Please wait a few minutes and try again.");
        } else if (error.message.toLowerCase().includes("network")) {
          setErrorMsg("Connection error. Please check your internet and try again.");
        } else {
          setErrorMsg(error.message || "Login failed. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // Success — initialize auth state and redirect
      await initialize();
      router.push(nextRoute);
    } catch (err: any) {
      // Fallback catch — should not normally be reached
      setErrorMsg("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-card border border-border p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide">Welcome Back</h1>
        <p className="text-muted-foreground text-xs">Sign in to your Vastrarupa account</p>
      </div>

      {/* Inline error popup — shown instead of Next.js overlay */}
      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/25 text-destructive px-4 py-3 rounded-sm text-xs font-semibold animate-in fade-in duration-200"
        >
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
              required
              autoComplete="email"
              className="w-full bg-background border border-border pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-primary transition"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="login-password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
              required
              autoComplete="current-password"
              className="w-full bg-background border border-border pl-9 pr-9 py-2.5 text-xs focus:outline-none focus:border-primary transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full bg-primary text-primary-foreground h-10 font-bold text-xs uppercase tracking-widest hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <><Loader2 className="animate-spin" size={15} /><span>Signing in...</span></>
          ) : (
            <span>Log In</span>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        New to Vastrarupa?{" "}
        <Link href="/signup" className="text-primary hover:underline font-bold">
          Create Account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
