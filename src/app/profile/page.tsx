import ProfileClient from "./ProfileClient";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | Vastrarupa Atelier",
  description: "View your order ledger, wishlist, saved delivery addresses, and personal profile details.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      }
    >
      <ProfileClient />
    </Suspense>
  );
}
