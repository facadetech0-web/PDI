import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ className, src, alt, fallback, size = "md", ...props }: AvatarProps) {
  const [error, setError] = React.useState(false);

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5 items-center justify-center font-semibold text-muted-foreground select-none",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !error ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt || "Avatar"}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      ) : fallback ? (
        <span>{getInitials(fallback)}</span>
      ) : (
        <span className="text-muted-foreground/40">U</span>
      )}
    </div>
  );
}
