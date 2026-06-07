"use client";

import React from "react";
import type { EapLandingTrainer } from "@/shared/utils/eapTrainingTrainerUtils";
import { formatTrainerExperienceLabel } from "@/shared/utils/eapTrainingDisplayUtils";

type EapTrainerShowcaseCardProps = {
  trainer: EapLandingTrainer;
  onClick?: (trainer: EapLandingTrainer) => void;
};

/**
 * Compact trainer profile card for EAP landing rows (photo, name, title, experience).
 */
const EapTrainerShowcaseCard: React.FC<EapTrainerShowcaseCardProps> = ({ trainer, onClick }) => {
  const photoUrl = trainer.profilePhoto?.path || "";
  const experienceLabel = formatTrainerExperienceLabel(trainer.experience);
  const initial = trainer.name?.charAt(0).toUpperCase() || "?";

  const content = (
    <>
      <span className="eap-trainer-showcase__badge" aria-hidden="true">
        <i className="ri-user-line" />
      </span>
      <div className="eap-trainer-showcase__photo-ring">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="" className="eap-trainer-showcase__photo" />
        ) : (
          <span
            className="eap-trainer-showcase__photo eap-trainer-showcase__photo--fallback"
            aria-hidden="true"
          >
            {initial}
          </span>
        )}
      </div>
      <h3 className="eap-trainer-showcase__name">{trainer.name}</h3>
      <p className="eap-trainer-showcase__title">{trainer.title}</p>
      <p className="eap-trainer-showcase__experience">
        <i className="ri-user-smile-line" aria-hidden="true" />
        {experienceLabel}
      </p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className="eap-trainer-showcase eap-trainer-showcase--clickable"
        onClick={() => onClick(trainer)}
        aria-label={`View profile for ${trainer.name}`}
      >
        {content}
      </button>
    );
  }

  return <article className="eap-trainer-showcase">{content}</article>;
};

export default EapTrainerShowcaseCard;
