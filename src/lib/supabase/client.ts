'use client';

import { createBrowserClient } from '@supabase/ssr';

// Fallback to placeholder during build — real values are injected at runtime.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/**
 * Create a Supabase client for use in browser/client components.
 * Uses the anon key — all queries are subject to RLS policies.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
