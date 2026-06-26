import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options = [], error, helperText, id, children, ...props }, ref) => {
    const selectId = id || React.useId();
    
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-foreground/80 cursor-pointer"
          >
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "glass-input h-10 w-full rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22rgba(255,255,255,0.5)%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10",
              error && "border-destructive focus:border-destructive",
              className
            )}
            {...props}
          >
            {children ? (
              children
            ) : (
              options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-card text-foreground">
                  {opt.label}
                </option>
              ))
            )}
          </select>
        </div>
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

Select.displayName = "Select";
