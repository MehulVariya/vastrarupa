import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductDetailsClient, { ProductDetails } from "@/features/products/ProductDetailsClient";
import ProductCard, { Product } from "@/features/products/ProductCard";
import { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Fallback Mock Product Detail
const MOCK_DETAILS: Record<string, ProductDetails> = {
  "ivory-chikankari-embroidered-kurti": {
    id: "e1111111-1111-1111-1111-111111111111",
    name: "Ivory Chikankari Embroidered Kurti",
    slug: "ivory-chikankari-embroidered-kurti",
    description: "Experience pure artisanal luxury with this ivory straight kurti. Adorned with intricate hand-embroidered chikankari shadows and floral motifs, this piece is crafted from premium georgette. Comes with a matching cotton inner slip.",
    price: 2499,
    sale_price: 1999,
    material: "Premium Georgette with Cotton Slip",
    care_instructions: "Dry Clean Recommended. Gentle hand wash inside out in cold water.",
    category: { name: "Kurtis", slug: "kurtis" },
    variants: [
      { id: "f1111111-1111-1111-1111-111111111111", size: "S", color: "Ivory", quantity: 10 },
      { id: "f1111112-1111-1111-1111-111111111112", size: "M", color: "Ivory", quantity: 15 },
      { id: "f1111113-1111-1111-1111-111111111113", size: "L", color: "Ivory", quantity: 20 },
      { id: "f1111114-1111-1111-1111-111111111114", size: "XL", color: "Ivory", quantity: 5 },
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop", alt_text: "Ivory Chikankari Kurti Front" },
      { url: "https://images.unsplash.com/photo-1610030470298-4c6e6d15b026?q=80&w=800&auto=format&fit=crop", alt_text: "Ivory Chikankari Kurti Detail" },
    ],
  },
  "crimson-anarkali-georgette-kurti": {
    id: "e1111112-1111-1111-1111-111111111112",
    name: "Crimson Anarkali Georgette Kurti",
    slug: "crimson-anarkali-georgette-kurti",
    description: "Make an entrance in this majestic crimson red Anarkali kurti. Featuring 24 flares for an elegant flow, it displays a delicate gota patti neckline border and gold lace details along the hem. Includes a soft crepe lining.",
    price: 3999,
    sale_price: 3499,
    material: "Faux Georgette with Crepe Lining",
    care_instructions: "Dry clean only. Iron on reverse low heat.",
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
  "emerald-silk-brocade-kurta-set": {
    id: "e2222221-2222-2222-2222-222222222221",
    name: "Emerald Silk Brocade Kurta Set",
    slug: "emerald-silk-brocade-kurta-set",
    description: "A celebration of Indian weaves, this emerald green kurta set features rich Banarasi brocade motifs. The kurta is straight and structured, paired with solid emerald cigarette pants and a sheer golden organza dupatta with scalloped borders.",
    price: 6999,
    sale_price: 5999,
    material: "Banarasi Silk Brocade & Organza",
    care_instructions: "Dry clean only.",
    category: { name: "Kurta Sets", slug: "kurta-sets" },
    variants: [
      { id: "f2222211-2222-2222-2222-222222222211", size: "S", color: "Emerald Green", quantity: 4 },
      { id: "f2222212-2222-2222-2222-222222222212", size: "M", color: "Emerald Green", quantity: 10 },
      { id: "f2222213-2222-2222-2222-222222222213", size: "L", color: "Emerald Green", quantity: 6 },
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop", alt_text: "Emerald Brocade Set" },
    ],
  },
};

const MOCK_REVIEWS = [
  {
    id: "r1",
    rating: 5,
    title: "Absolute masterpiece!",
    comment: "This garment surpassed my expectations. The fabric is heavy and extremely premium, and the fit is perfect.",
    is_verified: true,
    created_at: "2026-06-15T12:00:00Z",
    profiles: { full_name: "Aishwarya R." },
  },
  {
    id: "r2",
    rating: 4,
    title: "Lovely fabric and style",
    comment: "Very beautiful. The embroidery work is done beautifully. Delivery was quick, and it was nicely packed in a gold box.",
    is_verified: true,
    created_at: "2026-07-02T12:00:00Z",
    profiles: { full_name: "Sneha G." },
  },
];

const MOCK_RELATED: Product[] = [
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
    variants: [{ id: "f2222221-2222-2222-2222-222222222221", size: "S", color: "Mint Green", quantity: 15 }],
    images: [{ url: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=800&auto=format&fit=crop", alt_text: "Mint Floral" }],
  },
];

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const mockProduct = MOCK_DETAILS[slug];

  return {
    title: mockProduct ? `${mockProduct.name} | Vastrarupa` : "Premium Ethnic Garment | Vastrarupa",
    description: mockProduct?.description || "Shop premium handcrafted Indian ethnic clothing.",
    openGraph: {
      title: mockProduct ? `${mockProduct.name} | Vastrarupa` : "Vastrarupa Luxury Wear",
      description: mockProduct?.description || "Premium ethnic wear.",
      images: mockProduct?.images?.[0]?.url ? [mockProduct.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product: ProductDetails | null = null;
  let reviews: any[] = [];
  let relatedProducts: Product[] = [];

  try {
    const supabase = await createClient();

    // 1. Fetch product
    const { data: dbProduct } = await supabase
      .from("products")
      .select(`
        id, category_id, name, slug, description, price, sale_price, material, care_instructions, status, is_featured, is_trending,
        category:categories(name, slug),
        variants:product_variants(id, size, color, inventory(quantity)),
        images:product_images(url, alt_text)
      `)
      .eq("slug", slug)
      .single();

    if (dbProduct) {
      product = {
        id: dbProduct.id,
        name: dbProduct.name,
        slug: dbProduct.slug,
        description: dbProduct.description,
        price: Number(dbProduct.price),
        sale_price: dbProduct.sale_price ? Number(dbProduct.sale_price) : null,
        material: dbProduct.material,
        care_instructions: dbProduct.care_instructions,
        category: dbProduct.category ? {
          name: (dbProduct.category as any).name || (dbProduct.category as any)[0]?.name,
          slug: (dbProduct.category as any).slug || (dbProduct.category as any)[0]?.slug
        } : null,
        variants: (dbProduct.variants || []).map((v: any) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          quantity: v.inventory?.[0]?.quantity || 0,
        })),
        images: dbProduct.images || [],
      };

      // 2. Fetch reviews
      const { data: dbReviews } = await supabase
        .from("reviews")
        .select(`
          id, rating, comment, title, is_verified, created_at,
          profiles:user_id (full_name)
        `)
        .eq("product_id", product.id)
        .order("created_at", { ascending: false });

      reviews = dbReviews || [];

      // 3. Fetch related products
      const { data: dbRelated } = await supabase
        .from("products")
        .select(`
          id, name, slug, price, sale_price, material, is_trending, is_featured,
          category:categories(name, slug),
          variants:product_variants(id, size, color, inventory(quantity)),
          images:product_images(url, alt_text)
        `)
        .eq("category_id", dbProduct.category_id)
        .neq("id", product.id)
        .limit(4);

      if (dbRelated) {
        relatedProducts = dbRelated.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: Number(p.price),
          sale_price: p.sale_price ? Number(p.sale_price) : null,
          material: p.material,
          is_trending: p.is_trending,
          is_featured: p.is_featured,
          category: p.category ? {
            name: (p.category as any).name || (p.category as any)[0]?.name,
            slug: (p.category as any).slug || (p.category as any)[0]?.slug
          } : null,
          variants: (p.variants || []).map((v: any) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            quantity: v.inventory?.[0]?.quantity || 0,
          })),
          images: p.images || [],
        }));
      }
    }
  } catch (error) {
    console.error("Error fetching product data:", error);
  }

  // Fallbacks if not found in db
  if (!product) {
    product = MOCK_DETAILS[slug] || null;
    reviews = MOCK_REVIEWS;
    relatedProducts = MOCK_RELATED;
  }

  if (!product) {
    notFound();
  }

  // Structured Schema (JSON-LD)
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images.map((i) => i.url),
    "description": product.description,
    "sku": product.slug,
    "brand": {
      "@type": "Brand",
      "name": "Vastrarupa",
    },
    "offers": {
      "@type": "Offer",
      "url": `https://vastrarupa.vercel.app/product/${product.slug}`,
      "priceCurrency": "INR",
      "price": product.sale_price !== null ? product.sale_price : product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.variants.some((v) => v.quantity > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      {/* Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      <ProductDetailsClient product={product} initialReviews={reviews} />

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">Atelier Edits</span>
            <h2 className="font-serif text-2xl font-semibold tracking-wide">You May Also Cherish</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {relatedProducts.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
