"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth.schema";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Password reset link sent to your email!");
    } catch (err: any) {
      console.error("Forgot password error:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-1.5 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-gradient">
          Reset Password
        </h2>
        <p className="text-sm text-muted-foreground">
          {isSubmitted
            ? "Check your email for a link to reset your password"
            : "Enter your email address to receive a password reset link"}
        </p>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            disabled={isLoading}
            {...register("email")}
          />
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Send Reset Link
          </Button>
        </form>
      ) : (
        <div className="text-center p-4 border border-emerald-500/10 rounded-lg bg-emerald-500/5 text-emerald-400 text-sm">
          We&apos;ve sent an email to the address provided with details on how to reset your password.
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground/80 mt-2">
        Remember your password?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </div>
    </>
  );
}
