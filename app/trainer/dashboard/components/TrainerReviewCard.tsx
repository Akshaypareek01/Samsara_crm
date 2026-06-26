"use client";

import React from "react";
import type { TrainerRating } from "@/services/trainerRatingService";
import { formatBookingDate } from "@/shared/utils/bookingUtils";

type TrainerReviewCardProps = {
  review: TrainerRating;
};

type ReviewCompanyRef = {
  companyName?: string;
  name?: string;
  companyLogo?: string;
};

/**
 * Resolve populated company fields from a rating record.
 *
 * @param review - Trainer session rating.
 * @returns Company display name and optional logo URL.
 */
function getReviewCompanyMeta(review: TrainerRating): {
  companyName: string;
  logoUrl: string | null;
} {
  const company =
    review.company && typeof review.company === "object"
      ? (review.company as ReviewCompanyRef)
      : null;

  const companyName =
    company?.companyName?.trim() || company?.name?.trim() || "Company";

  const logoUrl = company?.companyLogo?.trim() || null;

  return {
    companyName,
    logoUrl,
  };
}

/**
 * Resolve session date from a populated booking on the rating.
 *
 * @param review - Trainer session rating.
 * @returns Formatted session date or null.
 */
function getReviewSessionDate(review: TrainerRating): string | null {
  const booking =
    review.booking && typeof review.booking === "object"
      ? (review.booking as { bookingDate?: string })
      : null;

  if (!booking?.bookingDate) return null;
  return formatBookingDate(booking.bookingDate);
}

/**
 * Compact star rating row for review cards.
 *
 * @param props - Star display props.
 * @param props.rating - Score from 1 to 5.
 */
function ReviewStars({ rating }: { rating: number }) {
  return (
    <span
      className="trainer-review-card__stars inline-flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <i
          key={index}
          className={
            index < rating
              ? "ri-star-fill text-amber-500 text-sm"
              : "ri-star-line text-gray-300 text-sm"
          }
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

/**
 * Small horizontal review card: company logo, name, date, stars, and feedback.
 */
export default function TrainerReviewCard({ review }: TrainerReviewCardProps) {
  const { companyName, logoUrl } = getReviewCompanyMeta(review);
  const sessionDate = getReviewSessionDate(review);
  const initial = companyName.charAt(0).toUpperCase();

  return (
    <article
      className="trainer-review-card"
      aria-label={`Review from ${companyName}, ${review.rating} stars`}
    >
      <div className="trainer-review-card__brand">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className="trainer-review-card__logo"
            onError={(event) => {
              (event.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="trainer-review-card__logo-fallback" aria-hidden="true">
            {initial}
          </span>
        )}
        <p className="trainer-review-card__company mb-0">{companyName}</p>
      </div>

      {sessionDate && (
        <p className="trainer-review-card__date mb-0">{sessionDate}</p>
      )}

      <ReviewStars rating={review.rating} />

      {review.feedback?.trim() ? (
        <p className="trainer-review-card__feedback mb-0">{review.feedback.trim()}</p>
      ) : (
        <p className="trainer-review-card__feedback trainer-review-card__feedback--empty mb-0">
          No written feedback.
        </p>
      )}
    </article>
  );
}
