"use client";

import React from 'react';
import Link from 'next/link';
import type { Trainer } from '@/services/trainerService';
import { trainerSpecialtyLabel } from '../utils/trainerCardDisplayUtils';
import { getTrainerRecordId, trainerProfilePageUrl } from '../utils/trainerProfilePageUrl';
import TrainerRatingBadge from '@/shared/components/trainer/TrainerRatingBadge';

type CompanyTrainerCardProps = {
  trainer: Trainer;
  /** Internal path used for the profile page back link. */
  returnTo?: string;
  /** When set, opens profile via callback instead of navigating to the profile page. */
  onViewProfile?: (trainer: Trainer) => void;
};

/**
 * Compact trainer card — fixed height, minimal content (dashboard + list).
 */
const CompanyTrainerCard: React.FC<CompanyTrainerCardProps> = ({
  trainer,
  returnTo = '/company/dashboard',
  onViewProfile,
}) => {
  const professionalTitle = trainerSpecialtyLabel(trainer);
  const trainerId = getTrainerRecordId(trainer);
  const profileHref = trainerId ? trainerProfilePageUrl(trainerId, returnTo) : undefined;

  return (
    <article className="company-trainer-card">
      <div className="company-trainer-card__photo-wrap">
        {trainer.profilePhoto?.path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trainer.profilePhoto.path}
            alt=""
            className="company-trainer-card__photo"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="company-trainer-card__photo company-trainer-card__photo--fallback" aria-hidden="true">
            <span>{trainer.name.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>

      <h3 className="company-trainer-card__name">{trainer.name}</h3>
      <p className="company-trainer-card__specialty">{professionalTitle}</p>

      <TrainerRatingBadge trainer={trainer} className="company-trainer-card__rating" />

      {onViewProfile ? (
        <button
          type="button"
          className="company-trainer-card__btn"
          aria-label={`View profile for ${trainer.name}`}
          onClick={() => onViewProfile(trainer)}
        >
          View Profile
        </button>
      ) : profileHref ? (
        <Link
          href={profileHref}
          className="company-trainer-card__btn"
          aria-label={`View profile for ${trainer.name}`}
        >
          View Profile
        </Link>
      ) : (
        <span
          className="company-trainer-card__btn company-trainer-card__btn--disabled"
          aria-disabled="true"
        >
          View Profile
        </span>
      )}
    </article>
  );
};

export default CompanyTrainerCard;
