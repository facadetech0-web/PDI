"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehicleForm } from "@/components/forms/vehicle-form";
import { useVehicles } from "@/lib/hooks/use-vehicles";
import Link from "next/link";

export default function NewVehiclePage() {
  const router = useRouter();
  const { addVehicle, isLoading } = useVehicles();

  const handleFormSubmit = async (data: any) => {
    try {
      await addVehicle(data);
      router.push("/customer/vehicles");
    } catch (err) {
      // Toast notifications are already handled inside addVehicle
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/customer/vehicles">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gradient-primary">
            Register Vehicle
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Add vehicle details to save in your garage
          </p>
        </div>
      </div>

      <VehicleForm onSubmit={handleFormSubmit} isLoading={isLoading} />
    </div>
  );
}
