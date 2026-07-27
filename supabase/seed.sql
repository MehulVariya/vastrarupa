-- Supabase Seed Data for Vastrarupa Premium Ethnic Fashion E-Commerce

-- 1. Seed CATEGORIES (Already using 'c' prefix which is valid hex)
INSERT INTO public.categories (id, name, slug, description, image_url) VALUES
('c1111111-1111-1111-1111-111111111111', 'Kurtis', 'kurtis', 'Elegant single kurtis for daily and occasion wear, crafted in premium linen, cotton, and georgette.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'),
('c2222222-2222-2222-2222-222222222222', 'Kurta Sets', 'kurta-sets', 'Complete matching sets including kurtas, trousers, and matching dupattas in luxury silks and cottons.', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop'),
('c3333333-3333-3333-3333-333333333333', 'Gowns', 'gowns', 'Flowing ethnic gowns and Anarkali suits with elaborate patterns, gold zari work, and delicate details.', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop'),
('c4444444-4444-4444-4444-444444444444', 'Co-ord Sets', 'co-ord-sets', 'Contemporary ethnic coordinates, fusion cuts, and comfort fits in organic weaves.', 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=800&auto=format&fit=crop'),
('c5555555-5555-5555-5555-555555555555', 'Dupattas', 'dupattas', 'Handcrafted dupattas in Banarasi silk, organza, and phulkari to complement any outfit.', 'https://images.unsplash.com/photo-1610030470298-4c6e6d15b026?q=80&w=800&auto=format&fit=crop');

-- 2. Seed SUBCATEGORIES (Using 'a' prefix which is valid hex)
INSERT INTO public.subcategories (id, category_id, name, slug, description) VALUES
('a1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Anarkali Kurtis', 'anarkali-kurtis', 'Flare silhouettes with gathers and panel details.'),
('a1111112-1111-1111-1111-111111111112', 'c1111111-1111-1111-1111-111111111111', 'Straight Kurtis', 'straight-kurtis', 'Classic straight-fit kurtas, ideal for office and casual wear.'),
('a2222221-2222-2222-2222-222222222221', 'c2222222-2222-2222-2222-222222222222', 'Festive Kurta Sets', 'festive-kurta-sets', 'Silks, brocades, and heavily embellished ensembles.'),
('a2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Cotton Daily Sets', 'cotton-daily-sets', 'Comfortable printed cotton daily wears with lightweight trousers.'),
('a3333331-3333-3333-3333-333333333331', 'c3333333-3333-3333-3333-333333333333', 'Velvet Gowns', 'velvet-gowns', 'Royal winter velvet gowns with hand embroidery.'),
('a4444441-4444-4444-4444-444444444441', 'c4444444-4444-4444-4444-444444444444', 'Fusion Coordinates', 'fusion-coords', 'Indo-western asymmetrical styles and lounge coordinates.');

-- 3. Seed COLLECTIONS (Using 'd' prefix which is valid hex)
INSERT INTO public.collections (id, name, slug, description, image_url) VALUES
('d1111111-1111-1111-1111-111111111111', 'Royal Heritage Edit', 'royal-heritage', 'Regal designs crafted in pure silks, hand-done zardozi, and rich brocades inspired by historical Indian royalty.', 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=800&auto=format&fit=crop'),
('d2222222-2222-2222-2222-222222222222', 'Summer Chanderi Loom', 'summer-chanderi', 'Breathable pastel hues woven in lightweight Chanderi cotton-silk, featuring subtle zari panels.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop');

-- 4. Seed PRODUCTS (Using 'e' prefix which is valid hex)
INSERT INTO public.products (id, category_id, subcategory_id, collection_id, name, slug, description, price, sale_price, material, care_instructions, status, is_featured, is_trending) VALUES
-- Product 1 (Kurti)
('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'a1111112-1111-1111-1111-111111111112', 'd2222222-2222-2222-2222-222222222222', 
 'Ivory Chikankari Embroidered Kurti', 'ivory-chikankari-embroidered-kurti', 
 'Experience pure artisanal luxury with this ivory straight kurti. Adorned with intricate hand-embroidered chikankari shadows and floral motifs, this piece is crafted from premium georgette. Comes with a matching cotton inner slip.', 
 2499.00, 1999.00, 'Premium Georgette with Cotton Slip', 'Dry Clean Recommended. Gentle hand wash inside out in cold water.', 'published', true, false),

-- Product 2 (Anarkali Kurti)
('e1111112-1111-1111-1111-111111111112', 'c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 
 'Crimson Anarkali Georgette Kurti', 'crimson-anarkali-georgette-kurti', 
 'Make an entrance in this majestic crimson red Anarkali kurti. Featuring 24 flares for an elegant flow, it displays a delicate gota patti neckline border and gold lace details along the hem. Includes a soft crepe lining.', 
 3999.00, 3499.00, 'Faux Georgette with Crepe Lining', 'Dry clean only. Iron on reverse low heat.', 'published', true, true),

-- Product 3 (Kurta Set)
('e2222221-2222-2222-2222-222222222221', 'c2222222-2222-2222-2222-222222222222', 'a2222221-2222-2222-2222-222222222221', 'd1111111-1111-1111-1111-111111111111', 
 'Emerald Silk Brocade Kurta Set', 'emerald-silk-brocade-kurta-set', 
 'A celebration of Indian weaves, this emerald green kurta set features rich Banarasi brocade motifs. The kurta is straight and structured, paired with solid emerald cigarette pants and a sheer golden organza dupatta with scalloped borders.', 
 6999.00, 5999.00, 'Banarasi Silk Brocade & Organza', 'Dry clean only.', 'published', true, true),

-- Product 4 (Daily Cotton Set)
('e2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', NULL, 
 'Pastel Mint Floral Kurta Set', 'pastel-mint-floral-kurta-set', 
 'Stay breezy and beautiful in this everyday luxury set. Printed with hand-blocked floral patterns using organic dyes, this mint green set features a classic V-neck kurta, straight-fit trousers, and a lightweight mulmul dupatta.', 
 3299.00, 2799.00, '100% Organic Mulmul Cotton', 'Gentle hand wash separately in cold water with mild detergent.', 'published', false, true),

-- Product 5 (Velvet Gown)
('e3333331-3333-3333-3333-333333333331', 'c3333333-3333-3333-3333-333333333333', 'a3333331-3333-3333-3333-333333333331', 'd1111111-1111-1111-1111-111111111111', 
 'Midnight Blue Velvet Ethnic Gown', 'midnight-blue-velvet-ethnic-gown', 
 'Wrap yourself in royal comfort. Crafted in luxury micro-velvet, this navy blue ethnic gown features a heavy zardozi hand-embroidered neckline, full sleeves with gold wire thread work, and a dramatic floor-length flare.', 
 8499.00, 7499.00, 'Premium Micro-Velvet', 'Professional dry clean only. Steam iron only.', 'published', true, false),

-- Product 6 (Co-ord Set)
('e4444441-4444-4444-4444-444444444441', 'c4444444-4444-4444-4444-444444444444', 'a4444441-4444-4444-4444-444444444441', 'd2222222-2222-2222-2222-222222222222', 
 'Terracotta Cotton Slub Co-ord Set', 'terracotta-cotton-slub-coord-set', 
 'A contemporary take on traditional shades. This terracotta coordinate set comes with an asymmetric overlapping tunic top and comfortable tapered trousers. Accentuated with contrast thread stitching detail.', 
 2999.00, 2399.00, 'Cotton Slub Weave', 'Machine wash cold on gentle cycle. Warm iron.', 'published', false, false),

-- Product 7 (Dupatta)
('e5555551-5555-5555-5555-555555555551', 'c5555555-5555-5555-5555-555555555555', NULL, 'd1111111-1111-1111-1111-111111111111', 
 'Handwoven Banarasi Silk Dupatta', 'handwoven-banarasi-silk-dupatta', 
 'Complete your look with this heirloom Banarasi dupatta. Woven over 15 days by master weavers, it displays rich gold zari panels, paisley motifs, and hand-knotted tassels.', 
 2400.00, 1899.00, 'Pure Katan Silk & Gold Zari', 'Dry clean only. Store in muslin cloth.', 'published', false, false);

-- 5. Seed PRODUCT_VARIANTS & INVENTORY (Using 'f' prefix which is valid hex)
-- Product 1 Variants
INSERT INTO public.product_variants (id, product_id, sku, size, color) VALUES
('f1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'SKU-IVY-CK-S', 'S', 'Ivory'),
('f1111112-1111-1111-1111-111111111112', 'e1111111-1111-1111-1111-111111111111', 'SKU-IVY-CK-M', 'M', 'Ivory'),
('f1111113-1111-1111-1111-111111111113', 'e1111111-1111-1111-1111-111111111111', 'SKU-IVY-CK-L', 'L', 'Ivory'),
('f1111114-1111-1111-1111-111111111114', 'e1111111-1111-1111-1111-111111111111', 'SKU-IVY-CK-XL', 'XL', 'Ivory');

INSERT INTO public.inventory (variant_id, quantity) VALUES
('f1111111-1111-1111-1111-111111111111', 12),
('f1111112-1111-1111-1111-111111111112', 20),
('f1111113-1111-1111-1111-111111111113', 15),
('f1111114-1111-1111-1111-111111111114', 5);

-- Product 2 Variants
INSERT INTO public.product_variants (id, product_id, sku, size, color) VALUES
('f1111121-1111-1111-1111-111111111121', 'e1111112-1111-1111-1111-111111111112', 'SKU-CRMSN-AN-S', 'S', 'Crimson Red'),
('f1111122-1111-1111-1111-111111111122', 'e1111112-1111-1111-1111-111111111112', 'SKU-CRMSN-AN-M', 'M', 'Crimson Red'),
('f1111123-1111-1111-1111-111111111123', 'e1111112-1111-1111-1111-111111111112', 'SKU-CRMSN-AN-L', 'L', 'Crimson Red');

INSERT INTO public.inventory (variant_id, quantity) VALUES
('f1111121-1111-1111-1111-111111111121', 8),
('f1111122-1111-1111-1111-111111111122', 12),
('f1111123-1111-1111-1111-111111111123', 7);

-- Product 3 Variants
INSERT INTO public.product_variants (id, product_id, sku, size, color) VALUES
('f2222211-2222-2222-2222-222222222211', 'e2222221-2222-2222-2222-222222222221', 'SKU-EMR-SLK-S', 'S', 'Emerald Green'),
('f2222212-2222-2222-2222-222222222212', 'e2222221-2222-2222-2222-222222222221', 'SKU-EMR-SLK-M', 'M', 'Emerald Green'),
('f2222213-2222-2222-2222-222222222213', 'e2222221-2222-2222-2222-222222222221', 'SKU-EMR-SLK-L', 'L', 'Emerald Green');

INSERT INTO public.inventory (variant_id, quantity) VALUES
('f2222211-2222-2222-2222-222222222211', 4),
('f2222212-2222-2222-2222-222222222212', 10),
('f2222213-2222-2222-2222-222222222213', 6);

-- Product 4 Variants
INSERT INTO public.product_variants (id, product_id, sku, size, color) VALUES
('f2222221-2222-2222-2222-222222222221', 'e2222222-2222-2222-2222-222222222222', 'SKU-MNT-FL-S', 'S', 'Mint Green'),
('f2222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222', 'SKU-MNT-FL-M', 'M', 'Mint Green'),
('f2222223-2222-2222-2222-222222222223', 'e2222222-2222-2222-2222-222222222222', 'SKU-MNT-FL-L', 'L', 'Mint Green');

INSERT INTO public.inventory (variant_id, quantity) VALUES
('f2222221-2222-2222-2222-222222222221', 15),
('f2222222-2222-2222-2222-222222222222', 25),
('f2222223-2222-2222-2222-222222222223', 18);

-- Product 5 Variants
INSERT INTO public.product_variants (id, product_id, sku, size, color) VALUES
('f3333331-3333-3333-3333-333333333331', 'e3333331-3333-3333-3333-333333333331', 'SKU-NAVY-VL-M', 'M', 'Midnight Blue'),
('f3333332-3333-3333-3333-333333333332', 'e3333331-3333-3333-3333-333333333331', 'SKU-NAVY-VL-L', 'L', 'Midnight Blue'),
('f3333333-3333-3333-3333-333333333333', 'e3333331-3333-3333-3333-333333333331', 'SKU-NAVY-VL-XL', 'XL', 'Midnight Blue');

INSERT INTO public.inventory (variant_id, quantity) VALUES
('f3333331-3333-3333-3333-333333333331', 5),
('f3333332-3333-3333-3333-333333333332', 8),
('f3333333-3333-3333-3333-333333333333', 3);

-- Product 6 Variants
INSERT INTO public.product_variants (id, product_id, sku, size, color) VALUES
('f4444441-4444-4444-4444-444444444441', 'e4444441-4444-4444-4444-444444444441', 'SKU-TERRA-CO-M', 'M', 'Terracotta'),
('f4444442-4444-4444-4444-444444444442', 'e4444441-4444-4444-4444-444444444441', 'SKU-TERRA-CO-L', 'L', 'Terracotta');

INSERT INTO public.inventory (variant_id, quantity) VALUES
('f4444441-4444-4444-4444-444444444441', 14),
('f4444442-4444-4444-4444-444444444442', 9);

-- Product 7 Variants
INSERT INTO public.product_variants (id, product_id, sku, size, color) VALUES
('f5555551-5555-5555-5555-555555555551', 'e5555551-5555-5555-5555-555555555551', 'SKU-BAN-DUP-ONE', 'One Size', 'Gold & Red');

INSERT INTO public.inventory (variant_id, quantity) VALUES
('f5555551-5555-5555-5555-555555555551', 11);


-- 6. Seed PRODUCT_IMAGES
INSERT INTO public.product_images (product_id, variant_id, url, is_featured, alt_text) VALUES
-- Product 1
('e1111111-1111-1111-1111-111111111111', NULL, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop', true, 'Ivory Chikankari Straight Kurti Front View'),
('e1111111-1111-1111-1111-111111111111', NULL, 'https://images.unsplash.com/photo-1610030470298-4c6e6d15b026?q=80&w=1000&auto=format&fit=crop', false, 'Ivory Chikankari Straight Kurti Detail embroidery'),

-- Product 2
('e1111112-1111-1111-1111-111111111112', NULL, 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop', true, 'Crimson Anarkali Gown Front View'),
('e1111112-1111-1111-1111-111111111112', NULL, 'https://images.unsplash.com/photo-1610030470298-4c6e6d15b026?q=80&w=1000&auto=format&fit=crop', false, 'Crimson Anarkali Gown Flare View'),

-- Product 3
('e2222221-2222-2222-2222-222222222221', NULL, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop', true, 'Emerald Silk Brocade Kurta Set'),

-- Product 4
('e2222222-2222-2222-2222-222222222222', NULL, 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=1000&auto=format&fit=crop', true, 'Mint Floral Kurta Set on model'),

-- Product 5
('e3333331-3333-3333-3333-333333333331', NULL, 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop', true, 'Midnight Blue Velvet Gown Neckline embroidery'),

-- Product 6
('e4444441-4444-4444-4444-444444444441', NULL, 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=1000&auto=format&fit=crop', true, 'Terracotta Cotton Slub Co-ord Set Minimalist View'),

-- Product 7
('e5555551-5555-5555-5555-555555555551', NULL, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop', true, 'Heirloom Gold Zari Banarasi Silk Dupatta');


-- 7. Seed BANNERS
INSERT INTO public.banners (title, subtitle, image_url, link, location, status, display_order) VALUES
('The Royal Heritage Edit', 'Timeless silhouettes crafted in pure Banarasi silk and hand-embroidered zardozi.', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1600&auto=format&fit=crop', '/shop?collection=royal-heritage', 'hero', 'active', 1),
('Summer Chanderi Loom', 'Effortless styles in lightweight cotton-silks and soothing pastel tones.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1600&auto=format&fit=crop', '/shop?collection=summer-chanderi', 'hero', 'active', 2),
('Crafted Daily Luxury', 'Flat 15% off on our hand block printed cotton sets. Use code: DAILY15', 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=1200&auto=format&fit=crop', '/shop?category=kurta-sets', 'promotional', 'active', 3);


-- 8. Seed COUPONS
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_value, max_discount, usage_limit) VALUES
('WELCOME10', 'percentage', 10.00, 1999.00, 500.00, 500),
('DAILY15', 'percentage', 15.00, 2499.00, 800.00, 300),
('ROYAL2000', 'fixed_amount', 2000.00, 9999.00, NULL, 100);


-- 9. Seed BLOG_POSTS
INSERT INTO public.blog_posts (title, slug, content, excerpt, cover_image, status, published_at) VALUES
('The Revival of Banarasi Brocades in Modern Silhouette', 'revival-of-banarasi-brocades', 
 'For centuries, Banarasi silk has been synonymous with bridal luxury in India. Handwoven in the holy city of Varanasi, these fabrics carry tales of Mughal artistry, gold zari threads, and deep heritage. In this article, we explore how contemporary designers are refashioning brocades from stiff traditional saris into flowing floor-length ethnic gowns, structured co-ord sets, and modern straight kurtas. This blend of ancient craft with global cuts represents the new era of Indian luxury.', 
 'Discover how centuries-old Banarasi silk is transitioning into contemporary ethnic gowns and modern pantsuits.', 
 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop', 'published', now()),

('Chikankari Hand Embroidery: A Labour of Pure Love', 'chikankari-hand-embroidery-labour-of-love', 
 'Hailing from the historic city of Lucknow, Chikankari is a delicate and artful shadow-work embroidery that has captured hearts globally. Originally done on fine muslin using white threads, today Chikankari is worked on premium georgettes, cottons, and organzas. Every single piece is block-printed with erasable ink and hand-stitched by skilled women artisans over weeks or even months. We guide you on how to spot authentic hand-chikankari and care for these heirloom pieces.', 
 'A deep dive into the historical craft of Lucknow shadow embroidery and how to care for your delicate Chikankari garments.', 
 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop', 'published', now());
