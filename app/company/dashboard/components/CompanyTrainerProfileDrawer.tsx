"use client";

import React from "react";
import Link from "next/link";
import type { Trainer } from "@/services/trainerService";
import { isTrainerAcceptingBookings } from "@/services/trainerService";
import CompanyRightDrawer from "./CompanyRightDrawer";
import CompanyTrainerProfilePanel from "./CompanyTrainerProfilePanel";
import { bookingNewPageUrl } from "../utils/bookingPageUrl";

export type CompanyTrainerProfileDrawerProps = {
  open: boolean;
  trainer: Trainer | null;
  loading?: boolean;
  onClose: () => void;
  /** Path to return after booking; enables Book Session link to the booking page. */
  returnTo?: string;
  onBookSession?: (trainer: Trainer) => void;
};

/**
 * Right-side tabbed trainer profile drawer for company users.
 */
const CompanyTrainerProfileDrawer: React.FC<CompanyTrainerProfileDrawerProps> = ({
  open,
  trainer,
  loading = false,
  onClose,
  returnTo,
  onBookSession,
}) => {
  const canBook = trainer ? isTrainerAcceptingBookings(trainer) : false;
  const trainerId = trainer?._id || trainer?.id;
  const bookHref =
    trainerId && returnTo
      ? bookingNewPageUrl(trainerId, returnTo)
      : trainerId
        ? bookingNewPageUrl(trainerId)
        : undefined;
  const showBookAction = Boolean(trainer && !loading && (onBookSession || bookHref));

  const footer = showBookAction ? (
      <div className="flex flex-col gap-2">
        {!canBook && (
          <p className="text-xs text-amber-700 mb-0 text-center" role="status">
            This trainer is not accepting new bookings right now.
          </p>
        )}
        {onBookSession ? (
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white text-sm font-semibold py-3 hover:opacity-90 transition-colors disabled:opacity-50"
            disabled={!canBook}
            onClick={() => trainer && onBookSession(trainer)}
          >
            <i className="ri-calendar-check-line text-base" aria-hidden="true" />
            Book Session
          </button>
        ) : bookHref ? (
          <Link
            href={bookHref}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white text-sm font-semibold py-3 hover:opacity-90 transition-colors${!canBook ? " pointer-events-none opacity-50" : ""}`}
            aria-disabled={!canBook}
            tabIndex={canBook ? 0 : -1}
            onClick={() => onClose()}
          >
            <i className="ri-calendar-check-line text-base" aria-hidden="true" />
            Book Session
          </Link>
        ) : null}
      </div>
    ) : undefined;

  return (
    <CompanyRightDrawer
      open={open}
      title="Trainer Profile"
      onClose={onClose}
      maxWidthClass="max-w-4xl"
      flushBody
      ariaLabelledBy="company-trainer-profile-title"
      footer={footer}
    >
      <CompanyTrainerProfilePanel trainer={trainer} loading={loading} variant="drawer" />
    </CompanyRightDrawer>
  );
};

export default CompanyTrainerProfileDrawer;
