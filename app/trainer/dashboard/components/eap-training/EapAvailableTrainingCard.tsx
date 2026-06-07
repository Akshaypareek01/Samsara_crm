"use client";

import React from "react";
import type { EapTraining } from "@/services/eapTrainingService";
import {
  getEapTrainingDescription,
  getEapTrainingIconTheme,
} from "@/shared/utils/eapTrainingDisplayUtils";

type EapAvailableTrainingCardProps = {
  training: EapTraining;
  onViewDetails?: (training: EapTraining) => void;
  onEdit?: (training: EapTraining) => void;
  onDelete?: (training: EapTraining) => void;
};

/**
 * Browse-style EAP training card with icon, summary, and optional management actions.
 */
const EapAvailableTrainingCard: React.FC<EapAvailableTrainingCardProps> = ({
  training,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const theme = getEapTrainingIconTheme(training.title);
  const description = getEapTrainingDescription(training);
  const isManage = Boolean(onEdit || onDelete);

  return (
    <article className="eap-available-training" aria-labelledby={`eap-at-${training._id || training.id}`}>
      <div className="eap-available-training__top">
        <span
          className="eap-available-training__icon"
          style={{ backgroundColor: theme.bg, color: theme.color }}
          aria-hidden="true"
        >
          <i className={theme.icon} />
        </span>
        <div className="eap-available-training__content">
          <h3 className="eap-available-training__title" id={`eap-at-${training._id || training.id}`}>
            {training.title}
          </h3>
          <p className="eap-available-training__desc">{description}</p>
        </div>
      </div>

      <div className="eap-available-training__footer">
        {onViewDetails && (
          <button
            type="button"
            className="eap-available-training__link"
            onClick={() => onViewDetails(training)}
            aria-label={`View details for ${training.title}`}
          >
            View Details
            <i className="ri-arrow-right-line" aria-hidden="true" />
          </button>
        )}

        {isManage && (
          <div className="eap-available-training__actions">
            {onEdit && (
              <button
                type="button"
                className="eap-available-training__action-btn eap-available-training__action-btn--edit"
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
                className="eap-available-training__action-btn eap-available-training__action-btn--delete"
                onClick={() => onDelete(training)}
                aria-label={`Delete ${training.title}`}
              >
                <i className="ri-delete-bin-line" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default EapAvailableTrainingCard;
