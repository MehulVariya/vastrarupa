# Vastrarupa — Premium Ethnic Fashion E-Commerce

Vastrarupa is a production-ready, high-performance, and responsive premium ethnic fashion e-commerce platform. Inspired by modern luxury brand design systems, it showcases collections of kurtis, kurta sets, gowns, coordinates, and dupattas using elegant editorial layouts, rich color transitions, and smooth interactive micro-animations.

---

## 1. Core Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 15 (using App Router, Server Actions, and ISR optimizations).
- **Styling**: Tailwind CSS v4 with custom HSL-based styling token system (supports seamless Dark Mode toggling).
- **Typography**: Editorial serif font (*Playfair Display*) paired with clean geometric sans-serif (*Inter*).
- **State Management**: Zustand for client-side Cart Drawer state, Wishlist persistence, and User Session context.
- **Form Controls**: React Hook Form with Zod schema validation (Checkout form, review submission form, admin catalog creators).
- **Client Cache**: TanStack React Query for smooth, cached database client actions.
- **Animations**: Framer Motion for sliding cart drawers, filter sheets, overlay searches, and fade-in transitions.
- **Icons**: Lucide Icons.

### Backend & Payments
- **Database & Auth**: Supabase (PostgreSQL tables, database triggers, security functions, Row Level Security).
- **Payment Gateway**: Simulated Razorpay Secure Online payment gateways (integrated cleanly into checkout workflows without breaking on missing keys).

---

## 2. Directory Structure

```text
vastrarupa/
├── src/
│   ├── app/                     # Page routes & layouts
│   │   ├── admin/               # /admin Dashboard overview, dispatch tracker, CRUD
│   │   ├── checkout/            # Checkout address validation & simulated payment gateway
│   │   ├── login/               # /login form with preset preview credentials
│   │   ├── product/[slug]/      # SEO optimized details page with reviews & related edits
│   │   ├── profile/             # Customer order ledger, wishlist, address book
│   │   ├── shop/                # Multi-faceted filter grids & sort mechanisms
│   │   ├── layout.tsx           # Fonts configurations, sitemaps, theme wrappers
│   │   └── page.tsx             # Homepage hero banners, brand storytelling, testimonials
│   ├── components/
│   │   ├── common/              # Global Navbar (Header), Footer, Theme toggler
│   │   └── provider/            # React Query & Theme context providers
│   ├── features/
│   │   ├── auth/                # useAuth session hook
│   │   ├── cart/                # CartDrawer slideouts, useCart subtotal store
│   │   ├── products/            # ProductCard hover sizing selectors
│   │   └── wishlist/            # useWishlist persistence hook
│   ├── lib/
│   │   ├── supabase/            # Browser Client & cookies-based Server SSR clients
│   │   └── utils.ts             # Currency formatter, order ID generators
│   └── middleware.ts            # Route guards (protects /admin paths for admins only)
├── supabase/
│   ├── migrations/              # PostgreSQL schema, updated_at triggers, RLS policies
│   └── seed.sql                 # Seed statements for premium catalog, banners, blog
```

---

## 3. Database Schema

All database models are located under `supabase/migrations/` and include:
1. `profiles`: Extends Supabase auth accounts with names, phones, and user roles (`customer`, `admin`).
2. `categories` & `subcategories`: Multilevel groupings (Kurtis, Kurta Sets, Gowns, Co-ord Sets, Dupattas).
3. `products` & `product_variants`: Standard items catalog split into XS, S, M, L, XL, XXL, and One Size variant attributes.
4. `inventory`: Tracks real-time quantity left per variant size.
5. `orders` & `order_items`: Records transaction histories, billing totals, shipping addresses, and Delhivery courier tracking references.
6. `addresses`: Saves client address books.
7. `reviews`: Verifies patron feedback ratings.
8. `coupons`: Manages discount promotions (`WELCOME10`, `DAILY15`, `ROYAL2000`).

---

## 4. Local Installation Guide

### Prerequisites
- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher

### Steps
1. Clone the repository and navigate to root:
   ```bash
   cd vastrarupa
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env.local` file at the root and input your Supabase parameters:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```
   *Note: If these variables are omitted, the application will run using high-fidelity fallback mock data for testing.*

4. Boot development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the portal.

---

## 5. Pre-configured Evaluation Accounts

Pre-seeded login credentials are provided to quickly review both customer and administrator features without manual signups:

| Account Type | Email Address | Password |
| :--- | :--- | :--- |
| **Customer (Patron)** | `customer@vastrarupa.com` | `password123` |
| **Administrator** | `admin@vastrarupa.com` | `password123` |
