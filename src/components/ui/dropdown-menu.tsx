import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}

export function DropdownMenu({ trigger, children, align = "right" }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-56 glass-panel rounded-lg shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden",
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
          )}
          onClick={() => setOpen(false)}
        >
          <div className="py-1 bg-card">{children}</div>
        </div>
      )}
    </div>
  );
}

export interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  disabled?: boolean;
}

export function DropdownMenuItem({
  className,
  children,
  disabled = false,
  ...props
}: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "flex w-full items-center px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-white/5 disabled:opacity-50 disabled:pointer-events-none transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="h-px bg-white/5 my-1" />;
}
