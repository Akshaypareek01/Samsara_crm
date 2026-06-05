"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { EapTraining } from "@/services/eapTrainingService";
import {
  getEapTrainingTrainer,
  getEapTrainingTrainerPhoto,
} from "@/shared/utils/eapTrainingTrainerUtils";

type CompanyEapTrainingBrowseCardProps = {
  training: EapTraining;
};

/**
 * Browse card for an EAP training program on the company catalog.
 */
const CompanyEapTrainingBrowseCard: React.FC<CompanyEapTrainingBrowseCardProps> = ({
  training,
}) => {
  const router = useRouter();
  const id = training._id || training.id;
  const trainer = getEapTrainingTrainer(training);
  const photoUrl = getEapTrainingTrainerPhoto(training);

  /**
   * Navigate to the training detail page.
   */
  const openDetail = () => {
    if (id) router.push(`/company/dashboard/eap-trainers/${id}`);
  };

  return (
    <article className="company-eap-browse-card">
      <button
        type="button"
        className="company-eap-browse-card__cover-btn"
        onClick={openDetail}
        aria-label={`View ${training.title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={training.coverImage}
          alt=""
          className="company-eap-browse-card__cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </button>

      <div className="company-eap-browse-card__body">
        <h3 className="company-eap-browse-card__title">{training.title}</h3>

        {trainer?.name && (
          <div className="company-eap-browse-card__trainer">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="company-eap-browse-card__avatar" />
            ) : (
              <span className="company-eap-browse-card__avatar company-eap-browse-card__avatar--fallback" aria-hidden="true">
                {trainer.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="company-eap-browse-card__trainer-name">{trainer.name}</span>
          </div>
        )}

        <div className="company-eap-browse-card__badges" aria-label="Available durations">
          {training.durationOptions.map((hours) => (
            <span key={hours} className="company-eap-browse-card__badge">
              {hours} hr{hours === 1 ? "" : "s"}
            </span>
          ))}
        </div>

        <button
          type="button"
          className="company-eap-browse-card__cta"
          onClick={openDetail}
          aria-label={`View program details for ${training.title}`}
        >
          View program
          <i className="ri-arrow-right-line" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
};

export default CompanyEapTrainingBrowseCard;
