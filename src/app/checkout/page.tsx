import CheckoutClient from "./CheckoutClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Vastrarupa Secure Payment",
  description: "Complete your luxury ethnic fashion order securely at Vastrarupa checkout.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
