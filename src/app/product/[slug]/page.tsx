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

// Fallback Mock Product Detail (conforming to the new nested color variant structure)
const MOCK_DETAILS: Record<string, ProductDetails> = {
  "ivory-chikankari-embroidered-kurti": {
    id: "e1111111-1111-1111-1111-111111111111",
    name: "Ivory Chikankari Embroidered Kurti",
    slug: "ivory-chikankari-embroidered-kurti",
    description: "Experience pure artisanal luxury with this ivory straight kurti. Adorned with intricate hand-embroidered chikankari shadows and floral motifs, this piece is crafted from premium georgette. Comes with a matching cotton inner slip.",
    brand: "Vastrarupa",
    category: "Kurtis",
    mrp: 2499,
    selling_price: 1999,
    fabric: "Premium Georgette with Cotton Slip",
    fit: "Straight Fit",
    colors: [
      {
        id: "b1111111-1111-1111-1111-111111111111",
        name: "Ivory",
        hex: "#FFFFF0",
        sku: "SKU-IVY-CK",
        thumbnail: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop"
        ],
        sizes: [
          { id: "f1111111-1111-1111-1111-111111111111", size: "S", stock: 12, sku: "SKU-IVY-CK-S" },
          { id: "f1111112-1111-1111-1111-111111111112", size: "M", stock: 20, sku: "SKU-IVY-CK-M" },
          { id: "f1111113-1111-1111-1111-111111111113", size: "L", stock: 15, sku: "SKU-IVY-CK-L" },
          { id: "f1111114-1111-1111-1111-111111111114", size: "XL", stock: 5, sku: "SKU-IVY-CK-XL" }
        ]
      }
    ]
  },
  "crimson-anarkali-georgette-kurti": {
    id: "e1111112-1111-1111-1111-111111111112",
    name: "Crimson Anarkali Georgette Kurti",
    slug: "crimson-anarkali-georgette-kurti",
    description: "Make an entrance in this majestic crimson red Anarkali kurti. Featuring 24 flares for an elegant flow, it displays a delicate gota patti neckline border and gold lace details along the hem. Includes a soft crepe lining.",
    brand: "Vastrarupa",
    category: "Kurtis",
    mrp: 3999,
    selling_price: 3499,
    fabric: "Faux Georgette with Crepe Lining",
    fit: "Anarkali Flare",
    colors: [
      {
        id: "b1111112-1111-1111-1111-111111111112",
        name: "Crimson Red",
        hex: "#990000",
        sku: "SKU-CRMSN-AN",
        thumbnail: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=400&auto=format&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop"
        ],
        sizes: [
          { id: "f1111121-1111-1111-1111-111111111121", size: "S", stock: 8, sku: "SKU-CRMSN-AN-S" },
          { id: "f1111122-1111-1111-1111-111111111122", size: "M", stock: 12, sku: "SKU-CRMSN-AN-M" },
          { id: "f1111123-1111-1111-1111-111111111123", size: "L", stock: 7, sku: "SKU-CRMSN-AN-L" }
        ]
      }
    ]
  }
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
      images: mockProduct?.colors?.[0]?.thumbnail ? [mockProduct.colors[0].thumbnail] : [],
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

    // 1. Fetch product with new colors and sizes schema
    const { data: dbProduct } = await supabase
      .from("products")
      .select(`
        id, category_id, name, slug, description, brand, category, mrp, selling_price, fabric, fit, status, is_featured, is_trending, keywords, seo_details,
        colors:product_colors (
          id, 
          color_name, 
          hex_code, 
          sku, 
          thumbnail, 
          display_order, 
          status,
          sizes:product_sizes (
            id, 
            size, 
            stock, 
            price_override, 
            mrp_override, 
            sku
          ),
          images:product_images (
            id, 
            image, 
            display_order
          )
        )
      `)
      .eq("slug", slug)
      .single();

    if (dbProduct) {
      product = {
        id: dbProduct.id,
        name: dbProduct.name,
        slug: dbProduct.slug,
        description: dbProduct.description,
        brand: dbProduct.brand || "Vastrarupa",
        category: dbProduct.category,
        mrp: Number(dbProduct.mrp),
        selling_price: Number(dbProduct.selling_price),
        fabric: dbProduct.fabric,
        fit: dbProduct.fit,
        keywords: dbProduct.keywords || dbProduct.seo_details?.keywords || [],
        colors: (dbProduct.colors || [])
          .filter((c: any) => c.status === "active")
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
          .map((c: any) => ({
            id: c.id,
            name: c.color_name,
            hex: c.hex_code,
            sku: c.sku,
            thumbnail: c.thumbnail,
            gallery: (c.images || [])
              .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
              .map((img: any) => img.image),
            sizes: (c.sizes || []).map((s: any) => ({
              id: s.id,
              size: s.size,
              stock: Number(s.stock),
              price_override: s.price_override ? Number(s.price_override) : null,
              mrp_override: s.mrp_override ? Number(s.mrp_override) : null,
              sku: s.sku,
            })),
          })),
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

      // 3. Fetch related products using new nested structure
      const { data: dbRelated } = await supabase
        .from("products")
        .select(`
          id, name, slug, mrp, selling_price, fabric, is_trending, is_featured, category,
          colors:product_colors (
            id, 
            color_name, 
            hex_code, 
            thumbnail,
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
        .eq("category_id", dbProduct.category_id)
        .neq("id", product.id)
        .limit(4);

      if (dbRelated) {
        relatedProducts = dbRelated.map((p: any) => {
          const firstColor = p.colors?.[0] || { color_name: "Default", thumbnail: "", sizes: [], images: [] };
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

  // Determine available stock in schema JSON
  const hasInStock = product.colors.some((c) => c.sizes.some((s) => s.stock > 0));

  // Structured Schema (JSON-LD)
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.colors?.[0]?.gallery || [],
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
      "price": product.selling_price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": hasInStock
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
        <section className="w-full px-4 sm:px-6 pb-16 space-y-8">
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
