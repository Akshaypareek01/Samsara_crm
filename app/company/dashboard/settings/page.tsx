"use client";

import Seo from "@/shared/layout-components/seo/seo";
import React, { Fragment, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Base_url } from "@/Config/BaseUrl";
import CompanyService, {
    UpdateCompanyRequest,
    ContactPerson,
} from "@/services/companyService";
import ApiService from "@/services/ApiService";
import { clearCompanyInsightsCache } from "@/services/companyInsightsClient";
import Swal from "sweetalert2";
import CompanySettingsForm from "../components/settings/CompanySettingsForm";
import CompanySettingsProfileView from "../components/settings/CompanySettingsProfileView";
import "../components/settings/company-settings-page.css";

/**
 * Deep-clones company form data for cancel/reset snapshots.
 *
 * @param data - Company profile form state.
 */
function cloneFormData(data: UpdateCompanyRequest): UpdateCompanyRequest {
    return {
        ...data,
        contactPerson1: { ...(data.contactPerson1 || EMPTY_CONTACT) },
        contactPerson2: { ...(data.contactPerson2 || EMPTY_CONTACT) },
    };
}

const EMPTY_CONTACT: ContactPerson = {
    name: "",
    email: "",
    mobileNumber: "",
    designation: "",
};

const INITIAL_FORM: UpdateCompanyRequest = {
    companyName: "",
    companyLogo: "",
    email: "",
    domain: "",
    numberOfEmployees: undefined,
    gstNumber: "",
    panNumber: "",
    address: "",
    city: "",
    pincode: "",
    country: "",
    contactPerson1: { ...EMPTY_CONTACT },
    contactPerson2: { ...EMPTY_CONTACT },
};

const SettingsPage = () => {
    const [companyId, setCompanyId] = useState("");
    const [accountStatus, setAccountStatus] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<UpdateCompanyRequest>(INITIAL_FORM);
    const [savedSnapshot, setSavedSnapshot] = useState<UpdateCompanyRequest>(INITIAL_FORM);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        void fetchCompanyProfile();
    }, []);

    const fetchCompanyProfile = async () => {
        try {
            setLoading(true);
            setError("");
            const profile = await CompanyService.getCompanyProfile();
            setCompanyId(profile.companyId || "");
            setAccountStatus(profile.status !== false);
            const nextForm = {
                companyName: profile.companyName || "",
                companyLogo: profile.companyLogo || "",
                email: profile.email || "",
                domain: profile.domain || "",
                numberOfEmployees: profile.numberOfEmployees,
                gstNumber: profile.gstNumber || "",
                panNumber: profile.panNumber || "",
                address: profile.address || "",
                city: profile.city || "",
                pincode: profile.pincode || "",
                country: profile.country || "",
                contactPerson1: profile.contactPerson1 || { ...EMPTY_CONTACT },
                contactPerson2: profile.contactPerson2 || { ...EMPTY_CONTACT },
            };
            setFormData(nextForm);
            setSavedSnapshot(cloneFormData(nextForm));
            setIsEditing(false);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to load company profile";
            setError(message);
            Swal.fire("Error!", message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError("");
            const payload: UpdateCompanyRequest = {
                ...formData,
                gstNumber: (formData.gstNumber || "").trim().toUpperCase(),
                panNumber: (formData.panNumber || "").trim().toUpperCase(),
            };
            const updatedCompany = await CompanyService.updateCompanyProfile(payload);
            setCompanyId(updatedCompany.companyId || "");
            setAccountStatus(updatedCompany.status !== false);
            const nextForm = {
                companyName: updatedCompany.companyName || "",
                companyLogo: updatedCompany.companyLogo || "",
                email: updatedCompany.email || "",
                domain: updatedCompany.domain || "",
                numberOfEmployees: updatedCompany.numberOfEmployees,
                gstNumber: updatedCompany.gstNumber || "",
                panNumber: updatedCompany.panNumber || "",
                address: updatedCompany.address || "",
                city: updatedCompany.city || "",
                pincode: updatedCompany.pincode || "",
                country: updatedCompany.country || "",
                contactPerson1: updatedCompany.contactPerson1 || { ...EMPTY_CONTACT },
                contactPerson2: updatedCompany.contactPerson2 || { ...EMPTY_CONTACT },
            };
            setFormData(nextForm);
            setSavedSnapshot(cloneFormData(nextForm));
            setIsEditing(false);
            await ApiService.setUser(updatedCompany);
            clearCompanyInsightsCache();
            Swal.fire("Success!", "Company profile updated successfully", "success");
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to update company profile";
            setError(message);
            Swal.fire("Error!", message, "error");
        } finally {
            setSaving(false);
        }
    };

    /**
     * Upload the selected logo file to the storage endpoint.
     * @param file - Image file from the file input.
     */
    const uploadCompanyLogo = async (file: File) => {
        try {
            setUploadingLogo(true);
            const body = new FormData();
            body.append("file", file);
            const token = localStorage.getItem("token");
            const response = await axios.post(`${Base_url}/upload`, body, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });
            if (response.data?.success && response.data?.url) {
                setFormData((prev) => ({ ...prev, companyLogo: response.data.url }));
                Swal.fire("Success!", "Company logo uploaded successfully", "success");
            } else {
                throw new Error("Upload failed: Invalid response");
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
            const message =
                axiosErr.response?.data?.message ||
                axiosErr.message ||
                "Failed to upload logo";
            Swal.fire("Error!", message, "error");
        } finally {
            setUploadingLogo(false);
        }
    };

    /**
     * Validate and upload logo from file input change.
     * @param e - Change event from hidden file input.
     */
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                Swal.fire("Error!", "Please select an image file", "error");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire("Error!", "File size should be less than 5MB", "error");
                return;
            }
            void uploadCompanyLogo(file);
        }
        if (logoInputRef.current) {
            logoInputRef.current.value = "";
        }
    };

    const clearCompanyLogo = () => {
        setFormData((prev) => ({ ...prev, companyLogo: "" }));
    };

    const updateContactPerson = (
        personNumber: 1 | 2,
        field: keyof ContactPerson,
        value: string
    ) => {
        const key = personNumber === 1 ? "contactPerson1" : "contactPerson2";
        setFormData((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value,
            },
        }));
    };

    const handleCancelEdit = () => {
        setFormData(cloneFormData(savedSnapshot));
        setIsEditing(false);
    };

    const handleStartEdit = () => {
        setSavedSnapshot(cloneFormData(formData));
        setIsEditing(true);
    };

    return (
        <Fragment>
            <Seo title="Settings" />

            <div className="company-settings-page">
                <header className="company-settings-page__header">
                    <div>
                        <h1 className="company-settings-page__title">
                            {isEditing ? "Edit company profile" : "Company profile"}
                        </h1>
                        <p className="company-settings-page__subtitle">
                            {isEditing
                                ? "Update your organization profile, location, and contact details."
                                : "View your organization details. Click Edit to make changes."}
                        </p>
                    </div>
                    {!loading && !isEditing && (
                        <button
                            type="button"
                            className="company-settings-btn company-settings-btn--primary"
                            onClick={handleStartEdit}
                            aria-label="Edit company profile"
                        >
                            <i className="ri-pencil-line" aria-hidden="true" />
                            Edit profile
                        </button>
                    )}
                </header>

                {error && (
                    <div className="company-settings-alert" role="alert">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="company-settings-loading" role="status" aria-live="polite">
                        <span className="company-settings-loading__spinner" aria-hidden="true" />
                        <p className="mb-0">Loading company profile…</p>
                    </div>
                ) : isEditing ? (
                    <CompanySettingsForm
                        formData={formData}
                        companyId={companyId}
                        accountStatus={accountStatus}
                        saving={saving}
                        uploadingLogo={uploadingLogo}
                        logoInputRef={logoInputRef}
                        onChange={setFormData}
                        onContactChange={updateContactPerson}
                        onLogoChange={handleLogoChange}
                        onLogoClear={clearCompanyLogo}
                        onSubmit={handleSubmit}
                        onCancel={handleCancelEdit}
                    />
                ) : (
                    <CompanySettingsProfileView
                        formData={formData}
                        companyId={companyId}
                        accountStatus={accountStatus}
                    />
                )}
            </div>
        </Fragment>
    );
};

export default SettingsPage;
