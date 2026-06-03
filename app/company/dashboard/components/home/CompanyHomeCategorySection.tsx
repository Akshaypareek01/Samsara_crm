"use client";

import React from 'react';
import Link from 'next/link';
import type { Trainer } from '@/services/trainerService';
import CompanyHomeTrainerCard from './CompanyHomeTrainerCard';
import { trainersPageUrl } from '../../utils/trainersPageUrl';

type CompanyHomeCategorySectionProps = {
  title: string;
  category: string;
  trainers: Trainer[];
  loading: boolean;
  onViewProfile: (trainer: Trainer) => void;
};

/**
 * Horizontal category row with trainer cards and a view-all link.
 */
const CompanyHomeCategorySection: React.FC<CompanyHomeCategorySectionProps> = ({
  title,
  category,
  trainers,
  loading,
  onViewProfile,
}) => {
  const viewAllHref = trainersPageUrl(category);

  return (
    <section className="mb-8" aria-labelledby={`category-${category}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 id={`category-${category}`} className="company-home-section-title mb-0">
          {title}
        </h2>
        <Link
          href={viewAllHref}
          className="company-home-view-all inline-flex items-center gap-1 whitespace-nowrap"
          aria-label={`View all ${title}`}
        >
          View All
          <i className="ri-arrow-right-line" aria-hidden="true"></i>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-10" role="status" aria-live="polite">
          <div className="spinner-border text-primary">
            <span className="visually-hidden">Loading trainers</span>
          </div>
        </div>
      ) : trainers.length === 0 ? (
        <p className="text-sm text-muted py-6 text-center rounded-xl bg-light/50 border border-defaultborder">
          No trainers in this category yet. Check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {trainers.map((trainer) => (
            <CompanyHomeTrainerCard
              key={trainer._id || trainer.id}
              trainer={trainer}
              onViewProfile={onViewProfile}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CompanyHomeCategorySection;
