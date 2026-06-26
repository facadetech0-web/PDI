"use client";

import * as React from "react";
import { Award, Star, MessageSquarePlus, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BookingService } from "@/lib/services/booking.service";
import { ReviewService } from "@/lib/services/review.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ReviewForm } from "@/components/forms/review-form";
import { Spinner } from "@/components/ui/spinner";
import { StarRating } from "@/components/ui/star-rating";
import { toast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils/format";

export default function CustomerReviewsPage() {
  const supabase = createClient();
  const { user } = useAuthStore();
  const [completedBookings, setCompletedBookings] = React.useState<any[]>([]);
  const [reviews, setReviews] = React.useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedBooking, setSelectedBooking] = React.useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const bookingService = React.useMemo(
    () => new BookingService(supabase),
    [supabase]
  );
  
  const reviewService = React.useMemo(
    () => new ReviewService(supabase),
    [supabase]
  );

  const loadData = React.useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Fetch completed bookings
      const { bookings: bookingsList } = await bookingService.listBookings({
        customer_id: user.id,
        status: "completed",
      });
      setCompletedBookings(bookingsList);

      // 2. Query reviews for these bookings
      const reviewMap: Record<string, any> = {};
      for (const b of bookingsList) {
        const rev = await reviewService.getReviewByBookingId(b.id);
        if (rev) {
          reviewMap[b.id] = rev;
        }
      }
      setReviews(reviewMap);
    } catch (err: any) {
      console.error("Error loading reviews page data:", err);
      toast.error("Failed to load feedback details.");
    } finally {
      setIsLoading(false);
    }
  }, [user, bookingService, reviewService]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenReviewModal = (booking: any) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const handleReviewSuccess = () => {
    setDialogOpen(false);
    setSelectedBooking(null);
    loadData();
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-gradient">
          Service Feedback & Ratings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your past completed car inspections, leave ratings, and help us maintain premium inspector standards.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {completedBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-card/25 border border-white/5 rounded-xl h-[40vh]">
            <Award className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="text-base font-semibold text-foreground">No Completed Inspections Found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Only completed inspection bookings qualify for submitting ratings and service reviews.
            </p>
          </div>
        ) : (
          completedBookings.map((booking) => {
            const hasReview = !!reviews[booking.id];
            const review = reviews[booking.id];

            return (
              <Card
                key={booking.id}
                className="p-6 border-white/5 bg-card/45 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Booking: {booking.booking_number}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
                    <span className="text-xs text-muted-foreground font-medium">
                      Completed: {formatDate(booking.completed_at || booking.updated_at)}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {booking.vehicle?.year} {booking.vehicle?.make} {booking.vehicle?.model}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Plate: {booking.vehicle?.license_plate || "N/A"} | Inspector:{" "}
                    {booking.inspector?.full_name || "Assigned Expert"}
                  </p>

                  {hasReview && (
                    <div className="pt-2 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} readonly size="sm" />
                        {review.title && (
                          <span className="text-sm font-semibold text-foreground">
                            "{review.title}"
                          </span>
                        )}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground italic pl-1 mt-1 border-l border-white/10">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  {hasReview ? (
                    <Button
                      variant="outline"
                      disabled
                      className="flex items-center gap-2 border-white/5 bg-white/[0.02] text-muted-foreground"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Submitted
                    </Button>
                  ) : (
                    <Button
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => handleOpenReviewModal(booking)}
                    >
                      <MessageSquarePlus className="h-4 w-4" />
                      Rate Service
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Write Review Dialog Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedBooking && (
          <DialogContent onClose={() => setDialogOpen(false)} className="p-6 max-w-lg">
            <DialogHeader>
              <DialogTitle>Write a Service Review</DialogTitle>
              <DialogDescription>
                Help others by sharing details of your inspection experience for the{" "}
                {selectedBooking.vehicle?.year} {selectedBooking.vehicle?.make}{" "}
                {selectedBooking.vehicle?.model}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ReviewForm
                bookingId={selectedBooking.id}
                inspectorId={selectedBooking.inspector_id}
                onSuccess={handleReviewSuccess}
                onCancel={() => setDialogOpen(false)}
              />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
