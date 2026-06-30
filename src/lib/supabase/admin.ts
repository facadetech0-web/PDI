import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

function getUrl(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (v && v.startsWith('http')) return v;
  return PLACEHOLDER_URL;
}

function getServiceKey(): string {
  const v = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (v && v.length > 10) return v;
  return PLACEHOLDER_KEY;
}

/**
 * Admin Supabase client using the service role key.
 * BYPASSES all Row Level Security — use only in secure server contexts.
 *
 * Use cases:
 * - Creating users via admin API
 * - Writing audit logs
 * - System-level operations
 */
export function createAdminClient() {
  return createSupabaseClient(
    getUrl(),
    getServiceKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
