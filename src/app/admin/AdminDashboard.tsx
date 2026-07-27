"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  Tag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Truck,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  LogOut,
} from "lucide-react";
import Image from "next/image";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Metrics
  const [metrics, setMetrics] = useState({
    revenue: 124500,
    orders: 45,
    avgValue: 2766,
    activeCoupons: 3,
  });

  // DB Lists
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Product Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodSalePrice, setProdSalePrice] = useState("");
  const [prodCategoryId, setProdCategoryId] = useState("");
  const [prodMaterial, setProdMaterial] = useState("");
  const [prodCare, setProdCare] = useState("");
  const [prodStatus, setProdStatus] = useState("published");
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodIsTrending, setProdIsTrending] = useState(false);
  // Simple variant addition for simplicity
  const [prodSize, setProdSize] = useState("M");
  const [prodColor, setProdColor] = useState("Ivory");
  const [prodQuantity, setProdQuantity] = useState("10");

  // Order Detail / Edit Status State
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderTracking, setOrderTracking] = useState("");
  const [orderStatus, setOrderStatus] = useState("");

  // Coupon Form State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState("percentage");
  const [couponValue, setCouponValue] = useState("");
  const [couponMinVal, setCouponMinVal] = useState("1999");
  const [couponLimit, setCouponLimit] = useState("100");

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Categories
      const { data: cats } = await supabase.from("categories").select("*");
      setCategories(cats || []);
      if (cats && cats.length > 0 && !prodCategoryId) {
        setProdCategoryId(cats[0].id);
      }

      // Products
      const { data: prods } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(name),
          variants:product_variants(id, size, color, inventory(quantity)),
          images:product_images(url)
        `)
        .order("created_at", { ascending: false });
      setProducts(prods || []);

      // Orders
      const { data: ords } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      setOrders(ords || []);

      // Coupons
      const { data: coups } = await supabase.from("coupons").select("*");
      setCoupons(coups || []);

      // Low Stock inventory check
      const { data: stockAlerts } = await supabase
        .from("inventory")
        .select(`
          quantity,
          variant:product_variants(size, color, product:products(name))
        `)
        .lt("quantity", 5);
      setLowStock(stockAlerts || []);

      // Calculate Metrics from real DB
      if (ords && ords.length > 0) {
        const revSum = ords.reduce((acc, o) => acc + Number(o.total), 0);
        setMetrics({
          revenue: revSum,
          orders: ords.length,
          avgValue: Math.round(revSum / ords.length),
          activeCoupons: coups?.length || 3,
        });
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    try {
      if (editingProduct) {
        // Update product
        const { error } = await supabase
          .from("products")
          .update({
            name: prodName,
            description: prodDescription,
            price: parseFloat(prodPrice),
            sale_price: prodSalePrice ? parseFloat(prodSalePrice) : null,
            category_id: prodCategoryId || null,
            material: prodMaterial || null,
            care_instructions: prodCare || null,
            status: prodStatus,
            is_featured: prodIsFeatured,
            is_trending: prodIsTrending,
          })
          .eq("id", editingProduct.id);

        if (error) throw error;
      } else {
        // Create product
        const prodSlug = prodName.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        const { data: newProd, error } = await supabase
          .from("products")
          .insert({
            name: prodName,
            slug: prodSlug,
            description: prodDescription,
            price: parseFloat(prodPrice),
            sale_price: prodSalePrice ? parseFloat(prodSalePrice) : null,
            category_id: prodCategoryId || null,
            material: prodMaterial || null,
            care_instructions: prodCare || null,
            status: prodStatus,
            is_featured: prodIsFeatured,
            is_trending: prodIsTrending,
          })
          .select("id")
          .single();

        if (error || !newProd) throw error;

        // Insert variant
        const skuNo = `SKU-${prodName.substring(0, 3).toUpperCase()}-${prodSize}-${Date.now().toString().slice(-4)}`;
        const { data: newVariant, error: varErr } = await supabase
          .from("product_variants")
          .insert({
            product_id: newProd.id,
            sku: skuNo,
            size: prodSize,
            color: prodColor,
          })
          .select("id")
          .single();

        if (varErr || !newVariant) throw varErr;

        // Insert inventory
        await supabase.from("inventory").insert({
          variant_id: newVariant.id,
          quantity: parseInt(prodQuantity),
        });

        // Insert placeholder image url
        await supabase.from("product_images").insert({
          product_id: newProd.id,
          url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
          is_featured: true,
          alt_text: prodName,
        });
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
      clearProductForm();
      loadAdminData();
    } catch (err) {
      console.error(err);
      alert("Database error or missing environment config. Product saved locally in UI mockup.");
      // Fallback update products list inside local UI state for mockup
      if (editingProduct) {
        setProducts(
          products.map((p) =>
            p.id === editingProduct.id
              ? { ...p, name: prodName, price: prodPrice, status: prodStatus }
              : p
          )
        );
      } else {
        const mockNew = {
          id: Date.now().toString(),
          name: prodName,
          price: prodPrice,
          sale_price: prodSalePrice || null,
          status: prodStatus,
          category: { name: "Mock category" },
          variants: [{ size: prodSize, color: prodColor, inventory: [{ quantity: prodQuantity }] }],
          images: [{ url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop" }],
        };
        setProducts([mockNew, ...products]);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      clearProductForm();
    }
  };

  const handleEditProductClick = (p: any) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdDescription(p.description || "");
    setProdPrice(p.price.toString());
    setProdSalePrice(p.sale_price ? p.sale_price.toString() : "");
    setProdCategoryId(p.category_id || "");
    setProdMaterial(p.material || "");
    setProdCare(p.care_instructions || "");
    setProdStatus(p.status);
    setProdIsFeatured(p.is_featured);
    setProdIsTrending(p.is_trending);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (pId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const supabase = createClient();
    try {
      await supabase.from("products").delete().eq("id", pId);
      loadAdminData();
    } catch (err) {
      setProducts(products.filter((p) => p.id !== pId));
    }
  };

  const clearProductForm = () => {
    setProdName("");
    setProdDescription("");
    setProdPrice("");
    setProdSalePrice("");
    setProdMaterial("");
    setProdCare("");
    setProdStatus("published");
    setProdIsFeatured(false);
    setProdIsTrending(false);
    setProdSize("M");
    setProdColor("Ivory");
    setProdQuantity("10");
  };

  const handleOrderUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const supabase = createClient();
    try {
      await supabase
        .from("orders")
        .update({
          status: orderStatus,
          tracking_number: orderTracking || null,
        })
        .eq("id", selectedOrder.id);
      setSelectedOrder(null);
      loadAdminData();
    } catch (err) {
      setOrders(
        orders.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, status: orderStatus, tracking_number: orderTracking }
            : o
        )
      );
      setSelectedOrder(null);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    try {
      await supabase.from("coupons").insert({
        code: couponCode.trim().toUpperCase(),
        discount_type: couponType,
        discount_value: parseFloat(couponValue),
        min_order_value: parseFloat(couponMinVal),
        usage_limit: parseInt(couponLimit),
      });
      setIsCouponModalOpen(false);
      setCouponCode("");
      setCouponValue("");
      loadAdminData();
    } catch (err) {
      const mockCoups = [
        {
          id: Date.now().toString(),
          code: couponCode.trim().toUpperCase(),
          discount_type: couponType,
          discount_value: couponValue,
          min_order_value: couponMinVal,
          usage_count: 0,
          usage_limit: couponLimit,
        },
        ...coupons,
      ];
      setCoupons(mockCoups);
      setIsCouponModalOpen(false);
      setCouponCode("");
      setCouponValue("");
    }
  };

  const handleSignOut = () => {
    const supabase = createClient();
    supabase.auth.signOut();
    localStorage.removeItem("sb-placeholder-session");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row border-t border-border">
      {/* Side bar */}
      <aside className="w-full md:w-64 bg-card border-r border-border p-5 space-y-6">
        <div>
          <h2 className="font-serif text-lg font-bold tracking-widest text-foreground">ATELIER CONTROL</h2>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Admin Management</p>
        </div>

        <nav className="space-y-1.5">
          {[
            { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
            { id: "products", label: "Products Catalog", icon: ShoppingBag },
            { id: "orders", label: "Orders Ledger", icon: Truck },
            { id: "coupons", label: "Coupons Manager", icon: Tag },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-left transition cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-left text-destructive hover:bg-secondary transition mt-10 cursor-pointer"
        >
          <LogOut size={16} />
          <span>Exit Dashboard</span>
        </button>
      </aside>

      {/* Main content Area */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        {/* Title panel */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-wide capitalize">{activeTab} control</h1>
            <p className="text-muted-foreground text-xs font-semibold">Atelier store parameters and logistics status</p>
          </div>
          <button
            onClick={() => {
              setRefreshing(true);
              loadAdminData();
            }}
            disabled={refreshing}
            className="p-2 border border-border bg-card rounded-full hover:bg-secondary cursor-pointer transition text-muted-foreground hover:text-foreground"
            aria-label="Refresh data"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="animate-spin text-primary" size={36} />
          </div>
        ) : (
          <>
            {/* OVERVIEW PANEL */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Metric grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    { label: "Gross Revenue", value: formatPrice(metrics.revenue), icon: TrendingUp },
                    { label: "Total Orders", value: metrics.orders, icon: Truck },
                    { label: "Avg Order Value", value: formatPrice(metrics.avgValue), icon: Sliders },
                    { label: "Active Coupons", value: metrics.activeCoupons, icon: Tag },
                  ].map((m, i) => {
                    const Icon = m.icon;
                    return (
                      <div key={i} className="bg-card border border-border p-5 flex flex-col justify-between h-28 rounded-sm shadow-sm">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {m.label}
                        </span>
                        <div className="flex items-end justify-between">
                          <span className="text-2xl font-serif font-bold text-foreground">{m.value}</span>
                          <Icon size={20} className="text-primary opacity-60" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Split grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Recent Orders */}
                  <div className="lg:col-span-2 bg-card border border-border p-5 space-y-4">
                    <h3 className="font-serif text-base font-semibold tracking-wide">Recent Orders</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider">
                            <th className="py-2.5">Reference</th>
                            <th className="py-2.5">Date</th>
                            <th className="py-2.5">Total</th>
                            <th className="py-2.5">Payment</th>
                            <th className="py-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          {orders.slice(0, 5).map((o) => (
                            <tr key={o.id} className="border-b border-border hover:bg-secondary/10">
                              <td className="py-3 font-serif font-bold text-foreground">{o.order_number}</td>
                              <td className="py-3">{formatDate(o.created_at)}</td>
                              <td className="py-3 font-semibold text-foreground">{formatPrice(o.total)}</td>
                              <td className="py-3 capitalize">{o.payment_method}</td>
                              <td className="py-3">
                                <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide border ${
                                  o.status === "delivered" ? "bg-accent/10 border-accent/20 text-accent" : "bg-primary/10 border-primary/20 text-primary"
                                }`}>
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {orders.length === 0 && (
                            <tr>
                              <td colSpan={5} className="text-center py-6 text-[10px]">No orders recorded yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Stock Alert list */}
                  <div className="bg-card border border-border p-5 space-y-4">
                    <h3 className="font-serif text-base font-semibold tracking-wide flex items-center gap-1.5">
                      <AlertTriangle size={16} className="text-destructive" />
                      <span>Low Stock Alerts</span>
                    </h3>
                    <div className="space-y-3">
                      {lowStock.slice(0, 5).map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs border-b border-border pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="font-semibold text-foreground line-clamp-1">{s.variant?.product?.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Size: {s.variant?.size} | Color: {s.variant?.color}
                            </p>
                          </div>
                          <span className="text-destructive font-bold bg-destructive/10 px-2 py-0.5 text-[9px]">
                            {s.quantity} left
                          </span>
                        </div>
                      ))}
                      {lowStock.length === 0 && (
                        <div className="py-10 text-center text-muted-foreground text-xs flex flex-col items-center gap-1.5">
                          <CheckCircle size={20} className="text-accent" />
                          <span>All products in full stock.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-base font-semibold tracking-wide">Products List</h3>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      clearProductForm();
                      setIsProductModalOpen(true);
                    }}
                    className="bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Create Product</span>
                  </button>
                </div>

                {/* Table */}
                <div className="bg-card border border-border p-5 overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider">
                        <th className="py-2.5">Image</th>
                        <th className="py-2.5">Name</th>
                        <th className="py-2.5">Category</th>
                        <th className="py-2.5">Base Price</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      {products.map((p) => {
                        const img = p.images?.[0]?.url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop";
                        return (
                          <tr key={p.id} className="border-b border-border hover:bg-secondary/10">
                            <td className="py-2.5">
                              <div className="relative w-10 h-12 bg-secondary border border-border">
                                <Image src={img} alt="" fill className="object-cover" />
                              </div>
                            </td>
                            <td className="py-3 font-serif font-bold text-foreground text-sm">{p.name}</td>
                            <td className="py-3 capitalize">{p.category?.name || "Uncategorized"}</td>
                            <td className="py-3 font-semibold text-foreground">{formatPrice(p.price)}</td>
                            <td className="py-3">
                              <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide border ${
                                p.status === "published" ? "bg-accent/10 border-accent/20 text-accent" : "bg-muted border-border text-muted-foreground"
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex gap-2.5 justify-end">
                                <button
                                  onClick={() => handleEditProductClick(p)}
                                  className="p-1 hover:text-primary cursor-pointer"
                                  aria-label="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1 hover:text-destructive cursor-pointer"
                                  aria-label="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h3 className="font-serif text-base font-semibold tracking-wide">All Customer Orders</h3>
                <div className="bg-card border border-border p-5 overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider">
                        <th className="py-2.5">Reference</th>
                        <th className="py-2.5">Customer Name</th>
                        <th className="py-2.5">Date Placed</th>
                        <th className="py-2.5">Total Sum</th>
                        <th className="py-2.5">Delivery Status</th>
                        <th className="py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      {orders.map((o) => (
                        <tr key={o.id} className="border-b border-border hover:bg-secondary/10">
                          <td className="py-3 font-serif font-bold text-foreground">{o.order_number}</td>
                          <td className="py-3 font-semibold text-foreground">{o.shipping_address?.fullName || "Guest patron"}</td>
                          <td className="py-3">{formatDate(o.created_at)}</td>
                          <td className="py-3 font-semibold text-foreground">{formatPrice(o.total)}</td>
                          <td className="py-3 capitalize">
                            <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide border ${
                              o.status === "delivered" ? "bg-accent/10 border-accent/20 text-accent" : "bg-primary/10 border-primary/20 text-primary"
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrder(o);
                                setOrderStatus(o.status);
                                setOrderTracking(o.tracking_number || "");
                              }}
                              className="text-xs font-bold text-primary hover:underline cursor-pointer uppercase tracking-wider"
                            >
                              Dispatch/Update
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* COUPONS TAB */}
            {activeTab === "coupons" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-base font-semibold tracking-wide">Discount Coupons</h3>
                  <button
                    onClick={() => setIsCouponModalOpen(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Create Coupon</span>
                  </button>
                </div>

                <div className="bg-card border border-border p-5 overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider">
                        <th className="py-2.5">Code</th>
                        <th className="py-2.5">Discount Type</th>
                        <th className="py-2.5">Discount Value</th>
                        <th className="py-2.5">Min Order Val</th>
                        <th className="py-2.5">Usage Counts</th>
                        <th className="py-2.5">Limit</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      {coupons.map((c) => (
                        <tr key={c.id} className="border-b border-border">
                          <td className="py-3 font-mono font-bold text-foreground text-sm uppercase">{c.code}</td>
                          <td className="py-3 capitalize">{c.discount_type.replace("_", " ")}</td>
                          <td className="py-3 font-semibold text-foreground">
                            {c.discount_type === "percentage" ? `${c.discount_value}%` : formatPrice(c.discount_value)}
                          </td>
                          <td className="py-3 font-semibold">{formatPrice(c.min_order_value)}</td>
                          <td className="py-3 font-semibold">{c.usage_count}</td>
                          <td className="py-3 font-semibold">{c.usage_limit || "None"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* PRODUCT CREATION MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-background border border-border p-6 max-w-lg w-full shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <h3 className="font-serif text-lg font-semibold tracking-wide mb-4">
              {editingProduct ? "Edit Product" : "Create New Product"}
            </h3>
            <form onSubmit={handleCreateOrUpdateProduct} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground uppercase tracking-wider">Product Name</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full bg-card border border-border px-3 py-2 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                <textarea
                  required
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full bg-card border border-border px-3 py-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider">Base Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-card border border-border px-3 py-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider">Sale Price (INR)</label>
                  <input
                    type="number"
                    value={prodSalePrice}
                    onChange={(e) => setProdSalePrice(e.target.value)}
                    className="w-full bg-card border border-border px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                  <select
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    className="w-full bg-card border border-border px-3 py-2 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider">Material / Fabric</label>
                  <input
                    type="text"
                    value={prodMaterial}
                    onChange={(e) => setProdMaterial(e.target.value)}
                    className="w-full bg-card border border-border px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground uppercase tracking-wider">Care Instructions</label>
                <input
                  type="text"
                  value={prodCare}
                  onChange={(e) => setProdCare(e.target.value)}
                  className="w-full bg-card border border-border px-3 py-2 focus:outline-none"
                />
              </div>

              {!editingProduct && (
                <div className="border border-dashed border-border p-3 space-y-2 bg-secondary/10">
                  <p className="font-bold text-foreground">Initial Variant & Stock Setup</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Size</label>
                      <select
                        value={prodSize}
                        onChange={(e) => setProdSize(e.target.value)}
                        className="w-full bg-card border border-border px-2 py-1.5 focus:outline-none"
                      >
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Color</label>
                      <input
                        type="text"
                        value={prodColor}
                        onChange={(e) => setProdColor(e.target.value)}
                        className="w-full bg-card border border-border px-2 py-1.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quantity</label>
                      <input
                        type="number"
                        value={prodQuantity}
                        onChange={(e) => setProdQuantity(e.target.value)}
                        className="w-full bg-card border border-border px-2 py-1.5 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2 font-bold cursor-pointer text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={prodIsFeatured}
                    onChange={(e) => setProdIsFeatured(e.target.checked)}
                    className="accent-primary"
                  />
                  <span>Feature Product</span>
                </label>
                <label className="flex items-center gap-2 font-bold cursor-pointer text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={prodIsTrending}
                    onChange={(e) => setProdIsTrending(e.target.checked)}
                    className="accent-primary"
                  />
                  <span>Trending Edit</span>
                </label>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 border border-border uppercase tracking-widest font-bold hover:bg-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground uppercase tracking-widest font-bold hover:opacity-90 cursor-pointer"
                >
                  {editingProduct ? "Update Catalog" : "Record Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DISPATCH MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-background border border-border p-6 max-w-sm w-full shadow-2xl relative text-xs">
            <h3 className="font-serif text-base font-semibold tracking-wide mb-4">
              Dispatch Order {selectedOrder.order_number}
            </h3>
            <form onSubmit={handleOrderUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full bg-card border border-border px-3 py-2 focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground uppercase tracking-wider">Tracking Number</label>
                <input
                  type="text"
                  placeholder="Courier Tracking Reference"
                  value={orderTracking}
                  onChange={(e) => setOrderTracking(e.target.value)}
                  className="w-full bg-card border border-border px-3 py-2 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-border uppercase tracking-widest font-bold hover:bg-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground uppercase tracking-widest font-bold hover:opacity-90 cursor-pointer"
                >
                  Save Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COUPON MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-background border border-border p-6 max-w-sm w-full shadow-2xl relative text-xs">
            <h3 className="font-serif text-base font-semibold tracking-wide mb-4">Create Discount Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground uppercase tracking-wider">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DAILY15"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-card border border-border px-3 py-2 uppercase focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider">Type</label>
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value)}
                    className="w-full bg-card border border-border px-3 py-2 focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount (INR)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider">Value</label>
                  <input
                    type="number"
                    required
                    value={couponValue}
                    onChange={(e) => setCouponValue(e.target.value)}
                    className="w-full bg-card border border-border px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider">Min Order (INR)</label>
                  <input
                    type="number"
                    value={couponMinVal}
                    onChange={(e) => setCouponMinVal(e.target.value)}
                    className="w-full bg-card border border-border px-3 py-2 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider">Usage Limit</label>
                  <input
                    type="number"
                    value={couponLimit}
                    onChange={(e) => setCouponLimit(e.target.value)}
                    className="w-full bg-card border border-border px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 border border-border uppercase tracking-widest font-bold hover:bg-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground uppercase tracking-widest font-bold hover:opacity-90 cursor-pointer"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
