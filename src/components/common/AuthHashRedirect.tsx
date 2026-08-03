"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Runs on every page. Detects Supabase auth hash fragments and redirects:
 *  - type=recovery  → /reset-password (set new password form)
 *  - error=*        → /reset-password (show error + resend option)
 */
export default function AuthHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    if (hash.includes("type=recovery") || hash.includes("error=")) {
      router.replace("/reset-password" + hash);
    }
  }, [router]);

  return null;
}
