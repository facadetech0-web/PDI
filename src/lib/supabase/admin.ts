import { createClient as createSupabaseClient } from '@supabase/supabase-js';

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
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
