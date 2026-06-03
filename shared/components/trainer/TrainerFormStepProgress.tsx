"use client";
import React from 'react';
import '@/shared/styles/trainer-form-sections.css';

const REGISTRATION_STEPS = [
  { number: 1, label: 'Trainer Type & Personal' },
  { number: 2, label: 'Education & Courses' },
  { number: 3, label: 'Bio & Specializations' },
  { number: 4, label: 'Photos & Submit' },
] as const;

interface TrainerFormStepProgressProps {
  /** Currently active step number (1–4). Defaults to all active on single-page form. */
  activeStep?: number;
  /** When true, all steps appear active (single-page registration). */
  allActive?: boolean;
}

/**
 * Circular step labels matching the HTML registration sidebar.
 *
 * @param props - Active step or all-active mode for single-page forms.
 * @returns Vertical/horizontal step list with circle badges.
 */
const TrainerFormStepProgress: React.FC<TrainerFormStepProgressProps> = ({
  activeStep = 4,
  allActive = true,
}) => (
  <nav className="trainer-form-steps" aria-label="Registration steps">
    {REGISTRATION_STEPS.map((step) => {
      const isActive = allActive || step.number <= activeStep;
      return (
        <div
          key={step.number}
          className={`trainer-form-step-item${isActive ? ' active' : ''}`}
        >
          <span className="trainer-form-step-dot" aria-hidden="true">
            {step.number}
          </span>
          <span>{step.label}</span>
        </div>
      );
    })}
  </nav>
);

export default TrainerFormStepProgress;
