import { createClient } from "@/lib/supabase/server";
import ProductCard, { Product } from "@/features/products/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Heart, ShieldCheck, Sparkles, RefreshCw } from "lucide-react";

// Mock Fallback Products if database is empty/unavailable
const MOCK_PRODUCTS: Product[] = [
  {
    id: "e1111111-1111-1111-1111-111111111111",
    name: "Ivory Chikankari Embroidered Kurti",
    slug: "ivory-chikankari-embroidered-kurti",
    price: 2499,
    sale_price: 1999,
    material: "Premium Georgette with Cotton Slip",
    is_trending: true,
    is_featured: true,
    category: { name: "Kurtis", slug: "kurtis" },
    variants: [
      { id: "f1111111-1111-1111-1111-111111111111", size: "S", color: "Ivory", quantity: 10 },
      { id: "f1111112-1111-1111-1111-111111111112", size: "M", color: "Ivory", quantity: 15 },
      { id: "f1111113-1111-1111-1111-111111111113", size: "L", color: "Ivory", quantity: 20 },
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", alt_text: "Ivory Chikankari Kurti" },
      { url: "https://images.unsplash.com/photo-1610030470298-4c6e6d15b026?q=80&w=800&auto=format&fit=crop", alt_text: "Ivory Chikankari Kurti Detail" },
    ],
  },
  {
    id: "e1111112-1111-1111-1111-111111111112",
    name: "Crimson Anarkali Georgette Kurti",
    slug: "crimson-anarkali-georgette-kurti",
    price: 3999,
    sale_price: 3499,
    material: "Faux Georgette with Crepe Lining",
    is_trending: true,
    is_featured: true,
    category: { name: "Kurtis", slug: "kurtis" },
    variants: [
      { id: "f1111121-1111-1111-1111-111111111121", size: "S", color: "Crimson Red", quantity: 8 },
      { id: "f1111122-1111-1111-1111-111111111122", size: "M", color: "Crimson Red", quantity: 12 },
      { id: "f1111123-1111-1111-1111-111111111123", size: "L", color: "Crimson Red", quantity: 7 },
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop", alt_text: "Crimson Anarkali" },
    ],
  },
  {
    id: "e2222221-2222-2222-2222-222222222221",
    name: "Emerald Silk Brocade Kurta Set",
    slug: "emerald-silk-brocade-kurta-set",
    price: 6999,
    sale_price: 5999,
    material: "Banarasi Silk Brocade & Organza",
    is_trending: true,
    is_featured: true,
    category: { name: "Kurta Sets", slug: "kurta-sets" },
    variants: [
      { id: "f2222211-2222-2222-2222-222222222211", size: "S", color: "Emerald Green", quantity: 5 },
      { id: "f2222212-2222-2222-2222-222222222212", size: "M", color: "Emerald Green", quantity: 8 },
      { id: "f2222213-2222-2222-2222-222222222213", size: "L", color: "Emerald Green", quantity: 5 },
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop", alt_text: "Emerald Brocade Set" },
    ],
  },
  {
    id: "e2222222-2222-2222-2222-222222222222",
    name: "Pastel Mint Floral Kurta Set",
    slug: "pastel-mint-floral-kurta-set",
    price: 3299,
    sale_price: 2799,
    material: "100% Organic Mulmul Cotton",
    is_trending: true,
    is_featured: false,
    category: { name: "Kurta Sets", slug: "kurta-sets" },
    variants: [
      { id: "f2222221-2222-2222-2222-222222222221", size: "S", color: "Mint Green", quantity: 15 },
      { id: "f2222222-2222-2222-2222-222222222222", size: "M", color: "Mint Green", quantity: 20 },
      { id: "f2222223-2222-2222-2222-222222222223", size: "L", color: "Mint Green", quantity: 12 },
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=800&auto=format&fit=crop", alt_text: "Pastel Mint Floral" },
    ],
  },
];

export const revalidate = 3600; // ISR cache for 1 hour

export default async function HomePage() {
  let products: Product[] = [];
  let banners: any[] = [];

  try {
    const supabase = await createClient();
    
    // Fetch products
    const { data: dbProducts } = await supabase
      .from("products")
      .select(`
        id, name, slug, price, sale_price, material, is_trending, is_featured,
        category:categories(name, slug),
        variants:product_variants(id, size, color, inventory(quantity)),
        images:product_images(url, alt_text)
      `)
      .eq("status", "published")
      .limit(8);

    if (dbProducts && dbProducts.length > 0) {
      products = dbProducts.map((p: any) => ({
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
    } else {
      products = MOCK_PRODUCTS;
    }

    // Fetch banners
    const { data: dbBanners } = await supabase
      .from("banners")
      .select("*")
      .eq("status", "active")
      .order("display_order", { ascending: true });
      
    banners = dbBanners || [];
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    products = MOCK_PRODUCTS;
  }

  // Active hero banner
  const activeHero = banners.find((b) => b.location === "hero") || {
    title: "The Royal Heritage Edit",
    subtitle: "Timeless silhouettes crafted in pure Banarasi silk and hand-embroidered zardozi.",
    image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1600&auto=format&fit=crop",
    link: "/shop",
  };

  const categories = [
    { name: "Kurtis", href: "/shop?category=kurtis", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop" },
    { name: "Kurta Sets", href: "/shop?category=kurta-sets", img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop" },
    { name: "Gowns", href: "/shop?category=gowns", img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=400&auto=format&fit=crop" },
    { name: "Co-ord Sets", href: "/shop?category=co-ord-sets", img: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=400&auto=format&fit=crop" },
    { name: "Dupattas", href: "/shop?category=dupattas", img: "https://images.unsplash.com/photo-1610030470298-4c6e6d15b026?q=80&w=400&auto=format&fit=crop" },
  ];

  return (
    <div className="w-full pb-16 space-y-20">
      {/* 1. HERO BANNER */}
      <section className="relative w-full h-[65vh] sm:h-[80vh] bg-secondary overflow-hidden">
        <Image
          src={activeHero.image_url}
          alt={activeHero.title}
          fill
          priority
          className="object-cover brightness-[0.8] dark:brightness-[0.7]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end pb-12 sm:pb-20 px-4 sm:px-8 max-w-7xl mx-auto text-white">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-primary">New Collection</span>
            <h1 className="font-serif text-4xl sm:text-6xl font-medium leading-tight">
              {activeHero.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-200 font-light leading-relaxed max-w-lg">
              {activeHero.subtitle}
            </p>
            <div className="pt-4">
              <Link
                href={activeHero.link}
                className="inline-flex items-center gap-2 bg-white text-black hover:bg-white/95 px-8 py-3.5 text-xs font-bold tracking-widest uppercase transition"
              >
                <span>Discover Edit</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SHOPPING CIRCLES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">Artisanal Weaves</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-wide">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 justify-center">
          {categories.map((cat) => (
            <Link key={cat.name} href={cat.href} className="group flex flex-col items-center gap-3">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border border-border bg-secondary shadow-sm transition-transform duration-500 group-hover:scale-105">
                <Image
                  src={cat.img}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 112px, 144px"
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>
              <span className="font-serif text-sm font-semibold tracking-wide group-hover:text-primary transition">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. EDITORIAL SHOWCASE (The Atelier Story) */}
      <section className="bg-card border-y border-border py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/5] bg-secondary border border-border">
            <Image
              src="https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=800&auto=format&fit=crop"
              alt="Atelier Craftsman Embroidery"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-6 lg:pl-10">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary">Reviving Indian Heritage</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-wide text-foreground">
              Slow Fashion, Crafted by Master Hands
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Every outfit in our collection begins its journey at a traditional loom or embroidery block. By choosing Vastrarupa, you support local female artisans in Lucknow practicing Lucknowi Chikankari shadow embroidery and generational weavers in Varanasi weaving Banarasi silk. 
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We design with intentionality, blending rich Indian heritage cuts with modern comfort shapes, creating classic items that last as heirlooms in your luxury wardrobe.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 border-b-2 border-primary pb-1 text-xs font-bold tracking-widest uppercase hover:text-primary transition"
              >
                <span>Read Our Craft Journal</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRENDING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">The Season Edit</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-wide">Trending Collections</h2>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-foreground hover:text-primary transition"
          >
            <span>View All Styles</span>
            <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="bg-secondary/40 py-16 text-center space-y-10 border-t border-border">
        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">Voices of Appreciation</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-wide">What Our Patrons Say</h2>
        </div>
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "The ivory chikankari kurti is stunning. The hand embroidery is so intricate and detailed. It truly feels like a work of art.",
              author: "Aditi S., Mumbai",
              rating: 5,
            },
            {
              quote: "Perfect fit and royal look. The silk brocade is thick and premium. Got so many compliments at a wedding function.",
              author: "Meera K., Delhi",
              rating: 5,
            },
            {
              quote: "Extremely fast shipping and luxurious packaging. The linen co-ord set is perfect for everyday elegance.",
              author: "Priya P., Bangalore",
              rating: 5,
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-background p-6 border border-border shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex justify-center gap-1">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground text-xs italic leading-relaxed">"{item.quote}"</p>
              <span className="text-[10px] font-bold tracking-widest uppercase text-foreground">
                — {item.author}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TRUST PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center pt-8">
        <div className="space-y-2.5 flex flex-col items-center">
          <div className="p-3 bg-card border border-border rounded-full text-primary">
            <Sparkles size={22} />
          </div>
          <h3 className="font-serif text-base font-semibold tracking-wide">Handcrafted Luxury</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Every garment features hand-embroidered detailing or traditional handloom weaves.
          </p>
        </div>
        <div className="space-y-2.5 flex flex-col items-center">
          <div className="p-3 bg-card border border-border rounded-full text-primary">
            <ShieldCheck size={22} />
          </div>
          <h3 className="font-serif text-base font-semibold tracking-wide">Secure Checkout</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Fully secure payments via Razorpay & Stripe. Easy cancellations and updates.
          </p>
        </div>
        <div className="space-y-2.5 flex flex-col items-center">
          <div className="p-3 bg-card border border-border rounded-full text-primary">
            <RefreshCw size={22} />
          </div>
          <h3 className="font-serif text-base font-semibold tracking-wide">Atelier Exchange</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Hassle-free 7-day returns or sizes exchange at your doorstep.
          </p>
        </div>
      </section>
    </div>
  );
}
