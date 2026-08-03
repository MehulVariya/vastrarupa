import { createClient } from "@/lib/supabase/server";
import ProductCard, { Product } from "@/features/products/ProductCard";
import Link from "next/link";
import { SlidersHorizontal, ArrowUpDown, ChevronRight, Sparkles } from "lucide-react";

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    size?: string;
    sort?: string;
    price?: string;
  }>;
}

// Fallback products for Shop Page
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
    is_trending: false,
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
  {
    id: "e3333331-3333-3333-3333-333333333331",
    name: "Midnight Blue Velvet Ethnic Gown",
    slug: "midnight-blue-velvet-ethnic-gown",
    price: 8499,
    sale_price: 7499,
    material: "Premium Micro-Velvet",
    is_trending: false,
    is_featured: false,
    category: { name: "Gowns", slug: "gowns" },
    variants: [
      { id: "f3333331-3333-3333-3333-333333333331", size: "M", color: "Midnight Blue", quantity: 5 },
      { id: "f3333332-3333-3333-3333-333333333332", size: "L", color: "Midnight Blue", quantity: 8 },
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop", alt_text: "Midnight Velvet Gown" },
    ],
  },
  {
    id: "e4444441-4444-4444-4444-444444444441",
    name: "Terracotta Cotton Slub Co-ord Set",
    slug: "terracotta-cotton-slub-coord-set",
    price: 2999,
    sale_price: 2399,
    material: "Cotton Slub Weave",
    is_trending: false,
    is_featured: false,
    category: { name: "Co-ord Sets", slug: "co-ord-sets" },
    variants: [
      { id: "f4444441-4444-4444-4444-444444444441", size: "M", color: "Terracotta", quantity: 14 },
      { id: "f4444442-4444-4444-4444-444444444442", size: "L", color: "Terracotta", quantity: 9 },
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=800&auto=format&fit=crop", alt_text: "Terracotta Co-ord" },
    ],
  },
  {
    id: "e5555551-5555-5555-5555-555555555551",
    name: "Handwoven Banarasi Silk Dupatta",
    slug: "handwoven-banarasi-silk-dupatta",
    price: 2400,
    sale_price: 1899,
    material: "Pure Katan Silk & Gold Zari",
    is_trending: false,
    is_featured: false,
    category: { name: "Dupattas", slug: "dupattas" },
    variants: [
      { id: "f5555551-5555-5555-5555-555555555551", size: "One Size", color: "Gold & Red", quantity: 11 },
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", alt_text: "Banarasi Dupatta" },
    ],
  },
];

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Await search params
  const { category, search, size, sort, price } = await searchParams;

  let products: Product[] = [];
  let categories: any[] = [];

  try {
    const supabase = await createClient();

    // 1. Fetch Categories for Sidebar filter
    const { data: dbCats } = await supabase
      .from("categories")
      .select("id, name, slug");
    categories = dbCats || [];

    // 2. Fetch products
    let query = supabase
      .from("products")
      .select(`
        id, name, slug, mrp, selling_price, fabric, is_trending, is_featured, category,
        colors:product_colors (
          id, 
          color_name, 
          hex_code, 
          thumbnail,
          status,
          sizes:product_sizes (
            id, 
            size, 
            stock
          ),
          images:product_images (
            image
          )
        )
      `)
      .eq("status", "published");

    // Apply category filter (checks direct text categories)
    if (category) {
      query = query.ilike("category", `%${category}%`);
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting (on selling_price instead of price)
    if (sort === "price_asc") {
      query = query.order("selling_price", { ascending: true });
    } else if (sort === "price_desc") {
      query = query.order("selling_price", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data: dbProducts } = await query;

    if (dbProducts && dbProducts.length > 0) {
      products = dbProducts.map((p: any) => {
        const firstColor = p.colors?.find((c: any) => c.status === "active") || p.colors?.[0] || { color_name: "Default", thumbnail: "", sizes: [], images: [] };
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: Number(p.mrp),
          sale_price: p.selling_price ? Number(p.selling_price) : null,
          material: p.fabric,
          is_trending: p.is_trending,
          is_featured: p.is_featured,
          category: p.category ? {
            name: p.category,
            slug: p.category.toLowerCase().replace(/\s+/g, "-"),
          } : null,
          variants: (firstColor.sizes || []).map((s: any) => ({
            id: s.id,
            size: s.size,
            color: firstColor.color_name,
            quantity: s.stock || 0,
          })),
          images: (firstColor.images || []).map((img: any) => ({
            url: img.image,
            alt_text: "",
          })).concat(
            firstColor.thumbnail ? [{ url: firstColor.thumbnail, alt_text: "" }] : []
          ),
        };
      });
    } else {
      products = [];
    }
  } catch (error) {
    console.error("Error fetching shop data:", error);
    products = [];
    categories = [
      { name: "Kurtis", slug: "kurtis" },
      { name: "Kurta Sets", slug: "kurta-sets" },
      { name: "Gowns", slug: "gowns" },
      { name: "Co-ord Sets", slug: "co-ord-sets" },
      { name: "Dupattas", slug: "dupattas" },
    ];
  }

  // Post-filtering for size in JS (if selected)
  if (size) {
    products = products.filter((p) =>
      p.variants?.some((v) => v.size.toLowerCase() === size.toLowerCase())
    );
  }

  // Post-filtering for price range
  if (price) {
    const maxPrice = parseInt(price);
    if (!isNaN(maxPrice)) {
      products = products.filter((p) => {
        const activePrice = p.sale_price !== null ? p.sale_price : p.price;
        return activePrice <= maxPrice;
      });
    }
  }

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "FS"];

  return (
    <div className="w-full px-4 sm:px-6 py-10 space-y-8">
      {/* Breadcrumbs */}
      <nav className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
        <Link href="/" className="hover:text-primary transition">Home</Link>
        <ChevronRight size={10} />
        <span className="text-foreground">Shop</span>
        {category && (
          <>
            <ChevronRight size={10} />
            <span className="capitalize">{category.replace("-", " ")}</span>
          </>
        )}
      </nav>

      {/* Header Info */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-wide">
          {category ? `${category.replace("-", " ")}` : "All Collections"}
        </h1>
        <p className="text-muted-foreground text-xs font-semibold">Showing {products.length} elegant items</p>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 sticky top-28 bg-card border border-border p-6">
          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Categories</h4>
            <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <Link
                href="/shop"
                className={`hover:text-primary transition ${!category ? "text-primary font-semibold" : ""}`}
              >
                Shop All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/shop?category=${c.slug}`}
                  className={`hover:text-primary transition capitalize ${
                    category === c.slug ? "text-primary font-semibold" : ""
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <hr className="border-border" />

          {/* Sizes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Sizes</h4>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((s) => (
                <Link
                  key={s}
                  href={`/shop?${category ? `category=${category}&` : ""}${
                    size === s ? "" : `size=${s}`
                  }`}
                  className={`w-9 h-9 text-xs font-semibold border flex items-center justify-center transition ${
                    size === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary text-foreground"
                  }`}
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>

          <hr className="border-border" />

          {/* Price Range */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Price Filter</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-semibold">
                <span>Max: {price ? `â‚¹${price}` : "Any"}</span>
              </div>
              <div className="flex flex-col gap-2">
                {[2000, 3000, 5000, 7500, 10000].map((pVal) => (
                  <Link
                    key={pVal}
                    href={`/shop?${category ? `category=${category}&` : ""}${
                      size ? `size=${size}&` : ""
                    }price=${pVal}`}
                    className={`hover:text-primary transition flex items-center gap-1.5 ${
                      price === pVal.toString() ? "text-primary font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    <span>Under â‚¹{pVal}</span>
                  </Link>
                ))}
                {price && (
                  <Link
                    href={`/shop?${category ? `category=${category}&` : ""}${size ? `size=${size}` : ""}`}
                    className="text-primary hover:underline text-[10px] font-bold uppercase tracking-wider mt-1"
                  >
                    Clear Price
                  </Link>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid and Top Controls */}
        <div className="lg:col-span-3 space-y-6">
          {/* Controls Bar */}
          <div className="flex items-center justify-between border border-border bg-card p-4 text-xs font-semibold tracking-wider uppercase">
            {/* Sorting links */}
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground flex items-center gap-1">
                <ArrowUpDown size={14} />
                <span>Sort By:</span>
              </span>
              <div className="flex items-center gap-2.5">
                <Link
                  href={`/shop?${category ? `category=${category}&` : ""}${
                    size ? `size=${size}&` : ""
                  }${price ? `price=${price}&` : ""}sort=newest`}
                  className={sort !== "price_asc" && sort !== "price_desc" ? "text-primary" : "text-muted-foreground hover:text-foreground"}
                >
                  Newest
                </Link>
                <Link
                  href={`/shop?${category ? `category=${category}&` : ""}${
                    size ? `size=${size}&` : ""
                  }${price ? `price=${price}&` : ""}sort=price_asc`}
                  className={sort === "price_asc" ? "text-primary" : "text-muted-foreground hover:text-foreground"}
                >
                  Price: Low-High
                </Link>
                <Link
                  href={`/shop?${category ? `category=${category}&` : ""}${
                    size ? `size=${size}&` : ""
                  }${price ? `price=${price}&` : ""}sort=price_desc`}
                  className={sort === "price_desc" ? "text-primary" : "text-muted-foreground hover:text-foreground"}
                >
                  Price: High-Low
                </Link>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            !(category || search || size || price) ? (
              <div className="py-24 border border-dashed border-border/80 flex flex-col items-center justify-center text-center space-y-4 bg-card px-6">
                <Sparkles size={36} className="text-primary/70 animate-pulse" />
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-medium tracking-wide">The Atelier is Updating the Catalog</h3>
                  <p className="text-muted-foreground text-xs max-w-md leading-relaxed">
                    Our luxury handcrafted ethnic ensembles are currently being cataloged. Please check back soon to explore the new arrivals.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-24 border border-dashed border-border flex flex-col items-center justify-center text-center space-y-3 bg-card">
                <SlidersHorizontal size={36} className="text-muted-foreground" />
                <div>
                  <h3 className="font-serif text-lg font-medium">No products match your filters</h3>
                  <p className="text-muted-foreground text-xs mt-1">Try clearing some filters or searching for other keywords.</p>
                </div>
                <Link
                  href="/shop"
                  className="px-6 py-2 bg-primary text-primary-foreground font-semibold text-xs tracking-widest uppercase hover:opacity-90 transition"
                >
                  Clear Filters
                </Link>
              </div>
            )
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

