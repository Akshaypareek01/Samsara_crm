"use client";

import React, { useEffect, useId, useRef } from "react";
import "@/shared/styles/help-support-modal.css";

/** Shared support inbox for company and trainer portals. */
export const SUPPORT_EMAIL = "info@samsarawellness.in";

type HelpSupportModalProps = {
  open: boolean;
  onClose: () => void;
  description: string;
  /** Override the support inbox shown for this portal (defaults to SUPPORT_EMAIL). */
  email?: string;
};

/**
 * Help & Support modal with contact email and mailto action.
 */
const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  open,
  onClose,
  description,
  email = SUPPORT_EMAIL,
}) => {
  const titleId = useId();
  const descId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="help-support-modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="help-support-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className="help-support-modal__icon-wrap" aria-hidden="true">
          <i className="ri-customer-service-2-line" />
        </div>
        <h2 id={titleId} className="help-support-modal__title">
          Help &amp; Support
        </h2>
        <p id={descId} className="help-support-modal__text">
          {description}
        </p>
        <p className="help-support-modal__email-label">Email us at</p>
        <a href={`mailto:${email}`} className="help-support-modal__email">
          {email}
        </a>
        <div className="help-support-modal__actions">
          <a
            href={`mailto:${email}`}
            className="help-support-modal__contact-btn"
          >
            <i className="ri-mail-send-line" aria-hidden="true" />
            Contact support
          </a>
          <button
            ref={closeBtnRef}
            type="button"
            className="help-support-modal__close-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportModal;
