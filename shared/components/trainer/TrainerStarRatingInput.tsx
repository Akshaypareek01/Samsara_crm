"use client";

import React from "react";

type TrainerStarRatingInputProps = {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  label?: string;
};

/**
 * Interactive 1–5 star rating input for session feedback forms.
 */
export default function TrainerStarRatingInput({
  value,
  onChange,
  disabled = false,
  label = "Your rating",
}: TrainerStarRatingInputProps) {
  return (
    <div role="group" aria-label={label}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">{label}</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= value;
          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              className="p-1 bg-transparent border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onChange(star)}
              aria-label={`Rate ${star} out of 5 stars`}
              aria-pressed={filled}
            >
              <i
                className={`text-2xl ${filled ? "ri-star-fill text-amber-400" : "ri-star-line text-gray-300"}`}
                aria-hidden="true"
              />
            </button>
          );
        })}
        {value > 0 ? (
          <span className="text-sm text-gray-600 ms-2" aria-live="polite">
            {value}/5
          </span>
        ) : (
          <span className="text-sm text-gray-400 ms-2">Select a rating</span>
        )}
      </div>
    </div>
  );
}
