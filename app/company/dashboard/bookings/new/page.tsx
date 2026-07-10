"use client";

import Seo from "@/shared/layout-components/seo/seo";
import Link from "next/link";
import React, { Fragment, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CompanyMultiSessionBookingForm from "../../components/CompanyMultiSessionBookingForm";
import { bookingNewPageUrl, safeBookingReturnTo } from "../../utils/bookingPageUrl";
import "./company-booking-page.css";

/**
 * Dedicated multi-session booking page with optional pre-selected trainer.
 */
const CompanyNewBookingPageInner = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const trainerId = searchParams.get("trainerId") || "";
    const returnTo = safeBookingReturnTo(searchParams.get("returnTo"));
    const currentPath = bookingNewPageUrl(trainerId || undefined, returnTo);

    const handleSuccess = () => {
        router.push(returnTo);
    };

    const handleCancel = () => {
        router.push(returnTo);
    };

    return (
        <Fragment>
            <Seo title="New Booking" />

            <div className="company-booking-page">
                <Link href={returnTo} className="company-booking-page__back">
                    <i className="ri-arrow-left-line" aria-hidden="true" />
                    Back
                </Link>

                <header className="company-booking-page__header">
                    <h1 className="company-booking-page__title">New multi-session booking</h1>
                    <p className="company-booking-page__subtitle">
                        Book one or more trainers on the same day. Use the trainer picker to search,
                        view profiles, and select the right expert for each session.
                    </p>
                </header>

                <div className="company-booking-page__card">
                    <CompanyMultiSessionBookingForm
                        initialTrainerId={trainerId}
                        returnTo={currentPath}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        </Fragment>
    );
};

const CompanyNewBookingPage = () => (
    <Suspense
        fallback={
            <div className="company-booking-page text-center py-16" role="status">
                <div className="spinner-border text-primary">
                    <span className="visually-hidden">Loading…</span>
                </div>
            </div>
        }
    >
        <CompanyNewBookingPageInner />
    </Suspense>
);

export default CompanyNewBookingPage;
