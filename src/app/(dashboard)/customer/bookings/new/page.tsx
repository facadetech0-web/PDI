"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingForm } from "@/components/forms/booking-form";
import { useBookings } from "@/lib/hooks/use-bookings";
import { useVehicles } from "@/lib/hooks/use-vehicles";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import type { PricingPlan } from "@/lib/types";
import { toast } from "@/components/ui/toast";
import Link from "next/link";

export default function NewBookingPage() {
  const router = useRouter();
  const supabase = createClient();
  const { createBooking, isLoading: bookingSubmitLoading } = useBookings();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  
  const [pricingPlans, setPricingPlans] = React.useState<PricingPlan[]>([]);
  const [plansLoading, setPlansLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadPlans() {
      try {
        const { data, error } = await supabase
          .from("pricing_plans")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;
        setPricingPlans(data as PricingPlan[]);
      } catch (err) {
        console.error("Error loading pricing plans:", err);
        toast.error("Failed to load pricing packages.");
      } finally {
        setPlansLoading(false);
      }
    }

    loadPlans();
  }, [supabase]);

  const handleFormSubmit = async (data: any) => {
    try {
      const { coupon_code, ...bookingData } = data;
      const res = await createBooking(bookingData);
      if (res) {
        router.push(`/customer/bookings/${res.id}`);
      }
    } catch (err) {
      // Errors handled in hook
    }
  };

  const isLoading = vehiclesLoading || plansLoading || bookingSubmitLoading;

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/customer/bookings">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gradient-primary">
            Schedule Inspection
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Book an certified auditor checklist scan
          </p>
        </div>
      </div>

      {isLoading && pricingPlans.length === 0 ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-2xl bg-card/20 text-center min-h-[300px]">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Car className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Garage is Empty</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            You must register a vehicle first before you can schedule an inspection audit.
          </p>
          <Link href="/customer/vehicles/new" className="mt-6">
            <Button>Register Vehicle</Button>
          </Link>
        </div>
      ) : (
        <BookingForm
          vehicles={vehicles}
          pricingPlans={pricingPlans}
          onSubmit={handleFormSubmit}
          isLoading={bookingSubmitLoading}
        />
      )}
    </div>
  );
}
