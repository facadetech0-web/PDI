import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 4, ...props }, ref) => {
    const textareaId = id || React.useId();
    
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-foreground/80 cursor-pointer"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            "glass-input w-full rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 resize-y",
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

Textarea.displayName = "Textarea";
