"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { generateOrderNumber } from "@/lib/utils";

const checkoutSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  addressLine1: z.string().min(5, "Address must be at least 5 characters"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(6, "Postal code must be 6 digits"),
  paymentMethod: z.enum(["razorpay", "cod"]),
  items: z.array(
    z.object({
      variantId: z.string().uuid(),
      productId: z.string().uuid(),
      quantity: z.number().min(1),
      price: z.number(),
    })
  ),
  subtotal: z.number(),
  discount: z.number(),
  shipping: z.number(),
  total: z.number(),
  couponCode: z.string().nullable(),
});

export async function createOrder(data: z.infer<typeof checkoutSchema>) {
  const result = checkoutSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const orderData = result.data;
  const supabase = await createClient();

  // Get current user id (if logged in)
  const { data: { user } } = await supabase.auth.getUser();

  try {
    // 1. Verify inventory stock for all variants
    for (const item of orderData.items) {
      const { data: inv, error: invErr } = await supabase
        .from("product_sizes")
        .select("stock")
        .eq("id", item.variantId)
        .single();
 
      if (invErr || !inv) {
        return { success: false, error: "Product variant not found in inventory." };
      }
 
      if (inv.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for selected items. Only ${inv.stock} units available.`,
        };
      }
    }

    const orderNo = generateOrderNumber();
    const shippingAddress = {
      fullName: orderData.fullName,
      phone: orderData.phone,
      addressLine1: orderData.addressLine1,
      addressLine2: orderData.addressLine2 || "",
      city: orderData.city,
      state: orderData.state,
      postalCode: orderData.postalCode,
      country: "India",
    };

    // 2. Insert into orders table
    const { data: newOrder, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id || null,
        order_number: orderNo,
        status: "pending",
        subtotal: orderData.subtotal,
        tax: 0,
        shipping: orderData.shipping,
        coupon_code: orderData.couponCode,
        discount_amount: orderData.discount,
        total: orderData.total,
        payment_status: orderData.paymentMethod === "razorpay" ? "paid" : "unpaid",
        payment_method: orderData.paymentMethod,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
      })
      .select("id")
      .single();

    if (orderErr || !newOrder) {
      console.error("Order insertion failed:", orderErr);
      throw new Error("Unable to record your order. Please try again.");
    }

    const orderId = newOrder.id;

    // 3. Insert order items
    const orderItemsRecords = orderData.items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(orderItemsRecords);
    if (itemsErr) {
      console.error("Order items insertion failed:", itemsErr);
      throw new Error("Unable to save order items.");
    }

    // 4. Update inventories
    for (const item of orderData.items) {
      const { data: currentInv } = await supabase
        .from("product_sizes")
        .select("stock")
        .eq("id", item.variantId)
        .single();
        
      if (currentInv) {
        await supabase
          .from("product_sizes")
          .update({ stock: currentInv.stock - item.quantity })
          .eq("id", item.variantId);
      }
    }

    // 5. If coupon code used, increment coupon usage_count
    if (orderData.couponCode) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("usage_count")
        .eq("code", orderData.couponCode)
        .single();
        
      if (coupon) {
        await supabase
          .from("coupons")
          .update({ usage_count: coupon.usage_count + 1 })
          .eq("code", orderData.couponCode);
      }
    }

    // 6. Clear user cart in DB if logged in
    if (user?.id) {
      await supabase.from("cart").delete().eq("user_id", user.id);
    }

    return { success: true, orderNumber: orderNo };
  } catch (error: any) {
    console.error("Order processing catch error:", error);
    return { success: false, error: error.message || "Failed to process order." };
  }
}
