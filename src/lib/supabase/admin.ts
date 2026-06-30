import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Fallback to placeholder during build — real values are injected at runtime.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

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
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
