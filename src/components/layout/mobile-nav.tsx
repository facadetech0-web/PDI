"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUIStore } from "@/lib/stores/ui.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { CUSTOMER_NAV, INSPECTOR_NAV, ADMIN_NAV } from "@/lib/utils/constants";
import { Sheet, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function MobileNav() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { profile } = useAuthStore();

  const role = profile?.role || "customer";

  const navItems = React.useMemo(() => {
    switch (role) {
      case "admin":
        return ADMIN_NAV;
      case "inspector":
        return INSPECTOR_NAV;
      default:
        return CUSTOMER_NAV;
    }
  }, [role]);

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen} side="left">
      <SheetHeader>
        <SheetTitle>
          <Link
            href={`/${role}`}
            className="flex items-center gap-3 select-none"
            onClick={() => setSidebarOpen(false)}
          >
            <Car className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-gradient-primary tracking-tight">
              PreCar Inspect
            </span>
          </Link>
        </SheetTitle>
      </SheetHeader>

      <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto mt-4 pr-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-md shadow-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              {Icon && <Icon className="h-5 w-5 shrink-0" />}
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </Sheet>
  );
}
