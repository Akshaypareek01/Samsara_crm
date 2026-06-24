"use client";

import Pageheader from "@/shared/layout-components/page-header/pageheader";
import Seo from "@/shared/layout-components/seo/seo";
import React, { Fragment } from "react";
import { useTrainerAccountForm } from "@/hooks/useTrainerAccountForm";
import TrainerAccountForm from "./TrainerAccountForm";
import "../components/trainer-account-details.css";

/**
 * Trainer My Account page — PAN, UPI, and bank payout details.
 */
export default function TrainerMyAccountPage() {
  const {
    loading,
    saving,
    uploadingPanDocument,
    uploadingGstDocument,
    error,
    formData,
    panDocumentInputRef,
    gstDocumentInputRef,
    patchDetails,
    handlePanDocumentChange,
    clearPanDocument,
    handleGstDocumentChange,
    clearGstDocument,
    handleSubmit,
  } = useTrainerAccountForm();

  return (
    <Fragment>
      <Seo title="My Account" />
      <Pageheader currentpage="My Account" activepage="Trainer" mainpage="My Account" />

      <div className="trainer-account-details-page">
        <header className="trainer-account-details-page__header">
          <h1 className="trainer-account-details-page__title">My Account</h1>
          <p className="trainer-account-details-page__subtitle">
            Add your PAN, GST, UPI, and bank details.
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
            uploadingPanDocument={uploadingPanDocument}
            uploadingGstDocument={uploadingGstDocument}
            panDocumentInputRef={panDocumentInputRef}
            gstDocumentInputRef={gstDocumentInputRef}
            onChange={patchDetails}
            onPanDocumentChange={handlePanDocumentChange}
            onClearPanDocument={clearPanDocument}
            onGstDocumentChange={handleGstDocumentChange}
            onClearGstDocument={clearGstDocument}
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
          />
        )}
      </div>
    </Fragment>
  );
}
