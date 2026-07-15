"use client";

import Link from "next/link";
import React from "react";
import "./company-home-feedback-form.css";

/**
 * Dashboard prompt directing companies to share feedback from completed bookings.
 */
const CompanyHomeFeedbackFormLink: React.FC = () => {
  return (
    <section className="company-home-feedback-prompt" aria-label="Wellness feedback form">
      <div className="company-home-feedback-prompt__copy">
        <h2 className="company-home-feedback-prompt__title">Session feedback form</h2>
        <p className="company-home-feedback-prompt__text">
          After a session is marked completed, open that booking on the Bookings page to get a
          shareable employee feedback link with your company and trainer details prefilled.
        </p>
      </div>
      <Link href="/company/dashboard/bookings" className="company-home-feedback-prompt__btn">
        <i className="ri-calendar-check-line" aria-hidden="true" />
        Go to bookings
      </Link>
    </section>
  );
};

export default CompanyHomeFeedbackFormLink;
