import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || React.useId();
    
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground/80 cursor-pointer"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "glass-input h-10 w-full rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-destructive font-medium">{error}</span>
        )}
        {!error && helperText && (
          <span className="text-xs text-muted-foreground/75">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
