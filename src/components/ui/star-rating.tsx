"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

export function StarRating({
  rating,
  onRatingChange,
  maxRating = 5,
  size = "md",
  readonly = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const starSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const handleStarClick = (val: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(val);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, idx) => {
        const starValue = idx + 1;
        const isFilled = hoverRating !== null ? starValue <= hoverRating : starValue <= rating;
        
        return (
          <button
            key={idx}
            type="button"
            disabled={readonly}
            className={cn(
              "focus:outline-none transition-colors",
              readonly ? "cursor-default" : "cursor-pointer"
            )}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => !readonly && setHoverRating(starValue)}
            onMouseLeave={() => !readonly && setHoverRating(null)}
          >
            <Star
              className={cn(
                starSizes[size],
                isFilled
                  ? "fill-warning text-warning"
                  : "text-muted-foreground/35 hover:text-warning/80"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
