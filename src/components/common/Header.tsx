"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/features/auth/useAuth";
import { useCart } from "@/features/cart/useCart";
import { useWishlist } from "@/features/wishlist/useWishlist";
import ThemeToggle from "./ThemeToggle";
import { ShoppingBag, Heart, Search, User, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import CartDrawer from "@/features/cart/CartDrawer";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { user, profile, initialize, signOut } = useAuth();
  const { items, setIsOpen: setCartOpen } = useCart();
  const { productIds } = useWishlist();
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<string[]>([
    "Free Shipping on all orders above ₹2,999"
  ]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Load announcement setting from Supabase
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "announcement_bar")
          .maybeSingle();
        if (data?.value && typeof data.value === "object") {
          if ("announcements" in data.value && Array.isArray((data.value as any).announcements)) {
            setAnnouncements((data.value as any).announcements);
          } else if ("text" in data.value) {
            setAnnouncements([(data.value as any).text]);
          }
        }
      } catch (err) {
        console.error("Failed to load announcement bar settings:", err);
      }
    };
    fetchAnnouncement();
  }, []);

  // Cycle announcements carousel
  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements]);

  // Close menus on path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsProfileMenuOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const navLinks = [
    { label: "Shop All", href: "/shop" },
    { label: "Kurtis", href: "/shop?category=kurtis" },
    { label: "Kurta Sets", href: "/shop?category=kurta-sets" },
    { label: "Gowns", href: "/shop?category=gowns" },
    { label: "Co-ord Sets", href: "/shop?category=co-ord-sets" },
    { label: "Dupattas", href: "/shop?category=dupattas" },
  ];

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border">
        {/* Top promo bar */}
        <div className="w-full bg-primary text-primary-foreground h-9 relative overflow-hidden flex items-center justify-center text-[10px] font-semibold tracking-widest uppercase">
          {announcements.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="absolute text-center px-4 w-full"
              >
                {announcements[currentIdx]}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Main Navbar */}
        <div className="w-full px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 -ml-1.5 text-foreground hover:text-primary transition cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-2xl font-bold tracking-[0.25em] text-foreground hover:opacity-90 transition absolute left-1/2 transform -translate-x-1/2 md:static md:translate-x-0"
          >
            VASTRARUPA
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-widest text-foreground">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`hover:text-primary transition-colors duration-200 relative py-1 ${
                    isActive ? "text-primary border-b border-primary" : "text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 text-foreground hover:text-primary transition cursor-pointer"
              aria-label="Open search"
            >
              <Search size={20} />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Wishlist */}
            <Link
              href="/profile?tab=wishlist"
              className="p-1.5 text-foreground hover:text-primary transition relative"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {productIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {productIds.length}
                </span>
              )}
            </Link>

            {/* Shopping Bag */}
            <button
              onClick={() => setCartOpen(true)}
              className="p-1.5 text-foreground hover:text-primary transition relative cursor-pointer"
              aria-label="Shopping bag"
            >
              <ShoppingBag size={20} />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {items.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Account / User Menu */}
            <div ref={profileMenuRef} className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="p-1.5 text-foreground hover:text-primary transition flex items-center gap-1 cursor-pointer"
                    aria-label="Profile menu"
                  >
                    <User size={20} />
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-sm shadow-lg py-1.5 z-40"
                        >
                          <div className="px-4 py-2 border-b border-border">
                            <p className="text-xs font-semibold truncate text-foreground">
                              {profile?.fullName || "My Account"}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                          </div>
                          
                          {(profile?.role === "admin" || profile?.role === "super_admin") && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-2 px-4 py-2 text-xs text-foreground hover:bg-secondary transition"
                            >
                              <LayoutDashboard size={14} />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}

                          <Link
                            href="/profile"
                            className="flex items-center gap-2 px-4 py-2 text-xs text-foreground hover:bg-secondary transition"
                          >
                            <User size={14} />
                            <span>My Profile</span>
                          </Link>

                          <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs text-destructive hover:bg-secondary transition text-left cursor-pointer"
                          >
                            <LogOut size={14} />
                            <span>Log Out</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  href="/login"
                  className="p-1.5 text-foreground hover:text-primary transition"
                  aria-label="Log in"
                >
                  <User size={20} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border bg-background overflow-hidden"
            >
              <div className="px-4 py-5 space-y-4 text-sm font-semibold uppercase tracking-wider">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-foreground hover:text-primary transition"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Global Slideout Cart Drawer */}
      <CartDrawer />

      {/* Search Overlay overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col justify-start pt-32 px-4"
          >
            <div className="w-full max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl tracking-wide">Search Vastrarupa</h3>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 rounded-full hover:bg-secondary cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search for Chikankari, Silk Brocade, Velvet Gowns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="flex-1 bg-background border border-border px-4 py-3 rounded-none focus:outline-none focus:border-primary text-base"
                />
                <button
                  type="submit"
                  className="px-6 bg-primary text-primary-foreground font-semibold uppercase tracking-widest text-sm hover:opacity-90 transition cursor-pointer"
                >
                  Search
                </button>
              </form>
              <div className="mt-8 space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Suggested Searches</p>
                <div className="flex flex-wrap gap-2.5">
                  {["Chikankari", "Velvet", "Silk Brocade", "Floral Kurta Set", "Dupattas"].map((sugg) => (
                    <button
                      key={sugg}
                      onClick={() => {
                        setSearchQuery(sugg);
                        router.push(`/shop?search=${encodeURIComponent(sugg)}`);
                        setIsSearchOpen(false);
                      }}
                      className="px-4 py-1.5 border border-border hover:border-primary hover:text-primary bg-card text-xs font-semibold tracking-wider transition cursor-pointer"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
