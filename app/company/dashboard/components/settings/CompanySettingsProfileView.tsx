"use client";

import React, { useState } from "react";
import { ContactPerson, UpdateCompanyRequest } from "@/services/companyService";

type CompanySettingsProfileViewProps = {
    formData: UpdateCompanyRequest;
    companyId: string;
    accountStatus: boolean;
};

/**
 * Formats a profile field for read-only display.
 *
 * @param value - Raw field value from the company profile.
 */
function displayValue(value?: string | number | null): string {
    if (value === undefined || value === null || value === "") return "—";
    return String(value);
}

type ProfileFieldProps = {
    label: string;
    value: string;
};

/**
 * Read-only label/value pair for the company profile view.
 */
function ProfileField({ label, value }: ProfileFieldProps) {
    return (
        <div className="company-settings-profile-field">
            <p className="company-settings-profile-field__label">{label}</p>
            <p className="company-settings-profile-field__value">{value}</p>
        </div>
    );
}

/**
 * Read-only company profile layout for the settings page.
 */
export default function CompanySettingsProfileView({
    formData,
    companyId,
    accountStatus,
}: CompanySettingsProfileViewProps) {
    const [contactTab, setContactTab] = useState<"primary" | "secondary">("primary");
    const contact: ContactPerson | undefined =
        contactTab === "primary" ? formData.contactPerson1 : formData.contactPerson2;

    const locationLine = [formData.address, formData.city, formData.pincode, formData.country]
        .filter(Boolean)
        .join(", ");

    return (
        <div className="company-settings-profile" aria-label="Company profile">
            <section className="company-settings-card" aria-labelledby="profile-org-heading">
                <div className="company-settings-card__head">
                    <span className="company-settings-card__icon" aria-hidden="true">
                        <i className="ri-building-4-line" />
                    </span>
                    <div>
                        <h2 id="profile-org-heading" className="company-settings-card__title">
                            Organization
                        </h2>
                        <p className="company-settings-card__desc">
                            Core company identity and branding
                        </p>
                    </div>
                </div>

                <div className="company-settings-logo company-settings-logo--view">
                    {formData.companyLogo ? (
                        <div className="company-settings-logo__preview">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={formData.companyLogo} alt="Company logo" />
                        </div>
                    ) : (
                        <div
                            className="company-settings-logo__preview company-settings-logo__preview--empty"
                            aria-hidden="true"
                        >
                            <i className="ri-building-4-line" />
                        </div>
                    )}
                    <div className="company-settings-logo__meta">
                        <p className="font-semibold text-[#374151] !mb-1">
                            {displayValue(formData.companyName)}
                        </p>
                        <p>Your organization logo and details as registered on Samsara Wellness.</p>
                    </div>
                </div>

                <div className="company-settings-grid company-settings-grid--2 !mt-5">
                    <ProfileField label="Company ID" value={displayValue(companyId)} />
                    <ProfileField label="Company name" value={displayValue(formData.companyName)} />
                    <ProfileField label="Email" value={displayValue(formData.email)} />
                    <ProfileField label="Domain" value={displayValue(formData.domain)} />
                    <ProfileField
                        label="Number of employees"
                        value={displayValue(formData.numberOfEmployees)}
                    />
                    <ProfileField label="GST number" value={displayValue(formData.gstNumber)} />
                    <ProfileField label="PAN number" value={displayValue(formData.panNumber)} />
                    <ProfileField
                        label="Account status"
                        value={accountStatus ? "Active" : "Inactive"}
                    />
                </div>
            </section>

            <section className="company-settings-card" aria-labelledby="profile-location-heading">
                <div className="company-settings-card__head">
                    <span className="company-settings-card__icon" aria-hidden="true">
                        <i className="ri-map-pin-line" />
                    </span>
                    <div>
                        <h2 id="profile-location-heading" className="company-settings-card__title">
                            Location
                        </h2>
                        <p className="company-settings-card__desc">Registered business address</p>
                    </div>
                </div>

                <ProfileField label="Full address" value={locationLine || "—"} />

                <div className="company-settings-grid company-settings-grid--3 !mt-4">
                    <ProfileField label="City" value={displayValue(formData.city)} />
                    <ProfileField label="Pincode" value={displayValue(formData.pincode)} />
                    <ProfileField label="Country" value={displayValue(formData.country)} />
                </div>
            </section>

            <section className="company-settings-card" aria-labelledby="profile-contacts-heading">
                <div className="company-settings-card__head">
                    <span className="company-settings-card__icon" aria-hidden="true">
                        <i className="ri-contacts-line" />
                    </span>
                    <div>
                        <h2 id="profile-contacts-heading" className="company-settings-card__title">
                            Contacts
                        </h2>
                        <p className="company-settings-card__desc">
                            Primary and secondary points of contact
                        </p>
                    </div>
                </div>

                <div
                    className="company-settings-tabs"
                    role="tablist"
                    aria-label="Contact person"
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={contactTab === "primary"}
                        className={`company-settings-tabs__btn ${
                            contactTab === "primary" ? "company-settings-tabs__btn--active" : ""
                        }`}
                        onClick={() => setContactTab("primary")}
                    >
                        <i className="ri-user-star-line" aria-hidden="true" />
                        Primary
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={contactTab === "secondary"}
                        className={`company-settings-tabs__btn ${
                            contactTab === "secondary" ? "company-settings-tabs__btn--active" : ""
                        }`}
                        onClick={() => setContactTab("secondary")}
                    >
                        <i className="ri-user-line" aria-hidden="true" />
                        Secondary
                    </button>
                </div>

                <div role="tabpanel" className="company-settings-grid company-settings-grid--2">
                    <ProfileField label="Full name" value={displayValue(contact?.name)} />
                    <ProfileField label="Designation" value={displayValue(contact?.designation)} />
                    <ProfileField label="Email" value={displayValue(contact?.email)} />
                    <ProfileField label="Mobile" value={displayValue(contact?.mobileNumber)} />
                </div>
            </section>
        </div>
    );
}
