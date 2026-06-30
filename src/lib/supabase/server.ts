import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
 * Create a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Reads/writes auth cookies automatically.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getUrl(),
    getKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
