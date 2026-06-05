"use client";

import React from "react";
import type { EapTraining } from "@/services/eapTrainingService";

type EapTrainingCardProps = {
  training: EapTraining;
  readOnly?: boolean;
  onEdit?: (training: EapTraining) => void;
  onDelete?: (training: EapTraining) => void;
  onBook?: (training: EapTraining) => void;
};

/**
 * Card displaying an EAP training program with optional trainer or company actions.
 */
const EapTrainingCard: React.FC<EapTrainingCardProps> = ({
  training,
  readOnly = false,
  onEdit,
  onDelete,
  onBook,
}) => {
  const id = training._id || training.id || training.title;

  return (
    <article className="eap-training-card" aria-labelledby={`eap-training-title-${id}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={training.coverImage}
        alt=""
        className="eap-training-card__cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div className="eap-training-card__body">
        <h3 className="eap-training-card__title" id={`eap-training-title-${id}`}>
          {training.title}
        </h3>
        <div className="eap-training-card__badges" aria-label="Available durations">
          {training.durationOptions.map((hours) => (
            <span key={hours} className="eap-training-card__badge">
              {hours} hr{hours === 1 ? "" : "s"}
            </span>
          ))}
        </div>
        {!readOnly && (onEdit || onDelete) && (
          <div className="eap-training-card__actions">
            {onEdit && (
              <button
                type="button"
                className="eap-training-btn eap-training-btn--ghost"
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
        {readOnly && onBook && (
          <div className="eap-training-card__actions">
            <button
              type="button"
              className="eap-training-btn eap-training-btn--primary w-full justify-center"
              onClick={() => onBook(training)}
              aria-label={`Book ${training.title}`}
            >
              Book
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default EapTrainingCard;
