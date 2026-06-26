"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, type VehicleInput } from "@/lib/validations/vehicle.schema";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CAR_MAKES, FUEL_TYPES, TRANSMISSION_TYPES, BODY_TYPES } from "@/lib/utils/constants";
import { Card, CardContent } from "@/components/ui/card";

export interface VehicleFormProps {
  initialData?: Partial<VehicleInput>;
  onSubmit: (data: VehicleInput) => Promise<void>;
  isLoading?: boolean;
}

export function VehicleForm({ initialData, onSubmit, isLoading = false }: VehicleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      make: initialData?.make || "",
      model: initialData?.model || "",
      year: initialData?.year || new Date().getFullYear(),
      vin: initialData?.vin || "",
      license_plate: initialData?.license_plate || "",
      color: initialData?.color || "",
      mileage: initialData?.mileage || 0,
      fuel_type: initialData?.fuel_type || "Petrol",
      transmission: initialData?.transmission || "Manual",
      body_type: initialData?.body_type || "Sedan",
      engine_size: initialData?.engine_size || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-2xl">
      <Card>
        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Make / Brand"
            error={errors.make?.message}
            disabled={isLoading}
            {...register("make")}
          >
            <option value="">Select Brand</option>
            {CAR_MAKES.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </Select>

          <Input
            label="Model Name"
            placeholder="e.g. Swift, City, Creta"
            error={errors.model?.message}
            disabled={isLoading}
            {...register("model")}
          />

          <Input
            label="Manufacture Year"
            type="number"
            placeholder="e.g. 2020"
            error={errors.year?.message ? String(errors.year?.message) : undefined}
            disabled={isLoading}
            {...register("year", { valueAsNumber: true })}
          />

          <Input
            label="VIN / Chassis Number"
            placeholder="17 character alphanumeric"
            error={errors.vin?.message}
            disabled={isLoading}
            {...register("vin")}
          />

          <Input
            label="License Plate Number"
            placeholder="e.g. KA-01-MJ-1234"
            error={errors.license_plate?.message}
            disabled={isLoading}
            {...register("license_plate")}
          />

          <Input
            label="Color"
            placeholder="e.g. Metallic Silver"
            error={errors.color?.message}
            disabled={isLoading}
            {...register("color")}
          />

          <Input
            label="Current Mileage (Odometer)"
            type="number"
            placeholder="in km"
            error={errors.mileage?.message ? String(errors.mileage?.message) : undefined}
            disabled={isLoading}
            {...register("mileage", { valueAsNumber: true })}
          />

          <Select
            label="Fuel Type"
            error={errors.fuel_type?.message}
            disabled={isLoading}
            {...register("fuel_type")}
          >
            {FUEL_TYPES.map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuel}
              </option>
            ))}
          </Select>

          <Select
            label="Transmission"
            error={errors.transmission?.message}
            disabled={isLoading}
            {...register("transmission")}
          >
            {TRANSMISSION_TYPES.map((trans) => (
              <option key={trans} value={trans}>
                {trans}
              </option>
            ))}
          </Select>

          <Select
            label="Body Type"
            error={errors.body_type?.message}
            disabled={isLoading}
            {...register("body_type")}
          >
            {BODY_TYPES.map((body) => (
              <option key={body} value={body}>
                {body}
              </option>
            ))}
          </Select>

          <Input
            label="Engine Displacement"
            placeholder="e.g. 1.2L, 1498cc"
            error={errors.engine_size?.message}
            disabled={isLoading}
            className="sm:col-span-2"
            {...register("engine_size")}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" isLoading={isLoading} className="px-6">
          Save Vehicle
        </Button>
      </div>
    </form>
  );
}
