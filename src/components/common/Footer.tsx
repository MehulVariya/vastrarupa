"use client";

import Link from "next/link";
import { useState } from "react";
import { Send, Phone, Mail, MapPin } from "lucide-react";

import { usePathname } from "next/navigation";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const pathname = usePathname();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-card border-t border-border mt-auto">
      {/* Top newsletter banner */}
      <div className="w-full px-4 sm:px-6 py-12 md:py-16 border-b border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-2">
            <h3 className="font-serif text-2xl tracking-wide text-foreground">Subscribe to our Edit</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Receive updates on seasonal collections, artisanal design stories, and exclusive subscriber edits.
            </p>
          </div>
          <div>
            {subscribed ? (
              <p className="text-accent text-sm font-semibold tracking-wider uppercase">
                Thank you for subscribing to Vastrarupa journal.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="px-6 bg-primary text-primary-foreground font-semibold uppercase tracking-wider text-xs flex items-center gap-1.5 hover:opacity-90 transition cursor-pointer"
                >
                  <span>Subscribe</span>
                  <Send size={12} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="w-full px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-4">
          <h4 className="font-serif text-lg font-bold tracking-widest text-foreground">VASTRARUPA</h4>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Crafting premium luxury ethnic clothing that bridges rich traditional weaves with contemporary aesthetics. Made in India.
          </p>
          <div className="flex space-x-4 pt-2">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition" aria-label="Instagram">
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition" aria-label="Facebook">
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition" aria-label="Twitter">
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>

        {/* Shop Column */}
        <div className="space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">Shop Categories</h5>
          <ul className="space-y-2.5 text-xs text-muted-foreground">
            <li>
              <Link href="/shop" className="hover:text-primary transition">Shop All</Link>
            </li>
            <li>
              <Link href="/shop?category=kurtis" className="hover:text-primary transition">Kurtis</Link>
            </li>
            <li>
              <Link href="/shop?category=kurta-sets" className="hover:text-primary transition">Kurta Sets</Link>
            </li>
            <li>
              <Link href="/shop?category=gowns" className="hover:text-primary transition">Ethnic Gowns</Link>
            </li>
            <li>
              <Link href="/shop?category=co-ord-sets" className="hover:text-primary transition">Coordinates</Link>
            </li>
          </ul>
        </div>

        {/* Help Column */}
        <div className="space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">Customer Care</h5>
          <ul className="space-y-2.5 text-xs text-muted-foreground">
            <li>
              <Link href="/profile?tab=orders" className="hover:text-primary transition">Track My Order</Link>
            </li>
            <li>
              <Link href="/shipping-policy" className="hover:text-primary transition">Shipping & Delivery</Link>
            </li>
            <li>
              <Link href="/returns-policy" className="hover:text-primary transition">Returns & Exchanges</Link>
            </li>
            <li>
              <Link href="/size-guide" className="hover:text-primary transition">Size Chart Guide</Link>
            </li>
            <li>
              <Link href="/faqs" className="hover:text-primary transition">Frequently Asked Questions</Link>
            </li>
          </ul>
        </div>

        {/* Contact Column */}
        <div className="space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">Artisanal Atelier</h5>
          <ul className="space-y-3 text-xs text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
              <span>45, Regal Heritage Plaza, Chanderi Lane, New Delhi, 110001, India</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={16} className="text-primary shrink-0" />
              <span>+91 11 4050 6070</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={16} className="text-primary shrink-0" />
              <span>atelier@vastrarupa.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Payment Row */}
      <div className="bg-background border-t border-border py-6 text-center text-[10px] text-muted-foreground">
        <div className="w-full px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} VASTRARUPA Private Limited. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span className="tracking-widest uppercase font-semibold text-[8px] border border-border px-1.5 py-0.5 rounded-sm">Razorpay</span>
            <span className="tracking-widest uppercase font-semibold text-[8px] border border-border px-1.5 py-0.5 rounded-sm">Stripe</span>
            <span className="tracking-widest uppercase font-semibold text-[8px] border border-border px-1.5 py-0.5 rounded-sm">Visa</span>
            <span className="tracking-widest uppercase font-semibold text-[8px] border border-border px-1.5 py-0.5 rounded-sm">Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
