"use client";

import React, { RefObject } from "react";
import { TrainerAccountDetails } from "@/services/trainerService";
import { sanitizeTrainerPan } from "../utils/trainerAccountValidation";
import TrainerPanDocumentUpload from "./TrainerPanDocumentUpload";

interface TrainerAccountFormProps {
  formData: TrainerAccountDetails;
  saving: boolean;
  uploadingPanDocument: boolean;
  panDocumentInputRef: RefObject<HTMLInputElement | null>;
  onChange: (patch: Partial<TrainerAccountDetails>) => void;
  onPanDocumentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearPanDocument: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Payout account form for trainer PAN, UPI, and bank details.
 */
export default function TrainerAccountForm({
  formData,
  saving,
  uploadingPanDocument,
  panDocumentInputRef,
  onChange,
  onPanDocumentChange,
  onClearPanDocument,
  onSubmit,
}: TrainerAccountFormProps) {
  const panDocumentUrl = formData.panDocument?.path || "";
  const panDocumentIsPdf = panDocumentUrl.toLowerCase().includes(".pdf");

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Trainer account details">
      <section
        className="trainer-account-details-card"
        aria-labelledby="trainer-account-pan-heading"
      >
        <div className="trainer-account-details-card__head">
          <span className="trainer-account-details-card__icon" aria-hidden="true">
            <i className="ri-id-card-line" />
          </span>
          <div>
            <h2 id="trainer-account-pan-heading" className="trainer-account-details-card__title">
              PAN details
            </h2>
            <p className="trainer-account-details-card__desc">
              Required for tax compliance and verification.
            </p>
          </div>
        </div>

        <div className="trainer-account-details-form-grid">
          <div className="trainer-account-details-form-grid__full">
            <label className="trainer-account-details-field__label" htmlFor="trainer-pan-number">
              PAN number
            </label>
            <input
              id="trainer-pan-number"
              type="text"
              className="trainer-account-details-field__input"
              placeholder="e.g. ABCDE1234F"
              maxLength={10}
              value={formData.panNumber || ""}
              onChange={(e) => onChange({ panNumber: sanitizeTrainerPan(e.target.value) })}
              autoComplete="off"
            />
          </div>

          <div className="trainer-account-details-form-grid__full">
            <TrainerPanDocumentUpload
              documentUrl={panDocumentUrl}
              isPdf={panDocumentIsPdf}
              panDocumentInputRef={panDocumentInputRef}
              uploading={uploadingPanDocument}
              onChange={onPanDocumentChange}
              onClear={onClearPanDocument}
            />
          </div>
        </div>
      </section>

      <section
        className="trainer-account-details-card"
        aria-labelledby="trainer-account-bank-heading"
      >
        <div className="trainer-account-details-card__head">
          <span className="trainer-account-details-card__icon" aria-hidden="true">
            <i className="ri-bank-line" />
          </span>
          <div>
            <h2 id="trainer-account-bank-heading" className="trainer-account-details-card__title">
              Bank details
            </h2>
            <p className="trainer-account-details-card__desc">
              UPI or bank account for receiving payments.
            </p>
          </div>
        </div>

        <div className="trainer-account-details-form-grid">
          <div className="trainer-account-details-form-grid__full">
            <label className="trainer-account-details-field__label" htmlFor="trainer-upi-id">
              UPI ID
            </label>
            <input
              id="trainer-upi-id"
              type="text"
              className="trainer-account-details-field__input"
              placeholder="name@bank"
              value={formData.upiId || ""}
              onChange={(e) => onChange({ upiId: e.target.value })}
              autoComplete="off"
            />
          </div>

          <div>
            <label
              className="trainer-account-details-field__label"
              htmlFor="trainer-account-holder"
            >
              Account holder name
            </label>
            <input
              id="trainer-account-holder"
              type="text"
              className="trainer-account-details-field__input"
              value={formData.accountHolderName || ""}
              onChange={(e) => onChange({ accountHolderName: e.target.value })}
              autoComplete="name"
            />
          </div>

          <div>
            <label className="trainer-account-details-field__label" htmlFor="trainer-bank-name">
              Bank name
            </label>
            <input
              id="trainer-bank-name"
              type="text"
              className="trainer-account-details-field__input"
              value={formData.bankName || ""}
              onChange={(e) => onChange({ bankName: e.target.value })}
              autoComplete="organization"
            />
          </div>

          <div>
            <label
              className="trainer-account-details-field__label"
              htmlFor="trainer-account-number"
            >
              Account number
            </label>
            <input
              id="trainer-account-number"
              type="text"
              inputMode="numeric"
              className="trainer-account-details-field__input"
              value={formData.accountNumber || ""}
              onChange={(e) => onChange({ accountNumber: e.target.value })}
              autoComplete="off"
            />
          </div>

          <div>
            <label className="trainer-account-details-field__label" htmlFor="trainer-ifsc">
              IFSC code
            </label>
            <input
              id="trainer-ifsc"
              type="text"
              className="trainer-account-details-field__input"
              value={formData.ifscCode || ""}
              onChange={(e) => onChange({ ifscCode: e.target.value.toUpperCase() })}
              autoComplete="off"
            />
          </div>
        </div>
      </section>

      <div className="trainer-account-details-actions">
        <button
          type="submit"
          className="trainer-account-details-btn"
          disabled={saving || uploadingPanDocument}
          aria-label="Save account details"
        >
          {saving ? "Saving…" : "Save details"}
        </button>
      </div>
    </form>
  );
}
