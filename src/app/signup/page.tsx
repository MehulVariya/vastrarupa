"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, Mail, User, Phone, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: "customer",
          },
        },
      });

      if (error) throw error;

      setSuccessMsg("Account created! Please check your email inbox to verify your email address.");
      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");
    } catch (err: any) {
      console.error("Signup error:", err);
      setErrorMsg(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full mx-auto bg-card border border-border p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide">Create Account</h1>
          <p className="text-muted-foreground text-xs">Join our luxury ethnic fashion atelier portal</p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-sm text-xs font-semibold">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 text-accent bg-accent/10 border border-accent/20 p-3 rounded-sm text-xs font-semibold">
            <AlertCircle size={16} className="text-accent" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="signup-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                id="signup-name"
                type="text"
                placeholder="Royal Patron"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-background border border-border pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="signup-email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                id="signup-email"
                type="email"
                placeholder="patron@vastrarupa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-background border border-border pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="signup-phone" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                id="signup-phone"
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-background border border-border pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="signup-password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                id="signup-password"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-background border border-border pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground h-10 font-bold text-xs uppercase tracking-widest hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-bold">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
