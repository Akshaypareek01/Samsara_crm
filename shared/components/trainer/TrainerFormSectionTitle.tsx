"use client";
import React from 'react';
import '@/shared/styles/trainer-form-sections.css';

interface TrainerFormSectionTitleProps {
  /** Uppercase section heading (e.g. "Trainer Type"). */
  title: string;
  /** Remix Icon class name (e.g. "ri-user-line"). */
  iconClass: string;
}

/**
 * Purple uppercase section heading with icon and gradient rule line.
 * Matches trainer_registration_form_v2.html `.section-title`.
 *
 * @param props - Section title and icon class.
 * @returns Styled section heading row.
 */
const TrainerFormSectionTitle: React.FC<TrainerFormSectionTitleProps> = ({ title, iconClass }) => (
  <h3 className="trainer-form-section-title">
    <i className={iconClass} aria-hidden="true" />
    {title}
  </h3>
);

export default TrainerFormSectionTitle;
