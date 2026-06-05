"use client";

import React, { useEffect, useState } from "react";
import type { Trainer } from "@/services/trainerService";
import { isTrainerAcceptingBookings } from "@/services/trainerService";
import companyService from "@/services/companyService";
import bookingService, { type CreateBookingRequest } from "@/services/bookingService";
import { clearCompanyInsightsCache } from "@/services/companyInsightsClient";
import type { EapTraining, EapDurationHours } from "@/services/eapTrainingService";
import { getEapSyllabusPointsForDuration } from "@/shared/utils/eapTrainingUtils";
import {
  BOOKING_NOTES_MAX_LENGTH,
  normalizeBookingNotes,
  validateBookingNotes,
  bookingNotesRemaining,
} from "@/shared/utils/bookingFormUtils";
import Swal from "sweetalert2";
import CompanyRightDrawer from "../CompanyRightDrawer";
import "./company-eap-booking-drawer.css";

export type CompanyEapBookingDrawerProps = {
  trainer: Trainer | null;
  training: EapTraining | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

/**
 * Booking drawer for EAP training programs with duration-specific syllabus display.
 */
const CompanyEapBookingDrawer: React.FC<CompanyEapBookingDrawerProps> = ({
  trainer,
  training,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateBookingRequest>({
    company: "",
    trainer: "",
    bookingDate: "",
    startTime: "",
    duration: 2,
    typeOfTraining: [],
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    bookingDate?: string;
    startTime?: string;
  }>({});

  useEffect(() => {
    if (!isOpen || !trainer || !training) return;

    const init = async () => {
      try {
        const companyProfile = await companyService.getCompanyProfile();
        const trainerId = trainer._id || trainer.id || "";
        const defaultDuration = training.durationOptions[0] ?? 2;
        setSelectedDuration(defaultDuration);
        setFormData({
          company: companyProfile._id || companyProfile.id || "",
          trainer: trainerId,
          bookingDate: "",
          startTime: "",
          duration: defaultDuration,
          typeOfTraining: [training.title],
          eapTraining: training._id || training.id,
          notes: "",
        });
        setNotesError(null);
        setFieldErrors({});
      } catch (error) {
        console.error("Error loading EAP booking drawer:", error);
      }
    };
    void init();
  }, [isOpen, trainer, training]);

  /**
   * Validate booking form before submit.
   */
  const validateForm = (): boolean => {
    const nextFieldErrors: { bookingDate?: string; startTime?: string } = {};
    let valid = true;

    if (!selectedDuration) {
      void Swal.fire({ icon: "warning", title: "Select a duration" });
      return false;
    }
    if (!formData.bookingDate) {
      nextFieldErrors.bookingDate = "Please select a date";
      valid = false;
    }
    if (!formData.startTime) {
      nextFieldErrors.startTime = "Please select a start time";
      valid = false;
    }
    if (formData.bookingDate && formData.startTime) {
      const bookingDateTime = new Date(`${formData.bookingDate}T${formData.startTime}`);
      if (bookingDateTime <= new Date()) {
        nextFieldErrors.startTime = "Date and time must be in the future";
        valid = false;
      }
    }

    const notesValidation = validateBookingNotes(formData.notes);
    setNotesError(notesValidation);
    if (notesValidation) valid = false;

    setFieldErrors(nextFieldErrors);
    if (!valid && !notesValidation) {
      void Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fix the highlighted fields.",
      });
    }
    return valid;
  };

  /**
   * Handle notes input with live length validation.
   *
   * @param value - Updated notes text.
   */
  const handleNotesChange = (value: string) => {
    const next = value.slice(0, BOOKING_NOTES_MAX_LENGTH);
    setNotesError(validateBookingNotes(next));
    setFormData((prev) => ({ ...prev, notes: next }));
  };

  /**
   * Select session duration and sync form state.
   *
   * @param hours - Selected duration in hours.
   */
  const selectDuration = (hours: EapDurationHours) => {
    setSelectedDuration(hours);
    setFormData((prev) => ({ ...prev, duration: hours }));
  };

  /**
   * Submit EAP booking to the API.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !training) return;

    if (!isTrainerAcceptingBookings(trainer)) {
      void Swal.fire({
        icon: "info",
        title: "Not available",
        text: "This trainer is not accepting new bookings right now.",
      });
      return;
    }

    try {
      setLoading(true);
      await bookingService.createBooking({
        ...formData,
        duration: selectedDuration!,
        typeOfTraining: [training.title],
        eapTraining: training._id || training.id,
        notes: normalizeBookingNotes(formData.notes),
      });
      clearCompanyInsightsCache();
      void Swal.fire({
        icon: "success",
        title: "Booking Created!",
        text: "Your booking has been submitted and is waiting for admin approval.",
      });
      onClose();
      onSuccess?.();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to create booking.";
      void Swal.fire({ icon: "error", title: "Booking Failed", text: msg });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !trainer || !training) return null;

  const syllabusPoints = getEapSyllabusPointsForDuration(training, selectedDuration ?? 0);
  const canBook = isTrainerAcceptingBookings(trainer);
  const notesLength = formData.notes?.length ?? 0;
  const notesRemaining = bookingNotesRemaining(formData.notes);
  const trainerPhoto = trainer.profilePhoto?.path;

  const footer = (
    <div className="company-eap-booking-footer" role="group" aria-label="Booking actions">
      <button
        type="submit"
        form="company-eap-booking-form"
        className="company-eap-booking-footer__submit"
        disabled={loading || !canBook || !!notesError}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            Creating…
          </>
        ) : (
          <>
            <i className="ri-calendar-check-line" aria-hidden="true" />
            Create booking
          </>
        )}
      </button>
      <button
        type="button"
        className="company-eap-booking-footer__cancel"
        onClick={onClose}
        disabled={loading}
      >
        Cancel
      </button>
    </div>
  );

  return (
    <CompanyRightDrawer
      open={isOpen}
      title="Book session"
      onClose={onClose}
      maxWidthClass="max-w-lg"
      stacked
      ariaLabelledBy="company-eap-booking-title"
      footer={footer}
    >
      <form id="company-eap-booking-form" onSubmit={handleSubmit} className="company-eap-booking-form">
        <div className="company-eap-booking-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={training.coverImage} alt="" className="company-eap-booking-hero__cover" />
          <div className="company-eap-booking-hero__body">
            <p className="company-eap-booking-hero__title">{training.title}</p>
            <p className="company-eap-booking-hero__trainer">
              {trainerPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={trainerPhoto} alt="" className="company-eap-booking-hero__avatar" />
              ) : (
                <span
                  className="company-eap-booking-hero__avatar company-eap-booking-hero__avatar--fallback"
                  aria-hidden="true"
                >
                  {trainer.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span>{trainer.name}</span>
            </p>
          </div>
        </div>

        <section className="company-eap-booking-section" aria-labelledby="eap-booking-duration">
          <span id="eap-booking-duration" className="company-eap-booking-section__label">
            Session duration
          </span>
          <div className="company-eap-booking-duration-chips" role="group" aria-label="Select duration">
            {training.durationOptions.map((hours) => (
              <button
                key={hours}
                type="button"
                className={`company-eap-booking-duration-chip ${
                  selectedDuration === hours ? "company-eap-booking-duration-chip--selected" : ""
                }`}
                onClick={() => selectDuration(hours)}
                aria-pressed={selectedDuration === hours}
              >
                {hours} hr{hours === 1 ? "" : "s"}
              </button>
            ))}
          </div>
        </section>

        {syllabusPoints.length > 0 && (
          <section className="company-eap-booking-section" aria-labelledby="eap-booking-outline">
            <span id="eap-booking-outline" className="company-eap-booking-section__label">
              Session outline · {selectedDuration}h
            </span>
            <ul className="company-eap-booking-outline">
              {syllabusPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="company-eap-booking-section" aria-labelledby="eap-booking-schedule">
          <span id="eap-booking-schedule" className="company-eap-booking-section__label">
            Schedule
          </span>
          <div className="company-eap-booking-schedule">
            <div className="company-eap-booking-field">
              <label htmlFor="eap-date">Date</label>
              <input
                id="eap-date"
                type="date"
                className={`form-control ${fieldErrors.bookingDate ? "is-invalid" : ""}`}
                min={new Date().toISOString().split("T")[0]}
                value={formData.bookingDate}
                onChange={(e) => {
                  setFieldErrors((prev) => ({ ...prev, bookingDate: undefined }));
                  setFormData((prev) => ({ ...prev, bookingDate: e.target.value }));
                }}
                required
                aria-invalid={!!fieldErrors.bookingDate}
                aria-describedby={fieldErrors.bookingDate ? "eap-date-error" : undefined}
              />
              {fieldErrors.bookingDate && (
                <p id="eap-date-error" className="company-eap-booking-field-error" role="alert">
                  {fieldErrors.bookingDate}
                </p>
              )}
            </div>
            <div className="company-eap-booking-field">
              <label htmlFor="eap-time">Start time</label>
              <input
                id="eap-time"
                type="time"
                className={`form-control ${fieldErrors.startTime ? "is-invalid" : ""}`}
                value={formData.startTime}
                onChange={(e) => {
                  setFieldErrors((prev) => ({ ...prev, startTime: undefined }));
                  setFormData((prev) => ({ ...prev, startTime: e.target.value }));
                }}
                required
                aria-invalid={!!fieldErrors.startTime}
                aria-describedby={fieldErrors.startTime ? "eap-time-error" : undefined}
              />
              {fieldErrors.startTime && (
                <p id="eap-time-error" className="company-eap-booking-field-error" role="alert">
                  {fieldErrors.startTime}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="company-eap-booking-section" aria-labelledby="eap-booking-notes">
          <div className="company-eap-booking-notes-head">
            <span id="eap-booking-notes" className="company-eap-booking-section__label mb-0">
              Notes <span className="normal-case font-normal tracking-normal">(optional)</span>
            </span>
            <span
              className={`company-eap-booking-notes-count ${notesRemaining < 0 ? "text-red-600" : ""}`}
              aria-live="polite"
            >
              {notesLength}/{BOOKING_NOTES_MAX_LENGTH}
            </span>
          </div>
          <textarea
            id="eap-notes"
            className={`form-control ${notesError ? "is-invalid" : ""}`}
            rows={3}
            maxLength={BOOKING_NOTES_MAX_LENGTH}
            value={formData.notes || ""}
            onChange={(e) => handleNotesChange(e.target.value)}
            onBlur={() => setNotesError(validateBookingNotes(formData.notes))}
            placeholder="Any special requirements for this session…"
            aria-invalid={!!notesError}
            aria-describedby="eap-notes-hint eap-notes-error"
          />
          <p id="eap-notes-hint" className="company-eap-booking-field-hint mb-0">
            Optional — share room setup, audience size, or other requirements.
          </p>
          {notesError && (
            <p id="eap-notes-error" className="company-eap-booking-field-error" role="alert">
              {notesError}
            </p>
          )}
        </section>
      </form>
    </CompanyRightDrawer>
  );
};

export default CompanyEapBookingDrawer;
