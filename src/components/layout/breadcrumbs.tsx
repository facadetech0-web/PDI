"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Breadcrumbs() {
  const pathname = usePathname();
  
  const pathSegments = pathname
    .split("/")
    .filter((segment) => segment !== "");

  if (pathSegments.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground/80 font-medium py-1 px-1">
      <Link
        href={`/${pathSegments[0]}`}
        className="hover:text-foreground flex items-center gap-1 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Home</span>
      </Link>

      {pathSegments.slice(1).map((segment, index) => {
        const isLast = index === pathSegments.length - 2;
        const href = `/${pathSegments.slice(0, index + 2).join("/")}`;
        
        // Capitalize segment label and format dashes/underscores
        const label = decodeURIComponent(segment)
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());

        // Skip UUID segments or show a fallback
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(segment);
        const displayLabel = isUUID ? "Details" : label;

        return (
          <div key={href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/35 shrink-0" />
            {isLast ? (
              <span className="text-foreground/90 font-semibold max-w-[120px] sm:max-w-xs truncate">
                {displayLabel}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-foreground transition-colors max-w-[120px] sm:max-w-xs truncate"
              >
                {displayLabel}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
