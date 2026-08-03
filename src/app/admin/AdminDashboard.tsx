"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
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
  Settings,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Metrics
  const [metrics, setMetrics] = useState({
    revenue: 0,
    orders: 0,
    avgValue: 0,
    activeCoupons: 0,
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

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passMsg, setPassMsg] = useState("");
  const [passMsgType, setPassMsgType] = useState<"success" | "error">("success");
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
  // Advanced dynamic color variants & sizes matrix
  const [prodColors, setProdColors] = useState<Array<{
    id?: string;
    name: string;
    hex: string;
    sku: string;
    thumbnail: string;
    gallery: string[];
    sizes: Record<string, number>;
  }>>([]);

  // File Upload State and Helpers
  const [uploadingIndex, setUploadingIndex] = useState<string | null>(null);

  const uploadImageFile = async (file: File): Promise<string> => {
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
    const filePath = `catalog/${fileName}`;

    try {
      // 1. Ensure public products storage bucket exists
      try {
        await supabase.storage.createBucket("products", { public: true });
      } catch (e) {
        // Handled silently
      }

      // 2. Upload file
      const { data, error } = await supabase.storage
        .from("products")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // 3. Return public path
      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err) {
      console.warn("Storage upload failed, using FileReader Base64 fallback:", err);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("File reading failed"));
        reader.readAsDataURL(file);
      });
    }
  };

  const handleThumbnailFileChange = async (colorIdx: number, file: File) => {
    setUploadingIndex(`thumb-${colorIdx}`);
    try {
      const url = await uploadImageFile(file);
      const nextColors = [...prodColors];
      nextColors[colorIdx].thumbnail = url;
      setProdColors(nextColors);
    } catch (err) {
      console.error("Thumbnail upload failed:", err);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleGalleryFilesChange = async (colorIdx: number, files: FileList) => {
    setUploadingIndex(`gallery-${colorIdx}`);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImageFile(files[i]);
        urls.push(url);
      }
      const nextColors = [...prodColors];
      nextColors[colorIdx].gallery = [...nextColors[colorIdx].gallery, ...urls];
      setProdColors(nextColors);
    } catch (err) {
      console.error("Gallery upload failed:", err);
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeGalleryImage = (colorIdx: number, imgIdx: number) => {
    const nextColors = [...prodColors];
    nextColors[colorIdx].gallery = nextColors[colorIdx].gallery.filter((_, idx) => idx !== imgIdx);
    setProdColors(nextColors);
  };

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

  // Category Form State
  const [newCatName, setNewCatName] = useState("");
  const [newCatDescription, setNewCatDescription] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSavingCategory(true);
    const supabase = createClient();
    try {
      const slug = newCatName.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
      const { error } = await supabase
        .from("categories")
        .insert({
          name: newCatName.trim(),
          slug,
          description: newCatDescription.trim() || null,
        });

      if (error) throw error;
      setNewCatName("");
      setNewCatDescription("");
      alert("Category created successfully!");
      loadAdminData();
    } catch (err: any) {
      console.error(err);
      alert("Error creating category: " + (err.message || err));
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("Are you sure you want to delete this category? Products in this category will become uncategorized.")) return;
    const supabase = createClient();
    try {
      const { error } = await supabase.from("categories").delete().eq("id", catId);
      if (error) throw error;
      loadAdminData();
    } catch (err: any) {
      console.error(err);
      alert("Error deleting category: " + (err.message || err));
    }
  };

  // Settings Tab states
  const [announcements, setAnnouncements] = useState<string[]>([
    "Free Shipping on all orders above ₹2,999"
  ]);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  const handleAddAnnouncement = () => {
    setAnnouncements([...announcements, ""]);
  };

  const handleRemoveAnnouncement = (index: number) => {
    const updated = [...announcements];
    updated.splice(index, 1);
    setAnnouncements(updated);
  };

  const handleAnnouncementChange = (index: number, val: string) => {
    const updated = [...announcements];
    updated[index] = val;
    setAnnouncements(updated);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsMsg("");
    try {
      const supabase = createClient();
      const filtered = announcements.filter(t => t.trim() !== "");
      if (filtered.length === 0) {
        filtered.push("Free Shipping on all orders above ₹2,999");
      }
      const { error } = await supabase
        .from("settings")
        .upsert({
          key: "announcement_bar",
          value: { announcements: filtered }
        });
      if (error) throw error;
      setAnnouncements(filtered);
      setSettingsMsg("Settings saved successfully!");
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      setSettingsMsg("Error: " + (err.message || "Failed to save settings."));
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg("");

    if (newPassword.length < 8) {
      setPassMsg("New password must be at least 8 characters.");
      setPassMsgType("error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg("New passwords do not match.");
      setPassMsgType("error");
      return;
    }

    setIsChangingPass(true);
    try {
      const supabase = createClient();

      // Re-authenticate with current password first
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email;
      if (!email) throw new Error("Not authenticated.");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInError) {
        setPassMsg("Current password is incorrect.");
        setPassMsgType("error");
        return;
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      setPassMsg("Password changed successfully!");
      setPassMsgType("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPassMsg(err.message || "Failed to change password.");
      setPassMsgType("error");
    } finally {
      setIsChangingPass(false);
    }
  };

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
      // Products query updated to new colors and sizes schema
      const { data: prods } = await supabase
        .from("products")
        .select(`
          *,
          category:categories (id, name),
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
        .order("created_at", { ascending: false });

      if (prods) {
        const mappedProds = prods.map((p: any) => {
          const firstColor = p.colors?.[0] || { color_name: "Default", thumbnail: "", sizes: [], images: [] };
          return {
            ...p,
            price: Number(p.mrp || 0),
            sale_price: p.selling_price ? Number(p.selling_price) : null,
            material: p.fabric || null,
            care_instructions: p.fit || null,
            images: (firstColor.images || []).map((img: any) => ({ url: img.image || img, alt_text: "" })).concat(
              firstColor.thumbnail ? [{ url: firstColor.thumbnail, alt_text: "" }] : []
            ),
            variants: (firstColor.sizes || []).map((s: any) => ({
              id: s.id,
              size: s.size,
              color: firstColor.color_name,
              inventory: [{ quantity: s.stock }]
            }))
          };
        });
        setProducts(mappedProds);
      } else {
        setProducts([]);
      }

      // Orders
      const { data: ords } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id, quantity, price,
            product:products (
              id, name, slug,
              colors:product_colors (
                thumbnail,
                images:product_images ( image )
              )
            )
          )
        `)
        .order("created_at", { ascending: false });
      setOrders(ords || []);

      // Coupons
      const { data: coups } = await supabase.from("coupons").select("*");
      setCoupons(coups || []);

      // Calculate dynamic real-time metrics
      const activeOrders = (ords || []).filter(o => o.status !== "cancelled");
      const realOrdersCount = ords ? ords.length : 0;
      const realRevenue = activeOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const realAvgValue = realOrdersCount > 0 ? Math.round(realRevenue / realOrdersCount) : 0;
      const activeCoupsCount = (coups || []).filter(c => {
        if (!c.active_to) return true;
        return new Date(c.active_to) > new Date();
      }).length;

      setMetrics({
        revenue: realRevenue,
        orders: realOrdersCount,
        avgValue: realAvgValue,
        activeCoupons: activeCoupsCount,
      });

      // Settings
      const { data: annSetting } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "announcement_bar")
        .maybeSingle();
      if (annSetting?.value && typeof annSetting.value === "object") {
        if ("announcements" in annSetting.value && Array.isArray((annSetting.value as any).announcements)) {
          setAnnouncements((annSetting.value as any).announcements);
        } else if ("text" in annSetting.value) {
          setAnnouncements([(annSetting.value as any).text]);
        }
      } else {
        setAnnouncements(["Free Shipping on all orders above ₹2,999"]);
      }

      // Low Stock inventory check mapping to new tables
      const { data: stockAlerts } = await supabase
        .from("product_sizes")
        .select(`
          stock,
          size,
          product_color:product_color_id (
            color_name,
            product:product_id (
              name
            )
          )
        `)
        .lt("stock", 5);

      if (stockAlerts) {
        setLowStock(
          stockAlerts.map((s: any) => ({
            quantity: s.stock,
            variant: {
              size: s.size,
              color: s.product_color?.color_name,
              product: {
                name: s.product_color?.product?.name
              }
            }
          }))
        );
      } else {
        setLowStock([]);
      }

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
      // 1. Zod Validation Checks
      const colorSchema = z.object({
        name: z.string().min(1, "Color name is required"),
        hex: z.string().min(3, "Hex code must be valid (e.g. #000000)"),
        sku: z.string().min(1, "Color SKU is required"),
        thumbnail: z.string().url("Thumbnail must be a valid URL"),
        gallery: z.array(z.string().url("Gallery images must be valid URLs")).min(1, "Each color variant must have at least one gallery image"),
        sizes: z.record(z.string(), z.number().min(0, "Stock cannot be negative"))
      });

      const productFormSchema = z.object({
        name: z.string().min(3, "Product name must be at least 3 characters"),
        description: z.string().min(5, "Description must be at least 5 characters"),
        mrp: z.number().min(0, "MRP must be positive"),
        selling_price: z.number().min(0, "Selling price must be positive"),
        colors: z.array(colorSchema).min(1, "Product must have at least one color variant"),
        status: z.string()
      }).refine(data => data.selling_price <= data.mrp, {
        message: "Selling price cannot exceed MRP",
        path: ["selling_price"]
      });

      const parsedMRP = parseFloat(prodPrice) || 0;
      const parsedSellingPrice = parseFloat(prodSalePrice) || parsedMRP;

      const validationResult = productFormSchema.safeParse({
        name: prodName,
        description: prodDescription,
        mrp: parsedMRP,
        selling_price: parsedSellingPrice,
        colors: prodColors,
        status: prodStatus
      });

      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(issue => issue.message).join("\n");
        alert("Validation Error:\n" + errors);
        return;
      }

      // Check if product is published but has zero total stock
      const totalStock = prodColors.reduce((acc, col) => {
        return acc + Object.values(col.sizes).reduce((sAcc, stk) => sAcc + Number(stk), 0);
      }, 0);

      if (prodStatus === "published" && totalStock <= 0) {
        alert("Validation Error: Cannot publish product with 0 total stock inventory.");
        return;
      }

      let activeProdId = editingProduct?.id;

      // 2. Perform DB Insertion/Update
      if (editingProduct) {
        // Update product
        const payload: any = {
          name: prodName,
          description: prodDescription,
          mrp: parsedMRP,
          selling_price: parsedSellingPrice,
          category_id: prodCategoryId || null,
          category: categories.find(c => c.id === prodCategoryId)?.name || null,
          fabric: prodMaterial || null,
          fit: prodCare || null,
          status: prodStatus,
          is_featured: prodIsFeatured,
          is_trending: prodIsTrending,
        };

        let { error: updateErr } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);

        if (updateErr && updateErr.message.includes("category")) {
          console.warn("Retrying update without 'category' column due to schema cache mismatch.");
          delete payload.category;
          const { error: retryErr } = await supabase
            .from("products")
            .update(payload)
            .eq("id", editingProduct.id);
          updateErr = retryErr;
        }

        if (updateErr) throw updateErr;

        // Clean slate update for colors, sizes and images
        await supabase.from("product_colors").delete().eq("product_id", editingProduct.id);

        for (const col of prodColors) {
          const { data: newCol, error: colErr } = await supabase
            .from("product_colors")
            .insert({
              product_id: editingProduct.id,
              color_name: col.name,
              hex_code: col.hex,
              sku: col.sku,
              thumbnail: col.thumbnail,
              status: "active"
            })
            .select("id")
            .single();

          if (colErr || !newCol) throw colErr;

          // Insert sizes
          const sizeInserts = Object.entries(col.sizes).map(([sz, stock]) => ({
            product_color_id: newCol.id,
            size: sz,
            stock: Number(stock),
            sku: `${col.sku}-${sz}`,
          }));
          await supabase.from("product_sizes").insert(sizeInserts);

          // Insert gallery images
          if (col.gallery && col.gallery.length > 0) {
            const imgInserts = col.gallery.map((img, idx) => ({
              product_color_id: newCol.id,
              image: img,
              display_order: idx + 1,
            }));
            await supabase.from("product_images").insert(imgInserts);
          }
        }
      } else {
        // Create product
        const baseSlug = prodName.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        const suffix = Math.random().toString(36).substring(2, 6);
        const prodSlug = `${baseSlug}-${suffix}`;
        const payload: any = {
          name: prodName,
          slug: prodSlug,
          description: prodDescription,
          mrp: parsedMRP,
          selling_price: parsedSellingPrice,
          category_id: prodCategoryId || null,
          category: categories.find(c => c.id === prodCategoryId)?.name || null,
          fabric: prodMaterial || null,
          fit: prodCare || null,
          status: prodStatus,
          is_featured: prodIsFeatured,
          is_trending: prodIsTrending,
        };

        let { data: newProd, error: createErr } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();

        if (createErr && createErr.message.includes("category")) {
          console.warn("Retrying insert without 'category' column due to schema cache mismatch.");
          delete payload.category;
          const { data: retryProd, error: retryErr } = await supabase
            .from("products")
            .insert(payload)
            .select("id")
            .single();
          newProd = retryProd;
          createErr = retryErr;
        }

        if (createErr || !newProd) throw createErr || new Error("Failed to create product");
        activeProdId = newProd.id;

        for (const col of prodColors) {
          const { data: newCol, error: colErr } = await supabase
            .from("product_colors")
            .insert({
              product_id: newProd.id,
              color_name: col.name,
              hex_code: col.hex,
              sku: col.sku,
              thumbnail: col.thumbnail,
              status: "active"
            })
            .select("id")
            .single();

          if (colErr || !newCol) throw colErr;

          // Insert sizes
          const sizeInserts = Object.entries(col.sizes).map(([sz, stock]) => ({
            product_color_id: newCol.id,
            size: sz,
            stock: Number(stock),
            sku: `${col.sku}-${sz}`,
          }));
          await supabase.from("product_sizes").insert(sizeInserts);

          // Insert gallery images
          if (col.gallery && col.gallery.length > 0) {
            const imgInserts = col.gallery.map((img, idx) => ({
              product_color_id: newCol.id,
              image: img,
              display_order: idx + 1,
            }));
            await supabase.from("product_images").insert(imgInserts);
          }
        }
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
      clearProductForm();
      loadAdminData();
    } catch (err: any) {
      console.error(err);
      alert("Error saving product: " + (err.message || err));
    }
  };

  const handleEditProductClick = (p: any) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdDescription(p.description || "");
    setProdPrice((p.mrp || p.price || "").toString());
    setProdSalePrice((p.selling_price || p.sale_price || "").toString());
    setProdCategoryId(p.category_id || "");
    setProdMaterial(p.fabric || p.material || "");
    setProdCare(p.fit || p.care_instructions || "");
    setProdStatus(p.status);
    setProdIsFeatured(p.is_featured);
    setProdIsTrending(p.is_trending);
    
    if (p.colors && p.colors.length > 0) {
      setProdColors(p.colors.map((c: any) => {
        const sizeStockMap: Record<string, number> = {};
        (c.sizes || []).forEach((s: any) => {
          sizeStockMap[s.size] = s.stock;
        });
        return {
          id: c.id,
          name: c.color_name,
          hex: c.hex_code,
          sku: c.sku,
          thumbnail: c.thumbnail,
          gallery: (c.images || []).map((img: any) => img.image || img),
          sizes: sizeStockMap,
        };
      }));
    } else {
      setProdColors([]);
    }
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (pId: string) => {
    if (!confirm(
      "Are you sure you want to permanently delete this product?\n\n" +
      "⚠ This will also remove any order line items linked to it.\n\n" +
      "This cannot be undone."
    )) return;

    const supabase = createClient();
    try {
      // 1. Get all color variant IDs for this product
      const { data: colorRows } = await supabase
        .from("product_colors")
        .select("id")
        .eq("product_id", pId);

      const colorIds = (colorRows || []).map((c: any) => c.id);

      // 2. Delete order_items that reference this product directly
      //    (FK: order_items.product_id → products.id, NOT NULL constraint)
      await supabase
        .from("order_items")
        .delete()
        .eq("product_id", pId);

      // 3. Delete order_items that reference any color variant of this product
      if (colorIds.length > 0) {
        // Some schemas use product_color_id on order_items
        const { error: oiErr } = await supabase
          .from("order_items")
          .delete()
          .in("product_color_id", colorIds);
        // Ignore error here — column may not exist in all schemas
      }

      // 4. Delete product_images for all colors
      if (colorIds.length > 0) {
        await supabase
          .from("product_images")
          .delete()
          .in("product_color_id", colorIds);

        // 5. Delete product_sizes for all colors
        await supabase
          .from("product_sizes")
          .delete()
          .in("product_color_id", colorIds);

        // 6. Delete product_colors
        await supabase
          .from("product_colors")
          .delete()
          .eq("product_id", pId);
      }

      // 7. Finally delete the product itself
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", pId);

      if (error) throw error;

      // Update UI immediately, then refresh full data
      setProducts((prev: any[]) => prev.filter((p) => p.id !== pId));
      loadAdminData();
    } catch (err: any) {
      console.error("Delete product error:", err);
      alert("Failed to delete product: " + (err.message || "Unknown error"));
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
    setProdColors([]);
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
            { id: "categories", label: "Categories Catalog", icon: Sliders },
            { id: "orders", label: "Orders Ledger", icon: Truck },
            { id: "coupons", label: "Coupons Manager", icon: Tag },
            { id: "settings", label: "Store Settings", icon: Settings },
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
                  <Link
                    href="/admin/products/form"
                    className="bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Create Product</span>
                  </Link>
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
                                <Link
                                  href={`/admin/products/form?id=${p.id}`}
                                  className="p-1 hover:text-primary cursor-pointer flex items-center justify-center"
                                  aria-label="Edit"
                                >
                                  <Edit2 size={14} />
                                </Link>
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

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-lg font-semibold tracking-wide text-foreground">Store Settings</h3>
                  <p className="text-muted-foreground text-xs">Configure global atelier configurations and announcement banners.</p>
                </div>

                <div className="bg-card border border-border p-6 max-w-2xl space-y-6">
                  <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">
                          Store Announcement Slides
                        </label>
                        <button
                          type="button"
                          onClick={handleAddAnnouncement}
                          className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={12} />
                          <span>Add Slide</span>
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {announcements.map((text, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              required
                              value={text}
                              onChange={(e) => handleAnnouncementChange(idx, e.target.value)}
                              className="flex-1 bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary text-foreground"
                              placeholder={`Announcement #${idx + 1}`}
                            />
                            {announcements.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveAnnouncement(idx)}
                                className="text-muted-foreground hover:text-destructive p-2 cursor-pointer"
                                aria-label="Remove announcement"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground">These messages will slide/fade automatically at the top of the header bar.</p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-6 py-2.5 bg-primary text-primary-foreground uppercase tracking-widest font-bold text-xs hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingSettings ? "Saving..." : "Save Settings"}
                    </button>
                    {settingsMsg && (
                      <p className={`text-xs font-semibold mt-2 ${settingsMsg.startsWith("Error") ? "text-destructive" : "text-accent"}`}>
                        {settingsMsg}
                      </p>
                    )}
                  </form>
                </div>

                {/* ── Change Admin Password Card ── */}
                <div className="bg-card border border-border p-6 max-w-2xl space-y-5">
                  <div>
                    <h4 className="font-serif text-base font-semibold text-foreground">Change Admin Password</h4>
                    <p className="text-muted-foreground text-xs mt-0.5">Update your admin account password.</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4 text-xs" noValidate>
                    {/* Current Password */}
                    <div className="space-y-1.5">
                      <label htmlFor="admin-current-pass" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
                        <input
                          id="admin-current-pass"
                          type={showCurrentPass ? "text" : "password"}
                          placeholder="Enter current password"
                          value={currentPassword}
                          onChange={(e) => { setCurrentPassword(e.target.value); setPassMsg(""); }}
                          required
                          autoComplete="current-password"
                          className="w-full bg-background border border-border pl-8 pr-8 py-2 text-xs focus:outline-none focus:border-primary transition"
                        />
                        <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} tabIndex={-1}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                          {showCurrentPass ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="admin-new-pass" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
                          <input
                            id="admin-new-pass"
                            type={showNewPass ? "text" : "password"}
                            placeholder="Min 8 characters"
                            value={newPassword}
                            onChange={(e) => { setNewPassword(e.target.value); setPassMsg(""); }}
                            required
                            autoComplete="new-password"
                            className="w-full bg-background border border-border pl-8 pr-8 py-2 text-xs focus:outline-none focus:border-primary transition"
                          />
                          <button type="button" onClick={() => setShowNewPass(!showNewPass)} tabIndex={-1}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                            {showNewPass ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="admin-confirm-pass" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
                          <input
                            id="admin-confirm-pass"
                            type={showConfirmPass ? "text" : "password"}
                            placeholder="Repeat new password"
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setPassMsg(""); }}
                            required
                            autoComplete="new-password"
                            className={`w-full bg-background border pl-8 pr-8 py-2 text-xs focus:outline-none transition ${
                              confirmPassword && confirmPassword !== newPassword ? "border-destructive" : "border-border focus:border-primary"
                            }`}
                          />
                          <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} tabIndex={-1}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                            {showConfirmPass ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                        {confirmPassword && confirmPassword !== newPassword && (
                          <p className="text-[10px] text-destructive font-semibold">Passwords do not match</p>
                        )}
                      </div>
                    </div>

                    {passMsg && (
                      <p className={`text-xs font-semibold ${passMsgType === "success" ? "text-accent" : "text-destructive"}`}>
                        {passMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isChangingPass || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                      className="px-6 py-2.5 bg-primary text-primary-foreground uppercase tracking-widest font-bold text-xs hover:opacity-90 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isChangingPass ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "categories" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-serif text-lg font-semibold tracking-wide text-foreground">Categories Catalog</h3>
                    <p className="text-muted-foreground text-xs">Manage product groupings and navigation labels.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Category Table */}
                  <div className="lg:col-span-2 bg-card border border-border p-5 overflow-x-auto rounded-sm">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider">
                          <th className="py-2.5">Category Name</th>
                          <th className="py-2.5">Slug</th>
                          <th className="py-2.5">Description</th>
                          <th className="py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        {categories.map((c) => (
                          <tr key={c.id} className="border-b border-border hover:bg-secondary/10">
                            <td className="py-3 font-bold text-foreground">{c.name}</td>
                            <td className="py-3 font-mono">{c.slug}</td>
                            <td className="py-3 max-w-[200px] truncate">{c.description || "—"}</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => handleDeleteCategory(c.id)}
                                className="p-1 hover:text-destructive cursor-pointer"
                                aria-label="Delete Category"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Create Category Form */}
                  <div className="bg-card border border-border p-5 space-y-4 rounded-sm">
                    <h4 className="font-serif text-sm font-semibold tracking-wide border-b border-border pb-2">
                      New Category
                    </h4>
                    <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-muted-foreground uppercase tracking-widest text-[9px]">
                          Category Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          className="w-full bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary text-foreground"
                          placeholder="e.g. Kurta Sets"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-muted-foreground uppercase tracking-widest text-[9px]">
                          Description (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={newCatDescription}
                          onChange={(e) => setNewCatDescription(e.target.value)}
                          className="w-full bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary text-foreground"
                          placeholder="Brief description of fabrics or styles"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSavingCategory}
                        className="w-full px-4 py-2.5 bg-primary text-primary-foreground uppercase tracking-widest font-bold text-xs hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                      >
                        {isSavingCategory ? "Creating..." : "Add Category"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>


      {/* ORDER DISPATCH MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-background border border-border p-6 max-w-3xl w-full shadow-2xl relative text-xs rounded-sm my-8">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground text-base cursor-pointer"
            >
              ✕
            </button>
            
            <h3 className="font-serif text-lg font-semibold tracking-wide mb-6 border-b border-border pb-3">
              Order Details & Dispatch: {selectedOrder.order_number}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Customer details, address, payment details */}
              <div className="space-y-5">
                <div>
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Shipping Information</h4>
                  <div className="bg-secondary/10 border border-border/60 p-3 space-y-1 text-foreground">
                    <p className="font-bold">{selectedOrder.shipping_address?.fullName || "Guest Patron"}</p>
                    {selectedOrder.shipping_address?.phone && (
                      <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.shipping_address.phone}</p>
                    )}
                    <p>{selectedOrder.shipping_address?.addressLine1}</p>
                    {selectedOrder.shipping_address?.addressLine2 && <p>{selectedOrder.shipping_address.addressLine2}</p>}
                    <p>
                      {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.postalCode}
                    </p>
                    <p>{selectedOrder.shipping_address?.country || "India"}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Payment Details</h4>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-border/30 py-1.5 flex justify-between">
                        <td className="text-muted-foreground">Payment Method:</td>
                        <td className="font-semibold uppercase text-foreground">{selectedOrder.payment_method || "COD"}</td>
                      </tr>
                      <tr className="border-b border-border/30 py-1.5 flex justify-between">
                        <td className="text-muted-foreground">Payment Status:</td>
                        <td className="font-bold uppercase text-foreground">{selectedOrder.payment_status || "Unpaid"}</td>
                      </tr>
                      <tr className="border-b border-border/30 py-1.5 flex justify-between">
                        <td className="text-muted-foreground">Subtotal:</td>
                        <td className="font-semibold text-foreground">{formatPrice(selectedOrder.subtotal)}</td>
                      </tr>
                      {selectedOrder.discount_amount > 0 && (
                        <tr className="border-b border-border/30 py-1.5 flex justify-between">
                          <td className="text-muted-foreground">Discount ({selectedOrder.coupon_code || "Coupon"}):</td>
                          <td className="font-semibold text-destructive">-{formatPrice(selectedOrder.discount_amount)}</td>
                        </tr>
                      )}
                      <tr className="border-b border-border/30 py-1.5 flex justify-between">
                        <td className="text-muted-foreground">Shipping:</td>
                        <td className="font-semibold text-foreground">{formatPrice(selectedOrder.shipping)}</td>
                      </tr>
                      <tr className="py-2 flex justify-between text-sm font-bold border-t border-border">
                        <td className="text-foreground">Total:</td>
                        <td className="text-accent">{formatPrice(selectedOrder.total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Ordered items and Status update form */}
              <div className="space-y-5">
                <div>
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Ordered Items</h4>
                  <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1 border border-border/40 p-3 bg-secondary/5">
                    {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                      selectedOrder.order_items.map((item: any, idx: number) => {
                        const fc = item.product?.colors?.[0];
                        const img = fc?.images?.[0]?.image || fc?.thumbnail || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop";
                        return (
                          <div key={idx} className="flex gap-3 text-xs items-center justify-between">
                            <div className="flex gap-2 items-center">
                              <div className="relative w-8 h-10 border border-border shrink-0">
                                <Image src={img} alt={item.product?.name || ""} fill className="object-cover" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground truncate max-w-[150px]">{item.product?.name || "Product Name"}</p>
                                <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-semibold text-foreground">{formatPrice(item.price)}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No item details found.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Dispatch Control</h4>
                  <form onSubmit={handleOrderUpdate} className="space-y-3 bg-secondary/10 border border-border/60 p-4">
                    <div className="space-y-1">
                      <label className="font-bold text-muted-foreground uppercase tracking-wider text-[9px]">Status</label>
                      <select
                        value={orderStatus}
                        onChange={(e) => setOrderStatus(e.target.value)}
                        className="w-full bg-background border border-border px-3 py-2 focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-muted-foreground uppercase tracking-wider text-[9px]">Tracking Number</label>
                      <input
                        type="text"
                        placeholder="e.g. Courier Tracking Reference"
                        value={orderTracking}
                        onChange={(e) => setOrderTracking(e.target.value)}
                        className="w-full bg-background border border-border px-3 py-2 focus:outline-none"
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
            </div>
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
