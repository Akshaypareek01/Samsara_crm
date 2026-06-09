"use client";

import Pageheader from "@/shared/layout-components/page-header/pageheader";
import Seo from "@/shared/layout-components/seo/seo";
import React, { Fragment } from "react";
import { useTrainerAccountForm } from "@/hooks/useTrainerAccountForm";
import TrainerAccountForm from "./TrainerAccountForm";
import "../components/trainer-account-details.css";

/**
 * Trainer My Account page — save UPI and bank payout details.
 */
export default function TrainerMyAccountPage() {
  const { loading, saving, error, formData, patchDetails, handleSubmit } =
    useTrainerAccountForm();

  return (
    <Fragment>
      <Seo title="My Account" />
      <Pageheader currentpage="My Account" activepage="Trainer" mainpage="My Account" />

      <div className="trainer-account-details-page">
        <header className="trainer-account-details-page__header">
          <h1 className="trainer-account-details-page__title">My Account</h1>
          <p className="trainer-account-details-page__subtitle">
            Add your UPI and bank details so we can process session payouts.
          </p>
        </header>

        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="trainer-account-details-loading" role="status">
            <span className="trainer-account-details-loading__spinner" aria-hidden="true" />
            <p className="mb-0">Loading account details…</p>
          </div>
        ) : (
          <TrainerAccountForm
            formData={formData}
            saving={saving}
            onChange={patchDetails}
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
          />
        )}
      </div>
    </Fragment>
  );
}
