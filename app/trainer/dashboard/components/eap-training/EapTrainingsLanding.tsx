"use client";

import React, { useMemo } from "react";
import type { EapTraining } from "@/services/eapTrainingService";
import type { Trainer } from "@/services/trainerService";
import type { EapLandingTrainer } from "@/shared/utils/eapTrainingTrainerUtils";
import CompanyHomeTrainerCard from "@/app/company/dashboard/components/home/CompanyHomeTrainerCard";
import EapTrainerShowcaseCard from "./EapTrainerShowcaseCard";
import EapTrainingCard from "./EapTrainingCard";
import { EAP_FEATURED_LIMIT } from "@/hooks/useCompanyEapLanding";
import "@/shared/styles/eap-training-page.css";
import "./eap-training-landing.css";

type EapTrainingsLandingProps = {
  trainers: EapLandingTrainer[];
  trainings: EapTraining[];
  loading?: boolean;
  showPageTitle?: boolean;
  /** Company portal: dashboard-style cards, top 6 newest, swipeable rows. */
  featuredMode?: boolean;
  trainersSectionTitle?: string;
  trainersSectionSubtitle?: string;
  trainingsSectionTitle?: string;
  trainingsSectionSubtitle?: string;
  onTrainerClick?: (trainer: EapLandingTrainer) => void;
  onTrainingViewDetails?: (training: EapTraining) => void;
  onTrainingPreview?: (training: EapTraining) => void;
  onTrainingEdit?: (training: EapTraining) => void;
  onTrainingDelete?: (training: EapTraining) => void;
  onSeeAllTrainings?: () => void;
  showSeeAllButton?: boolean;
  onSeeAllTrainers?: () => void;
  showSeeAllTrainersButton?: boolean;
  /** When false, hides the trainings/programs section (e.g. company catalog page). */
  showTrainingsSection?: boolean;
  /** When false, hides the trainers/profile section (e.g. trainer manage page). */
  showTrainersSection?: boolean;
};

/**
 * EAP landing layout: featured trainer row + training row (dashboard-style when featured).
 */
const EapTrainingsLanding: React.FC<EapTrainingsLandingProps> = ({
  trainers,
  trainings,
  loading = false,
  showPageTitle = true,
  featuredMode = false,
  trainersSectionTitle = "Our Trainers",
  trainersSectionSubtitle = "Learn from experienced and certified professionals.",
  trainingsSectionTitle = "Available Trainings",
  trainingsSectionSubtitle = "Choose from our wide range of EAP training programs.",
  onTrainerClick,
  onTrainingViewDetails,
  onTrainingPreview,
  onTrainingEdit,
  onTrainingDelete,
  onSeeAllTrainings,
  showSeeAllButton = false,
  onSeeAllTrainers,
  showSeeAllTrainersButton = false,
  showTrainingsSection = true,
  showTrainersSection = true,
}) => {
  const isManageMode = Boolean(onTrainingPreview || onTrainingEdit || onTrainingDelete);

  const featuredTrainers = useMemo(
    () => (featuredMode ? trainers.slice(0, EAP_FEATURED_LIMIT) : trainers),
    [featuredMode, trainers]
  );

  const featuredTrainings = useMemo(
    () => (featuredMode ? trainings.slice(0, EAP_FEATURED_LIMIT) : trainings),
    [featuredMode, trainings]
  );

  const trainerSubtitle = featuredMode
    ? "Recently added EAP trainers — swipe to browse the latest profiles."
    : trainersSectionSubtitle;

  const trainingSubtitle = featuredMode
    ? "Newly created programs — swipe to explore the latest offerings."
    : trainingsSectionSubtitle;

  /**
   * Opens trainer profile when using dashboard-style cards.
   */
  const handleDashboardTrainerClick = (trainer: Trainer) => {
    onTrainerClick?.(trainer);
  };

  return (
    <div className="eap-landing">
      {showPageTitle && <h1 className="eap-landing__page-title">EAP Trainings</h1>}

      {showTrainersSection && (
      <section className="eap-landing__section" aria-labelledby="eap-trainers-section-title">
        <div className="eap-landing__section-head">
          <div className="eap-landing__section-head-main">
            <span className="eap-landing__section-icon" aria-hidden="true">
              <i className="ri-team-line" />
            </span>
            <div>
              <h2 className="eap-landing__section-title" id="eap-trainers-section-title">
                {trainersSectionTitle}
              </h2>
              <p className="eap-landing__section-subtitle">{trainerSubtitle}</p>
            </div>
          </div>
          {showSeeAllTrainersButton && onSeeAllTrainers && (
            <button
              type="button"
              className="eap-landing__see-all-small"
              onClick={onSeeAllTrainers}
              aria-label="See all EAP trainers"
            >
              See All
            </button>
          )}
        </div>

        {loading ? (
          <div className="eap-landing__loading" role="status" aria-live="polite">
            <div className="spinner-border text-primary">
              <span className="visually-hidden">Loading trainers…</span>
            </div>
          </div>
        ) : featuredTrainers.length === 0 ? (
          <p className="eap-landing__empty">No EAP trainers listed yet.</p>
        ) : featuredMode ? (
          <div
            className="eap-landing__scroll-row eap-landing__scroll-row--dashboard-trainers"
            role="list"
            aria-label={trainersSectionTitle}
          >
            {featuredTrainers.map((trainer) => {
              const key = trainer._id || trainer.id || trainer.name;
              return (
                <div key={key} role="listitem" className="eap-landing__dashboard-trainer-item">
                  <CompanyHomeTrainerCard
                    trainer={trainer as Trainer}
                    onViewProfile={handleDashboardTrainerClick}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="eap-landing__scroll-row" role="list" aria-label={trainersSectionTitle}>
            {featuredTrainers.map((trainer) => {
              const key = trainer._id || trainer.id || trainer.name;
              return (
                <div key={key} role="listitem" className="eap-landing__trainer-scroll-item">
                  <EapTrainerShowcaseCard trainer={trainer} onClick={onTrainerClick} />
                </div>
              );
            })}
          </div>
        )}
      </section>
      )}

      {showTrainingsSection && (
      <section className="eap-landing__section" aria-labelledby="eap-trainings-section-title">
        <div className="eap-landing__section-head">
          <span className="eap-landing__section-icon" aria-hidden="true">
            <i className="ri-graduation-cap-line" />
          </span>
          <div>
            <h2 className="eap-landing__section-title" id="eap-trainings-section-title">
              {trainingsSectionTitle}
            </h2>
            <p className="eap-landing__section-subtitle">{trainingSubtitle}</p>
          </div>
        </div>

        {loading ? (
          <div className="eap-landing__loading" role="status" aria-live="polite">
            <div className="spinner-border text-primary">
              <span className="visually-hidden">Loading trainings…</span>
            </div>
          </div>
        ) : featuredTrainings.length === 0 ? (
          <p className="eap-landing__empty">No training programs available yet.</p>
        ) : isManageMode ? (
          <div className="eap-landing__program-grid" role="list" aria-label={trainingsSectionTitle}>
            {featuredTrainings.map((training) => (
              <div key={training._id || training.id} role="listitem" className="eap-landing__program-item">
                <EapTrainingCard
                  training={training}
                  onPreview={onTrainingPreview}
                  onEdit={onTrainingPreview ? undefined : onTrainingEdit}
                  onDelete={onTrainingDelete}
                />
              </div>
            ))}
          </div>
        ) : featuredMode ? (
          <div
            className="eap-landing__scroll-row eap-landing__scroll-row--program"
            role="list"
            aria-label={trainingsSectionTitle}
          >
            {featuredTrainings.map((training) => (
              <div
                key={training._id || training.id}
                role="listitem"
                className="eap-landing__program-scroll-item"
              >
                <EapTrainingCard
                  training={training}
                  readOnly
                  onViewDetails={onTrainingViewDetails}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="eap-landing__program-grid" role="list" aria-label={trainingsSectionTitle}>
            {featuredTrainings.map((training) => (
              <div
                key={training._id || training.id}
                role="listitem"
                className="eap-landing__program-item"
              >
                <EapTrainingCard
                  training={training}
                  readOnly
                  onViewDetails={onTrainingViewDetails}
                />
              </div>
            ))}
          </div>
        )}
      </section>
      )}

      {showSeeAllButton && onSeeAllTrainings && showTrainingsSection && (
        <div className="eap-landing__see-all-wrap">
          <button
            type="button"
            className="eap-landing__see-all"
            onClick={onSeeAllTrainings}
            aria-label="See all EAP training programs"
          >
            <i className="ri-layout-grid-line" aria-hidden="true" />
            See All Trainings
          </button>
        </div>
      )}
    </div>
  );
};

export default EapTrainingsLanding;
