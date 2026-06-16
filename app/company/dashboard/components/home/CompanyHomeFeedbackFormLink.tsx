"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { WELLNESS_FEEDBACK_FORM_URL } from "@/constants/wellnessFeedbackForm";
import "./company-home-feedback-form.css";

/**
 * Dashboard action to copy the corporate wellness feedback form link.
 */
const CompanyHomeFeedbackFormLink: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const dialogTitleId = useId();
  const dialogDescId = useId();
  const linkInputRef = useRef<HTMLInputElement>(null);
  const copyResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Clears the temporary "copied" success state timer.
   */
  const clearCopyResetTimer = useCallback(() => {
    if (copyResetTimerRef.current) {
      clearTimeout(copyResetTimerRef.current);
      copyResetTimerRef.current = null;
    }
  }, []);

  /**
   * Opens the feedback link dialog.
   */
  const handleOpen = () => {
    setCopied(false);
    setCopyError(null);
    setOpen(true);
  };

  /**
   * Closes the feedback link dialog.
   */
  const handleClose = useCallback(() => {
    setOpen(false);
    setCopied(false);
    setCopyError(null);
    clearCopyResetTimer();
  }, [clearCopyResetTimer]);

  /**
   * Copies the feedback form URL to the clipboard.
   */
  const handleCopyLink = async () => {
    setCopyError(null);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(WELLNESS_FEEDBACK_FORM_URL);
      } else if (linkInputRef.current) {
        linkInputRef.current.focus();
        linkInputRef.current.select();
        document.execCommand("copy");
      } else {
        throw new Error("Clipboard unavailable");
      }

      setCopied(true);
      clearCopyResetTimer();
      copyResetTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch {
      setCopyError("Could not copy automatically. Select the link and copy manually.");
    }
  };

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleClose]);

  useEffect(() => {
    return () => clearCopyResetTimer();
  }, [clearCopyResetTimer]);

  return (
    <>
      <section className="company-home-feedback-prompt" aria-label="Wellness feedback form">
        <div className="company-home-feedback-prompt__copy">
          <h2 className="company-home-feedback-prompt__title">Session feedback form</h2>
          <p className="company-home-feedback-prompt__text">
            Share the wellness feedback link with your employees after a session.
          </p>
        </div>
        <button
          type="button"
          className="company-home-feedback-prompt__btn"
          onClick={handleOpen}
          aria-haspopup="dialog"
        >
          <i className="ri-link-m" aria-hidden="true" />
          Get feedback form link
        </button>
      </section>

      {open && (
        <div
          className="company-home-feedback-dialog-backdrop"
          role="presentation"
          onClick={handleClose}
        >
          <div
            className="company-home-feedback-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            aria-describedby={dialogDescId}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="company-home-feedback-dialog__header">
              <div>
                <h3 id={dialogTitleId} className="company-home-feedback-dialog__title">
                  Wellness feedback form
                </h3>
                <p id={dialogDescId} className="company-home-feedback-dialog__subtitle">
                  Copy this link and send it to employees who attended your wellness session.
                </p>
              </div>
              <button
                type="button"
                className="company-home-feedback-dialog__close"
                onClick={handleClose}
                aria-label="Close dialog"
              >
                <i className="ri-close-line text-xl" aria-hidden="true" />
              </button>
            </div>

            <label className="company-home-feedback-dialog__label" htmlFor="company-feedback-form-url">
              Form link
            </label>
            <div className="company-home-feedback-dialog__link-row">
              <input
                ref={linkInputRef}
                id="company-feedback-form-url"
                type="text"
                readOnly
                value={WELLNESS_FEEDBACK_FORM_URL}
                className="company-home-feedback-dialog__input"
                aria-label="Wellness feedback form URL"
              />
              <button
                type="button"
                className="company-home-feedback-dialog__copy-btn"
                onClick={() => void handleCopyLink()}
              >
                <i className={copied ? "ri-check-line" : "ri-file-copy-line"} aria-hidden="true" />
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>

            {copied && (
              <p className="company-home-feedback-dialog__success" role="status" aria-live="polite">
                <i className="ri-checkbox-circle-fill" aria-hidden="true" />
                Link copied successfully!
              </p>
            )}

            {copyError && (
              <p className="company-home-feedback-dialog__error" role="alert">
                {copyError}
              </p>
            )}

            <div className="company-home-feedback-dialog__actions">
              <a
                href={WELLNESS_FEEDBACK_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="company-home-feedback-dialog__preview-link"
              >
                Preview form
                <i className="ri-external-link-line" aria-hidden="true" />
              </a>
              <button
                type="button"
                className="company-home-feedback-dialog__done-btn"
                onClick={handleClose}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyHomeFeedbackFormLink;
