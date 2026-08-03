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
  mergeCartWithDatabase: () => Promise<void>;
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

      clearCart: () => {
        set({ items: [], coupon: null });
        get().syncWithDatabase();
      },

      applyCoupon: (coupon) => set({ coupon }),

      syncWithDatabase: async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const localItems = get().items;

        // Clear current DB cart items to push fresh local items
        await supabase.from("cart").delete().eq("user_id", user.id);

        if (localItems.length > 0) {
          const cartRecords = localItems.map((item) => ({
            user_id: user.id,
            variant_id: item.variantId,
            quantity: item.quantity,
          }));

          await supabase.from("cart").insert(cartRecords);
        }
      },

      mergeCartWithDatabase: async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
          const { data: dbItems, error: fetchError } = await supabase
            .from("cart")
            .select(`
              quantity,
              variant_id,
              variant:product_sizes (
                id,
                size,
                stock,
                color:product_colors (
                  id,
                  color_name,
                  hex_code,
                  thumbnail,
                  sku,
                  product:products (
                    id,
                    name,
                    slug,
                    mrp,
                    selling_price
                  )
                )
              )
            `)
            .eq("user_id", user.id);

          if (fetchError) {
            console.error("Failed to fetch database cart:", fetchError.message);
            return;
          }

          const localItems = get().items;

          const mappedDbItems: CartItem[] = (dbItems || [])
            .filter((item: any) => item.variant && item.variant.color && item.variant.color.product)
            .map((item: any) => {
              const variant = item.variant;
              const color = variant.color;
              const product = color.product;
              const price = Number(product.mrp || 0);
              const salePrice = product.selling_price ? Number(product.selling_price) : null;
              return {
                variantId: variant.id,
                productId: product.id,
                productName: product.name,
                productSlug: product.slug,
                image: color.thumbnail || "",
                size: variant.size,
                color: color.color_name,
                price: price,
                salePrice: salePrice,
                quantity: item.quantity,
              };
            });

          // Merge local & DB items
          const mergedMap = new Map<string, CartItem>();

          // Add DB items
          mappedDbItems.forEach(item => {
            mergedMap.set(item.variantId, item);
          });

          // Merge local items
          localItems.forEach(localItem => {
            const dbItem = mergedMap.get(localItem.variantId);
            if (dbItem) {
              dbItem.quantity = Math.max(dbItem.quantity, localItem.quantity);
            } else {
              mergedMap.set(localItem.variantId, localItem);
            }
          });

          const finalItems = Array.from(mergedMap.values());
          set({ items: finalItems });

          // Push merged back to DB
          await supabase.from("cart").delete().eq("user_id", user.id);
          if (finalItems.length > 0) {
            const cartRecords = finalItems.map((item) => ({
              user_id: user.id,
              variant_id: item.variantId,
              quantity: item.quantity,
            }));
            await supabase.from("cart").insert(cartRecords);
          }
        } catch (err) {
          console.error("Error merging cart with database:", err);
        }
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
