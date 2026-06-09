"use client";

import React, { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import bookingService, { type Booking } from "@/services/bookingService";
import TrainerRatingService, { type TrainerRating } from "@/services/trainerRatingService";
import {
  formatBookingDate,
  formatBookingTime,
} from "@/shared/utils/bookingUtils";
import {
  getBookingTrainer,
  getBookingTrainerName,
  getTrainerProfilePhotoUrl,
} from "@/shared/utils/bookingTrainerUtils";
import TrainerStarRatingInput from "@/shared/components/trainer/TrainerStarRatingInput";
import CompanyRightDrawer from "./CompanyRightDrawer";
import "./company-trainer-rating-drawer.css";

type CompanyTrainerRatingDrawerProps = {
  bookingId: string | null;
  onClose: () => void;
  onSubmitted: () => void;
};

/**
 * Right drawer for HR to rate a completed training session.
 */
export default function CompanyTrainerRatingDrawer({
  bookingId,
  onClose,
  onSubmitted,
}: CompanyTrainerRatingDrawerProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [existingRating, setExistingRating] = useState<TrainerRating | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const loadDrawerData = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const [bookingData, ratingData] = await Promise.all([
        bookingService.getBookingById(id),
        TrainerRatingService.getRatingByBooking(id),
      ]);
      setBooking(bookingData);
      setExistingRating(ratingData);
      setRating(ratingData?.rating ?? 0);
      setFeedback(ratingData?.feedback ?? "");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load session";
      Swal.fire("Error", msg, "error");
      onClose();
    } finally {
      setLoading(false);
    }
  }, [onClose]);

  useEffect(() => {
    if (!bookingId) {
      setBooking(null);
      setExistingRating(null);
      setRating(0);
      setFeedback("");
      return;
    }
    void loadDrawerData(bookingId);
  }, [bookingId, loadDrawerData]);

  const handleSubmit = async () => {
    if (!bookingId || rating < 1 || rating > 5) {
      Swal.fire("Rating required", "Please select a star rating before submitting.", "warning");
      return;
    }

    try {
      setSaving(true);
      const payload = { rating, feedback: feedback.trim() };
      if (existingRating) {
        await TrainerRatingService.updateRating(bookingId, payload);
        Swal.fire("Updated", "Your rating has been saved.", "success");
      } else {
        await TrainerRatingService.createRating({ bookingId, ...payload });
        Swal.fire("Thank you!", "Your rating has been submitted.", "success");
      }
      onSubmitted();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        axiosErr.response?.data?.message || axiosErr.message || "Failed to save rating";
      Swal.fire("Error", msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const trainer = booking ? getBookingTrainer(booking) : null;
  const trainerName = booking ? getBookingTrainerName(booking) : "Trainer";
  const photoUrl = getTrainerProfilePhotoUrl(trainer);
  const eapTitle =
    booking?.eapTraining && typeof booking.eapTraining === "object"
      ? (booking.eapTraining as { title?: string }).title
      : undefined;

  const footer = !loading && booking ? (
    <button
      type="button"
      className="ti-btn ti-btn-primary !m-0 !float-none w-full inline-flex items-center justify-center !px-4 !py-2.5 text-sm font-semibold min-h-[2.5rem] rounded-lg"
      disabled={saving}
      onClick={() => void handleSubmit()}
      aria-label={existingRating ? "Update session rating" : "Submit session rating"}
    >
      {saving ? "Saving…" : existingRating ? "Update rating" : "Submit rating"}
    </button>
  ) : undefined;

  return (
    <CompanyRightDrawer
      open={Boolean(bookingId)}
      title="Rate this session"
      onClose={onClose}
      maxWidthClass="max-w-md"
      ariaLabelledBy="company-trainer-rating-title"
      footer={footer}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading session…</span>
          </div>
          <p className="text-sm text-muted mb-0">Loading session…</p>
        </div>
      ) : !booking ? (
        <p className="text-sm text-muted mb-0">No session selected.</p>
      ) : booking.status !== "completed" ? (
        <p className="text-sm text-muted mb-0">Only completed sessions can be rated.</p>
      ) : (
        <div>
          <section className="company-trainer-rating-drawer__hero" aria-label="Trainer">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="company-trainer-rating-drawer__avatar" />
            ) : (
              <span className="company-trainer-rating-drawer__avatar-fallback" aria-hidden="true">
                {trainerName.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <h3 className="text-base font-bold text-gray-900 mb-0 truncate">{trainerName}</h3>
              {trainer?.title && (
                <p className="text-sm text-gray-600 mb-0 truncate">{trainer.title}</p>
              )}
            </div>
          </section>

          <section
            className="company-trainer-rating-drawer__session"
            aria-labelledby="rating-session-heading"
          >
            <h4 id="rating-session-heading" className="company-trainer-rating-drawer__session-title">
              Completed session
            </h4>
            <div className="company-trainer-rating-drawer__grid">
              <div>
                <span className="text-gray-500 text-xs block">Date</span>
                <span className="font-medium">{formatBookingDate(booking.bookingDate)}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">Time</span>
                <span className="font-medium">{formatBookingTime(booking.startTime)}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">Duration</span>
                <span className="font-medium">{booking.duration} hrs</span>
              </div>
              {eapTitle && (
                <div className="col-span-2">
                  <span className="text-gray-500 text-xs block">Program</span>
                  <span className="font-medium">{eapTitle}</span>
                </div>
              )}
            </div>
          </section>

          <TrainerStarRatingInput value={rating} onChange={setRating} disabled={saving} />

          <div className="mt-4">
            <label htmlFor="session-rating-feedback" className="company-trainer-rating-drawer__feedback-label">
              Feedback (optional)
            </label>
            <textarea
              id="session-rating-feedback"
              className="company-trainer-rating-drawer__feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={saving}
              placeholder="Share what went well or suggestions for improvement…"
              maxLength={1000}
              aria-label="Session feedback"
            />
          </div>
        </div>
      )}
    </CompanyRightDrawer>
  );
}
