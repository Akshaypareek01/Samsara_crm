"use client";

import React, { RefObject, useState } from "react";
import { ContactPerson, UpdateCompanyRequest } from "@/services/companyService";
import CompanySettingsLogoField from "./CompanySettingsLogoField";

type CompanySettingsFormProps = {
    formData: UpdateCompanyRequest;
    companyId: string;
    accountStatus: boolean;
    saving: boolean;
    uploadingLogo: boolean;
    logoInputRef: RefObject<HTMLInputElement | null>;
    onChange: (data: UpdateCompanyRequest) => void;
    onContactChange: (person: 1 | 2, field: keyof ContactPerson, value: string) => void;
    onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onLogoClear: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
};

/**
 * Settings form sections: organization, location, and contacts.
 */
/**
 * Uppercase alphanumeric PAN (max 10 chars).
 * @param raw - Raw input value.
 */
const sanitizePan = (raw: string) =>
    raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);

/**
 * Uppercase GSTIN (max 15 chars).
 * @param raw - Raw input value.
 */
const sanitizeGst = (raw: string) => raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);

/**
 * Digits-only mobile (max 10).
 * @param raw - Raw input value.
 */
const sanitizeMobile = (raw: string) => raw.replace(/\D/g, "").slice(0, 10);

/**
 * Digits-only pincode (max 6).
 * @param raw - Raw input value.
 */
const sanitizePincode = (raw: string) => raw.replace(/\D/g, "").slice(0, 6);

export default function CompanySettingsForm({
    formData,
    companyId,
    accountStatus,
    saving,
    uploadingLogo,
    logoInputRef,
    onChange,
    onContactChange,
    onLogoChange,
    onLogoClear,
    onSubmit,
    onCancel,
}: CompanySettingsFormProps) {
    const [contactTab, setContactTab] = useState<"primary" | "secondary">("primary");
    const contact =
        contactTab === "primary" ? formData.contactPerson1 : formData.contactPerson2;
    const contactNum = contactTab === "primary" ? 1 : 2;

    const patch = (partial: Partial<UpdateCompanyRequest>) =>
        onChange({ ...formData, ...partial });

    return (
        <form onSubmit={onSubmit} aria-label="Company settings form">
            <section className="company-settings-card" aria-labelledby="settings-org-heading">
                <div className="company-settings-card__head">
                    <span className="company-settings-card__icon" aria-hidden="true">
                        <i className="ri-building-4-line" />
                    </span>
                    <div>
                        <h2 id="settings-org-heading" className="company-settings-card__title">
                            Organization
                        </h2>
                        <p className="company-settings-card__desc">
                            Core company identity and branding
                        </p>
                    </div>
                </div>

                <CompanySettingsLogoField
                    logoUrl={formData.companyLogo || ""}
                    uploading={uploadingLogo}
                    inputRef={logoInputRef}
                    onFileChange={onLogoChange}
                    onClear={onLogoClear}
                />

                <div className="company-settings-grid company-settings-grid--2 !mt-5">
                    <div>
                        <label className="company-settings-field__label" htmlFor="company-id">
                            Company ID
                        </label>
                        <input
                            id="company-id"
                            type="text"
                            className="company-settings-field__input"
                            value={companyId}
                            disabled
                            readOnly
                            aria-describedby="company-id-hint"
                        />
                        <span id="company-id-hint" className="company-settings-field__hint">
                            Assigned at registration — cannot be changed
                        </span>
                    </div>
                    <div>
                        <label className="company-settings-field__label" htmlFor="company-name">
                            Company name
                        </label>
                        <input
                            id="company-name"
                            type="text"
                            className="company-settings-field__input"
                            value={formData.companyName}
                            onChange={(e) => patch({ companyName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="company-settings-field__label" htmlFor="company-email">
                            Email
                        </label>
                        <input
                            id="company-email"
                            type="email"
                            className="company-settings-field__input"
                            value={formData.email}
                            onChange={(e) => patch({ email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="company-settings-field__label" htmlFor="company-domain">
                            Domain
                        </label>
                        <input
                            id="company-domain"
                            type="text"
                            className="company-settings-field__input"
                            value={formData.domain}
                            onChange={(e) => patch({ domain: e.target.value })}
                            placeholder="company.com"
                        />
                    </div>
                    <div>
                        <label className="company-settings-field__label" htmlFor="company-employees">
                            Number of employees
                        </label>
                        <input
                            id="company-employees"
                            type="number"
                            min={0}
                            className="company-settings-field__input"
                            value={formData.numberOfEmployees ?? ""}
                            onChange={(e) =>
                                patch({
                                    numberOfEmployees: e.target.value
                                        ? parseInt(e.target.value, 10)
                                        : undefined,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className="company-settings-field__label" htmlFor="company-gst">
                            GST number
                        </label>
                        <input
                            id="company-gst"
                            type="text"
                            className="company-settings-field__input"
                            value={formData.gstNumber}
                            onChange={(e) => patch({ gstNumber: sanitizeGst(e.target.value) })}
                            placeholder="15-character GSTIN"
                            maxLength={15}
                            autoComplete="off"
                        />
                    </div>
                    <div>
                        <label className="company-settings-field__label" htmlFor="company-pan">
                            PAN number
                        </label>
                        <input
                            id="company-pan"
                            type="text"
                            className="company-settings-field__input"
                            value={formData.panNumber || ""}
                            onChange={(e) => patch({ panNumber: sanitizePan(e.target.value) })}
                            placeholder="e.g. ABCDE1234F"
                            maxLength={10}
                            autoComplete="off"
                        />
                    </div>
                    <div>
                        <label className="company-settings-field__label" htmlFor="company-status">
                            Account status
                        </label>
                        <input
                            id="company-status"
                            type="text"
                            className="company-settings-field__input"
                            value={accountStatus ? "Active" : "Inactive"}
                            disabled
                            readOnly
                            aria-describedby="company-status-hint"
                        />
                        <span id="company-status-hint" className="company-settings-field__hint">
                            Managed by Samsara — contact support to change
                        </span>
                    </div>
                </div>
            </section>

            <section className="company-settings-card" aria-labelledby="settings-location-heading">
                <div className="company-settings-card__head">
                    <span className="company-settings-card__icon" aria-hidden="true">
                        <i className="ri-map-pin-line" />
                    </span>
                    <div>
                        <h2 id="settings-location-heading" className="company-settings-card__title">
                            Location
                        </h2>
                        <p className="company-settings-card__desc">
                            Registered business address
                        </p>
                    </div>
                </div>

                <div className="company-settings-grid">
                    <div>
                        <label className="company-settings-field__label" htmlFor="company-address">
                            Street address
                        </label>
                        <input
                            id="company-address"
                            type="text"
                            className="company-settings-field__input"
                            value={formData.address}
                            onChange={(e) => patch({ address: e.target.value })}
                        />
                    </div>
                </div>
                <div className="company-settings-grid company-settings-grid--3 !mt-4">
                    <div>
                        <label className="company-settings-field__label" htmlFor="company-city">
                            City
                        </label>
                        <input
                            id="company-city"
                            type="text"
                            className="company-settings-field__input"
                            value={formData.city}
                            onChange={(e) => patch({ city: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="company-settings-field__label" htmlFor="company-pincode">
                            Pincode
                        </label>
                        <input
                            id="company-pincode"
                            type="text"
                            className="company-settings-field__input"
                            value={formData.pincode}
                            onChange={(e) => patch({ pincode: sanitizePincode(e.target.value) })}
                            maxLength={6}
                            inputMode="numeric"
                        />
                    </div>
                    <div>
                        <label className="company-settings-field__label" htmlFor="company-country">
                            Country
                        </label>
                        <input
                            id="company-country"
                            type="text"
                            className="company-settings-field__input"
                            value={formData.country}
                            onChange={(e) => patch({ country: e.target.value })}
                        />
                    </div>
                </div>
            </section>

            <section className="company-settings-card" aria-labelledby="settings-contacts-heading">
                <div className="company-settings-card__head">
                    <span className="company-settings-card__icon" aria-hidden="true">
                        <i className="ri-contacts-line" />
                    </span>
                    <div>
                        <h2 id="settings-contacts-heading" className="company-settings-card__title">
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
                            contactTab === "primary"
                                ? "company-settings-tabs__btn--active"
                                : ""
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
                            contactTab === "secondary"
                                ? "company-settings-tabs__btn--active"
                                : ""
                        }`}
                        onClick={() => setContactTab("secondary")}
                    >
                        <i className="ri-user-line" aria-hidden="true" />
                        Secondary
                    </button>
                </div>

                <div
                    role="tabpanel"
                    className="company-settings-grid company-settings-grid--2"
                >
                    <div>
                        <label
                            className="company-settings-field__label"
                            htmlFor={`contact-${contactTab}-name`}
                        >
                            Full name
                        </label>
                        <input
                            id={`contact-${contactTab}-name`}
                            type="text"
                            className="company-settings-field__input"
                            value={contact?.name || ""}
                            onChange={(e) =>
                                onContactChange(contactNum, "name", e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <label
                            className="company-settings-field__label"
                            htmlFor={`contact-${contactTab}-designation`}
                        >
                            Designation
                        </label>
                        <input
                            id={`contact-${contactTab}-designation`}
                            type="text"
                            className="company-settings-field__input"
                            value={contact?.designation || ""}
                            onChange={(e) =>
                                onContactChange(contactNum, "designation", e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <label
                            className="company-settings-field__label"
                            htmlFor={`contact-${contactTab}-email`}
                        >
                            Email
                        </label>
                        <input
                            id={`contact-${contactTab}-email`}
                            type="email"
                            className="company-settings-field__input"
                            value={contact?.email || ""}
                            onChange={(e) =>
                                onContactChange(contactNum, "email", e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <label
                            className="company-settings-field__label"
                            htmlFor={`contact-${contactTab}-mobile`}
                        >
                            Mobile
                        </label>
                        <input
                            id={`contact-${contactTab}-mobile`}
                            type="tel"
                            className="company-settings-field__input"
                            value={contact?.mobileNumber || ""}
                            onChange={(e) =>
                                onContactChange(
                                    contactNum,
                                    "mobileNumber",
                                    sanitizeMobile(e.target.value)
                                )
                            }
                            maxLength={10}
                            inputMode="numeric"
                        />
                    </div>
                </div>
            </section>

            <div className="company-settings-form-footer">
                <button
                    type="button"
                    className="company-settings-btn company-settings-btn--ghost"
                    onClick={onCancel}
                    disabled={saving || uploadingLogo}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="company-settings-btn company-settings-btn--primary"
                    disabled={saving || uploadingLogo}
                    aria-busy={saving}
                >
                    {saving ? (
                        <>
                            <span
                                className="company-settings-loading__spinner"
                                style={{ width: "1rem", height: "1rem", borderWidth: 2 }}
                                aria-hidden="true"
                            />
                            Saving…
                        </>
                    ) : (
                        <>
                            <i className="ri-save-line" aria-hidden="true" />
                            Save changes
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
