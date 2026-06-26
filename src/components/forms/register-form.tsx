"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth.schema";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
      role: "customer",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          data: {
            full_name: data.full_name,
            role: data.role,
            phone: data.phone,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        toast.success(
          "Registration successful! Please check your email to verify your account."
        );
        router.push("/verify-email");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error(err.message || "Something went wrong during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <Input
        label="Full Name"
        placeholder="John Doe"
        error={errors.full_name?.message}
        disabled={isLoading}
        {...register("full_name")}
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        disabled={isLoading}
        {...register("email")}
      />

      <Input
        label="Phone Number"
        type="tel"
        placeholder="+91-XXXXXXXXXX"
        error={errors.phone?.message}
        disabled={isLoading}
        {...register("phone")}
      />

      <Select
        label="I want to register as a..."
        disabled={isLoading}
        error={errors.role?.message}
        {...register("role")}
      >
        <option value="customer">Customer (Book Inspections)</option>
        <option value="inspector">Inspector (Perform Audits)</option>
      </Select>

      <Input
        label="Password"
        type="password"
        placeholder="Min 8 chars, 1 upper, 1 lower, 1 digit"
        error={errors.password?.message}
        disabled={isLoading}
        {...register("password")}
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        error={errors.confirm_password?.message}
        disabled={isLoading}
        {...register("confirm_password")}
      />

      <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
        Sign Up
      </Button>
    </form>
  );
}
