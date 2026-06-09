"use client";

import React from "react";
import { TrainerAccountDetails } from "@/services/trainerService";

interface TrainerAccountFormProps {
  formData: TrainerAccountDetails;
  saving: boolean;
  onChange: (patch: Partial<TrainerAccountDetails>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Payout account form for trainer UPI and bank details.
 */
export default function TrainerAccountForm({
  formData,
  saving,
  onChange,
  onSubmit,
}: TrainerAccountFormProps) {
  return (
    <form onSubmit={onSubmit} noValidate aria-label="Trainer payout account details">
      <section
        className="trainer-account-details-card"
        aria-labelledby="trainer-account-bank-heading"
      >
        <div className="trainer-account-details-card__head">
          <span className="trainer-account-details-card__icon" aria-hidden="true">
            <i className="ri-bank-line" />
          </span>
          <h2 id="trainer-account-bank-heading" className="trainer-account-details-card__title">
            Payout details
          </h2>
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

        <div className="trainer-account-details-actions">
          <button
            type="submit"
            className="trainer-account-details-btn"
            disabled={saving}
            aria-label="Save account details"
          >
            {saving ? "Saving…" : "Save details"}
          </button>
        </div>
      </section>
    </form>
  );
}
