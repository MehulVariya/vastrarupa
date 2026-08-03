"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/features/cart/useCart";
import { useWishlist } from "@/features/wishlist/useWishlist";
import { formatPrice } from "@/lib/utils";
import { Heart, ShoppingBag, Loader2 } from "lucide-react";
import Image from "next/image";

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  material: string | null;
  is_trending: boolean;
  is_featured: boolean;
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

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, setIsOpen: setCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [isAdding, setIsAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizes, setShowSizes] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const favorited = mounted ? isInWishlist(product.id) : false;
  const mainImage = product.images?.[0]?.url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop";
  const hoverImage = product.images?.[1]?.url || mainImage;

  const handleQuickAdd = async (variantId: string, size: string, color: string) => {
    setIsAdding(true);
    addItem({
      variantId,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: mainImage,
      size,
      color,
      price: product.price,
      salePrice: product.sale_price,
      quantity: 1,
    });
    setIsAdding(false);
    setShowSizes(false);
    setCartOpen(true);
  };

  const activePrice = product.sale_price !== null ? product.sale_price : product.price;
  const discountPercent = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <div
      className="group relative flex flex-col bg-background"
      onMouseLeave={() => setShowSizes(false)}
    >
      {/* Image Gallery Container */}
      <div className="relative w-full aspect-[3/4] bg-secondary overflow-hidden border border-border">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.is_trending && (
            <span className="bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase">
              Trending
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-accent text-accent-foreground text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => toggleWishlist(product.id)}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/90 hover:bg-background shadow-sm hover:scale-105 transition cursor-pointer"
          aria-label="Add to wishlist"
        >
          <Heart size={16} className={favorited ? "fill-destructive text-destructive" : "text-foreground"} />
        </button>

        {/* Product Images */}
        <Link href={`/product/${product.slug}`} className="block w-full h-full relative">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={product.is_featured}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {hoverImage !== mainImage && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out">
              <Image
                src={hoverImage}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover scale-105"
              />
            </div>
          )}
        </Link>

        {/* Quick Add Overlay */}
        <div className="absolute bottom-3 inset-x-3 z-10">
          {!showSizes ? (
            <button
              onClick={() => setShowSizes(true)}
              className="w-full bg-background/95 hover:bg-background text-foreground py-2 text-[10px] font-bold tracking-widest uppercase shadow-md flex items-center justify-center gap-1.5 transition opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 cursor-pointer"
            >
              <ShoppingBag size={12} />
              <span>Quick Add</span>
            </button>
          ) : (
            <div className="bg-background/95 p-2 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-200">
              <p className="text-[9px] font-bold tracking-wider uppercase text-muted-foreground mb-1 text-center">
                Select Size
              </p>
              <div className="flex flex-wrap justify-center gap-1">
                {product.variants?.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleQuickAdd(v.id, v.size, v.color)}
                    disabled={v.quantity === 0 || isAdding}
                    className="w-7 h-7 text-[10px] font-semibold border border-border hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-foreground flex items-center justify-center transition cursor-pointer"
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info details */}
      <div className="pt-3 pb-2 flex flex-col items-start text-left">
        {product.category && (
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-0.5">
            {product.category.name}
          </span>
        )}
        <Link
          href={`/product/${product.slug}`}
          className="font-serif text-sm font-medium hover:text-primary transition line-clamp-1 mb-1 text-foreground"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2">
          {product.sale_price !== null ? (
            <>
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm font-semibold text-primary">
                {formatPrice(product.sale_price)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-foreground">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
