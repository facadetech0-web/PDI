import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "";

  if (code) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && user) {
      // Fetch profile role to redirect
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      const role = profile?.role || "customer";
      
      // If there's a specific 'next' query param, redirect there, otherwise redirect to the role page
      const redirectUrl = next 
        ? `${requestUrl.origin}${next}`
        : `${requestUrl.origin}/${role}`;

      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.redirect(
    `${requestUrl.origin}/login?error=Could not exchange auth code for session`
  );
}
