import Link from "next/link";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { Metadata } from "next";

interface SuccessPageProps {
  searchParams: Promise<{
    orderNumber?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Order Confirmed | Vastrarupa",
  description: "Your order has been successfully placed.",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { orderNumber } = await searchParams;

  return (
    <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-6">
      <div className="flex justify-center text-primary">
        <CheckCircle2 size={64} className="stroke-accent fill-accent/10" />
      </div>
      <div className="space-y-2">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent">Order Success</span>
        <h1 className="font-serif text-3xl font-semibold text-foreground">Thank You for Your Order</h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          We have received your payment and are preparing your luxury ethnic apparel. A copy of the invoice has been dispatched to your email.
        </p>
      </div>

      {orderNumber && (
        <div className="bg-secondary/40 border border-border p-4 max-w-xs mx-auto text-xs space-y-1 rounded-sm">
          <p className="text-muted-foreground uppercase font-bold tracking-wider">Order Reference</p>
          <p className="font-serif text-base font-semibold text-foreground">{orderNumber}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-1.5 px-6 py-3 border border-primary text-primary font-bold text-xs uppercase tracking-widest hover:bg-secondary transition"
        >
          <ShoppingBag size={14} />
          <span>Continue Shopping</span>
        </Link>
        <Link
          href="/profile"
          className="inline-flex items-center justify-center gap-1.5 px-6 py-3 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:opacity-90 transition"
        >
          <span>Track My Order</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
