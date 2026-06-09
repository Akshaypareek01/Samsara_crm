"use client";

import React from "react";
import type { EapDurationHours } from "@/services/eapTrainingService";
import { formatEapSessionDurationLabel } from "@/shared/utils/eapTrainingUtils";

type CompanyEapSessionOptionCardProps = {
  durationHours: EapDurationHours;
  description: string;
  selected: boolean;
  onSelect: () => void;
};

/**
 * Selectable EAP session duration card with syllabus paragraph details.
 */
const CompanyEapSessionOptionCard: React.FC<CompanyEapSessionOptionCardProps> = ({
  durationHours,
  description,
  selected,
  onSelect,
}) => {
  const label = formatEapSessionDurationLabel(durationHours);
  const inputId = `eap-session-${durationHours}h`;

  return (
    <button
      type="button"
      id={inputId}
      className={`company-eap-session-card${selected ? " company-eap-session-card--selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Select ${label}`}
    >
      <span className="company-eap-session-card__select">
        <span className="company-eap-session-card__radio" aria-hidden="true">
          {selected && <span className="company-eap-session-card__radio-dot" />}
        </span>
        <span className="company-eap-session-card__title">{label}</span>
      </span>

      <span className="company-eap-session-card__details">
        {description.trim() ? (
          <p className="company-eap-session-card__description">{description}</p>
        ) : (
          <p className="company-eap-session-card__empty">Session outline will be shared before the booking.</p>
        )}
      </span>
    </button>
  );
};

export default CompanyEapSessionOptionCard;
