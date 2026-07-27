"use client";

import { useCart, CartItem } from "./useCart";
import { formatPrice } from "@/lib/utils";
import { X, Plus, Minus, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    getCartSubtotal,
    getCartDiscount,
    getCartTotal,
    coupon,
    applyCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");

  const subtotal = getCartSubtotal();
  const discount = getCartDiscount();
  const total = getCartTotal();
  const shippingThreshold = 2999;
  const shippingFee = subtotal > shippingThreshold || subtotal === 0 ? 0 : 99;
  const remainingForFreeShipping = shippingThreshold - subtotal;

  const handleApplyCoupon = () => {
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    // Simulated coupons
    if (code === "WELCOME10") {
      if (subtotal < 1999) {
        setCouponError("Minimum order value for WELCOME10 is ₹1,999");
        return;
      }
      applyCoupon({
        code: "WELCOME10",
        discountType: "percentage",
        discountValue: 10,
        minOrderValue: 1999,
        maxDiscount: 500,
      });
      setCouponCode("");
    } else if (code === "DAILY15") {
      if (subtotal < 2499) {
        setCouponError("Minimum order value for DAILY15 is ₹2,499");
        return;
      }
      applyCoupon({
        code: "DAILY15",
        discountType: "percentage",
        discountValue: 15,
        minOrderValue: 2499,
        maxDiscount: 800,
      });
      setCouponCode("");
    } else if (code === "ROYAL2000") {
      if (subtotal < 9999) {
        setCouponError("Minimum order value for ROYAL2000 is ₹9,999");
        return;
      }
      applyCoupon({
        code: "ROYAL2000",
        discountType: "fixed_amount",
        discountValue: 2000,
        minOrderValue: 9999,
        maxDiscount: null,
      });
      setCouponCode("");
    } else {
      setCouponError("Invalid coupon code.");
    }
  };

  const handleRemoveCoupon = () => {
    applyCoupon(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col h-full"
          >
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary" />
                <h2 className="font-serif text-xl font-semibold tracking-wide">Shopping Bag ({items.length})</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-secondary transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {subtotal > 0 && (
              <div className="bg-secondary p-4 border-b border-border text-center text-sm">
                {remainingForFreeShipping > 0 ? (
                  <p>
                    Add <span className="font-semibold text-primary">{formatPrice(remainingForFreeShipping)}</span> more for{" "}
                    <span className="font-semibold">FREE Shipping</span>
                  </p>
                ) : (
                  <p className="text-accent font-semibold">Congratulations! You qualify for FREE Shipping.</p>
                )}
                <div className="w-full bg-border h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / shippingThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-secondary text-muted-foreground">
                    <ShoppingBag size={32} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium">Your bag is empty</h3>
                    <p className="text-muted-foreground text-sm mt-1">Explore our premium collection to add styles.</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2.5 bg-primary text-primary-foreground font-medium text-sm tracking-wider uppercase hover:opacity-90 transition cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const activePrice = item.salePrice !== null ? item.salePrice : item.price;
                  return (
                    <div key={item.variantId} className="flex gap-4 border-b border-border pb-4 last:border-0">
                      <div className="relative w-20 h-24 overflow-hidden bg-secondary border border-border">
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <Link
                              href={`/product/${item.productSlug}`}
                              onClick={() => setIsOpen(false)}
                              className="font-serif text-sm font-medium hover:text-primary transition line-clamp-1"
                            >
                              {item.productName}
                            </Link>
                            <button
                              onClick={() => removeItem(item.variantId)}
                              className="text-muted-foreground hover:text-destructive text-xs cursor-pointer ml-2"
                            >
                              Remove
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Size: {item.size} | Color: {item.color}
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center border border-border rounded-sm">
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="p-1 hover:bg-secondary transition cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              className="p-1 hover:bg-secondary transition cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="text-right">
                            {item.salePrice !== null ? (
                              <div className="flex items-center gap-1.5 justify-end">
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                                <span className="text-sm font-semibold text-primary">
                                  {formatPrice(item.salePrice * item.quantity)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm font-semibold">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="border-t border-border p-5 bg-card space-y-4">
                {/* Coupon input */}
                {coupon ? (
                  <div className="flex items-center justify-between bg-accent/10 border border-accent/20 p-2.5 rounded-sm text-sm">
                    <div className="flex items-center gap-2 text-accent">
                      <Tag size={16} />
                      <span>
                        Code <span className="font-semibold">{coupon.code}</span> applied
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo Code (WELCOME10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 bg-background border border-border px-3 py-1.5 text-sm uppercase placeholder:normal-case focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-1.5 bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-destructive text-xs">{couponError}</p>}
                    <p className="text-[10px] text-muted-foreground">Try WELCOME10, DAILY15, or ROYAL2000</p>
                  </div>
                )}

                {/* Subtotal, Discount, Shipping, Total */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-accent font-medium">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-border pt-2 mt-1">
                    <span className="font-serif">Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 font-semibold text-sm tracking-wider uppercase hover:opacity-95 transition cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
