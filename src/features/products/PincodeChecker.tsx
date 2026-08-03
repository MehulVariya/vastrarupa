"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2, AlertTriangle, Truck } from "lucide-react";

const pincodeFormSchema = z.object({
  pincode: z
    .string()
    .length(6, "Pincode must be exactly 6 digits")
    .regex(/^\d+$/, "Pincode must contain only numbers"),
});

type PincodeFormData = z.infer<typeof pincodeFormSchema>;

interface PincodeResult {
  available: boolean;
  expectedDelivery: string;
  cashOnDelivery: string;
  expressDelivery: string;
}

export default function PincodeChecker() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<PincodeResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PincodeFormData>({
    resolver: zodResolver(pincodeFormSchema),
    defaultValues: {
      pincode: "",
    },
  });

  const handleCheckPincode = async (data: PincodeFormData) => {
    setChecking(true);
    setErrorMsg("");
    setResult(null);

    try {
      const response = await fetch(`/api/pincode?pincode=${data.pincode}`);
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Service Not Available");
      }

      setResult(json);
    } catch (err: any) {
      setErrorMsg(err.message || "Service Not Available");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-3 border-t border-border pt-5">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Delivery For
        </span>
        <form onSubmit={handleSubmit(handleCheckPincode)} className="flex gap-2">
          <input
            type="text"
            maxLength={6}
            placeholder="Enter Pincode"
            {...register("pincode")}
            className="flex-1 bg-background border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary text-foreground font-mono placeholder:font-sans"
          />
          <button
            type="submit"
            disabled={checking}
            className="px-5 bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer min-w-[80px]"
          >
            {checking ? (
              <Loader2 className="animate-spin" size={12} />
            ) : (
              <span>Check</span>
            )}
          </button>
        </form>
        {errors.pincode && (
          <p className="text-[10px] text-destructive font-semibold mt-0.5">{errors.pincode.message}</p>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1.5 text-[10px] text-destructive font-bold bg-destructive/5 border border-destructive/10 p-2.5 rounded-sm">
          <AlertTriangle size={12} />
          <span>{errorMsg}</span>
        </div>
      )}

      {result && (
        <div className="bg-secondary/20 border border-border p-3 rounded-sm space-y-2 text-[11px] text-muted-foreground animate-fadeIn animate-duration-300">
          <div className="flex items-center gap-1.5 text-accent font-bold uppercase tracking-wider text-[10px]">
            <CheckCircle2 size={13} className="text-accent" />
            <span>Delivery Available</span>
          </div>
          <div className="grid grid-cols-1 gap-1 font-medium pl-4">
            <div className="flex items-center gap-1.5 text-foreground">
              <Truck size={12} className="shrink-0" />
              <span>{result.expectedDelivery}</span>
            </div>
            <p className="text-foreground/80">{result.cashOnDelivery}</p>
            <p className="text-foreground/80">{result.expressDelivery}</p>
          </div>
        </div>
      )}
    </div>
  );
}
