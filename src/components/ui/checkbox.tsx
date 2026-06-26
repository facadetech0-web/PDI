import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const checkboxId = id || React.useId();
    
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5 cursor-pointer">
          <input
            id={checkboxId}
            type="checkbox"
            ref={ref}
            className={cn(
              "h-4 w-4 rounded border border-white/20 bg-black/20 text-primary focus:ring-primary focus:ring-offset-background cursor-pointer accent-primary",
              error && "border-destructive",
              className
            )}
            {...props}
          />
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm font-medium text-foreground/80 cursor-pointer select-none"
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <span className="text-xs text-destructive font-medium ml-6.5">{error}</span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
