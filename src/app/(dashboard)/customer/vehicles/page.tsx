"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Car, Trash2, Calendar, Gauge } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVehicles } from "@/lib/hooks/use-vehicles";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";

export default function CustomerVehiclesPage() {
  const { vehicles, isLoading, deleteVehicle } = useVehicles();

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gradient-primary">
            My Garage
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Add and manage vehicles that you want inspected
          </p>
        </div>
        <Link href="/customer/vehicles/new">
          <Button variant="primary" size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Vehicle
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          title="No Vehicles Registered"
          description="Register a car in your garage to begin booking inspections."
          icon={<Car className="h-6 w-6" />}
          action={
            <Link href="/customer/vehicles/new">
              <Button>Add Vehicle Now</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} hoverable>
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                    <Car className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {vehicle.make} {vehicle.model}
                    </CardTitle>
                    <CardDescription>Manufactured in {vehicle.year}</CardDescription>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to remove this vehicle?")) {
                      deleteVehicle(vehicle.id);
                    }
                  }}
                  className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                  title="Remove Vehicle"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex flex-col gap-2.5 text-sm text-muted-foreground/85">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Gauge className="h-4 w-4 text-muted-foreground/50" />
                    Mileage
                  </span>
                  <span className="font-semibold text-foreground">
                    {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span>Fuel Type</span>
                  <span className="font-semibold text-foreground">{vehicle.fuel_type || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span>Transmission</span>
                  <span className="font-semibold text-foreground">{vehicle.transmission || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>License Plate</span>
                  <span className="font-semibold text-foreground uppercase">
                    {vehicle.license_plate || "—"}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="bg-black/10 px-6 py-4 flex justify-between items-center gap-4">
                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                  VIN: {vehicle.vin || "—"}
                </span>
                <Link href={`/customer/bookings/new?vehicleId=${vehicle.id}`}>
                  <Button variant="outline" size="sm">
                    Book Audit
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
