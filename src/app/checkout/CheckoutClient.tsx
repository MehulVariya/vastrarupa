"use client";

import { useCart } from "@/features/cart/useCart";
import { formatPrice } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { createOrder } from "./actions";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/useAuth";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, CreditCard, Truck, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";

const checkoutFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  addressLine1: z.string().min(5, "Address must be at least 5 characters"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(6, "Postal code must be 6 digits"),
  paymentMethod: z.enum(["razorpay", "cod"]),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutClient() {
  const { items, coupon, getCartSubtotal, getCartDiscount, getCartTotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const subtotal = getCartSubtotal();
  const discount = getCartDiscount();
  const total = getCartTotal();
  const shippingThreshold = 2999;
  const shippingFee = subtotal > shippingThreshold || subtotal === 0 ? 0 : 99;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      paymentMethod: "razorpay",
    },
  });

  // Prefill user details if logged in
  useEffect(() => {
    if (user) {
      setValue("email", user.email || "");
    }
    if (profile) {
      setValue("fullName", profile.fullName || "");
      setValue("phone", profile.phone || "");
    }
  }, [user, profile, setValue]);

  // Load default address if available in Supabase
  useEffect(() => {
    async function loadDefaultAddress() {
      if (!user) return;
      const supabase = createClient();
      const { data: addr } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .single();

      if (addr) {
        setValue("fullName", addr.full_name);
        setValue("phone", addr.phone);
        setValue("addressLine1", addr.address_line1);
        setValue("addressLine2", addr.address_line2 || "");
        setValue("city", addr.city);
        setValue("state", addr.state);
        setValue("postalCode", addr.postal_code);
      }
    }
    loadDefaultAddress();
  }, [user, setValue]);

  const onSubmit = async (values: CheckoutFormValues) => {
    if (items.length === 0) {
      setErrorMsg("Your shopping bag is empty.");
      return;
    }

    setErrorMsg("");
    setIsProcessing(true);
    setProcessingStep(1); // Authenticating

    // Simulated transaction steps
    if (values.paymentMethod === "razorpay") {
      setTimeout(() => {
        setProcessingStep(2); // Securing
        setTimeout(() => {
          setProcessingStep(3); // Finalizing Order
        }, 1500);
      }, 1500);
    } else {
      setProcessingStep(3); // Finalizing
    }

    // Call server action to write order
    const orderItems = items.map((i) => ({
      variantId: i.variantId,
      productId: i.productId,
      quantity: i.quantity,
      price: i.salePrice !== null ? i.salePrice : i.price,
    }));

    setTimeout(async () => {
      try {
        const res = await createOrder({
          email: values.email,
          fullName: values.fullName,
          phone: values.phone,
          addressLine1: values.addressLine1,
          addressLine2: values.addressLine2,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          paymentMethod: values.paymentMethod,
          items: orderItems,
          subtotal,
          discount,
          shipping: shippingFee,
          total,
          couponCode: coupon?.code || null,
        });

        if (res.success && res.orderNumber) {
          clearCart();
          router.push(`/checkout/success?orderNumber=${res.orderNumber}`);
        } else {
          setErrorMsg(res.error || "Something went wrong. Please check details.");
          setIsProcessing(false);
        }
      } catch (err: any) {
        setErrorMsg("Failed to place order. Connection error.");
        setIsProcessing(false);
      }
    }, 4000);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-6">
        <h2 className="font-serif text-2xl font-semibold">Your Shopping Bag is empty</h2>
        <p className="text-muted-foreground text-sm">Add items to your bag before proceeding to checkout.</p>
        <button
          onClick={() => router.push("/shop")}
          className="px-6 py-3 bg-primary text-primary-foreground font-semibold text-xs tracking-widest uppercase hover:opacity-90 transition cursor-pointer"
        >
          Explore Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      {/* simulated secure payment processing screen */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-background/95 flex flex-col items-center justify-center space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <h3 className="font-serif text-xl font-semibold text-foreground">
              {processingStep === 1 && "Authenticating Payment..."}
              {processingStep === 2 && "Securing Luxury Transaction..."}
              {processingStep === 3 && "Registering Order details..."}
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs text-center leading-relaxed">
              Please do not close this window or click back button. We are processing your request.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Form details */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-7 space-y-8 bg-card border border-border p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-semibold tracking-wide">Secure Checkout</h2>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground pb-1.5 border-b border-border">
              1. Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="e.g. patron@vastrarupa.com"
                  {...register("email")}
                  className="w-full bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary"
                />
                {errors.email && <p className="text-destructive text-[10px]">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="10-digit number"
                  {...register("phone")}
                  className="w-full bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary"
                />
                {errors.phone && <p className="text-destructive text-[10px]">{errors.phone.message}</p>}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground pb-1.5 border-b border-border">
              2. Shipping Address
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Recipient Name"
                  {...register("fullName")}
                  className="w-full bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary"
                />
                {errors.fullName && <p className="text-destructive text-[10px]">{errors.fullName.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="addressLine1" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Address Line 1</label>
                  <input
                    id="addressLine1"
                    type="text"
                    placeholder="House, Flat No, Building, Street"
                    {...register("addressLine1")}
                    className="w-full bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  />
                  {errors.addressLine1 && <p className="text-destructive text-[10px]">{errors.addressLine1.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="addressLine2" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Address Line 2 (Optional)</label>
                  <input
                    id="addressLine2"
                    type="text"
                    placeholder="Landmark, Area, Colony"
                    {...register("addressLine2")}
                    className="w-full bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="city" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">City</label>
                  <input
                    id="city"
                    type="text"
                    {...register("city")}
                    className="w-full bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  />
                  {errors.city && <p className="text-destructive text-[10px]">{errors.city.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="state" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">State</label>
                  <input
                    id="state"
                    type="text"
                    {...register("state")}
                    className="w-full bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  />
                  {errors.state && <p className="text-destructive text-[10px]">{errors.state.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="postalCode" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pincode</label>
                  <input
                    id="postalCode"
                    type="text"
                    placeholder="6 digits"
                    {...register("postalCode")}
                    className="w-full bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  />
                  {errors.postalCode && <p className="text-destructive text-[10px]">{errors.postalCode.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground pb-1.5 border-b border-border">
              3. Payment Method
            </h3>
            <div className="space-y-3">
              {/* Razorpay Online */}
              <label className="flex items-center gap-3 p-4 border border-border hover:border-primary bg-background rounded-sm cursor-pointer">
                <input
                  type="radio"
                  value="razorpay"
                  {...register("paymentMethod")}
                  className="accent-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-foreground">Razorpay Secure Online Checkout</span>
                    <CreditCard size={16} className="text-muted-foreground" />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Pay securely using Cards, UPI, Netbanking, or Wallet.</p>
                </div>
              </label>

              {/* COD */}
              <label className="flex items-center gap-3 p-4 border border-border hover:border-primary bg-background rounded-sm cursor-pointer">
                <input
                  type="radio"
                  value="cod"
                  {...register("paymentMethod")}
                  className="accent-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-foreground">Cash on Delivery (COD)</span>
                    <Truck size={16} className="text-muted-foreground" />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Pay with cash upon delivery of your luxury parcel.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-sm text-xs font-semibold">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground h-12 font-bold text-xs uppercase tracking-widest hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck size={18} />
            <span>Place Order ({formatPrice(total)})</span>
          </button>
        </form>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border p-6 space-y-4">
            <h3 className="font-serif text-lg font-semibold tracking-wide">Order Summary</h3>
            
            {/* Items */}
            <div className="max-h-72 overflow-y-auto space-y-4 pr-1">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3 text-xs">
                  <div className="relative w-12 h-16 bg-secondary border border-border shrink-0">
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-medium line-clamp-1 text-foreground">{item.productName}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Qty: {item.quantity} | Size: {item.size}
                      </p>
                    </div>
                    <span className="font-semibold text-right">
                      {formatPrice(
                        (item.salePrice !== null ? item.salePrice : item.price) * item.quantity
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-border" />

            {/* Calculations */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-accent font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping Fees</span>
                <span>{shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-border pt-2 text-foreground">
                <span className="font-serif">Estimated Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Secure Trust Banner */}
          <div className="border border-border p-4 bg-secondary/30 rounded-sm flex gap-3 text-xs text-muted-foreground leading-relaxed">
            <ShieldCheck size={24} className="text-primary shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">100% Secure Checkout</h4>
              <p>Your payment information is encrypted and protected with industry standard SSL certificates.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
