"use client";

import React from 'react';
import type { Trainer } from '@/services/trainerService';
import CompanyTrainerCard from '../CompanyTrainerCard';

type CompanyHomeTrainerCardProps = {
  trainer: Trainer;
  onViewProfile: (trainer: Trainer) => void;
};

/**
 * Compact trainer card for dashboard category rows.
 */
const CompanyHomeTrainerCard: React.FC<CompanyHomeTrainerCardProps> = (props) => (
  <CompanyTrainerCard {...props} />
);

export default CompanyHomeTrainerCard;
