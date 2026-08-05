"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/features/cart/useCart";
import { useWishlist } from "@/features/wishlist/useWishlist";
import { formatPrice, formatDate } from "@/lib/utils";
import { Heart, ShoppingBag, ChevronRight, Ruler, Star, Sparkles, Check, HelpCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PincodeChecker from "./PincodeChecker";

export interface ProductSize {
  id: string;
  size: string;
  stock: number;
  price_override?: number | null;
  mrp_override?: number | null;
  sku?: string | null;
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  sku: string;
  thumbnail: string;
  gallery: string[];
  sizes: ProductSize[];
}

export interface ProductDetails {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: string | null;
  mrp: number;
  selling_price: number;
  fabric: string | null;
  fit: string | null;
  colors: ProductColor[];
  keywords?: string[] | null;
}

interface ProductDetailsClientProps {
  product: ProductDetails;
  initialReviews: any[];
}

export default function ProductDetailsClient({ product, initialReviews }: ProductDetailsClientProps) {
  const { addItem, setIsOpen: setCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, profile } = useAuth();
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Find initial color based on URL query "?color=green"
  const colorQuery = searchParams.get("color");
  const initialColorIdx = product.colors.findIndex(
    (c) => c.name.toLowerCase() === colorQuery?.toLowerCase()
  );
  
  const [activeColorIdx, setActiveColorIdx] = useState(initialColorIdx !== -1 ? initialColorIdx : 0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Review states
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const favorited = isInWishlist(product.id);
  const selectedColorObj = product.colors[activeColorIdx] || product.colors[0];

  // Derive gallery images
  const galleryImages = selectedColorObj?.gallery && selectedColorObj.gallery.length > 0
    ? selectedColorObj.gallery
    : [selectedColorObj?.thumbnail || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop"];

  const availableSizes = selectedColorObj ? selectedColorObj.sizes : [];

  // Reset image index and select in-stock size when color changes
  useEffect(() => {
    setActiveImageIndex(0);
    if (availableSizes && availableSizes.length > 0) {
      const inStockSize = availableSizes.find(s => s.stock > 0);
      setSelectedSize(inStockSize ? inStockSize.size : availableSizes[0].size);
    } else {
      setSelectedSize("");
    }
  }, [activeColorIdx, availableSizes]);

  // Sync color selection to URL without reload
  const handleColorChange = (index: number, colorName: string) => {
    setActiveColorIdx(index);
    const params = new URLSearchParams(searchParams.toString());
    params.set("color", colorName.toLowerCase());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Find matching size variant configuration
  const selectedSizeObj = availableSizes.find((s) => s.size === selectedSize);
  
  // Custom price overrides per size variety
  const currentMRP = selectedSizeObj?.mrp_override !== null && selectedSizeObj?.mrp_override !== undefined
    ? Number(selectedSizeObj.mrp_override)
    : Number(product.mrp);

  const currentPrice = selectedSizeObj?.price_override !== null && selectedSizeObj?.price_override !== undefined
    ? Number(selectedSizeObj.price_override)
    : Number(product.selling_price);

  const currentSKU = selectedSizeObj?.sku || selectedColorObj?.sku || "SKU-PENDING";
  const stockCount = selectedSizeObj ? selectedSizeObj.stock : 0;
  const isOutOfStock = stockCount <= 0;

  // Discount percentage calculation
  const discountPercent = currentMRP > 0
    ? Math.round(((currentMRP - currentPrice) / currentMRP) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedColorObj || !selectedSizeObj) return;
    setIsAdding(true);
    addItem({
      variantId: selectedSizeObj.id, // references product_sizes.id
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: galleryImages[0],
      size: selectedSize,
      color: selectedColorObj.name,
      price: currentMRP,
      salePrice: currentPrice,
      quantity,
    });
    setIsAdding(false);
    setCartOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReviewMessage("Please log in to submit a review.");
      return;
    }
    setIsSubmittingReview(true);
    setReviewMessage("");

    try {
      const supabase = createClient();
      const { data: newReview, error } = await supabase
        .from("reviews")
        .insert({
          user_id: user.id,
          product_id: product.id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          is_verified: true, // Auto-verified for mockup
        })
        .select(`
          id, rating, comment, title, is_verified, created_at,
          profiles:user_id (full_name)
        `)
        .single();

      if (error) throw error;

      if (newReview) {
        setReviews([newReview, ...reviews]);
        setReviewTitle("");
        setReviewComment("");
        setReviewRating(5);
        setReviewMessage("Thank you! Your review has been posted successfully.");
      }
    } catch (err: any) {
      console.error("Error submitting review:", err);
      // Mock review insertion for offline/unconfigured supabase
      const mockNew = {
        id: Date.now().toString(),
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        is_verified: true,
        created_at: new Date().toISOString(),
        profiles: { full_name: profile?.fullName || "Guest Patron" },
      };
      setReviews([mockNew, ...reviews]);
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      setReviewMessage("Thank you! Your review has been saved.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  return (
    <div className="w-full px-4 sm:px-6 py-10 space-y-16">
      {/* 1. Breadcrumbs */}
      <nav className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
        <Link href="/" className="hover:text-primary transition">Home</Link>
        <ChevronRight size={10} />
        <Link href="/shop" className="hover:text-primary transition">Shop</Link>
        {product.category && (
          <>
            <ChevronRight size={10} />
            <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-primary transition capitalize">
              {product.category}
            </Link>
          </>
        )}
        <ChevronRight size={10} />
        <span className="text-foreground truncate max-w-xs">{product.name}</span>
      </nav>

      {/* 2. Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] bg-secondary border border-border overflow-hidden rounded-sm shadow-xs">
            <Image
              src={galleryImages[activeImageIndex]}
              alt={`${product.name} - ${selectedColorObj?.name || ""}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-all duration-300"
              priority
            />
          </div>
          {galleryImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-24 overflow-hidden bg-secondary border shrink-0 cursor-pointer transition ${
                    activeImageIndex === idx ? "border-primary scale-95 shadow-sm" : "border-border hover:border-primary/50"
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              {product.category && (
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">
                  {product.category}
                </span>
              )}
              {currentSKU && (
                <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
                  SKU: {currentSKU}
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl font-semibold leading-tight text-foreground">{product.name}</h1>
            
            {/* Reviews Summary */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex gap-0.5 text-primary">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.round(Number(averageRating)) ? "fill-primary text-primary" : "text-border"}
                  />
                ))}
              </div>
              <span className="font-semibold">{averageRating}</span>
              <span className="text-muted-foreground text-xs font-semibold">({reviews.length} customer reviews)</span>
            </div>
          </div>

          {/* Component 1: Pricing */}
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-foreground">
                {formatPrice(currentPrice)}
              </span>
              {currentMRP > currentPrice && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(currentMRP)}
                  </span>
                  <span className="text-xs font-bold text-destructive uppercase tracking-wide">
                    ({discountPercent}% OFF)
                  </span>
                </>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Inclusive of all taxes
            </span>
          </div>

          <hr className="border-border" />

          {/* Component 3: Color Variant Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-widest uppercase text-foreground">
                Color: {selectedColorObj?.name}
              </span>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((color, idx) => {
                  const isSelected = activeColorIdx === idx;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => handleColorChange(idx, color.name)}
                      className={`flex items-center gap-2 p-1 border transition hover:scale-[1.02] duration-200 cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs scale-102"
                          : "border-border bg-card hover:border-primary"
                      }`}
                    >
                      <div className="relative w-8 h-10 overflow-hidden bg-secondary shrink-0">
                        <Image
                          src={color.thumbnail}
                          alt={color.name}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <div className="pr-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-foreground leading-tight">
                          {color.name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className="inline-block w-2 h-2 rounded-full border border-border"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-[8px] text-muted-foreground tracking-wide font-mono uppercase">
                            {color.hex}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Component 2: Size Selector */}
          {availableSizes && availableSizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold tracking-widest uppercase text-foreground">Select Size</span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <Ruler size={13} />
                  <span>Size Guide</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sObj) => {
                  const isSelected = selectedSize === sObj.size;
                  const isSizeOutOfStock = sObj.stock <= 0;
                  return (
                    <button
                      key={sObj.id}
                      disabled={isSizeOutOfStock}
                      onClick={() => setSelectedSize(sObj.size)}
                      className={`w-12 h-10 border text-xs font-bold flex items-center justify-center transition duration-200 cursor-pointer ${
                        isSizeOutOfStock
                          ? "border-border bg-secondary/50 text-muted-foreground/60 opacity-60 cursor-not-allowed line-through"
                          : isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm animate-fadeIn"
                          : "border-border bg-background hover:border-primary text-foreground"
                      }`}
                    >
                      {sObj.size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add to Cart & Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between border border-border h-11 px-3.5 bg-card shrink-0 select-none">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 hover:bg-secondary cursor-pointer font-bold text-muted-foreground hover:text-foreground"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 hover:bg-secondary cursor-pointer font-bold text-muted-foreground hover:text-foreground"
                >
                  +
                </button>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className="flex-1 bg-primary text-primary-foreground h-11 font-bold text-xs uppercase tracking-widest hover:opacity-95 transition disabled:opacity-50 disabled:hover:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag size={14} />
                <span>{isOutOfStock ? "Out of Stock" : "Add to Shopping Bag"}</span>
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="h-11 w-11 border border-border hover:border-primary bg-card hover:bg-secondary flex items-center justify-center transition cursor-pointer shrink-0"
                aria-label="Add to wishlist"
              >
                <Heart size={18} className={favorited ? "fill-destructive text-destructive" : "text-foreground"} />
              </button>
            </div>

            {/* Real-time Stock */}
            {selectedSizeObj && (
              <p className="text-[11px] font-medium leading-tight">
                {stockCount > 0 && stockCount <= 5 ? (
                  <span className="text-destructive font-semibold">Hurry! Only {stockCount} items left in stock.</span>
                ) : stockCount > 5 ? (
                  <span className="text-accent font-semibold">Item is in stock (ready to dispatch).</span>
                ) : (
                  <span className="text-destructive font-semibold">Out of Stock. Select a different size or color.</span>
                )}
              </p>
            )}
          </div>

          <hr className="border-border" />

          {/* Component 4: Delivery Pincode Checker */}
          <PincodeChecker />

          <hr className="border-border" />

          {/* Details Accordion style */}
          <div className="space-y-4 pt-1">
            {product.fabric && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Fabric & Weave</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{product.fabric}</p>
              </div>
            )}
            {product.fit && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Fit & Silhouette</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{product.fit}</p>
              </div>
            )}
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Atelier Details</h4>
              <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                <li>100% Handcrafted authentic luxury ethnic wear</li>
                <li>Sourced sustainably from weaver cooperatives</li>
                <li>Includes signature Vastrarupa gold-foil box packaging</li>
              </ul>
            </div>
            {product.keywords && product.keywords.length > 0 && (
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {product.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-muted/60 text-muted-foreground border border-border/60 px-2.5 py-0.5 rounded-sm font-medium tracking-wide"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-background border border-border p-6 max-w-md w-full shadow-2xl relative">
            <h3 className="font-serif text-lg font-semibold tracking-wide mb-4">Size Chart Guide (Inches)</h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border font-bold">
                  <th className="py-2">Size</th>
                  <th className="py-2">Chest</th>
                  <th className="py-2">Waist</th>
                  <th className="py-2">Hip</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-2 font-semibold text-foreground">XS</td>
                  <td className="py-2">32</td>
                  <td className="py-2">26</td>
                  <td className="py-2">35</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 font-semibold text-foreground">S</td>
                  <td className="py-2">34</td>
                  <td className="py-2">28</td>
                  <td className="py-2">37</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 font-semibold text-foreground">M</td>
                  <td className="py-2">36</td>
                  <td className="py-2">30</td>
                  <td className="py-2">39</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 font-semibold text-foreground">L</td>
                  <td className="py-2">38</td>
                  <td className="py-2">32</td>
                  <td className="py-2">41</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 font-semibold text-foreground">XL</td>
                  <td className="py-2">40</td>
                  <td className="py-2">34</td>
                  <td className="py-2">43</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 font-semibold text-foreground">XXL</td>
                  <td className="py-2">42</td>
                  <td className="py-2">36</td>
                  <td className="py-2">45</td>
                </tr>
              </tbody>
            </table>
            <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed">
              * Measurements shown are body measurements, not garment measurements. If you fall between sizes, we recommend ordering the larger size.
            </p>
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="mt-6 w-full py-2 border border-primary text-primary font-bold text-xs uppercase tracking-widest hover:bg-secondary transition cursor-pointer"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

      {/* 4. Reviews Module */}
      <section className="space-y-8 border-t border-border pt-12">
        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">Guest Opinions</span>
          <h2 className="font-serif text-2xl font-semibold tracking-wide">Customer Feedback</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Ratings distribution & write review form */}
          <div className="space-y-6">
            <div className="bg-card border border-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-serif font-bold text-primary">{averageRating}</span>
                <div>
                  <div className="flex gap-0.5 text-primary">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.round(Number(averageRating)) ? "fill-primary" : "text-border"}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Average Customer Rating</p>
                </div>
              </div>
            </div>

            {/* Review form */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4 border border-border p-6 bg-card">
                <h3 className="font-serif text-base font-semibold tracking-wide">Write a Review</h3>
                
                {/* Rating selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setReviewRating(stars)}
                        className="text-primary cursor-pointer hover:scale-110 transition"
                      >
                        <Star size={20} className={stars <= reviewRating ? "fill-primary" : "text-border"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="review-title" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Review Title</label>
                  <input
                    id="review-title"
                    type="text"
                    placeholder="e.g. Perfect fit, beautiful embroidery!"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    required
                    className="w-full bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="review-comment" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Comment</label>
                  <textarea
                    id="review-comment"
                    placeholder="Share your experience wearing this garment..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    rows={4}
                    className="w-full bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full bg-primary text-primary-foreground py-2 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </button>

                {reviewMessage && <p className="text-accent text-xs font-semibold mt-2">{reviewMessage}</p>}
              </form>
            ) : (
              <div className="bg-secondary/40 border border-border p-6 text-center space-y-3">
                <HelpCircle size={24} className="text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Only verified patrons who logged in can submit reviews for this product.
                </p>
                <Link
                  href="/login"
                  className="inline-block px-4 py-2 border border-primary text-primary font-bold text-[10px] tracking-widest uppercase hover:bg-secondary transition"
                >
                  Log In to Write Review
                </Link>
              </div>
            )}
          </div>

          {/* Right: Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <div className="py-12 border border-dashed border-border rounded-sm text-center text-muted-foreground text-xs">
                No reviews yet for this product. Be the first to share your experience!
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="border border-border p-5 bg-card space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex gap-0.5 text-primary">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < rev.rating ? "fill-primary" : "text-border"}
                            />
                          ))}
                        </div>
                        <h4 className="font-semibold text-sm text-foreground">{rev.title}</h4>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">{formatDate(rev.created_at)}</span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>

                    <div className="flex items-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
                      <span className="font-bold text-foreground">
                        {rev.profiles?.full_name || rev.user_id ? "Patron" : "Anonymous Patron"}
                      </span>
                      {rev.is_verified && (
                        <span className="flex items-center gap-0.5 text-accent font-semibold uppercase tracking-wider">
                          <ShieldCheck size={12} />
                          <span>Verified Purchase</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
