import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "./spinner";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/10",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md shadow-secondary/10",
      outline: "border border-border bg-transparent hover:bg-white/5 text-foreground",
      ghost: "bg-transparent hover:bg-white/5 text-foreground",
      destructive: "bg-destructive text-primary-foreground hover:bg-destructive/90 shadow-md shadow-destructive/10",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 py-2",
      lg: "h-12 px-6 text-lg",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Spinner size="sm" className="mr-2 border-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
