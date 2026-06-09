"use client";

import React, { useEffect, useState } from "react";
import TrainerRatingService, {
  getTrainerRatingSummary,
  hasTrainerReviews,
  type TrainerRating,
} from "@/services/trainerRatingService";
import type { Trainer } from "@/services/trainerService";
import TrainerRatingBadge from "@/shared/components/trainer/TrainerRatingBadge";
import { formatBookingDate } from "@/shared/utils/bookingUtils";

type TrainerReviewsSectionProps = {
  trainer: Trainer | null;
};

/**
 * Recent session ratings received by the trainer (read-only).
 */
export default function TrainerReviewsSection({ trainer }: TrainerReviewsSectionProps) {
  const [reviews, setReviews] = useState<TrainerRating[]>([]);
  const [loading, setLoading] = useState(false);

  const trainerId = trainer?._id || trainer?.id;
  const summary = getTrainerRatingSummary(trainer);

  useEffect(() => {
    if (!trainerId || !hasTrainerReviews(summary)) {
      setReviews([]);
      return;
    }

    const loadReviews = async () => {
      try {
        setLoading(true);
        const data = await TrainerRatingService.getTrainerReviews(trainerId, { limit: 5 });
        setReviews(data.results || []);
      } catch (err) {
        console.error("Failed to load trainer reviews:", err);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    void loadReviews();
  }, [trainerId, summary.totalReviews]);

  if (!trainer || !hasTrainerReviews(summary)) return null;

  return (
    <section className="box mb-6" aria-labelledby="trainer-reviews-heading">
      <div className="box-header flex items-center justify-between gap-3 flex-wrap">
        <h2 id="trainer-reviews-heading" className="box-title mb-0">
          Session ratings
        </h2>
        <TrainerRatingBadge trainer={trainer} size="md" />
      </div>
      <div className="box-body">
        {loading ? (
          <p className="text-sm text-muted mb-0" role="status">
            Loading reviews…
          </p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted mb-0">No reviews to display yet.</p>
        ) : (
          <ul className="list-none m-0 p-0 flex flex-col gap-3">
            {reviews.map((review) => {
              const key = review._id || review.id || String(review.createdAt);
              const booking =
                review.booking && typeof review.booking === "object"
                  ? (review.booking as { bookingDate?: string })
                  : null;
              const company =
                review.company && typeof review.company === "object"
                  ? (review.company as { companyName?: string })
                  : null;
              return (
                <li
                  key={key}
                  className="rounded-lg border border-defaultborder p-4 bg-light/20"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-semibold text-defaulttextcolor">
                      {company?.companyName || "Company"}
                    </span>
                    <span
                      className="inline-flex items-center gap-0.5 text-sm text-amber-600"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i
                          key={i}
                          className={
                            i < review.rating ? "ri-star-fill" : "ri-star-line text-gray-300"
                          }
                          aria-hidden="true"
                        />
                      ))}
                    </span>
                  </div>
                  {booking?.bookingDate && (
                    <p className="text-xs text-muted mb-2">
                      Session on {formatBookingDate(booking.bookingDate)}
                    </p>
                  )}
                  {review.feedback ? (
                    <p className="text-sm text-defaulttextcolor mb-0 leading-relaxed">
                      {review.feedback}
                    </p>
                  ) : (
                    <p className="text-sm text-muted mb-0 italic">No written feedback.</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
