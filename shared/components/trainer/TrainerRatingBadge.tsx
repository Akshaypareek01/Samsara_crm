"use client";

import React from "react";
import {
  getTrainerRatingSummary,
  hasTrainerReviews,
  type TrainerRatingSummary,
} from "@/services/trainerRatingService";
import type { Trainer } from "@/services/trainerService";

type TrainerRatingBadgeProps = {
  trainer?: Pick<Trainer, "ratingSummary"> | null;
  summary?: TrainerRatingSummary;
  className?: string;
  size?: "sm" | "md";
};

/**
 * Read-only trainer rating display. Renders nothing when no reviews exist.
 */
export default function TrainerRatingBadge({
  trainer,
  summary: summaryProp,
  className = "",
  size = "sm",
}: TrainerRatingBadgeProps) {
  const summary = summaryProp ?? getTrainerRatingSummary(trainer);
  if (!hasTrainerReviews(summary)) return null;

  const textSize = size === "md" ? "text-sm" : "text-xs";

  return (
    <p
      className={`inline-flex items-center gap-1 m-0 ${textSize} ${className}`}
      aria-label={`Rating ${summary.averageRating} out of 5, ${summary.totalReviews} reviews`}
    >
      <i className="ri-star-fill text-amber-400" aria-hidden="true" />
      <strong className="text-gray-900">{summary.averageRating.toFixed(1)}</strong>
      <span className="text-gray-500">({summary.totalReviews})</span>
    </p>
  );
}
