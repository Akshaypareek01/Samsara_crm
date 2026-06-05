"use client";

import Seo from "@/shared/layout-components/seo/seo";
import React, { Fragment, useEffect, useState } from "react";
import {
    getPlatformAccountDetails,
    PlatformAccountDetails,
} from "@/services/platformAccountDetailsService";
import "../components/account-details/company-account-details.css";

/**
 * Read-only account details for company users (bank + downloadable documents).
 */
export default function CompanyAccountDetailsPage() {
    const [data, setData] = useState<PlatformAccountDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        void loadDetails();
    }, []);

    const loadDetails = async () => {
        try {
            setLoading(true);
            setError("");
            const details = await getPlatformAccountDetails();
            setData(details);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to load account details";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const bank = data?.bankDetails;
    const documents = data?.documents ?? [];
    const hasBank =
        bank?.accountHolderName ||
        bank?.accountNumber ||
        bank?.ifscCode ||
        bank?.bankName;

    return (
        <Fragment>
            <Seo title="Account Details" />

            <div className="company-account-details-page">
                <header className="company-account-details-page__header">
                    <h1 className="company-account-details-page__title">Account details</h1>
                    <p className="company-account-details-page__subtitle">
                        Official bank information and documents for payments and compliance.
                    </p>
                </header>

                {error && (
                    <div className="alert alert-danger mb-4" role="alert">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="company-account-details-loading" role="status">
                        <span
                            className="company-account-details-loading__spinner"
                            aria-hidden="true"
                        />
                        <p className="mb-0">Loading account details…</p>
                    </div>
                ) : (
                    <>
                        <section
                            className="company-account-details-card"
                            aria-labelledby="company-bank-heading"
                        >
                            <div className="company-account-details-card__head">
                                <span
                                    className="company-account-details-card__icon"
                                    aria-hidden="true"
                                >
                                    <i className="ri-bank-line" />
                                </span>
                                <h2
                                    id="company-bank-heading"
                                    className="company-account-details-card__title"
                                >
                                    Bank details
                                </h2>
                            </div>

                            {hasBank ? (
                                <div className="company-account-details-bank-grid">
                                    <div>
                                        <p className="company-account-details-field__label">
                                            Account holder name
                                        </p>
                                        <p className="company-account-details-field__value">
                                            {bank?.accountHolderName || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="company-account-details-field__label">
                                            Bank name
                                        </p>
                                        <p className="company-account-details-field__value">
                                            {bank?.bankName || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="company-account-details-field__label">
                                            Account number
                                        </p>
                                        <p className="company-account-details-field__value">
                                            {bank?.accountNumber || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="company-account-details-field__label">
                                            IFSC code
                                        </p>
                                        <p className="company-account-details-field__value">
                                            {bank?.ifscCode || "—"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="company-account-details-empty mb-0">
                                    Bank details have not been published yet.
                                </p>
                            )}
                        </section>

                        <section
                            className="company-account-details-card"
                            aria-labelledby="company-docs-heading"
                        >
                            <div className="company-account-details-card__head">
                                <span
                                    className="company-account-details-card__icon"
                                    aria-hidden="true"
                                >
                                    <i className="ri-file-text-line" />
                                </span>
                                <h2
                                    id="company-docs-heading"
                                    className="company-account-details-card__title"
                                >
                                    Documents
                                </h2>
                            </div>

                            {documents.length > 0 ? (
                                <ul className="company-account-details-doc-list">
                                    {documents.map((doc) => {
                                        const key = doc.id || doc._id || doc.fileUrl;
                                        return (
                                            <li
                                                key={key}
                                                className="company-account-details-doc-item"
                                            >
                                                <div>
                                                    <p className="company-account-details-doc-item__title">
                                                        {doc.title || "Document"}
                                                    </p>
                                                    {doc.documentNumber ? (
                                                        <p className="company-account-details-doc-item__meta">
                                                            No.{" "}
                                                            <span className="company-account-details-doc-item__number">
                                                                {doc.documentNumber}
                                                            </span>
                                                        </p>
                                                    ) : (
                                                        <p className="company-account-details-doc-item__meta">
                                                            —
                                                        </p>
                                                    )}
                                                </div>
                                                <a
                                                    href={doc.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download={doc.fileName || undefined}
                                                    className="company-account-details-btn"
                                                    aria-label={`Download ${doc.title || "document"}`}
                                                >
                                                    <i
                                                        className="ri-download-2-line"
                                                        aria-hidden="true"
                                                    />
                                                    Download
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="company-account-details-empty mb-0">
                                    No documents available yet.
                                </p>
                            )}
                        </section>
                    </>
                )}
            </div>
        </Fragment>
    );
}
