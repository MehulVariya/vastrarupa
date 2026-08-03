"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Plus, ArrowLeft, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function ProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Form State
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

  // ── Fabric Details (per garment component) ──
  const [lehenkaFabric, setLehengaFabric] = useState("");
  const [lehenkaWork, setLehengaWork] = useState("");
  const [lehenkaInner, setLehengaInner] = useState("");
  const [lehenkaFlair, setLehengaFlair] = useState("");
  const [lehenkaSize, setLehengaSize] = useState("");
  const [choliFabric, setCholiFabric] = useState("");
  const [choliWork, setCholiWork] = useState("");
  const [choliSize, setCholiSize] = useState("");
  const [dupattaFabric, setDupattaFabric] = useState("");
  const [dupattaWork, setDupattaWork] = useState("");
  const [dupattaLength, setDupattaLength] = useState("");
  const [packageContents, setPackageContents] = useState("");
  const [productWeight, setProductWeight] = useState("");
  const [occasions, setOccasions] = useState("");

  // ── SEO Information State ──
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [prodSlug, setProdSlug] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [robotsSetting, setRobotsSetting] = useState("index, follow");

  const nameTouched = useRef(false);
  const descTouched = useRef(false);
  const slugTouched = useRef(false);

  // ── Fabric Template (localStorage) ──
  const TEMPLATES_KEY = "vr_fabric_templates";
  const [templateMsg, setTemplateMsg] = useState("");
  const [templateMsgType, setTemplateMsgType] = useState<"success" | "info">("success");

  // State for loading modal
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<string[]>([]);

  const getAllFabricFields = () => ({
    lehenkaFabric, lehenkaWork, lehenkaInner, lehenkaFlair, lehenkaSize,
    choliFabric, choliWork, choliSize,
    dupattaFabric, dupattaWork, dupattaLength,
    packageContents, productWeight, occasions,
  });

  const applyFabricFields = (t: Record<string, string>) => {
    if (t.lehenkaFabric !== undefined) setLehengaFabric(t.lehenkaFabric);
    if (t.lehenkaWork   !== undefined) setLehengaWork(t.lehenkaWork);
    if (t.lehenkaInner  !== undefined) setLehengaInner(t.lehenkaInner);
    if (t.lehenkaFlair  !== undefined) setLehengaFlair(t.lehenkaFlair);
    if (t.lehenkaSize   !== undefined) setLehengaSize(t.lehenkaSize);
    if (t.choliFabric   !== undefined) setCholiFabric(t.choliFabric);
    if (t.choliWork     !== undefined) setCholiWork(t.choliWork);
    if (t.choliSize     !== undefined) setCholiSize(t.choliSize);
    if (t.dupattaFabric !== undefined) setDupattaFabric(t.dupattaFabric);
    if (t.dupattaWork   !== undefined) setDupattaWork(t.dupattaWork);
    if (t.dupattaLength !== undefined) setDupattaLength(t.dupattaLength);
    if (t.packageContents !== undefined) setPackageContents(t.packageContents);
    if (t.productWeight   !== undefined) setProductWeight(t.productWeight);
    if (t.occasions       !== undefined) setOccasions(t.occasions);
  };

  const getSavedTemplatesDict = (): Record<string, any> => {
    try {
      const raw = localStorage.getItem(TEMPLATES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const handleSaveFabricTemplate = () => {
    const templateName = prompt("Enter a name for this fabric template:");
    if (!templateName || !templateName.trim()) return;

    const trimmedName = templateName.trim();
    try {
      const currentDict = getSavedTemplatesDict();
      currentDict[trimmedName] = getAllFabricFields();
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(currentDict));
      setTemplateMsgType("success");
      setTemplateMsg(`✓ Template "${trimmedName}" saved!`);
      setTimeout(() => setTemplateMsg(""), 3500);
    } catch {
      setTemplateMsg("Failed to save template.");
    }
  };

  const handleLoadFabricTemplate = () => {
    const dict = getSavedTemplatesDict();
    const names = Object.keys(dict);
    if (names.length === 0) {
      setTemplateMsgType("info");
      setTemplateMsg("No saved templates found. Save one first.");
      setTimeout(() => setTemplateMsg(""), 3000);
      return;
    }
    setAvailableTemplates(names);
    setShowLoadModal(true);
  };

  const handleLoadSpecificTemplate = (name: string) => {
    const dict = getSavedTemplatesDict();
    const selected = dict[name];
    if (selected) {
      applyFabricFields(selected);
      setTemplateMsgType("success");
      setTemplateMsg(`✓ Template "${name}" loaded!`);
      setTimeout(() => setTemplateMsg(""), 3000);
    }
    setShowLoadModal(false);
  };

  const handleDeleteTemplate = (name: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering load
    if (!confirm(`Are you sure you want to delete template "${name}"?`)) return;

    const dict = getSavedTemplatesDict();
    delete dict[name];
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(dict));

    const updatedNames = Object.keys(dict);
    setAvailableTemplates(updatedNames);
    if (updatedNames.length === 0) {
      setShowLoadModal(false);
    }
  };

  const handleClearFabricFields = () => {
    setLehengaFabric(""); setLehengaWork(""); setLehengaInner(""); setLehengaFlair(""); setLehengaSize("");
    setCholiFabric(""); setCholiWork(""); setCholiSize("");
    setDupattaFabric(""); setDupattaWork(""); setDupattaLength("");
    setPackageContents(""); setProductWeight(""); setOccasions("");
  };

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

  const [uploadingIndex, setUploadingIndex] = useState<string | null>(null);

  // Load categories and initial product data if editId is provided
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      const supabase = createClient();
      try {
        // Load categories
        const { data: cats } = await supabase.from("categories").select("*");
        setCategories(cats || []);

        if (editId) {
          // Load product to edit
          const { data: p, error } = await supabase
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
            .eq("id", editId)
            .single();

          if (error) throw error;
          if (p) {
            setProdName(p.name);
            setProdDescription(p.description || "");
            setProdPrice((p.mrp || p.price || "").toString());
            setProdSalePrice((p.selling_price || p.sale_price || "").toString());
            // Use joined category.id as the most reliable source
            setProdCategoryId(p.category_id || p.category?.id || "");
            setProdMaterial(p.fabric || p.material || "");
            setProdCare(p.fit || p.care_instructions || "");
            setProdStatus(p.status);
            setProdIsFeatured(p.is_featured);
            setProdIsTrending(p.is_trending);

            // Load fabric details from JSON field
            const fd = p.fabric_details || {};
            setLehengaFabric(fd.lehenga?.fabric || "");
            setLehengaWork(fd.lehenga?.work || "");
            setLehengaInner(fd.lehenga?.inner || "");
            setLehengaFlair(fd.lehenga?.flair || "");
            setLehengaSize(fd.lehenga?.size || "");
            setCholiFabric(fd.choli?.fabric || "");
            setCholiWork(fd.choli?.work || "");
            setCholiSize(fd.choli?.size || "");
            setDupattaFabric(fd.dupatta?.fabric || "");
            setDupattaWork(fd.dupatta?.work || "");
            setDupattaLength(fd.dupatta?.length || "");
            setPackageContents(fd.packageContents || "");
            setProductWeight(fd.weight || "");
            setOccasions(fd.occasions || "");

            // Load SEO details from JSON field
            const seo = p.seo_details || {};
            setSeoTitle(seo.title || "");
            setMetaDescription(seo.meta_description || "");
            setProdSlug(p.slug || "");
            setFocusKeyword(seo.focus_keyword || "");
            setCanonicalUrl(seo.canonical_url || "");
            setRobotsSetting(seo.robots || "index, follow");

            nameTouched.current = !!seo.title;
            descTouched.current = !!seo.meta_description;
            slugTouched.current = !!p.slug;

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
            }
          }
        } else {
          // Default initial variant for new product
          setProdColors([
            {
              name: "Ivory",
              hex: "#FFFFF0",
              sku: `SKU-NEW-IVY`,
              thumbnail: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop",
              gallery: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop"],
              sizes: { XS: 0, S: 10, M: 15, L: 10, XL: 5, XXL: 0, "3XL": 0, FS: 0 }
            }
          ]);
          if (cats && cats.length > 0) {
            setProdCategoryId(cats[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load initial form data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [editId]);

  // Auto-fill SEO fields from product name & description
  useEffect(() => {
    if (!editId) {
      if (prodName && !nameTouched.current) {
        setSeoTitle(`${prodName} | Vastrarupa`);
      }
      if (prodName && !slugTouched.current) {
        const baseSlug = prodName.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        setProdSlug(baseSlug);
      }
    }
  }, [prodName, editId]);

  useEffect(() => {
    if (!editId) {
      if (prodDescription && !descTouched.current) {
        const cleanDesc = prodDescription.replace(/<[^>]*>/g, ""); // Strip HTML tags
        setMetaDescription(cleanDesc.slice(0, 155));
      }
    }
  }, [prodDescription, editId]);

  const uploadImageFile = async (file: File): Promise<string> => {
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
    const filePath = `catalog/${fileName}`;

    try {
      try {
        await supabase.storage.createBucket("products", { public: true });
      } catch (e) {
        // Handled silently
      }

      const { error } = await supabase.storage
        .from("products")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err) {
      console.warn("Storage upload failed, using Base64 data URL fallback:", err);
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
      console.error(err);
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
      console.error(err);
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeGalleryImage = (colorIdx: number, imgIdx: number) => {
    const nextColors = [...prodColors];
    nextColors[colorIdx].gallery = nextColors[colorIdx].gallery.filter((_, idx) => idx !== imgIdx);
    setProdColors(nextColors);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
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
        setSaving(false);
        return;
      }

      // Check if product is published but has zero total stock
      const totalStock = prodColors.reduce((acc, col) => {
        return acc + Object.values(col.sizes).reduce((sAcc, stk) => sAcc + Number(stk), 0);
      }, 0);

      if (prodStatus === "published" && totalStock <= 0) {
        alert("Validation Error: Cannot publish product with 0 total stock inventory.");
        setSaving(false);
        return;
      }

      let activeProdId = editId;

      // 1. Probe database schema columns dynamically
      const { data: probeList } = await supabase.from("products").select("*").limit(1);
      let useNewSchema = true;
      let hasCategoryCol = false;
      
      if (probeList && probeList.length > 0) {
        useNewSchema = "mrp" in probeList[0];
        hasCategoryCol = "category" in probeList[0];
      }

      const buildPayload = (newSchema: boolean, includeCategory: boolean) => {
        const fabricDetails = {
          lehenga: {
            fabric: lehenkaFabric || undefined,
            work: lehenkaWork || undefined,
            inner: lehenkaInner || undefined,
            flair: lehenkaFlair || undefined,
            size: lehenkaSize || undefined,
          },
          choli: {
            fabric: choliFabric || undefined,
            work: choliWork || undefined,
            size: choliSize || undefined,
          },
          dupatta: {
            fabric: dupattaFabric || undefined,
            work: dupattaWork || undefined,
            length: dupattaLength || undefined,
          },
          packageContents: packageContents || undefined,
          weight: productWeight || undefined,
          occasions: occasions || undefined,
        };

        const seoDetails = {
          title: seoTitle || undefined,
          meta_description: metaDescription || undefined,
          focus_keyword: focusKeyword || undefined,
          canonical_url: canonicalUrl || undefined,
          robots: robotsSetting || undefined,
        };

        let cleanSlug = (prodSlug || prodName)
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, "");

        if (!cleanSlug) {
          cleanSlug = "product";
        }

        if (!editId) {
          const suffix = Math.random().toString(36).substring(2, 6);
          cleanSlug = `${cleanSlug}-${suffix}`;
        }

        const p: any = {
          name: prodName,
          description: prodDescription,
          category_id: prodCategoryId || null,
          status: prodStatus,
          is_featured: prodIsFeatured,
          is_trending: prodIsTrending,
          fabric_details: fabricDetails,
          seo_details: seoDetails,
          slug: cleanSlug,
        };

        if (newSchema) {
          p.mrp = parsedMRP;
          p.selling_price = parsedSellingPrice;
          p.fabric = prodMaterial || null;
          p.fit = prodCare || null;
        } else {
          p.price = parsedMRP;
          p.sale_price = parsedSellingPrice;
          p.material = prodMaterial || null;
          p.care_instructions = prodCare || null;
        }

        if (includeCategory) {
          p.category = categories.find(c => c.id === prodCategoryId)?.name || null;
        }

        return p;
      };

      const executeSave = async (pPayload: any) => {
        if (editId) {
          const { error } = await supabase
            .from("products")
            .update(pPayload)
            .eq("id", editId);
          return { error, data: null };
        } else {
          const { data, error } = await supabase
            .from("products")
            .insert(pPayload)
            .select("id")
            .single();
          return { error, data };
        }
      };

      // Try first attempt with detected/assumed schema
      let payload = buildPayload(useNewSchema, hasCategoryCol);
      let result = await executeSave(payload);

      // Fallback 1: If database schema is legacy (price/sale_price/material/care_instructions) but we assumed new schema
      if (result.error && useNewSchema && (
        result.error.message.includes("mrp") || 
        result.error.message.includes("selling_price") || 
        result.error.message.includes("fabric") || 
        result.error.message.includes("fit")
      )) {
        console.warn("Attempting fallback to legacy schema columns (price, sale_price, material, care_instructions).");
        useNewSchema = false;
        payload = buildPayload(useNewSchema, hasCategoryCol);
        result = await executeSave(payload);
      }

      // Fallback 2: If we still fail due to category column cache mismatch
      if (result.error && result.error.message.includes("category")) {
        console.warn("Attempting fallback without 'category' column.");
        hasCategoryCol = false;
        payload = buildPayload(useNewSchema, hasCategoryCol);
        result = await executeSave(payload);
      }

      if (result.error) throw result.error;
      activeProdId = editId || result.data?.id;

      if (editId) {
        // Clean slate update
        await supabase.from("product_colors").delete().eq("product_id", editId);

        for (const col of prodColors) {
          const { data: newCol, error: colErr } = await supabase
            .from("product_colors")
            .insert({
              product_id: editId,
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
        for (const col of prodColors) {
          const { data: newCol, error: colErr } = await supabase
            .from("product_colors")
            .insert({
              product_id: activeProdId,
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

      router.push("/admin");
    } catch (err: any) {
      console.error(err);
      alert("Error saving product: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back Link */}
        <div className="flex items-center gap-2">
          <Link href="/admin" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition">
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Title */}
        <div className="border-b border-border pb-4">
          <h1 className="font-serif text-2xl font-semibold tracking-wide">
            {editId ? "Modify Catalog Item" : "Create Catalog Item"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Configure name, prices, fabrics, and size stock quantities.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* General info card */}
          <div className="bg-card border border-border p-6 space-y-4 rounded-sm">
            <div className="space-y-1">
              <label className="font-bold text-muted-foreground uppercase tracking-wider">Product Name</label>
              <input
                type="text"
                required
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-muted-foreground uppercase tracking-wider">Description</label>
              <textarea
                required
                rows={4}
                value={prodDescription}
                onChange={(e) => setProdDescription(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground uppercase tracking-wider">Base Price (MRP - INR)</label>
                <input
                  type="number"
                  required
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground uppercase tracking-wider">Sale Price (INR)</label>
                <input
                  type="number"
                  value={prodSalePrice}
                  onChange={(e) => setProdSalePrice(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                  <button
                    type="button"
                    onClick={async () => {
                      const newCat = prompt("Enter new category name:");
                      if (!newCat || !newCat.trim()) return;
                      const supabase = createClient();
                      const slug = newCat.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
                      try {
                        const { data, error } = await supabase
                          .from("categories")
                          .insert({ name: newCat.trim(), slug })
                          .select("id, name")
                          .single();
                        if (error) throw error;
                        if (data) {
                          setCategories([...categories, data]);
                          setProdCategoryId(data.id);
                        }
                      } catch (err: any) {
                        alert("Error adding category: " + (err.message || err));
                      }
                    }}
                    className="text-[9px] font-bold text-primary hover:underline uppercase tracking-wider cursor-pointer"
                  >
                    + Add New
                  </button>
                </div>
                <select
                  value={prodCategoryId}
                  onChange={(e) => setProdCategoryId(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs"
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
                  className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-muted-foreground uppercase tracking-wider">Care Instructions</label>
              <input
                type="text"
                value={prodCare}
                onChange={(e) => setProdCare(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs"
              />
            </div>
          </div>

          {/* ── FABRIC DETAILS CARD ── */}
          <div className="bg-card border border-border p-6 space-y-5 rounded-sm">
            <div className="border-b border-border pb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-foreground uppercase tracking-widest text-[10px]">Fabric Details</h3>
                <p className="text-[9px] text-muted-foreground mt-0.5">Specify fabric, work, and size info per garment component.</p>
              </div>
              {/* Template Actions */}
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleLoadFabricTemplate}
                    className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest border border-border px-2.5 py-1.5 hover:bg-secondary transition cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    📂 Load Template
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveFabricTemplate}
                    className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest bg-primary text-primary-foreground px-2.5 py-1.5 hover:opacity-90 transition cursor-pointer"
                  >
                    💾 Save as Template
                  </button>
                  <button
                    type="button"
                    onClick={handleClearFabricFields}
                    className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest border border-border px-2.5 py-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition cursor-pointer text-muted-foreground"
                  >
                    ✕ Clear
                  </button>
                </div>
                {templateMsg && (
                  <p className={`text-[9px] font-semibold ${
                    templateMsgType === "success" ? "text-green-600" : "text-muted-foreground"
                  }`}>
                    {templateMsg}
                  </p>
                )}
              </div>
            </div>

            {/* LEHENGA */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5">👉 Lehenga</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Fabric</label>
                  <input type="text" value={lehenkaFabric} onChange={(e) => setLehengaFabric(e.target.value)}
                    placeholder="e.g. Heavy Muslin Cotton"
                    className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Work</label>
                  <input type="text" value={lehenkaWork} onChange={(e) => setLehengaWork(e.target.value)}
                    placeholder="e.g. Beautiful Digital Print"
                    className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Inner</label>
                  <input type="text" value={lehenkaInner} onChange={(e) => setLehengaInner(e.target.value)}
                    placeholder="e.g. Micro"
                    className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Flair</label>
                  <input type="text" value={lehenkaFlair} onChange={(e) => setLehengaFlair(e.target.value)}
                    placeholder="e.g. 4 mtrs"
                    className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Size & Stitching Info</label>
                <input type="text" value={lehenkaSize} onChange={(e) => setLehengaSize(e.target.value)}
                  placeholder="e.g. Fully stitched to XXL (44) free size, canvas patta border, length 42 inches"
                  className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs" />
              </div>
            </div>

            <div className="border-t border-border/50" />

            {/* CHOLI */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5">👉 Choli</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Fabric</label>
                  <input type="text" value={choliFabric} onChange={(e) => setCholiFabric(e.target.value)}
                    placeholder="e.g. Heavy Muslin Cotton"
                    className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Work</label>
                  <input type="text" value={choliWork} onChange={(e) => setCholiWork(e.target.value)}
                    placeholder="e.g. Beautiful Digital Print"
                    className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Size & Stitching Info</label>
                <input type="text" value={choliSize} onChange={(e) => setCholiSize(e.target.value)}
                  placeholder="e.g. Unstitched fabric material (can be stitched to XXL+ size)"
                  className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs" />
              </div>
            </div>

            <div className="border-t border-border/50" />

            {/* DUPATTA */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5">👉 Dupatta</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Fabric</label>
                  <input type="text" value={dupattaFabric} onChange={(e) => setDupattaFabric(e.target.value)}
                    placeholder="e.g. Soft Net"
                    className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Work</label>
                  <input type="text" value={dupattaWork} onChange={(e) => setDupattaWork(e.target.value)}
                    placeholder="e.g. Digital Print Patta Borders"
                    className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Length</label>
                  <input type="text" value={dupattaLength} onChange={(e) => setDupattaLength(e.target.value)}
                    placeholder="e.g. 2 mtrs"
                    className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs" />
                </div>
              </div>
            </div>

            <div className="border-t border-border/50" />

            {/* PACKAGE / LOGISTICS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">📦 Package Contents</label>
                <input type="text" value={packageContents} onChange={(e) => setPackageContents(e.target.value)}
                  placeholder="e.g. Fully stitched lehenga & unstitched choli fabric with dupatta"
                  className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">⚖️ Weight (KG)</label>
                <input type="text" value={productWeight} onChange={(e) => setProductWeight(e.target.value)}
                  placeholder="e.g. 0.900 KG"
                  className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">🎉 Occasions</label>
              <input type="text" value={occasions} onChange={(e) => setOccasions(e.target.value)}
                placeholder="e.g. Summer parties, Carnivals, Marriage functions"
                className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs" />
            </div>
          </div>

          {/* ── SEO INFORMATION CARD ── */}
          <div className="bg-card border border-border p-6 space-y-4 rounded-sm">
            <div className="border-b border-border pb-3">
              <h3 className="font-bold text-foreground uppercase tracking-widest text-[10px]">SEO Information</h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Optimize this product for search engines like Google.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">SEO Title <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  required
                  value={seoTitle}
                  onChange={(e) => {
                    setSeoTitle(e.target.value);
                    nameTouched.current = true;
                  }}
                  placeholder="Google search results title"
                  className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">URL Slug <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  required
                  value={prodSlug}
                  onChange={(e) => {
                    setProdSlug(e.target.value);
                    slugTouched.current = true;
                  }}
                  placeholder="e.g. crimson-anarkali-georgette-kurti"
                  className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Meta Description <span className="text-destructive">*</span></label>
              <textarea
                required
                rows={2}
                value={metaDescription}
                onChange={(e) => {
                  setMetaDescription(e.target.value);
                  descTouched.current = true;
                }}
                placeholder="Google search description (recommended max 155 characters)"
                className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Focus Keyword <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  required
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="e.g. chikankari kurti"
                  className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Canonical URL <span className="text-destructive">*</span></label>
                <input
                  type="url"
                  required
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="e.g. https://vastrarupa.in/product/slug"
                  className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Robots Meta</label>
                <select
                  value={robotsSetting}
                  onChange={(e) => setRobotsSetting(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs"
                >
                  <option value="index, follow">Index, Follow</option>
                  <option value="noindex, follow">Noindex, Follow</option>
                  <option value="index, nofollow">Index, Nofollow</option>
                  <option value="noindex, nofollow">Noindex, Nofollow</option>
                </select>
              </div>
            </div>
          </div>

          {/* Color variants & sizes card */}
          <div className="bg-card border border-border p-6 space-y-4 rounded-sm">
            <div className="flex justify-between items-center">
              <label className="font-bold text-muted-foreground uppercase tracking-wider text-xs">Color Variants & Size Matrix</label>
              <button
                type="button"
                onClick={() => {
                  setProdColors([
                    ...prodColors,
                    {
                      name: "New Color",
                      hex: "#7C3AED",
                      sku: `SKU-${prodName.substring(0,3).toUpperCase() || "NEW"}-${Date.now().toString().slice(-4)}`,
                      thumbnail: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop",
                      gallery: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop"],
                      sizes: { XS: 0, S: 10, M: 10, L: 10, XL: 5, XXL: 0, FS: 0 }
                    }
                  ]);
                }}
                className="text-[10px] font-bold bg-primary text-primary-foreground px-3 py-2 uppercase tracking-widest hover:opacity-90 transition cursor-pointer"
              >
                Add Color Variant
              </button>
            </div>

            {prodColors.length === 0 && (
              <p className="text-[10px] text-muted-foreground text-center py-6 border border-dashed border-border">
                No color variants added yet. Click &apos;Add Color Variant&apos; to specify a variant.
              </p>
            )}

            {prodColors.map((colorObj, cIdx) => (
              <div key={cIdx} className="bg-background border border-border shadow-xs relative rounded-xs overflow-hidden">
                {/* Card Header */}
                <div className="bg-secondary/15 border-b border-border px-4 py-2.5 flex justify-between items-center">
                  <span className="font-bold text-foreground tracking-wider uppercase text-[9px]">
                    Variant #{cIdx + 1}: {colorObj.name || "Unnamed Color"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setProdColors(prodColors.filter((_, idx) => idx !== cIdx));
                    }}
                    className="text-destructive hover:opacity-85 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition"
                  >
                    <Trash2 size={12} />
                    <span>Delete Variant</span>
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Properties */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Color Name</label>
                        <input
                          type="text"
                          value={colorObj.name}
                          onChange={(e) => {
                            const nextColors = [...prodColors];
                            nextColors[cIdx].name = e.target.value;
                            setProdColors(nextColors);
                          }}
                          className="w-full bg-background border border-border px-3 py-2 focus:outline-none focus:border-primary text-xs"
                          placeholder="e.g. Emerald Green"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Hex Code</label>
                          <div className="flex gap-2 items-center">
                            <div
                              className="w-7 h-7 border border-border rounded-full shrink-0 shadow-xs transition"
                              style={{ backgroundColor: colorObj.hex || "#7C3AED" }}
                            />
                            <input
                              type="text"
                              value={colorObj.hex}
                              onChange={(e) => {
                                const nextColors = [...prodColors];
                                nextColors[cIdx].hex = e.target.value;
                                setProdColors(nextColors);
                              }}
                              className="w-full bg-background border border-border px-2 py-1.5 focus:outline-none focus:border-primary text-xs font-mono"
                              placeholder="e.g. #006400"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Color SKU</label>
                          <input
                            type="text"
                            value={colorObj.sku}
                            onChange={(e) => {
                              const nextColors = [...prodColors];
                              nextColors[cIdx].sku = e.target.value;
                              setProdColors(nextColors);
                            }}
                            className="w-full bg-background border border-border px-2 py-1.5 focus:outline-none focus:border-primary text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Media */}
                    <div className="grid grid-cols-3 gap-4">
                      {/* Thumbnail */}
                      <div className="col-span-1 space-y-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Thumbnail</label>
                        <div className="relative w-full aspect-[3/4] border border-border bg-secondary/10 flex items-center justify-center overflow-hidden group">
                          {colorObj.thumbnail ? (
                            <>
                              <Image
                                src={colorObj.thumbnail}
                                alt="Thumbnail preview"
                                fill
                                sizes="120px"
                                className="object-cover"
                              />
                              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[8px] font-bold uppercase tracking-wider transition cursor-pointer">
                                <span>Change</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleThumbnailFileChange(cIdx, file);
                                  }}
                                />
                              </label>
                            </>
                          ) : (
                            <label className="flex flex-col items-center justify-center p-2 text-center text-muted-foreground hover:text-foreground cursor-pointer w-full h-full">
                              <Plus size={16} className="mb-0.5" />
                              <span className="text-[7px] font-bold uppercase tracking-wider">Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleThumbnailFileChange(cIdx, file);
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Gallery */}
                      <div className="col-span-2 space-y-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Gallery Images</label>
                        <div className="grid grid-cols-3 gap-2">
                          {colorObj.gallery.map((imgUrl, imgIdx) => (
                            <div key={imgIdx} className="relative aspect-[3/4] border border-border bg-secondary/10 overflow-hidden group">
                              <Image
                                src={imgUrl}
                                alt="Gallery preview"
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(cIdx, imgIdx)}
                                className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[8px] font-bold uppercase tracking-wider transition cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          ))}

                          {colorObj.gallery.length < 5 && (
                            <label className="aspect-[3/4] border border-dashed border-border hover:border-primary flex flex-col items-center justify-center text-[8px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer bg-secondary/10 hover:bg-secondary/25 transition">
                              {uploadingIndex === `gallery-${cIdx}` ? (
                                <Loader2 className="animate-spin" size={14} />
                              ) : (
                                <>
                                  <Plus size={14} className="mb-0.5" />
                                  <span>Add</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  const files = e.target.files;
                                  if (files && files.length > 0) handleGalleryFilesChange(cIdx, files);
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sizes Section */}
                  <div className="border-t border-border/60 pt-4">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                      Stock Quantities Matrix
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {["XS", "S", "M", "L", "XL", "XXL", "3XL", "FS"].map((sz) => {
                        const isFSActive = (colorObj.sizes["FS"] || 0) > 0;
                        const isOtherSizesActive = ["XS", "S", "M", "L", "XL", "XXL", "3XL"].some(
                          (s) => (colorObj.sizes[s] || 0) > 0
                        );
                        const isDisabled = sz === "FS" ? isOtherSizesActive : isFSActive;
                        return (
                          <div key={sz} className={`border rounded-xs overflow-hidden transition ${
                            isDisabled ? "border-border/30 opacity-40 bg-secondary/5" : "border-border/80"
                          }`}>
                            <div className="bg-secondary/35 text-center py-1 border-b border-border/80 text-[8px] font-bold text-foreground tracking-wider uppercase">
                              <span>{sz === "FS" ? "FS (Free)" : sz}</span>
                            </div>
                            <input
                              type="number"
                              min={0}
                              disabled={isDisabled}
                              value={isDisabled ? 0 : (colorObj.sizes[sz] !== undefined ? colorObj.sizes[sz] : 0)}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                const nextColors = [...prodColors];
                                
                                if (sz === "FS" && val > 0) {
                                  // Clear all standard sizes
                                  ["XS", "S", "M", "L", "XL", "XXL", "3XL"].forEach((s) => {
                                    nextColors[cIdx].sizes[s] = 0;
                                  });
                                } else if (sz !== "FS" && val > 0) {
                                  // Clear Free Size
                                  nextColors[cIdx].sizes["FS"] = 0;
                                }

                                nextColors[cIdx].sizes[sz] = val;
                                setProdColors(nextColors);
                              }}
                              className="w-full bg-background px-1 py-1.5 text-center focus:outline-none text-xs font-semibold text-foreground disabled:cursor-not-allowed disabled:bg-secondary/20"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Settings features and Status bar */}
          <div className="flex flex-wrap gap-4 items-center justify-between bg-card border border-border p-4 rounded-sm">
            <div className="flex gap-4">
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

            <div className="flex items-center gap-2">
              <label className="font-bold text-muted-foreground uppercase tracking-wider">Catalog Status</label>
              <select
                value={prodStatus}
                onChange={(e) => setProdStatus(e.target.value)}
                className="bg-background border border-border px-2 py-1.5 focus:outline-none focus:border-primary text-xs"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end">
            <Link
              href="/admin"
              className="px-6 py-3 border border-border uppercase tracking-widest font-bold text-xs hover:bg-secondary text-center transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary text-primary-foreground uppercase tracking-widest font-bold text-xs hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
            >
              {saving ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="animate-spin" size={12} />
                  <span>Saving...</span>
                </div>
              ) : editId ? (
                "Update Product"
              ) : (
                "Record Product"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── SELECT TEMPLATE MODAL ── */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-background border border-border p-6 max-w-sm w-full shadow-2xl relative text-xs rounded-sm">
            <button
              onClick={() => setShowLoadModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground text-base cursor-pointer font-bold"
            >
              ✕
            </button>
            <h3 className="font-serif text-sm font-semibold tracking-wide mb-4">
              Select Fabric Template
            </h3>
            <p className="text-[10px] text-muted-foreground mb-4">Choose a saved template to apply to this product listing:</p>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {availableTemplates.map((name) => (
                <div
                  key={name}
                  onClick={() => handleLoadSpecificTemplate(name)}
                  className="flex justify-between items-center border border-border p-2.5 hover:bg-secondary/40 transition cursor-pointer group"
                >
                  <span className="font-semibold text-foreground truncate max-w-[200px]">{name}</span>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteTemplate(name, e)}
                    className="text-muted-foreground hover:text-destructive p-1 cursor-pointer opacity-40 group-hover:opacity-100 transition"
                    title="Delete template"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setShowLoadModal(false)}
                className="px-4 py-2 border border-border uppercase tracking-widest font-bold text-[10px] hover:bg-secondary transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductFormPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    }>
      <ProductFormContent />
    </Suspense>
  );
}
