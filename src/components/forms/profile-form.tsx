"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/stores/auth.store";

const profileFormSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().max(20).optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

type ProfileFormInput = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const supabase = createClient();
  const { profile, setProfile } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      password: "",
    },
  });

  React.useEffect(() => {
    if (profile) {
      setValue("full_name", profile.full_name);
      setValue("phone", profile.phone || "");
    }
  }, [profile, setValue]);

  const onSubmit = async (data: ProfileFormInput) => {
    if (!profile) return;
    setIsLoading(true);
    try {
      // 1. Update profiles table
      const { data: updatedProfile, error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)
        .select()
        .single();

      if (profileError) throw profileError;

      // 2. If password is provided, update auth user password
      if (data.password) {
        const { error: authError } = await supabase.auth.updateUser({
          password: data.password,
        });
        if (authError) throw authError;
      }

      setProfile(updatedProfile as any);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error("Profile update error:", err);
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-xl">
      <Card>
        <CardContent className="p-6 flex flex-col gap-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            error={errors.full_name?.message}
            disabled={isLoading}
            {...register("full_name")}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+91-XXXXXXXXXX"
            error={errors.phone?.message}
            disabled={isLoading}
            {...register("phone")}
          />

          <Input
            label="Change Password (Optional)"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            disabled={isLoading}
            {...register("password")}
          />
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading} className="px-8">
          Save Settings
        </Button>
      </div>
    </form>
  );
}
