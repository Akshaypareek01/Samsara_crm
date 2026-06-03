"use client";

import React from 'react';
import type { Trainer } from '@/services/trainerService';
import { trainerDisplayRating } from '../utils/trainerDisplayRating';
import { trainerSpecialtyLabel } from '../utils/trainerCardDisplayUtils';

type CompanyTrainerCardProps = {
  trainer: Trainer;
  onViewProfile: (trainer: Trainer) => void;
};

/**
 * Compact trainer card — fixed height, minimal content (dashboard + list).
 */
const CompanyTrainerCard: React.FC<CompanyTrainerCardProps> = ({
  trainer,
  onViewProfile,
}) => {
  const seed = trainer._id || trainer.id || trainer.name;
  const { rating, reviews } = trainerDisplayRating(seed);
  const specialty = trainerSpecialtyLabel(trainer);

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
      <p className="company-trainer-card__specialty">{specialty}</p>

      <p className="company-trainer-card__rating" aria-label={`Rating ${rating}, ${reviews} reviews`}>
        <i className="ri-star-fill text-amber-400" aria-hidden="true"></i>
        <strong>{rating}</strong>
        <span>({reviews})</span>
      </p>

      <button
        type="button"
        className="company-trainer-card__btn"
        onClick={() => onViewProfile(trainer)}
        aria-label={`View profile for ${trainer.name}`}
      >
        View Profile
      </button>
    </article>
  );
};

export default CompanyTrainerCard;
