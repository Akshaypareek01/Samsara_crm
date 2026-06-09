"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { EapTraining, EapDurationHours } from "@/services/eapTrainingService";
import type { Trainer } from "@/services/trainerService";
import { isTrainerAcceptingBookings } from "@/services/trainerService";
import {
  getEapTrainingTrainer,
  getEapTrainingTrainerId,
} from "@/shared/utils/eapTrainingTrainerUtils";
import { getEapTrainingDescription } from "@/shared/utils/eapTrainingDisplayUtils";
import {
  getOrderedEapSyllabusEntries,
  formatEapDurationLabel,
  formatEapSessionDurationLabel,
  normalizeEapDurationHours,
} from "@/shared/utils/eapTrainingUtils";
import CompanyTrainerProfilePanel from "../CompanyTrainerProfilePanel";
import CompanyEapSessionOptionCard from "./CompanyEapSessionOptionCard";
import CompanyEapBookingDrawer from "./CompanyEapBookingDrawer";

type DetailTab = "sessions" | "trainer";

type CompanyEapTrainingDetailViewProps = {
  training: EapTraining;
  fullTrainer?: Trainer | null;
  trainerLoading?: boolean;
  /** Trainer manage flow: show company-facing layout without booking actions. */
  previewMode?: boolean;
  /** Hide back navigation (e.g. inside a drawer). */
  hideBackLink?: boolean;
};

const DETAIL_TABS: { id: DetailTab; label: string; icon: string }[] = [
  { id: "sessions", label: "Sessions", icon: "ri-time-line" },
  { id: "trainer", label: "Trainer Profile", icon: "ri-user-line" },
];

/**
 * EAP training detail with hero cover, tabbed sessions + trainer profile, and booking CTA.
 */
const CompanyEapTrainingDetailView: React.FC<CompanyEapTrainingDetailViewProps> = ({
  training,
  fullTrainer,
  trainerLoading = false,
  previewMode = false,
  hideBackLink = false,
}) => {
  const sessionEntries = useMemo(() => getOrderedEapSyllabusEntries(training), [training]);
  const normalizedDurations = useMemo(
    () =>
      Array.from(new Set(training.durationOptions.map((h) => normalizeEapDurationHours(h)))).sort(
        (a, b) => a - b
      ) as EapDurationHours[],
    [training.durationOptions]
  );
  const defaultDuration =
    normalizedDurations[0] ?? sessionEntries[0]?.durationHours ?? null;
  const summary = getEapTrainingDescription(training);

  const [activeTab, setActiveTab] = useState<DetailTab>("sessions");
  const [selectedDuration, setSelectedDuration] = useState<EapDurationHours | null>(defaultDuration);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [coverError, setCoverError] = useState(false);

  useEffect(() => {
    setActiveTab("sessions");
    setSelectedDuration(defaultDuration);
    setCoverError(false);
  }, [training._id, training.id, defaultDuration]);

  const populatedTrainer = getEapTrainingTrainer(training);
  const trainer: Trainer | null =
    fullTrainer ||
    (populatedTrainer
      ? ({
          ...populatedTrainer,
          _id: getEapTrainingTrainerId(training),
        } as Trainer)
      : null);
  const canBook = trainer ? isTrainerAcceptingBookings(trainer) : false;

  /**
   * Open booking drawer after a session duration is selected.
   */
  const handleBookingClick = () => {
    if (!selectedDuration) return;
    setBookingOpen(true);
  };

  return (
    <div className={`company-eap-detail${previewMode ? " company-eap-detail--preview" : ""}`}>
      {previewMode && (
        <p className="company-eap-detail__preview-note" role="status">
          <i className="ri-eye-line" aria-hidden="true" />
          Company preview — this is how your program appears to clients.
        </p>
      )}

      {!hideBackLink && !previewMode && (
        <Link href="/company/dashboard/eap-trainers" className="company-eap-detail__back">
          <i className="ri-arrow-left-line" aria-hidden="true" />
          Back to programs
        </Link>
      )}

      <header className="company-eap-detail__hero">
        <div className="company-eap-detail__hero-body">
          <h1 className="company-eap-detail__hero-title">{training.title}</h1>
          {summary && <p className="company-eap-detail__hero-summary">{summary}</p>}
          <div className="company-eap-detail__hero-badges" aria-label="Available session durations">
            {normalizedDurations.map((hours) => (
              <span key={hours} className="company-eap-detail__hero-badge">
                {formatEapDurationLabel(hours)}
              </span>
            ))}
          </div>
          {trainer?.name && (
            <p className="company-eap-detail__hero-trainer">
              <i className="ri-user-star-line" aria-hidden="true" />
              Led by {trainer.name}
            </p>
          )}
        </div>
        <div className="company-eap-detail__hero-media">
          {training.coverImage && !coverError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={training.coverImage}
              alt=""
              className="company-eap-detail__hero-cover"
              onError={() => setCoverError(true)}
            />
          ) : (
            <div className="company-eap-detail__hero-cover-fallback" aria-hidden="true">
              <i className="ri-image-line" />
              <span>No cover image</span>
            </div>
          )}
        </div>
      </header>

      <div className="company-eap-detail__tabs" role="tablist" aria-label="Program sections">
        {DETAIL_TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`eap-detail-tab-${id}`}
            aria-selected={activeTab === id}
            aria-controls={`eap-detail-panel-${id}`}
            className={`company-eap-detail__tab ${
              activeTab === id ? "company-eap-detail__tab--active" : ""
            }`}
            onClick={() => setActiveTab(id)}
          >
            <i className={icon} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "sessions" && (
        <section
          id="eap-detail-panel-sessions"
          role="tabpanel"
          aria-labelledby="eap-detail-tab-sessions"
          className="company-eap-detail__panel"
        >
          <h2 className="company-eap-detail__panel-title">Select a session</h2>
          <p className="company-eap-detail__panel-subtitle">
            {previewMode
              ? "Companies choose a duration to view the outline before booking."
              : "Choose a duration to view the outline, then book your preferred slot."}
          </p>
          <div
            className="company-eap-detail__session-list"
            role="radiogroup"
            aria-label="Session options"
          >
            {sessionEntries.length > 0 ? (
              sessionEntries.map((entry) => (
                <CompanyEapSessionOptionCard
                  key={entry.durationHours}
                  durationHours={entry.durationHours}
                  description={entry.description}
                  selected={selectedDuration === entry.durationHours}
                  onSelect={() => setSelectedDuration(entry.durationHours)}
                />
              ))
            ) : (
              training.durationOptions.map((hours) => (
                <CompanyEapSessionOptionCard
                  key={hours}
                  durationHours={hours}
                  description=""
                  selected={selectedDuration === hours}
                  onSelect={() => setSelectedDuration(hours)}
                />
              ))
            )}
          </div>

          {!previewMode && (
            <div className="company-eap-detail__book-bar">
              {!canBook && (
                <p className="company-eap-detail__book-note" role="status">
                  This trainer is not accepting new bookings right now.
                </p>
              )}
              {!selectedDuration && (
                <p className="company-eap-detail__book-note" role="status">
                  Select a session above to continue.
                </p>
              )}
              <button
                type="button"
                className="company-eap-detail__book-btn"
                disabled={!canBook || trainerLoading || !selectedDuration}
                onClick={handleBookingClick}
                aria-label={
                  selectedDuration
                    ? `Book ${training.title} — ${formatEapSessionDurationLabel(selectedDuration)}`
                    : "Select a session to book"
                }
              >
                <i className="ri-calendar-check-line" aria-hidden="true" />
                Booking
              </button>
            </div>
          )}
        </section>
      )}

      {activeTab === "trainer" && (
        <section
          id="eap-detail-panel-trainer"
          role="tabpanel"
          aria-labelledby="eap-detail-tab-trainer"
          className="company-eap-detail__panel"
        >
          <div className="company-eap-detail__trainer-profile-wrap">
            <CompanyTrainerProfilePanel
              trainer={trainer}
              loading={trainerLoading}
              variant="embedded"
            />
          </div>
        </section>
      )}

      {!previewMode && (
        <CompanyEapBookingDrawer
          trainer={trainer}
          training={training}
          isOpen={bookingOpen}
          initialDuration={selectedDuration}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </div>
  );
};

export default CompanyEapTrainingDetailView;
