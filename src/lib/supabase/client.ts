'use client';

import { createBrowserClient } from '@supabase/ssr';

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

function getUrl(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (v && v.startsWith('http')) return v;
  return PLACEHOLDER_URL;
}

function getKey(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (v && v.length > 10) return v;
  return PLACEHOLDER_KEY;
}

/**
 * Create a Supabase client for use in browser/client components.
 * Uses the anon key — all queries are subject to RLS policies.
 */
export function createClient() {
  try {
    return createBrowserClient(getUrl(), getKey());
  } catch {
    // Fallback for build-time prerendering when env vars are unavailable
    return createBrowserClient(PLACEHOLDER_URL, PLACEHOLDER_KEY);
  }
}
