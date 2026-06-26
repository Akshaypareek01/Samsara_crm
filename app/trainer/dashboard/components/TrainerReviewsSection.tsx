"use client";

import React, { useEffect, useState } from "react";
import TrainerRatingService, {
  getTrainerRatingSummary,
  hasTrainerReviews,
  type TrainerRating,
} from "@/services/trainerRatingService";
import type { Trainer } from "@/services/trainerService";
import TrainerRatingBadge from "@/shared/components/trainer/TrainerRatingBadge";
import TrainerReviewCard from "./TrainerReviewCard";

type TrainerReviewsSectionProps = {
  trainer: Trainer | null;
};

/**
 * Recent session ratings received by the trainer (read-only), shown as a horizontal row of cards.
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
          <div
            className="trainer-review-cards-row"
            role="list"
            aria-label="Recent session ratings"
          >
            {reviews.map((review) => {
              const key = review._id || review.id || String(review.createdAt);
              return (
                <div key={key} role="listitem" className="h-full">
                  <TrainerReviewCard review={review} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
