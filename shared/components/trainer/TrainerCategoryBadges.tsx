"use client";

import React from 'react';

type TrainerCategoryBadgesProps = {
  /** Display labels for each category badge. */
  labels: string[];
  /** Optional extra class names on the wrapper. */
  className?: string;
  /** Badge size variant. */
  size?: 'sm' | 'md';
};

/**
 * Renders one or more category pills for trainer profiles and cards.
 *
 * @param props - Labels and optional styling.
 */
const TrainerCategoryBadges: React.FC<TrainerCategoryBadgesProps> = ({
  labels,
  className = '',
  size = 'sm',
}) => {
  if (labels.length === 0) return null;

  const sizeClass =
    size === 'md'
      ? 'text-xs font-semibold px-2.5 py-1'
      : 'text-[0.65rem] font-semibold px-2 py-0.5';

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`.trim()} aria-label="Trainer categories">
      {labels.map((label) => (
        <span
          key={label}
          className={`rounded-full bg-primary/10 text-primary ${sizeClass}`}
        >
          {label}
        </span>
      ))}
    </div>
  );
};

export default TrainerCategoryBadges;
