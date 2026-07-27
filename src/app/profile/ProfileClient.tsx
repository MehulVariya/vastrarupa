"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/useAuth";
import { useWishlist } from "@/features/wishlist/useWishlist";
import { formatPrice, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { User, ShoppingBag, MapPin, Heart, Bell, ShieldCheck, Plus, Trash2, Loader2, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ProductCard, { Product } from "@/features/products/ProductCard";

export default function ProfileClient() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const { productIds, toggleWishlist } = useWishlist();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Loading states
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Profile Edit Form States
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPincode, setAddrPincode] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?next=/profile");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile) {
      setEditName(profile.fullName);
      setEditPhone(profile.phone);
    }
  }, [profile]);

  // Load orders
  const loadOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            quantity,
            price,
            product:products (name, slug, product_images(url))
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Load addresses
  const loadAddresses = async () => {
    if (!user) return;
    setLoadingAddresses(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });
      setAddresses(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Load wishlist products
  const loadWishlist = async () => {
    if (productIds.length === 0) {
      setWishlistProducts([]);
      return;
    }
    setLoadingWishlist(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select(`
          id, name, slug, price, sale_price, material, is_trending, is_featured,
          category:categories(name, slug),
          variants:product_variants(id, size, color, inventory(quantity)),
          images:product_images(url, alt_text)
        `)
        .in("id", productIds);

      if (data) {
        const mapped = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: Number(p.price),
          sale_price: p.sale_price ? Number(p.sale_price) : null,
          material: p.material,
          is_trending: p.is_trending,
          is_featured: p.is_featured,
          category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
          variants: (p.variants || []).map((v: any) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            quantity: v.inventory?.[0]?.quantity || 0,
          })),
          images: p.images || [],
        }));
        setWishlistProducts(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  // Load tab-specific data
  useEffect(() => {
    if (!user) return;
    if (activeTab === "orders") loadOrders();
    if (activeTab === "addresses") loadAddresses();
    if (activeTab === "wishlist") loadWishlist();
  }, [activeTab, user, productIds]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);
    setProfileMsg("");
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editName,
          phone: editPhone,
        })
        .eq("id", user.id);

      if (error) throw error;
      await refreshProfile();
      setProfileMsg("Profile updated successfully!");
    } catch (err: any) {
      setProfileMsg(err.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingAddress(true);
    try {
      const supabase = createClient();
      // If we are setting as default, unset others first
      const { error } = await supabase.from("addresses").insert({
        user_id: user.id,
        full_name: addrName,
        phone: addrPhone,
        address_line1: addrLine1,
        address_line2: addrLine2 || null,
        city: addrCity,
        state: addrState,
        postal_code: addrPincode,
        is_default: addresses.length === 0, // Default if first address
      });

      if (error) throw error;
      setAddrName("");
      setAddrPhone("");
      setAddrLine1("");
      setAddrLine2("");
      setAddrCity("");
      setAddrState("");
      setAddrPincode("");
      setShowAddressForm(false);
      loadAddresses();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    try {
      const supabase = createClient();
      await supabase.from("addresses").delete().eq("id", addrId);
      loadAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefaultAddress = async (addrId: string) => {
    if (!user) return;
    try {
      const supabase = createClient();
      // Unset previous defaults
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
      // Set new default
      await supabase.from("addresses").update({ is_default: true }).eq("id", addrId);
      loadAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "orders", label: "Orders Ledger", icon: ShoppingBag },
    { id: "addresses", label: "Address Book", icon: MapPin },
    { id: "wishlist", label: "Wishlist", icon: Heart },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 items-start">
        {/* Navigation Sidebar */}
        <nav className="bg-card border border-border p-5 space-y-1.5 md:w-[260px] shrink-0">
          <div className="pb-4 mb-4 border-b border-border text-center sm:text-left">
            <h3 className="font-serif text-lg font-bold truncate text-foreground">
              {profile?.fullName || "Patron"}
            </h3>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-left transition cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Contents Column */}
        <div className="bg-card border border-border p-6 sm:p-8 w-full min-w-0">
          {/* PROFILE SETTINGS TAB */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-semibold tracking-wide">Personal Details</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="p-email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                    <input
                      id="p-email"
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full bg-secondary border border-border px-3 py-2 text-xs text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="p-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                    <input
                      id="p-name"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="w-full bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="p-phone" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number</label>
                    <input
                      id="p-phone"
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingProfile ? "Saving..." : "Save Profile Details"}
                  </button>
                </div>
                {profileMsg && <p className="text-accent text-xs font-semibold mt-2">{profileMsg}</p>}
              </form>
            </div>
          )}

          {/* ORDERS LEDGER TAB */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-semibold tracking-wide">Orders Ledger</h2>
              {loadingOrders ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-sm text-muted-foreground text-xs space-y-4">
                  <p>You have not placed any orders yet.</p>
                  <Link
                    href="/shop"
                    className="inline-block px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:opacity-90 transition"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((ord) => (
                    <div key={ord.id} className="border border-border rounded-sm overflow-hidden">
                      {/* Order top bar */}
                      <div className="bg-secondary/40 border-b border-border p-4 flex flex-col sm:flex-row justify-between gap-3 text-xs">
                        <div className="grid grid-cols-2 sm:flex sm:gap-6 gap-x-4">
                          <div>
                            <p className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Date Placed</p>
                            <p className="font-semibold text-foreground mt-0.5">{formatDate(ord.created_at)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Reference</p>
                            <p className="font-serif font-semibold text-foreground mt-0.5">{ord.order_number}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Total Sum</p>
                            <p className="font-semibold text-foreground mt-0.5">{formatPrice(ord.total)}</p>
                          </div>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Delivery Status</p>
                          <span className={`inline-block px-2.5 py-0.5 mt-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            ord.status === "delivered" ? "bg-accent/10 text-accent border border-accent/20" : "bg-primary/10 text-primary border border-primary/20"
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>

                      {/* Order items */}
                      <div className="p-4 space-y-3">
                        {ord.order_items?.map((item: any, idx: number) => {
                          const itemImg = item.product?.product_images?.[0]?.url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop";
                          return (
                            <div key={idx} className="flex gap-4 text-xs">
                              <div className="relative w-12 h-16 bg-secondary border border-border shrink-0">
                                <Image
                                  src={itemImg}
                                  alt={item.product?.name || ""}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 flex flex-col justify-between">
                                <div>
                                  <h4 className="font-semibold text-foreground">{item.product?.name}</h4>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">Quantity: {item.quantity}</p>
                                </div>
                                <span className="font-semibold">{formatPrice(item.price)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Tracking footer */}
                      {ord.tracking_number && (
                        <div className="bg-secondary/20 p-3 border-t border-border text-[10px] flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Tracking Number: <span className="font-mono font-bold text-foreground">{ord.tracking_number}</span>
                          </span>
                          <a
                            href="https://delhivery.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary font-bold hover:underline uppercase tracking-wider"
                          >
                            Track Parcel
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADDRESS BOOK TAB */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-xl font-semibold tracking-wide">Saved Addresses</h2>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/95 transition cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>New Address</span>
                  </button>
                )}
              </div>

              {/* Address insert form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="border border-border p-5 space-y-4 max-w-md bg-secondary/10">
                  <h3 className="font-serif text-sm font-semibold tracking-wide">Add Delivery Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="addr-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recipient Name</label>
                      <input
                        id="addr-name"
                        type="text"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        required
                        className="w-full bg-background border border-border px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="addr-phone" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recipient Phone</label>
                      <input
                        id="addr-phone"
                        type="tel"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        required
                        className="w-full bg-background border border-border px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="addr-line1" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Address Line 1</label>
                    <input
                      id="addr-line1"
                      type="text"
                      placeholder="Flat, House no, Street name"
                      value={addrLine1}
                      onChange={(e) => setAddrLine1(e.target.value)}
                      required
                      className="w-full bg-background border border-border px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="addr-line2" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Address Line 2 (Optional)</label>
                    <input
                      id="addr-line2"
                      type="text"
                      placeholder="Area, Colony, LandMark"
                      value={addrLine2}
                      onChange={(e) => setAddrLine2(e.target.value)}
                      className="w-full bg-background border border-border px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="addr-city" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">City</label>
                      <input
                        id="addr-city"
                        type="text"
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        required
                        className="w-full bg-background border border-border px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="addr-state" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">State</label>
                      <input
                        id="addr-state"
                        type="text"
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        required
                        className="w-full bg-background border border-border px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="addr-pin" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pincode</label>
                      <input
                        id="addr-pin"
                        type="text"
                        value={addrPincode}
                        onChange={(e) => setAddrPincode(e.target.value)}
                        required
                        className="w-full bg-background border border-border px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-1.5 border border-border text-xs font-semibold uppercase tracking-wider hover:bg-secondary cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingAddress}
                      className="px-4 py-1.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {loadingAddresses ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin text-primary" size={20} />
                </div>
              ) : addresses.length === 0 ? (
                <p className="text-xs text-muted-foreground">No saved delivery addresses found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`border p-4 rounded-sm flex flex-col justify-between space-y-4 bg-background relative ${
                        addr.is_default ? "border-primary" : "border-border"
                      }`}
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">{addr.full_name}</span>
                          {addr.is_default && (
                            <span className="bg-accent/15 text-accent border border-accent/20 text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground">{addr.phone}</p>
                        <p className="text-muted-foreground mt-1.5 leading-relaxed">
                          {addr.address_line1}, {addr.address_line2 && `${addr.address_line2}, `}
                          {addr.city}, {addr.state} - {addr.postal_code}
                        </p>
                      </div>

                      <div className="flex gap-4 border-t border-border pt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {!addr.is_default && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="hover:text-primary cursor-pointer"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="hover:text-destructive cursor-pointer ml-auto flex items-center gap-0.5"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === "wishlist" && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-semibold tracking-wide">My Wishlist</h2>
              {loadingWishlist ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              ) : wishlistProducts.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-sm text-muted-foreground text-xs space-y-4">
                  <p>Your wishlist is currently empty.</p>
                  <Link
                    href="/shop"
                    className="inline-block px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:opacity-90 transition"
                  >
                    Explore Collections
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {wishlistProducts.map((prod) => (
                    <div key={prod.id} className="relative">
                      <ProductCard product={prod} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
