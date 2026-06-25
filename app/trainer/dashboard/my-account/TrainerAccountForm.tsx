"use client";

import React, { RefObject } from "react";
import { TrainerAccountDetails } from "@/services/trainerService";
import { sanitizeTrainerPan, sanitizeTrainerGst } from "../utils/trainerAccountValidation";
import TrainerPanDocumentUpload from "./TrainerPanDocumentUpload";
import TrainerGstDocumentUpload from "./TrainerGstDocumentUpload";

interface TrainerAccountFormProps {
  formData: TrainerAccountDetails;
  saving: boolean;
  uploadingPanDocument: boolean;
  uploadingGstDocument: boolean;
  savingPanDocument: boolean;
  savingGstDocument: boolean;
  panDocumentInputRef: RefObject<HTMLInputElement | null>;
  gstDocumentInputRef: RefObject<HTMLInputElement | null>;
  onChange: (patch: Partial<TrainerAccountDetails>) => void;
  onPanDocumentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearPanDocument: () => void;
  onSavePanDocument: () => void;
  onGstDocumentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearGstDocument: () => void;
  onSaveGstDocument: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Payout account form for trainer PAN, GST, and bank details.
 */
export default function TrainerAccountForm({
  formData,
  saving,
  uploadingPanDocument,
  uploadingGstDocument,
  savingPanDocument,
  savingGstDocument,
  panDocumentInputRef,
  gstDocumentInputRef,
  onChange,
  onPanDocumentChange,
  onClearPanDocument,
  onSavePanDocument,
  onGstDocumentChange,
  onClearGstDocument,
  onSaveGstDocument,
  onSubmit,
}: TrainerAccountFormProps) {
  const panDocumentUrl = formData.panDocument?.path || "";
  const panDocumentIsPdf = panDocumentUrl.toLowerCase().includes(".pdf");
  const gstDocumentUrl = formData.gstDocument?.path || "";
  const gstDocumentIsPdf = gstDocumentUrl.toLowerCase().includes(".pdf");

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Trainer account details">
      <section
        className="trainer-account-details-card"
        aria-labelledby="trainer-account-tax-heading"
      >
        <div className="trainer-account-details-card__head">
          <span className="trainer-account-details-card__icon" aria-hidden="true">
            <i className="ri-id-card-line" />
          </span>
          <div>
            <h2 id="trainer-account-tax-heading" className="trainer-account-details-card__title">
              PAN &amp; GST details
            </h2>
            <p className="trainer-account-details-card__desc">
              PAN is required for tax compliance and verification. GST is
              optional — add if you are GST registered.
            </p>
          </div>
        </div>

        <div className="trainer-account-details-form-grid">
          <div>
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

          <div>
            <label className="trainer-account-details-field__label" htmlFor="trainer-gst-number">
              GST number
            </label>
            <input
              id="trainer-gst-number"
              type="text"
              className="trainer-account-details-field__input"
              placeholder="e.g. 22AAAAA0000A1Z5"
              maxLength={15}
              value={formData.gstNumber || ""}
              onChange={(e) => onChange({ gstNumber: sanitizeTrainerGst(e.target.value) })}
              autoComplete="off"
            />
          </div>

          <div>
            <TrainerPanDocumentUpload
              documentUrl={panDocumentUrl}
              isPdf={panDocumentIsPdf}
              panDocumentInputRef={panDocumentInputRef}
              uploading={uploadingPanDocument}
              saving={savingPanDocument}
              onChange={onPanDocumentChange}
              onClear={onClearPanDocument}
              onSave={onSavePanDocument}
            />
          </div>

          <div>
            <TrainerGstDocumentUpload
              documentUrl={gstDocumentUrl}
              isPdf={gstDocumentIsPdf}
              gstDocumentInputRef={gstDocumentInputRef}
              uploading={uploadingGstDocument}
              saving={savingGstDocument}
              onChange={onGstDocumentChange}
              onClear={onClearGstDocument}
              onSave={onSaveGstDocument}
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
          disabled={saving || uploadingPanDocument || uploadingGstDocument}
          aria-label="Save account details"
        >
          {saving ? "Saving…" : "Save details"}
        </button>
      </div>
    </form>
  );
}
