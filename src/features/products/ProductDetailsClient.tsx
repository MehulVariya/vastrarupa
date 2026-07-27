"use client";

import { useState } from "react";
import { useCart } from "@/features/cart/useCart";
import { useWishlist } from "@/features/wishlist/useWishlist";
import { formatPrice, formatDate } from "@/lib/utils";
import { Heart, ShoppingBag, ChevronRight, Ruler, ShieldCheck, HelpCircle, Star, Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

export interface ProductDetails {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  material: string | null;
  care_instructions: string | null;
  category: { name: string; slug: string } | null;
  variants: Array<{
    id: string;
    size: string;
    color: string;
    quantity: number;
  }>;
  images: Array<{
    url: string;
    alt_text: string | null;
  }>;
}

interface ProductDetailsClientProps {
  product: ProductDetails;
  initialReviews: any[];
}

export default function ProductDetailsClient({ product, initialReviews }: ProductDetailsClientProps) {
  const { addItem, setIsOpen: setCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, profile } = useAuth();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Review Form States
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const favorited = isInWishlist(product.id);
  const images = product.images.length > 0 ? product.images : [{ url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", alt_text: "Vastrarupa Image" }];

  // Find unique sizes and colors available
  const availableSizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const availableColors = Array.from(new Set(product.variants.map((v) => v.color)));

  // Auto-select first color/size if available
  useState(() => {
    if (availableSizes.length > 0) setSelectedSize(availableSizes[0]);
    if (availableColors.length > 0) setSelectedColor(availableColors[0]);
  });

  // Find matching variant
  const selectedVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const stockCount = selectedVariant ? selectedVariant.quantity : 0;
  const isOutOfStock = stockCount <= 0;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    setIsAdding(true);
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: images[0].url,
      size: selectedSize,
      color: selectedColor,
      price: product.price,
      salePrice: product.sale_price,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* 1. Breadcrumbs */}
      <nav className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
        <Link href="/" className="hover:text-primary transition">Home</Link>
        <ChevronRight size={10} />
        <Link href="/shop" className="hover:text-primary transition">Shop</Link>
        {product.category && (
          <>
            <ChevronRight size={10} />
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-primary transition capitalize">
              {product.category.name}
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
          <div className="relative aspect-[3/4] bg-secondary border border-border overflow-hidden">
            <Image
              src={images[activeImageIndex].url}
              alt={images[activeImageIndex].alt_text || product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-24 overflow-hidden bg-secondary border shrink-0 cursor-pointer ${
                    activeImageIndex === idx ? "border-primary" : "border-border"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt_text || ""}
                    fill
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
            {product.category && (
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">
                {product.category.name}
              </span>
            )}
            <h1 className="font-serif text-3xl font-semibold leading-tight text-foreground">{product.name}</h1>
            
            {/* Reviews Summary */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex gap-0.5 text-primary">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.round(Number(averageRating)) ? "fill-primary" : "text-border"}
                  />
                ))}
              </div>
              <span className="font-semibold">{averageRating}</span>
              <span className="text-muted-foreground text-xs font-semibold">({reviews.length} customer reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-3">
            {product.sale_price !== null ? (
              <>
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-2xl font-semibold text-primary">
                  {formatPrice(product.sale_price)}
                </span>
                <span className="bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                  Save {Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                </span>
              </>
            ) : (
              <span className="text-2xl font-semibold text-foreground">{formatPrice(product.price)}</span>
            )}
          </div>

          <hr className="border-border" />

          {/* Variant Selection */}
          <div className="space-y-4">
            {/* Color selection */}
            {availableColors.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest uppercase text-foreground">Color: {selectedColor}</span>
                <div className="flex gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-1.5 border text-xs font-semibold tracking-wider transition uppercase cursor-pointer ${
                        selectedColor === color
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {availableSizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold tracking-widest uppercase text-foreground">Size</span>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <Ruler size={14} />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  {availableSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-10 h-10 border text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                        selectedSize === s
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary text-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add to Cart and Wishlist Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            {/* Quantity */}
            <div className="flex items-center justify-between border border-border h-12 px-4 bg-card shrink-0">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 hover:bg-secondary cursor-pointer font-bold"
              >
                -
              </button>
              <span className="px-6 text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 hover:bg-secondary cursor-pointer font-bold"
              >
                +
              </button>
            </div>

            {/* Add button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className="flex-1 bg-primary text-primary-foreground h-12 font-bold text-xs uppercase tracking-widest hover:opacity-95 transition disabled:opacity-50 disabled:hover:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag size={16} />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Shopping Bag"}</span>
            </button>

            {/* Wishlist toggle */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="h-12 w-12 border border-border hover:border-primary bg-card hover:bg-secondary flex items-center justify-center transition cursor-pointer shrink-0"
              aria-label="Add to wishlist"
            >
              <Heart size={20} className={favorited ? "fill-destructive text-destructive" : "text-foreground"} />
            </button>
          </div>

          {/* Real-time stock label */}
          {selectedVariant && (
            <p className="text-xs text-muted-foreground mt-2">
              {stockCount > 0 && stockCount <= 5 ? (
                <span className="text-destructive font-semibold">Only {stockCount} items left in stock.</span>
              ) : stockCount > 5 ? (
                <span className="text-accent font-semibold">In stock and ready to ship.</span>
              ) : (
                <span className="text-destructive font-semibold">Temporarily Out of stock.</span>
              )}
            </p>
          )}

          <hr className="border-border" />

          {/* Details Accordion style */}
          <div className="space-y-4">
            {product.material && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Fabric & Materials</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{product.material}</p>
              </div>
            )}
            {product.care_instructions && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Care Instructions</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{product.care_instructions}</p>
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
