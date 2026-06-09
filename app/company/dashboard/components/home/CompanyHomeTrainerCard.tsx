"use client";

import React from 'react';
import type { Trainer } from '@/services/trainerService';
import CompanyTrainerCard from '../CompanyTrainerCard';

type CompanyHomeTrainerCardProps = {
  trainer: Trainer;
  /** When set, opens profile via callback instead of navigating to the profile page. */
  onViewProfile?: (trainer: Trainer) => void;
};

/**
 * Compact trainer card for dashboard category rows.
 */
const CompanyHomeTrainerCard: React.FC<CompanyHomeTrainerCardProps> = ({
  trainer,
  onViewProfile,
}) => (
  <CompanyTrainerCard
    trainer={trainer}
    returnTo="/company/dashboard"
    onViewProfile={onViewProfile}
  />
);

export default CompanyHomeTrainerCard;
