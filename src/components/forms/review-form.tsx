"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema, type ReviewInput } from "@/lib/validations/review.schema";
import { createClient } from "@/lib/supabase/client";
import { ReviewService } from "@/lib/services/review.service";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { toast } from "@/components/ui/toast";

interface ReviewFormProps {
  bookingId: string;
  inspectorId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  bookingId,
  inspectorId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const supabase = createClient();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      booking_id: bookingId,
      inspector_id: inspectorId,
      rating: 5,
      title: "",
      comment: "",
    },
  });

  const reviewService = React.useMemo(
    () => new ReviewService(supabase),
    [supabase]
  );

  const onSubmit = async (data: ReviewInput) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated.");

      await reviewService.createReview({
        booking_id: data.booking_id,
        customer_id: user.id,
        inspector_id: data.inspector_id,
        rating: data.rating,
        title: data.title || null,
        comment: data.comment || null,
      });

      toast.success("Thank you! Your review has been submitted.");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Error submitting review:", err);
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white/[0.02] rounded-xl border border-white/5">
        <label className="text-sm font-semibold text-foreground">
          Rate your overall inspection experience
        </label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <StarRating
              rating={field.value}
              onRatingChange={field.onChange}
              size="lg"
            />
          )}
        />
        {errors.rating && (
          <p className="text-xs text-destructive mt-1">{errors.rating.message}</p>
        )}
      </div>

      <Input
        label="Review Title"
        placeholder="e.g. Thorough inspection, very polite!"
        error={errors.title?.message}
        disabled={isLoading}
        {...register("title")}
      />

      <Textarea
        label="Share your feedback"
        placeholder="What did you like? Is there anything that could be improved?"
        error={errors.comment?.message}
        disabled={isLoading}
        rows={4}
        {...register("comment")}
      />

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="border-white/10 hover:bg-white/5 cursor-pointer"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isLoading} className="cursor-pointer px-6">
          Submit Review
        </Button>
      </div>
    </form>
  );
}
