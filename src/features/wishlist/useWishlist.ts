"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";

interface WishlistState {
  productIds: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  syncWithDatabase: () => Promise<void>;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],

      toggleWishlist: async (productId) => {
        const isFav = get().productIds.includes(productId);
        let newIds = [];
        if (isFav) {
          newIds = get().productIds.filter((id) => id !== productId);
        } else {
          newIds = [...get().productIds, productId];
        }
        set({ productIds: newIds });

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (isFav) {
          await supabase
            .from("wishlist")
            .delete()
            .match({ user_id: user.id, product_id: productId });
        } else {
          await supabase
            .from("wishlist")
            .insert({ user_id: user.id, product_id: productId });
        }
      },

      isInWishlist: (productId) => {
        return get().productIds.includes(productId);
      },

      syncWithDatabase: async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: dbWishlist } = await supabase
          .from("wishlist")
          .select("product_id")
          .eq("user_id", user.id);

        if (dbWishlist) {
          const dbIds = dbWishlist.map((item) => item.product_id);
          const merged = Array.from(new Set([...get().productIds, ...dbIds]));
          set({ productIds: merged });

          const missingDb = get().productIds.filter((id) => !dbIds.includes(id));
          if (missingDb.length > 0) {
            const records = missingDb.map((id) => ({
              user_id: user.id,
              product_id: id,
            }));
            await supabase.from("wishlist").insert(records);
          }
        }
      },
    }),
    {
      name: "vastrarupa-wishlist-storage",
    }
  )
);
