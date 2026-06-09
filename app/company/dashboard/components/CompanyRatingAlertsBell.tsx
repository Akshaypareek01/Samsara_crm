"use client";

import React, { useEffect, useRef, useState } from "react";
import { formatBookingDate } from "@/shared/utils/bookingUtils";
import { useCompanyRating } from "../context/CompanyRatingContext";

/**
 * Header bell dropdown listing completed sessions awaiting a trainer rating.
 */
export default function CompanyRatingAlertsBell() {
  const { pendingAlerts, pendingCount, loadingPending, openRatingDrawer, refreshPending } =
    useCompanyRating();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = (bookingId: string) => {
    setOpen(false);
    openRatingDrawer(bookingId);
  };

  return (
    <div className="company-rating-bell" ref={containerRef}>
      <button
        type="button"
        className="company-rating-bell__trigger"
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) void refreshPending();
        }}
        aria-label={
          pendingCount > 0
            ? `${pendingCount} sessions awaiting your rating`
            : "No sessions awaiting rating"
        }
        aria-expanded={open}
        aria-haspopup="true"
      >
        <i className="ri-notification-3-line text-xl" aria-hidden="true" />
        {pendingCount > 0 && (
          <span className="company-rating-bell__badge" aria-hidden="true">
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        )}
      </button>

      {open && (
        <div className="company-rating-bell__dropdown" role="menu" aria-label="Pending ratings">
          <div className="company-rating-bell__dropdown-head">
            <h2 className="company-rating-bell__dropdown-title">Rate your sessions</h2>
            <p className="company-rating-bell__dropdown-sub">
              Completed trainings waiting for your feedback
            </p>
          </div>

          {loadingPending ? (
            <p className="company-rating-bell__empty" role="status">
              Loading…
            </p>
          ) : pendingAlerts.length === 0 ? (
            <p className="company-rating-bell__empty">You&apos;re all caught up.</p>
          ) : (
            <ul className="company-rating-bell__list">
              {pendingAlerts.map((alert) => {
                const trainerName = alert.trainer?.name || "Trainer";
                return (
                  <li key={alert.bookingId}>
                    <button
                      type="button"
                      className="company-rating-bell__item"
                      role="menuitem"
                      onClick={() => handleSelect(alert.bookingId)}
                    >
                      <span className="company-rating-bell__item-title">
                        Rate {trainerName}
                      </span>
                      <span className="company-rating-bell__item-meta">
                        Session on {formatBookingDate(alert.bookingDate)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
