"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut, Car } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUIStore } from "@/lib/stores/ui.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { CUSTOMER_NAV, INSPECTOR_NAV, ADMIN_NAV } from "@/lib/utils/constants";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { profile } = useAuthStore();
  const { signOut } = useAuth();

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
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen border-r border-white/5 bg-card/65 backdrop-blur-xl transition-all duration-300 relative z-20 shrink-0",
        sidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Sidebar header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
        <Link href={`/${role}`} className="flex items-center gap-3 select-none">
          <Car className="h-6 w-6 text-primary animate-pulse" />
          {!sidebarCollapsed && (
            <span className="font-bold text-lg text-gradient-primary tracking-tight">
              PreCar Inspect
            </span>
          )}
        </Link>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 py-6 px-4 flex flex-col gap-1.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-md shadow-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
              )}
              title={sidebarCollapsed ? item.title : undefined}
            >
              {Icon && <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />}
              {!sidebarCollapsed && <span>{item.title}</span>}
              {sidebarCollapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-card border border-white/10 text-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                  {item.title}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 bg-card border border-white/10 text-muted-foreground hover:text-foreground rounded-full p-1 shadow-md hover:bg-white/5 focus:outline-none hidden md:block cursor-pointer z-30"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Sidebar footer */}
      <div className="p-4 border-t border-white/5 flex flex-col gap-2">
        <Button
          variant="ghost"
          size={sidebarCollapsed ? "icon" : "md"}
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={signOut}
        >
          <LogOut className={cn("h-5 w-5 shrink-0", !sidebarCollapsed && "mr-3")} />
          {!sidebarCollapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
