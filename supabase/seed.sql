-- Supabase Seed Data for Vastrarupa Premium Ethnic Fashion E-Commerce

-- 1. Seed CATEGORIES (Already using 'c' prefix which is valid hex)
INSERT INTO public.categories (id, name, slug, description, image_url) VALUES
('c1111111-1111-1111-1111-111111111111', 'Kurtis', 'kurtis', 'Elegant single kurtis for daily and occasion wear, crafted in premium linen, cotton, and georgette.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'),
('c2222222-2222-2222-2222-222222222222', 'Kurta Sets', 'kurta-sets', 'Complete matching sets including kurtas, trousers, and matching dupattas in luxury silks and cottons.', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop'),
('c3333333-3333-3333-3333-333333333333', 'Gowns', 'gowns', 'Flowing ethnic gowns and Anarkali suits with elaborate patterns, gold zari work, and delicate details.', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop'),
('c4444444-4444-4444-4444-444444444444', 'Co-ord Sets', 'co-ord-sets', 'Contemporary ethnic coordinates, fusion cuts, and comfort fits in organic weaves.', 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=800&auto=format&fit=crop'),
('c5555555-5555-5555-5555-555555555555', 'Dupattas', 'dupattas', 'Handcrafted dupattas in Banarasi silk, organza, and phulkari to complement any outfit.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop');

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

-- -- 4. Seed PRODUCTS (Using 'e' prefix which is valid hex)
INSERT INTO public.products (id, category_id, subcategory_id, collection_id, name, slug, description, brand, category, mrp, selling_price, fabric, fit, status, is_featured, is_trending) VALUES
-- Product 1 (Kurti)
('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'a1111112-1111-1111-1111-111111111112', 'd2222222-2222-2222-2222-222222222222', 
 'Ivory Chikankari Embroidered Kurti', 'ivory-chikankari-embroidered-kurti', 
 'Experience pure artisanal luxury with this ivory straight kurti. Adorned with intricate hand-embroidered chikankari shadows and floral motifs, this piece is crafted from premium georgette. Comes with a matching cotton inner slip.', 
 'Vastrarupa', 'Kurtis', 2499.00, 1999.00, 'Premium Georgette with Cotton Slip', 'Straight Fit', 'published', true, false),

-- Product 2 (Anarkali Kurti)
('e1111112-1111-1111-1111-111111111112', 'c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 
 'Crimson Anarkali Georgette Kurti', 'crimson-anarkali-georgette-kurti', 
 'Make an entrance in this majestic crimson red Anarkali kurti. Featuring 24 flares for an elegant flow, it displays a delicate gota patti neckline border and gold lace details along the hem. Includes a soft crepe lining.', 
 'Vastrarupa', 'Kurtis', 3999.00, 3499.00, 'Faux Georgette with Crepe Lining', 'Anarkali Flare', 'published', true, true),

-- Product 3 (Kurta Set)
('e2222221-2222-2222-2222-222222222221', 'c2222222-2222-2222-2222-222222222222', 'a2222221-2222-2222-2222-222222222221', 'd1111111-1111-1111-1111-111111111111', 
 'Emerald Silk Brocade Kurta Set', 'emerald-silk-brocade-kurta-set', 
 'A celebration of Indian weaves, this emerald green kurta set features rich Banarasi brocade motifs. The kurta is straight and structured, paired with solid emerald cigarette pants and a sheer golden organza dupatta with scalloped borders.', 
 'Vastrarupa', 'Kurta Sets', 6999.00, 5999.00, 'Banarasi Silk Brocade & Organza', 'Regular Fit', 'published', true, true),

-- Product 4 (Daily Cotton Set)
('e2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', NULL, 
 'Pastel Mint Floral Kurta Set', 'pastel-mint-floral-kurta-set', 
 'Stay breezy and beautiful in this everyday luxury set. Printed with hand-blocked floral patterns using organic dyes, this mint green set features a classic V-neck kurta, straight-fit trousers, and a lightweight mulmul dupatta.', 
 'Vastrarupa', 'Kurta Sets', 3299.00, 2799.00, '100% Organic Mulmul Cotton', 'Loose Fit', 'published', false, true),

-- Product 5 (Velvet Gown)
('e3333331-3333-3333-3333-333333333331', 'c3333333-3333-3333-3333-333333333333', 'a3333331-3333-3333-3333-333333333331', 'd1111111-1111-1111-1111-111111111111', 
 'Midnight Blue Velvet Ethnic Gown', 'midnight-blue-velvet-ethnic-gown', 
 'Wrap yourself in royal comfort. Crafted in luxury micro-velvet, this navy blue ethnic gown features a heavy zardozi hand-embroidered neckline, full sleeves with gold wire thread work, and a dramatic floor-length flare.', 
 'Vastrarupa', 'Gowns', 8499.00, 7499.00, 'Premium Micro-Velvet', 'Floor Length Gown', 'published', true, false),

-- Product 6 (Co-ord Set)
('e4444441-4444-4444-4444-444444444441', 'c4444444-4444-4444-4444-444444444444', 'a4444441-4444-4444-4444-444444444441', 'd2222222-2222-2222-2222-222222222222', 
 'Terracotta Cotton Slub Co-ord Set', 'terracotta-cotton-slub-coord-set', 
 'A contemporary take on traditional shades. This terracotta coordinate set comes with an asymmetric overlapping tunic top and comfortable tapered trousers. Accentuated with contrast thread stitching detail.', 
 'Vastrarupa', 'Co-ord Sets', 2999.00, 2399.00, 'Cotton Slub Weave', 'Relaxed Asymmetric Fit', 'published', false, false),

-- Product 7 (Dupatta)
('e5555551-5555-5555-5555-555555555551', 'c5555555-5555-5555-5555-555555555555', NULL, 'd1111111-1111-1111-1111-111111111111', 
 'Handwoven Banarasi Silk Dupatta', 'handwoven-banarasi-silk-dupatta', 
 'Complete your look with this heirloom Banarasi dupatta. Woven over 15 days by master weavers, it displays rich gold zari panels, paisley motifs, and hand-knotted tassels.', 
 'Vastrarupa', 'Dupattas', 2400.00, 1899.00, 'Pure Katan Silk & Gold Zari', 'Standard Length', 'published', false, false);

-- 5. Seed PRODUCT_COLORS (Using 'b' prefix for colors in hex)
INSERT INTO public.product_colors (id, product_id, color_name, hex_code, sku, thumbnail, display_order, status) VALUES
-- Product 1 (Ivory)
('b1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Ivory', '#FFFFF0', 'SKU-IVY-CK', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop', 1, 'active'),

-- Product 2 (Crimson Red)
('b1111112-1111-1111-1111-111111111112', 'e1111112-1111-1111-1111-111111111112', 'Crimson Red', '#990000', 'SKU-CRMSN-AN', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=400&auto=format&fit=crop', 1, 'active'),

-- Product 3 (Emerald Green, Royal Blue)
('b2222211-2222-2222-2222-222222222211', 'e2222221-2222-2222-2222-222222222221', 'Emerald Green', '#006400', 'SKU-EMR-SLK', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop', 1, 'active'),
('b2222212-2222-2222-2222-222222222212', 'e2222221-2222-2222-2222-222222222221', 'Royal Blue', '#0000FF', 'SKU-BLU-SLK', 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=400&auto=format&fit=crop', 2, 'active'),

-- Product 4 (Mint Green)
('b2222221-2222-2222-2222-222222222221', 'e2222222-2222-2222-2222-222222222222', 'Mint Green', '#AAF0D1', 'SKU-MNT-FL', 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=400&auto=format&fit=crop', 1, 'active'),

-- Product 5 (Midnight Blue)
('b3333331-3333-3333-3333-333333333331', 'e3333331-3333-3333-3333-333333333331', 'Midnight Blue', '#191970', 'SKU-NAVY-VL', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=400&auto=format&fit=crop', 1, 'active'),

-- Product 6 (Terracotta)
('b4444441-4444-4444-4444-444444444441', 'e4444441-4444-4444-4444-444444444441', 'Terracotta', '#E2725B', 'SKU-TERRA-CO', 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=400&auto=format&fit=crop', 1, 'active'),

-- Product 7 (Gold & Red)
('b5555551-5555-5555-5555-555555555551', 'e5555551-5555-5555-5555-555555555551', 'Gold & Red', '#D4AF37', 'SKU-BAN-DUP', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop', 1, 'active');

-- 6. Seed PRODUCT_SIZES (Using 'f' prefix for sizes in hex)
INSERT INTO public.product_sizes (id, product_color_id, size, stock, sku) VALUES
-- Product 1 (Ivory sizes)
('f1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'S', 12, 'SKU-IVY-CK-S'),
('f1111112-1111-1111-1111-111111111112', 'b1111111-1111-1111-1111-111111111111', 'M', 20, 'SKU-IVY-CK-M'),
('f1111113-1111-1111-1111-111111111113', 'b1111111-1111-1111-1111-111111111111', 'L', 15, 'SKU-IVY-CK-L'),
('f1111114-1111-1111-1111-111111111114', 'b1111111-1111-1111-1111-111111111111', 'XL', 5, 'SKU-IVY-CK-XL'),

-- Product 2 (Crimson Red sizes)
('f1111121-1111-1111-1111-111111111121', 'b1111112-1111-1111-1111-111111111112', 'S', 8, 'SKU-CRMSN-AN-S'),
('f1111122-1111-1111-1111-111111111122', 'b1111112-1111-1111-1111-111111111112', 'M', 12, 'SKU-CRMSN-AN-M'),
('f1111123-1111-1111-1111-111111111123', 'b1111112-1111-1111-1111-111111111112', 'L', 7, 'SKU-CRMSN-AN-L'),

-- Product 3 (Emerald Green sizes)
('f2222211-2222-2222-2222-222222222211', 'b2222211-2222-2222-2222-222222222211', 'S', 4, 'SKU-EMR-SLK-S'),
('f2222212-2222-2222-2222-222222222212', 'b2222211-2222-2222-2222-222222222211', 'M', 10, 'SKU-EMR-SLK-M'),
('f2222213-2222-2222-2222-222222222213', 'b2222211-2222-2222-2222-222222222211', 'L', 6, 'SKU-EMR-SLK-L'),

-- Product 3 (Royal Blue sizes)
('f2222214-2222-2222-2222-222222222214', 'b2222212-2222-2222-2222-222222222212', 'M', 10, 'SKU-BLU-SLK-M'),
('f2222215-2222-2222-2222-222222222215', 'b2222212-2222-2222-2222-222222222212', 'L', 15, 'SKU-BLU-SLK-L'),
('f2222216-2222-2222-2222-222222222216', 'b2222212-2222-2222-2222-222222222212', 'XL', 5, 'SKU-BLU-SLK-XL'),

-- Product 4 (Mint Green sizes)
('f2222221-2222-2222-2222-222222222221', 'b2222221-2222-2222-2222-222222222221', 'S', 15, 'SKU-MNT-FL-S'),
('f2222222-2222-2222-2222-222222222222', 'b2222221-2222-2222-2222-222222222221', 'M', 25, 'SKU-MNT-FL-M'),
('f2222223-2222-2222-2222-222222222223', 'b2222221-2222-2222-2222-222222222221', 'L', 18, 'SKU-MNT-FL-L'),

-- Product 5 (Midnight Blue sizes)
('f3333331-3333-3333-3333-333333333331', 'b3333331-3333-3333-3333-333333333331', 'M', 5, 'SKU-NAVY-VL-M'),
('f3333332-3333-3333-3333-333333333332', 'b3333331-3333-3333-3333-333333333331', 'L', 8, 'SKU-NAVY-VL-L'),
('f3333333-3333-3333-3333-333333333333', 'b3333331-3333-3333-3333-333333333331', 'XL', 3, 'SKU-NAVY-VL-XL'),

-- Product 6 (Terracotta sizes)
('f4444441-4444-4444-4444-444444444441', 'b4444441-4444-4444-4444-444444444441', 'M', 14, 'SKU-TERRA-CO-M'),
('f4444442-4444-4444-4444-444444444442', 'b4444441-4444-4444-4444-444444444441', 'L', 9, 'SKU-TERRA-CO-L'),

-- Product 7 (Gold & Red size)
('f5555551-5555-5555-5555-555555555551', 'b5555551-5555-5555-5555-555555555551', 'One Size', 11, 'SKU-BAN-DUP-ONE');

-- 7. Seed PRODUCT_IMAGES
INSERT INTO public.product_images (product_color_id, image, display_order) VALUES
-- Product 1 (Ivory)
('b1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop', 1),
('b1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop', 2),

-- Product 2 (Crimson Red)
('b1111112-1111-1111-1111-111111111112', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop', 1),
('b1111112-1111-1111-1111-111111111112', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop', 2),

-- Product 3 (Emerald Green)
('b2222211-2222-2222-2222-222222222211', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop', 1),

-- Product 3 (Royal Blue)
('b2222212-2222-2222-2222-222222222212', 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=1000&auto=format&fit=crop', 1),

-- Product 4 (Mint Green)
('b2222221-2222-2222-2222-222222222221', 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=1000&auto=format&fit=crop', 1),

-- Product 5 (Midnight Blue)
('b3333331-3333-3333-3333-333333333331', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop', 1),

-- Product 6 (Terracotta)
('b4444441-4444-4444-4444-444444444441', 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=1000&auto=format&fit=crop', 1),

-- Product 7 (Gold & Red)
('b5555551-5555-5555-5555-555555555551', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop', 1);


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

-- 10. Seed SETTINGS
INSERT INTO public.settings (key, value) VALUES
('announcement_bar', '{"text": "Free Shipping on all orders above ₹2,999"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
