"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw, Mail } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [linkExpired, setLinkExpired] = useState(false);

  // Resend state
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function processHash() {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const errorCode = params.get("error_code");
        const error = params.get("error");

        // Link expired or invalid — show resend form
        if (error === "access_denied" || errorCode === "otp_expired") {
          setLinkExpired(true);
          setCheckingSession(false);
          window.history.replaceState(null, "", window.location.pathname);
          return;
        }

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const type = params.get("type");

        if (type === "recovery" && accessToken && refreshToken) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!sessionError && data.session) {
            setSessionReady(true);
            window.history.replaceState(null, "", window.location.pathname);
            setCheckingSession(false);
            return;
          }
        }

        // Fallback: already have a valid session
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          setSessionReady(true);
        }
        setCheckingSession(false);
      } catch (err) {
        setCheckingSession(false);
      }
    }

    processHash();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMsg(error.message || "Failed to update password. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setErrorMsg("Something went wrong. Please request a new reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResendLoading(true);
    setResendMsg("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(resendEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        if (error.message.toLowerCase().includes("rate limit") || error.message.toLowerCase().includes("rate_limit")) {
          setResendMsg("⚠ Too many emails sent. Please wait 5–10 minutes and try again, or reset your password directly from the Supabase dashboard.");
        } else {
          setResendMsg(error.message || "Failed to send email. Please try again.");
        }
      } else {
        setResendMsg("✓ Reset email sent! Check your inbox and click the link within 1 hour.");
      }
    } catch {
      setResendMsg("Failed to send email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const strength =
    password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"];
  const strengthColor = ["", "bg-red-500", "bg-yellow-500", "bg-green-500"];

  // ── Checking ──
  if (checkingSession) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <Loader2 className="animate-spin text-primary" size={28} />
        <p className="text-xs text-muted-foreground">Verifying reset link…</p>
      </div>
    );
  }

  // ── Expired / Invalid link ──
  if (linkExpired) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle size={24} className="text-destructive" />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-semibold">Link Expired</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This password reset link has expired or was already used.<br />
              Enter your email below to receive a new one.
            </p>
          </div>
        </div>

        <form onSubmit={handleResend} className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="resend-email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Your Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                id="resend-email"
                type="email"
                placeholder="you@example.com"
                value={resendEmail}
                onChange={(e) => { setResendEmail(e.target.value); setResendMsg(""); }}
                required
                autoComplete="email"
                className="w-full bg-background border border-border pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          {resendMsg && (
            <p className={`text-xs font-semibold px-1 ${resendMsg.startsWith("✓") ? "text-green-600" : "text-destructive"}`}>
              {resendMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={resendLoading || !resendEmail}
            className="w-full bg-primary text-primary-foreground h-10 font-bold text-xs uppercase tracking-widest hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {resendLoading ? (
              <><Loader2 className="animate-spin" size={15} /><span>Sending…</span></>
            ) : (
              <><RefreshCw size={14} /><span>Send New Reset Link</span></>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline font-bold">← Back to Login</Link>
        </p>
      </div>
    );
  }

  // ── No valid session found ──
  if (!sessionReady) {
    return (
      <div className="space-y-5 text-center py-4">
        <AlertCircle size={38} className="mx-auto text-destructive" />
        <div className="space-y-1">
          <h2 className="font-serif text-lg font-semibold">Invalid Link</h2>
          <p className="text-xs text-muted-foreground">
            This reset link is not valid. Please request a new one.
          </p>
        </div>
        <Link href="/login" className="inline-block mt-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:opacity-90 transition">
          Back to Login
        </Link>
      </div>
    );
  }

  // ── Success ──
  if (success) {
    return (
      <div className="space-y-4 text-center py-4">
        <CheckCircle2 size={40} className="mx-auto text-green-500" />
        <div className="space-y-1">
          <h2 className="font-serif text-xl font-semibold">Password Updated!</h2>
          <p className="text-xs text-muted-foreground">Your password has been changed. Redirecting…</p>
        </div>
        <Loader2 className="animate-spin text-primary mx-auto mt-1" size={18} />
      </div>
    );
  }

  // ── Set new password form ──
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-serif text-2xl font-bold tracking-wide">Set New Password</h1>
        <p className="text-muted-foreground text-xs">Choose a strong password for your account</p>
      </div>

      {errorMsg && (
        <div role="alert" className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/25 text-destructive px-4 py-3 text-xs font-semibold">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="rp-password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input id="rp-password" type={showPass ? "text" : "password"} placeholder="At least 8 characters"
              value={password} onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
              required autoComplete="new-password"
              className="w-full bg-background border border-border pl-9 pr-9 py-2.5 text-xs focus:outline-none focus:border-primary transition" />
            <button type="button" onClick={() => setShowPass(!showPass)} tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : "bg-border"}`} />
                ))}
              </div>
              <p className={`text-[10px] font-semibold ${strength === 1 ? "text-red-500" : strength === 2 ? "text-yellow-600" : "text-green-600"}`}>
                {strengthLabel[strength]}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="rp-confirm" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input id="rp-confirm" type={showConfirm ? "text" : "password"} placeholder="Repeat your password"
              value={confirm} onChange={(e) => { setConfirm(e.target.value); setErrorMsg(""); }}
              required autoComplete="new-password"
              className={`w-full bg-background border pl-9 pr-9 py-2.5 text-xs focus:outline-none transition ${confirm && confirm !== password ? "border-destructive" : "border-border focus:border-primary"}`} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {confirm && confirm !== password && (
            <p className="text-[10px] text-destructive font-semibold">Passwords do not match</p>
          )}
        </div>

        <button type="submit"
          disabled={isLoading || !password || !confirm || password !== confirm}
          className="w-full bg-primary text-primary-foreground h-10 font-bold text-xs uppercase tracking-widest hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
          {isLoading ? (
            <><Loader2 className="animate-spin" size={15} /><span>Updating…</span></>
          ) : (
            <span>Update Password</span>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline font-bold">← Back to Login</Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full mx-auto bg-card border border-border p-6 sm:p-8">
        <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={24} /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
