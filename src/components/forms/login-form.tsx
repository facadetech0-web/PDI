"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations/auth.schema";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { KeyRound, Mail } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Fetch role to redirect to correct dashboard
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        if (profileError) throw profileError;

        const role = profile?.role || "customer";
        toast.success("Welcome back! Login successful.");
        router.push(`/${role}`);
        router.refresh();
      }
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        disabled={isLoading}
        {...register("email")}
      />

      <div className="space-y-1">
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          disabled={isLoading}
          {...register("password")}
        />
        <div className="flex justify-end mt-1">
          <Link
            href="/forgot-password"
            className="text-xs text-primary hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      </div>

      <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
        Sign In
      </Button>
    </form>
  );
}
