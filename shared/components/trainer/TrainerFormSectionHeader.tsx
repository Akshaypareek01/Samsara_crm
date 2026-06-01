"use client";
import React from 'react';

interface TrainerFormSectionHeaderProps {
  /** Section index shown in the badge (e.g. 1, 2). */
  number: number;
  /** Section heading text. */
  title: string;
  /** Optional muted suffix (e.g. "optional"). */
  subtitle?: string;
}

/**
 * Numbered section heading used on trainer registration and profile forms.
 *
 * @param props - Section number, title and optional subtitle.
 * @returns A flex row with badge and heading.
 */
const TrainerFormSectionHeader: React.FC<TrainerFormSectionHeaderProps> = ({
  number,
  title,
  subtitle,
}) => (
  <div className="flex items-center gap-2 mb-4">
    <span
      className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold"
      aria-hidden="true"
    >
      {number}
    </span>
    <h3 className="font-semibold text-base text-defaulttextcolor">
      {title}
      {subtitle ? (
        <span className="text-muted text-xs font-normal ms-1">({subtitle})</span>
      ) : null}
    </h3>
  </div>
);

export default TrainerFormSectionHeader;
