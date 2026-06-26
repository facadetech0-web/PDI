"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth.schema";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      toast.success("Password reset successful! Please login with your new password.");
      router.push("/login");
    } catch (err: any) {
      console.error("Reset password error:", err);
      toast.error(err.message || "Failed to reset password. Please request another link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-1.5 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-gradient">
          New Password
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your new password below to update your credentials
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          placeholder="Min 8 chars, 1 upper, 1 number"
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
          Reset Password
        </Button>
      </form>
    </>
  );
}
