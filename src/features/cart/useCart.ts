"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  image: string;
  size: string;
  color: string;
  price: number;
  salePrice: number | null;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
}

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon | null) => void;
  syncWithDatabase: () => Promise<void>;
  getCartSubtotal: () => number;
  getCartDiscount: () => number;
  getCartTotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),

      addItem: (item) => {
        const existingIndex = get().items.findIndex((i) => i.variantId === item.variantId);
        let newItems = [...get().items];
        if (existingIndex > -1) {
          newItems[existingIndex].quantity += item.quantity;
        } else {
          newItems.push(item);
        }
        set({ items: newItems });

        // Async sync if logged in
        get().syncWithDatabase();
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
        get().syncWithDatabase();
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
        });
        get().syncWithDatabase();
      },

      clearCart: () => set({ items: [], coupon: null }),

      applyCoupon: (coupon) => set({ coupon }),

      syncWithDatabase: async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch current DB cart, upsert our local cart items
        const localItems = get().items;
        if (localItems.length === 0) return;

        const cartRecords = localItems.map((item) => ({
          user_id: user.id,
          variant_id: item.variantId,
          quantity: item.quantity,
        }));

        await supabase.from("cart").upsert(cartRecords, { onConflict: "user_id,variant_id" });
      },

      getCartSubtotal: () => {
        return get().items.reduce((acc, item) => {
          const activePrice = item.salePrice !== null ? item.salePrice : item.price;
          return acc + activePrice * item.quantity;
        }, 0);
      },

      getCartDiscount: () => {
        const subtotal = get().getCartSubtotal();
        const coupon = get().coupon;
        if (!coupon || subtotal < coupon.minOrderValue) return 0;

        if (coupon.discountType === "percentage") {
          const discount = (subtotal * coupon.discountValue) / 100;
          return coupon.maxDiscount !== null ? Math.min(discount, coupon.maxDiscount) : discount;
        } else {
          return coupon.discountValue;
        }
      },

      getCartTotal: () => {
        const subtotal = get().getCartSubtotal();
        const discount = get().getCartDiscount();
        // Add flat shipping fee (e.g. 100 INR, free above 2999 INR)
        const shipping = subtotal > 2999 || subtotal === 0 ? 0 : 99;
        return Math.max(0, subtotal - discount + shipping);
      },
    }),
    {
      name: "vastrarupa-cart-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
