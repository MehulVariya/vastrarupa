-- Supabase Migration: Initial Schema for Vastrarupa Premium Ethnic Fashion E-Commerce

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES Table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. CATEGORIES Table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. SUBCATEGORIES Table
CREATE TABLE public.subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- 4. COLLECTIONS Table
CREATE TABLE public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- 5. PRODUCTS Table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
    collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    brand TEXT DEFAULT 'Vastrarupa',
    category TEXT,
    mrp NUMERIC(10,2) NOT NULL CHECK (mrp >= 0),
    selling_price NUMERIC(10,2) NOT NULL CHECK (selling_price >= 0 AND selling_price <= mrp),
    fabric TEXT,
    fit TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'out_of_stock')),
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 6. PRODUCT_COLORS Table
CREATE TABLE public.product_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    color_name TEXT NOT NULL,
    hex_code TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    thumbnail TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;

-- 7. PRODUCT_SIZES Table
CREATE TABLE public.product_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_color_id UUID REFERENCES public.product_colors(id) ON DELETE CASCADE NOT NULL,
    size TEXT NOT NULL CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size')),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    price_override NUMERIC(10,2) CHECK (price_override >= 0),
    mrp_override NUMERIC(10,2) CHECK (mrp_override >= 0),
    sku TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;

-- 8. PRODUCT_IMAGES Table
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_color_id UUID REFERENCES public.product_colors(id) ON DELETE CASCADE NOT NULL,
    image TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- 9. COUPONS Table
CREATE TABLE public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
    min_order_value NUMERIC(10,2) DEFAULT 0 CHECK (min_order_value >= 0),
    max_discount NUMERIC(10,2) CHECK (max_discount >= 0),
    active_from TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    active_to TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER CHECK (usage_limit > 0),
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 10. ORDERS Table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    tax NUMERIC(10,2) DEFAULT 0 CHECK (tax >= 0),
    shipping NUMERIC(10,2) DEFAULT 0 CHECK (shipping >= 0),
    coupon_code TEXT,
    discount_amount NUMERIC(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed')),
    payment_method TEXT CHECK (payment_method IN ('razorpay', 'stripe', 'cod')),
    payment_id TEXT,
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    tracking_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 11. ORDER_ITEMS Table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL NOT NULL,
    variant_id UUID REFERENCES public.product_sizes(id) ON DELETE SET NULL NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0)
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 12. CART Table
CREATE TABLE public.cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES public.product_sizes(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id, variant_id)
);

ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- 13. WISHLIST Table
CREATE TABLE public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- 14. ADDRESSES Table
CREATE TABLE public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- 15. REVIEWS Table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    title TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 16. BANNERS Table
CREATE TABLE public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link TEXT,
    location TEXT DEFAULT 'hero' CHECK (location IN ('hero', 'promotional', 'side')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- 17. BLOG_POSTS Table
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 18. NOTIFICATIONS Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'order', 'promotion')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 19. SETTINGS Table
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;


--------------------------------------------------------------------------------
-- Database Functions and Triggers
--------------------------------------------------------------------------------

-- Auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sync user signup from auth.users to public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, phone, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    new.phone,
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();-- Helper function to check if current user is an admin (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


--------------------------------------------------------------------------------
-- Row Level Security (RLS) Policies
--------------------------------------------------------------------------------

-- Profiles RLS
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Categories & Subcategories RLS
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "Subcategories are viewable by everyone" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Admins can manage subcategories" ON public.subcategories FOR ALL USING (public.is_admin());

-- Collections RLS
CREATE POLICY "Collections are viewable by everyone" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Admins can manage collections" ON public.collections FOR ALL USING (public.is_admin());

-- Products & Variants RLS
CREATE POLICY "Published products are viewable by everyone" ON public.products FOR SELECT USING (status = 'published' OR public.is_admin());
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (public.is_admin());

CREATE POLICY "Product colors are viewable by everyone" ON public.product_colors FOR SELECT USING (true);
CREATE POLICY "Admins can manage product colors" ON public.product_colors FOR ALL USING (public.is_admin());

-- 15. Product Sizes RLS
CREATE POLICY "Product sizes are viewable by everyone" ON public.product_sizes FOR SELECT USING (true);
CREATE POLICY "Admins can manage product sizes" ON public.product_sizes FOR ALL USING (public.is_admin());

-- Product Images RLS
CREATE POLICY "Product images are viewable by everyone" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images" ON public.product_images FOR ALL USING (public.is_admin());

-- Coupons RLS
CREATE POLICY "Coupons are viewable by authenticated users" ON public.coupons FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (public.is_admin());

-- Orders RLS
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (public.is_admin());

-- Order Items RLS
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert their own order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all order items" ON public.order_items FOR ALL USING (public.is_admin());

-- Cart RLS
CREATE POLICY "Users can manage their own cart" ON public.cart FOR ALL USING (auth.uid() = user_id);

-- Wishlist RLS
CREATE POLICY "Users can manage their own wishlist" ON public.wishlist FOR ALL USING (auth.uid() = user_id);

-- Addresses RLS
CREATE POLICY "Users can manage their own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- Reviews RLS
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reviews" ON public.reviews FOR ALL USING (auth.uid() = user_id);

-- Banners RLS
CREATE POLICY "Banners are viewable by everyone" ON public.banners FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage banners" ON public.banners FOR ALL USING (public.is_admin());

-- Blog Posts RLS
CREATE POLICY "Published blog posts are viewable by everyone" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts FOR ALL USING (public.is_admin());

-- Notifications RLS
CREATE POLICY "Users can manage their own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Settings RLS
CREATE POLICY "Settings are viewable by everyone" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (public.is_admin());
