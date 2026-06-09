"use client";

import React, { useState } from "react";
import type { EapTraining } from "@/services/eapTrainingService";
import { getEapTrainingDescription } from "@/shared/utils/eapTrainingDisplayUtils";
import { formatEapDurationLabel, normalizeEapDurationHours } from "@/shared/utils/eapTrainingUtils";

type EapTrainingCardProps = {
  training: EapTraining;
  readOnly?: boolean;
  onPreview?: (training: EapTraining) => void;
  onEdit?: (training: EapTraining) => void;
  onDelete?: (training: EapTraining) => void;
  onBook?: (training: EapTraining) => void;
  onViewDetails?: (training: EapTraining) => void;
};

/**
 * Program card with cover image, title, summary, durations, and optional actions.
 */
const EapTrainingCard: React.FC<EapTrainingCardProps> = ({
  training,
  readOnly = false,
  onPreview,
  onEdit,
  onDelete,
  onBook,
  onViewDetails,
}) => {
  const id = training._id || training.id || training.title;
  const [coverError, setCoverError] = useState(false);
  const description = getEapTrainingDescription(training);
  const sessionCount = training.syllabus?.length ?? training.durationOptions.length;
  const isBrowse = readOnly && Boolean(onViewDetails);

  return (
    <article
      className={`eap-training-card${isBrowse ? " eap-training-card--browse" : ""}`}
      aria-labelledby={`eap-training-title-${id}`}
    >
      <div className="eap-training-card__cover-wrap">
        {training.coverImage && !coverError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={training.coverImage}
            alt=""
            className="eap-training-card__cover"
            onError={() => setCoverError(true)}
          />
        ) : (
          <div className="eap-training-card__cover-fallback" aria-hidden="true">
            <i className="ri-image-line" />
            <span>No cover image</span>
          </div>
        )}
      </div>

      <div className="eap-training-card__body">
        <h3 className="eap-training-card__title" id={`eap-training-title-${id}`}>
          {training.title}
        </h3>
        <p className="eap-training-card__desc">{description}</p>

        <div className="eap-training-card__meta" aria-label="Program details">
          <span className="eap-training-card__meta-item">
            <i className="ri-time-line" aria-hidden="true" />
            {sessionCount} session option{sessionCount === 1 ? "" : "s"}
          </span>
        </div>

        <div className="eap-training-card__badges" aria-label="Available durations">
          {training.durationOptions.map((hours) => (
            <span key={hours} className="eap-training-card__badge">
              {formatEapDurationLabel(normalizeEapDurationHours(hours))}
            </span>
          ))}
        </div>

        {!readOnly && (onPreview || onEdit || onDelete) && (
          <div className="eap-training-card__actions">
            {onPreview && (
              <button
                type="button"
                className="eap-training-btn eap-training-btn--ghost eap-training-card__action-grow"
                onClick={() => onPreview(training)}
                aria-label={`Preview ${training.title}`}
              >
                <i className="ri-eye-line" aria-hidden="true" />
                Preview
              </button>
            )}
            {!onPreview && onEdit && (
              <button
                type="button"
                className="eap-training-btn eap-training-btn--ghost eap-training-card__action-grow"
                onClick={() => onEdit(training)}
                aria-label={`Edit ${training.title}`}
              >
                <i className="ri-edit-line" aria-hidden="true" />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="eap-training-btn eap-training-btn--danger"
                onClick={() => onDelete(training)}
                aria-label={`Delete ${training.title}`}
              >
                <i className="ri-delete-bin-line" aria-hidden="true" />
                Delete
              </button>
            )}
          </div>
        )}
        {readOnly && (onViewDetails || onBook) && (
          <div className="eap-training-card__actions">
            {onViewDetails && (
              <button
                type="button"
                className="eap-training-btn eap-training-btn--primary eap-training-card__action-grow"
                onClick={() => onViewDetails(training)}
                aria-label={`View details for ${training.title}`}
              >
                View Details
                <i className="ri-arrow-right-line" aria-hidden="true" />
              </button>
            )}
            {onBook && (
              <button
                type="button"
                className="eap-training-btn eap-training-btn--primary eap-training-card__action-grow"
                onClick={() => onBook(training)}
                aria-label={`Book ${training.title}`}
              >
                Book
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default EapTrainingCard;
