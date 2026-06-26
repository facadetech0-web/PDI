"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/auth.store";
import type { Profile } from "@/lib/types";

export function useAuth() {
  const router = useRouter();
  const supabase = createClient();
  const { user, profile, isLoading, isInitialized, setUser, setProfile, setLoading, setInitialized, reset } = useAuthStore();

  const fetchProfile = React.useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data as Profile);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setProfile(null);
    }
  }, [supabase, setProfile]);

  // Synchronize authentication state
  React.useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session?.user) {
          if (mounted) setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        if (mounted) reset();
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    }

    if (!isInitialized) {
      initAuth();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        reset();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, isInitialized, fetchProfile, setUser, setProfile, setLoading, setInitialized, reset]);

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      reset();
      router.push("/login");
    } catch (err) {
      console.error("Signout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    profile,
    isLoading,
    isInitialized,
    signOut,
  };
}
