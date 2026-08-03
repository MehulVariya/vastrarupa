"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/features/cart/useCart";

export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl: string;
  phone: string;
  role: "customer" | "admin" | "super_admin";
  createdAt: string;
}

interface AuthState {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Self-healing profile creator
async function fetchOrCreateProfile(supabase: any, user: any) {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) return profile;

    // Self-heal: insert missing profile row (handles pre-trigger registrations)
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || "Patron",
        avatar_url: user.user_metadata?.avatar_url || "",
        phone: user.phone || "",
        role: "customer",
      })
      .select()
      .single();

    return newProfile;
  } catch (err) {
    console.error("Profile self-healing failed:", err);
    return null;
  }
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    set({ loading: true });
    const supabase = createClient();

    // Get active session
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      set({ user: session.user });

      // Merge cart with DB on restore
      useCart.getState().mergeCartWithDatabase();

      // Fetch or self-heal profile
      const profile = await fetchOrCreateProfile(supabase, session.user);

      if (profile) {
        set({
          profile: {
            id: profile.id,
            fullName: profile.full_name || "",
            avatarUrl: profile.avatar_url || "",
            phone: profile.phone || "",
            role: profile.role || "customer",
            createdAt: profile.created_at,
          },
        });
      }
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const currentUser = get().user;
        set({ user: session.user });

        // Merge cart with DB if user just logged in or user changed
        if (!currentUser || currentUser.id !== session.user.id) {
          useCart.getState().mergeCartWithDatabase();
        }

        const profile = await fetchOrCreateProfile(supabase, session.user);

        if (profile) {
          set({
            profile: {
              id: profile.id,
              fullName: profile.full_name || "",
              avatarUrl: profile.avatar_url || "",
              phone: profile.phone || "",
              role: profile.role || "customer",
              createdAt: profile.created_at,
            },
          });
        }
      } else {
        set({ user: null, profile: null });
      }
      set({ loading: false });
    });

    set({ loading: false, initialized: true });
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("sb-placeholder-session");
    set({ user: null, profile: null });
  },

  refreshProfile: async () => {
    const user = get().user;
    if (!user) return;

    const supabase = createClient();
    const profile = await fetchOrCreateProfile(supabase, user);

    if (profile) {
      set({
        profile: {
          id: profile.id,
          fullName: profile.full_name || "",
          avatarUrl: profile.avatar_url || "",
          phone: profile.phone || "",
          role: profile.role || "customer",
          createdAt: profile.created_at,
        },
      });
    }
  },
}));
