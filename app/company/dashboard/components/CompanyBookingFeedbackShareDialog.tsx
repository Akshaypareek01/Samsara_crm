"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import wellnessFeedbackService from "@/services/wellnessFeedbackService";
import "./home/company-home-feedback-form.css";

export type CompanyBookingFeedbackShareDialogProps = {
    open: boolean;
    bookingId: string;
    bookingLabel?: string;
    onClose: () => void;
};

/**
 * Dialog to generate and copy a booking-scoped wellness feedback share link.
 */
const CompanyBookingFeedbackShareDialog: React.FC<CompanyBookingFeedbackShareDialogProps> = ({
    open,
    bookingId,
    bookingLabel,
    onClose,
}) => {
    const [shareUrl, setShareUrl] = useState("");
    const [expiresAt, setExpiresAt] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState<string | null>(null);
    const dialogTitleId = useId();
    const dialogDescId = useId();
    const linkInputRef = useRef<HTMLInputElement>(null);
    const copyResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearCopyResetTimer = useCallback(() => {
        if (copyResetTimerRef.current) {
            clearTimeout(copyResetTimerRef.current);
            copyResetTimerRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!open || !bookingId) return undefined;

        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setLoadError(null);
                setShareUrl("");
                const data = await wellnessFeedbackService.createShareLink(bookingId);
                if (!cancelled) {
                    setShareUrl(data.url);
                    setExpiresAt(data.expiresAt);
                }
            } catch (err: unknown) {
                if (!cancelled) {
                    setLoadError(
                        err instanceof Error
                            ? err.message
                            : "Failed to generate feedback link. Try again."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [open, bookingId]);

    const handleClose = useCallback(() => {
        setCopied(false);
        setCopyError(null);
        clearCopyResetTimer();
        onClose();
    }, [clearCopyResetTimer, onClose]);

    const handleCopyLink = async () => {
        if (!shareUrl) return;
        setCopyError(null);

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareUrl);
            } else if (linkInputRef.current) {
                linkInputRef.current.focus();
                linkInputRef.current.select();
                document.execCommand("copy");
            } else {
                throw new Error("Clipboard unavailable");
            }

            setCopied(true);
            clearCopyResetTimer();
            copyResetTimerRef.current = setTimeout(() => setCopied(false), 2500);
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

    useEffect(() => () => clearCopyResetTimer(), [clearCopyResetTimer]);

    if (!open) return null;

    return (
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
                            Share feedback form
                        </h3>
                        <p id={dialogDescId} className="company-home-feedback-dialog__subtitle">
                            {bookingLabel
                                ? `Copy this link for employees who attended ${bookingLabel}.`
                                : "Copy this link and send it to employees who attended this session."}
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

                {loading && (
                    <p className="company-home-feedback-dialog__subtitle mb-0" role="status">
                        Generating link…
                    </p>
                )}

                {loadError && (
                    <p className="company-home-feedback-dialog__error" role="alert">
                        {loadError}
                    </p>
                )}

                {!loading && !loadError && shareUrl && (
                    <>
                        <label
                            className="company-home-feedback-dialog__label"
                            htmlFor="booking-feedback-form-url"
                        >
                            Form link
                        </label>
                        <div className="company-home-feedback-dialog__link-row">
                            <input
                                ref={linkInputRef}
                                id="booking-feedback-form-url"
                                type="text"
                                readOnly
                                value={shareUrl}
                                className="company-home-feedback-dialog__input"
                                aria-label="Booking wellness feedback form URL"
                            />
                            <button
                                type="button"
                                className="company-home-feedback-dialog__copy-btn"
                                onClick={() => void handleCopyLink()}
                            >
                                <i
                                    className={copied ? "ri-check-line" : "ri-file-copy-line"}
                                    aria-hidden="true"
                                />
                                {copied ? "Copied" : "Copy link"}
                            </button>
                        </div>

                        {expiresAt && (
                            <p className="company-home-feedback-dialog__subtitle mt-2 mb-0 text-xs">
                                Link valid until {new Date(expiresAt).toLocaleDateString()}.
                            </p>
                        )}

                        {copied && (
                            <p
                                className="company-home-feedback-dialog__success"
                                role="status"
                                aria-live="polite"
                            >
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
                                href={shareUrl}
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
                    </>
                )}
            </div>
        </div>
    );
};

export default CompanyBookingFeedbackShareDialog;
