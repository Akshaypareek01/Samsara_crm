"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import bookingService, { type Booking } from "@/services/bookingService";
import wellnessFeedbackService from "@/services/wellnessFeedbackService";
import { formatBookingDate } from "@/shared/utils/bookingUtils";
import { getBookingTrainerName } from "@/shared/utils/bookingTrainerUtils";
import {
  dismissFeedbackAlertBooking,
  isFeedbackAlertDismissed,
} from "../utils/companyDashboardFeedbackAlertStorage";
import "./home/company-home-feedback-form.css";

const COMPLETED_BOOKINGS_LIMIT = 5;

/**
 * Resolves a stable booking id from API payloads.
 *
 * @param booking - Booking record from the API.
 */
function getBookingId(booking: Booking): string {
  return booking._id || booking.id || "";
}

/**
 * Picks the most recent completed booking that has not been dismissed.
 *
 * @param bookings - Completed bookings sorted newest first.
 */
function pickAlertBooking(bookings: Booking[]): Booking | null {
  for (const booking of bookings) {
    const bookingId = getBookingId(booking);
    if (!bookingId || isFeedbackAlertDismissed(bookingId)) continue;
    return booking;
  }
  return null;
}

/**
 * Builds trainer name and formatted date for the alert.
 *
 * @param booking - Completed booking to summarize.
 */
function buildSessionDetails(booking: Booking): { trainerName: string; sessionDate: string } {
  return {
    trainerName: getBookingTrainerName(booking),
    sessionDate: formatBookingDate(booking.bookingDate),
  };
}

/**
 * Prominent dashboard alert to copy a wellness feedback link for a completed session.
 */
const CompanyDashboardFeedbackAlert: React.FC = () => {
  const [alertBooking, setAlertBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const copyResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCopyResetTimer = useCallback(() => {
    if (copyResetTimerRef.current) {
      clearTimeout(copyResetTimerRef.current);
      copyResetTimerRef.current = null;
    }
  }, []);

  const loadCompletedBooking = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings({
        page: 1,
        limit: COMPLETED_BOOKINGS_LIMIT,
        status: "completed",
        sortBy: "createdAt:desc",
      });
      setAlertBooking(pickAlertBooking(response.results));
    } catch {
      setAlertBooking(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCompletedBooking();
  }, [loadCompletedBooking]);

  useEffect(() => () => clearCopyResetTimer(), [clearCopyResetTimer]);

  const handleDismiss = () => {
    if (!alertBooking) return;
    const bookingId = getBookingId(alertBooking);
    if (!bookingId) return;

    dismissFeedbackAlertBooking(bookingId);
    setAlertBooking(null);
    setCopied(false);
    setCopyError(null);
    clearCopyResetTimer();
  };

  const handleCopyLink = async () => {
    if (!alertBooking) return;

    const bookingId = getBookingId(alertBooking);
    if (!bookingId) return;

    setCopying(true);
    setCopyError(null);

    try {
      const { url } = await wellnessFeedbackService.createShareLink(bookingId);

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        throw new Error("Clipboard unavailable");
      }

      setCopied(true);
      clearCopyResetTimer();
      copyResetTimerRef.current = setTimeout(() => setCopied(false), 2500);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not copy the feedback link. Try again from Bookings.";
      setCopyError(message);
    } finally {
      setCopying(false);
    }
  };

  if (loading || !alertBooking) return null;

  const bookingId = getBookingId(alertBooking);
  const { trainerName, sessionDate } = buildSessionDetails(alertBooking);
  const sessionLabel = `${trainerName} on ${sessionDate}`;

  return (
    <section
      className="company-home-feedback-alert"
      role="alert"
      aria-labelledby="company-feedback-alert-title"
      aria-describedby="company-feedback-alert-desc"
    >
      <div className="company-home-feedback-alert__content">
        <div className="company-home-feedback-alert__icon" aria-hidden="true">
          <i className="ri-feedback-line" />
        </div>

        <div className="company-home-feedback-alert__copy">
          <h2 id="company-feedback-alert-title" className="company-home-feedback-alert__title">
            Share employee feedback
          </h2>
          <p id="company-feedback-alert-desc" className="company-home-feedback-alert__text">
            Your session with <strong>{trainerName}</strong> on{" "}
            <strong>{sessionDate}</strong> is complete. Copy the feedback form link and send it to
            employees who attended.
          </p>

          {copied && (
            <p className="company-home-feedback-alert__success" role="status" aria-live="polite">
              <i className="ri-checkbox-circle-fill" aria-hidden="true" />
              Feedback link copied to clipboard.
            </p>
          )}

          {copyError && (
            <p className="company-home-feedback-alert__error" role="alert">
              {copyError}
            </p>
          )}
        </div>
      </div>

      <div className="company-home-feedback-alert__actions">
        <button
          type="button"
          className="company-home-feedback-alert__copy-btn"
          onClick={() => void handleCopyLink()}
          disabled={copying}
          aria-label={`Copy feedback form link for session with ${sessionLabel}`}
        >
          <i
            className={copied ? "ri-check-line" : "ri-file-copy-line"}
            aria-hidden="true"
          />
          {copying ? "Generating…" : copied ? "Copied" : "Copy link"}
        </button>

        <Link
          href="/company/dashboard/bookings"
          className="company-home-feedback-alert__view-link"
          aria-label="View all company bookings"
        >
          View bookings
          <i className="ri-arrow-right-s-line" aria-hidden="true" />
        </Link>
      </div>

      <button
        type="button"
        className="company-home-feedback-alert__dismiss"
        onClick={handleDismiss}
        aria-label={`Dismiss feedback reminder for booking ${bookingId}`}
      >
        <i className="ri-close-line text-lg" aria-hidden="true" />
      </button>
    </section>
  );
};

export default CompanyDashboardFeedbackAlert;
