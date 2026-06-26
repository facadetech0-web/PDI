import * as React from "react";
import Link from "next/link";
import { Car } from "lucide-react";
import { APP_NAME } from "@/lib/utils/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary)_0%,_transparent_50%),_radial-gradient(ellipse_at_bottom_left,_var(--color-secondary)_0%,_transparent_50%)] bg-background">
      <div className="w-full max-w-md flex flex-col gap-6 items-center">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3">
          <Car className="h-8 w-8 text-primary animate-pulse" />
          <span className="font-extrabold text-2xl text-gradient-primary tracking-tight">
            {APP_NAME}
          </span>
        </Link>
        
        {/* Auth Content Card */}
        <div className="w-full glass-panel bg-card/40 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Subtle grid accent */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
