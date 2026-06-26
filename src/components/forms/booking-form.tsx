"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, type BookingInput } from "@/lib/validations/booking.schema";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores/auth.store";
import type { Vehicle, PricingPlan } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils/format";
import { ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";

export interface BookingFormProps {
  vehicles: Vehicle[];
  pricingPlans: PricingPlan[];
  onSubmit: (data: BookingInput & { subtotal: number; total_amount: number }) => Promise<void>;
  isLoading?: boolean;
}

export function BookingForm({ vehicles, pricingPlans, onSubmit, isLoading = false }: BookingFormProps) {
  const [step, setStep] = React.useState(1);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    mode: "all",
    defaultValues: {
      vehicle_id: "",
      pricing_plan_id: "",
      scheduled_date: "",
      scheduled_time: "",
      location_address: "",
      notes: "",
      coupon_code: "",
      referral_code: "",
    },
  });

  const selectedVehicleId = watch("vehicle_id");
  const selectedPlanId = watch("pricing_plan_id");
  const couponCode = watch("coupon_code");

  const [discount, setDiscount] = React.useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = React.useState(false);

  // Get active selected plan detail
  const selectedPlan = React.useMemo(() => {
    return pricingPlans.find((p) => p.id === selectedPlanId);
  }, [selectedPlanId, pricingPlans]);

  // Calculate pricing subtotals
  const subtotal = selectedPlan?.price || 0;
  const totalAmount = Math.max(subtotal - discount, 0);

  const handleNextStep = () => {
    if (step === 1 && !selectedVehicleId) {
      toast.error("Please select a vehicle to proceed.");
      return;
    }
    if (step === 2 && !selectedPlanId) {
      toast.error("Please select an inspection plan to proceed.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const validateCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !data) {
        toast.error("Invalid coupon code.");
        setDiscount(0);
        return;
      }

      const coupon = data;
      const now = new Date();
      if (new Date(coupon.valid_until) < now || new Date(coupon.valid_from) > now) {
        toast.error("Coupon has expired or is not active yet.");
        setDiscount(0);
        return;
      }

      if (subtotal < coupon.min_order) {
        toast.error(`Minimum order amount of ₹${coupon.min_order} required.`);
        setDiscount(0);
        return;
      }

      let disc = 0;
      if (coupon.coupon_type === "percentage") {
        disc = (subtotal * coupon.value) / 100;
        if (coupon.max_discount) {
          disc = Math.min(disc, coupon.max_discount);
        }
      } else {
        disc = coupon.value;
      }

      setDiscount(disc);
      toast.success(`Coupon applied! Discount of ${formatCurrency(disc)}.`);
    } catch (err) {
      console.error("Coupon error:", err);
      toast.error("Coupon validation failed.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const onFormSubmit = async (data: BookingInput) => {
    await onSubmit({
      ...data,
      subtotal,
      total_amount: totalAmount,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 w-full max-w-2xl">
      {/* Step Indicators */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : step > s
                  ? "bg-success text-primary-foreground"
                  : "bg-white/5 border border-white/10 text-muted-foreground"
              }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div
                className={`h-0.5 w-12 sm:w-20 rounded-full ${
                  step > s ? "bg-success" : "bg-white/5"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Vehicle selection */}
      {step === 1 && (
        <Card>
          <CardContent className="p-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-foreground">Step 1: Select Vehicle</h2>
            <p className="text-xs text-muted-foreground">Select a vehicle from your registered garage catalog.</p>
            {vehicles.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-white/10 rounded-xl bg-white/2">
                <p className="text-sm text-muted-foreground">Garage is empty.</p>
              </div>
            ) : (
              <Select
                label="Select Vehicle"
                error={errors.vehicle_id?.message}
                disabled={isLoading}
                {...register("vehicle_id")}
              >
                <option value="">Select a registered car</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.year}) — {v.license_plate || "No plate"}
                  </option>
                ))}
              </Select>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Pricing Plan selection */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-base font-bold text-foreground">Step 2: Select Inspection Package</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {pricingPlans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setValue("pricing_plan_id", plan.id, { shouldValidate: true })}
                className={`p-6 rounded-xl border flex flex-col text-left transition-all cursor-pointer ${
                  selectedPlanId === plan.id
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/5"
                    : "border-white/5 bg-card/40 hover:bg-card/65"
                }`}
              >
                <h3 className="text-sm font-bold text-foreground">{plan.name}</h3>
                <span className="text-xl font-extrabold text-primary mt-2">
                  {formatCurrency(plan.price)}
                </span>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                  {plan.description || "Comprehensive inspection audit checklist package"}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Schedule Date, Time, and Location Address */}
      {step === 3 && (
        <Card>
          <CardContent className="p-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-foreground">Step 3: Dispatch Scheduling</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Scheduled Date"
                type="date"
                error={errors.scheduled_date?.message}
                disabled={isLoading}
                {...register("scheduled_date")}
              />
              <Input
                label="Preferred Time"
                type="time"
                error={errors.scheduled_time?.message}
                disabled={isLoading}
                {...register("scheduled_time")}
              />
              <Input
                label="Inspection Location Address"
                placeholder="Enter complete address, dealership name, or garage details"
                error={errors.location_address?.message}
                disabled={isLoading}
                className="sm:col-span-2"
                {...register("location_address")}
              />
              <Textarea
                label="Special Instructions / Inspector Notes"
                placeholder="Include contacts, access requirements, or car issues to review..."
                error={errors.notes?.message}
                disabled={isLoading}
                className="sm:col-span-2"
                {...register("notes")}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Apply code, confirm and place booking */}
      {step === 4 && (
        <Card>
          <CardContent className="p-6 flex flex-col gap-6">
            <h2 className="text-base font-bold text-foreground">Step 4: Invoice Details</h2>
            
            {/* Promo Codes */}
            <div className="flex flex-col gap-4 border-b border-white/5 pb-6">
              <div className="flex gap-2 items-end">
                <Input
                  label="Have a promo code?"
                  placeholder="ENTER CODE"
                  disabled={isLoading || isValidatingCoupon}
                  {...register("coupon_code")}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading || isValidatingCoupon || !couponCode}
                  onClick={validateCoupon}
                >
                  Apply
                </Button>
              </div>

              <Input
                label="Referral Code (Optional)"
                placeholder="REF-XXXXXXXX"
                disabled={isLoading}
                {...register("referral_code")}
              />
            </div>

            {/* Calculations breakdown */}
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inspection Plan Price</span>
                <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount Code Applied</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="h-px bg-white/5 my-2" />
              <div className="flex justify-between text-base font-bold">
                <span>Total Charge</span>
                <span className="text-primary">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer wizard navigation triggers */}
      <div className="flex justify-between items-center gap-4">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={handlePrevStep} disabled={isLoading}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <Button type="button" onClick={handleNextStep}>
            Continue
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" isLoading={isLoading}>
            Confirm Booking
          </Button>
        )}
      </div>
    </form>
  );
}
