"use client";

import React, { Fragment, useEffect, useRef, useState } from "react";
import Seo from "@/shared/layout-components/seo/seo";
import axios from "axios";
import { Base_url } from "@/Config/BaseUrl";
import Swal from "sweetalert2";
import { hasPermission } from "@/shared/utils/permissionUtils";
import {
    getPlatformAccountDetails,
    updatePlatformAccountDetails,
    PlatformBankDetails,
    PlatformAccountDocument,
} from "@/services/platformAccountDetailsService";
import {
    CrmPageHeader,
    CrmCard,
    CrmBtnPrimary,
    CrmLoading,
    crmInputClass,
} from "../components";

type DraftDocument = {
    title: string;
    documentNumber: string;
    fileUrl: string;
    fileName: string;
};

const EMPTY_BANK: PlatformBankDetails = {
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
};

const EMPTY_DRAFT: DraftDocument = {
    title: "",
    documentNumber: "",
    fileUrl: "",
    fileName: "",
};

/**
 * Admin page to manage platform bank details and compliance documents.
 */
export default function AdminAccountDetailsPage() {
    const [adminUser, setAdminUser] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [bankDetails, setBankDetails] = useState<PlatformBankDetails>({ ...EMPTY_BANK });
    const [documents, setDocuments] = useState<DraftDocument[]>([]);
    const [draft, setDraft] = useState<DraftDocument>({ ...EMPTY_DRAFT });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canUpdate =
        adminUser &&
        (hasPermission(adminUser, "companyManagement", "update") ||
            hasPermission(adminUser, "companyManagement", "create"));

    useEffect(() => {
        const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (userStr) setAdminUser(JSON.parse(userStr));
    }, []);

    useEffect(() => {
        void loadDetails();
    }, []);

    const loadDetails = async () => {
        try {
            setLoading(true);
            const data = await getPlatformAccountDetails();
            setBankDetails({
                accountHolderName: data.bankDetails?.accountHolderName || "",
                accountNumber: data.bankDetails?.accountNumber || "",
                ifscCode: data.bankDetails?.ifscCode || "",
                bankName: data.bankDetails?.bankName || "",
            });
            setDocuments(
                (data.documents || []).map((doc: PlatformAccountDocument) => ({
                    title: doc.title || "",
                    documentNumber: doc.documentNumber || "",
                    fileUrl: doc.fileUrl,
                    fileName: doc.fileName || "",
                }))
            );
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to load account details";
            Swal.fire("Error", message, "error");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Upload a document file to storage.
     * @param file - Selected file from input.
     */
    const uploadDocumentFile = async (file: File) => {
        try {
            setUploadingDoc(true);
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
                setDraft((prev) => ({
                    ...prev,
                    fileUrl: response.data.url,
                    fileName: response.data.fileName || file.name,
                }));
                Swal.fire("Uploaded", "File ready — add title and number, then Add document", "success");
            } else {
                throw new Error("Invalid upload response");
            }
        } catch (err: unknown) {
            const axiosErr = err as {
                response?: { data?: { message?: string } };
                message?: string;
            };
            Swal.fire(
                "Upload failed",
                axiosErr.response?.data?.message || axiosErr.message || "Could not upload file",
                "error"
            );
        } finally {
            setUploadingDoc(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            Swal.fire("Error", "File must be under 10MB", "error");
            return;
        }
        void uploadDocumentFile(file);
    };

    const addDocumentToList = () => {
        if (!draft.fileUrl) {
            Swal.fire("Error", "Upload a document file first", "warning");
            return;
        }
        if (!draft.title.trim()) {
            Swal.fire("Error", "Document title is required", "warning");
            return;
        }
        setDocuments((prev) => [
            ...prev,
            {
                title: draft.title.trim(),
                documentNumber: draft.documentNumber.trim(),
                fileUrl: draft.fileUrl,
                fileName: draft.fileName,
            },
        ]);
        setDraft({ ...EMPTY_DRAFT });
    };

    const removeDocument = (index: number) => {
        setDocuments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!canUpdate) {
            Swal.fire("Forbidden", "You do not have permission to update account details", "error");
            return;
        }
        try {
            setSaving(true);
            await updatePlatformAccountDetails({
                bankDetails: {
                    accountHolderName: bankDetails.accountHolderName?.trim(),
                    accountNumber: bankDetails.accountNumber?.trim(),
                    ifscCode: (bankDetails.ifscCode || "").trim().toUpperCase(),
                    bankName: bankDetails.bankName?.trim(),
                },
                documents,
            });
            Swal.fire("Saved", "Account details updated for all companies", "success");
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to save account details";
            Swal.fire("Error", message, "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Fragment>
            <Seo title="Account Details" />
            <CrmPageHeader
                title="Account Details"
                subtitle="Bank information and documents visible to company users"
                actions={
                    canUpdate ? (
                        <CrmBtnPrimary
                            type="button"
                            onClick={() => void handleSave()}
                            disabled={saving || loading}
                            aria-label="Save account details"
                        >
                            {saving ? "Saving…" : "Save changes"}
                        </CrmBtnPrimary>
                    ) : undefined
                }
            />

            {loading ? (
                <CrmLoading label="Loading account details…" />
            ) : (
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 xl:col-span-5">
                        <CrmCard className="p-5">
                            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <i className="ri-bank-line text-purple-600" aria-hidden="true" />
                                Bank details
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label" htmlFor="bank-holder">
                                        Account holder name
                                    </label>
                                    <input
                                        id="bank-holder"
                                        type="text"
                                        className={crmInputClass}
                                        value={bankDetails.accountHolderName}
                                        onChange={(e) =>
                                            setBankDetails((b) => ({
                                                ...b,
                                                accountHolderName: e.target.value,
                                            }))
                                        }
                                        disabled={!canUpdate}
                                    />
                                </div>
                                <div>
                                    <label className="form-label" htmlFor="bank-name">
                                        Bank name
                                    </label>
                                    <input
                                        id="bank-name"
                                        type="text"
                                        className={crmInputClass}
                                        value={bankDetails.bankName}
                                        onChange={(e) =>
                                            setBankDetails((b) => ({
                                                ...b,
                                                bankName: e.target.value,
                                            }))
                                        }
                                        disabled={!canUpdate}
                                    />
                                </div>
                                <div>
                                    <label className="form-label" htmlFor="bank-account">
                                        Account number
                                    </label>
                                    <input
                                        id="bank-account"
                                        type="text"
                                        className={crmInputClass}
                                        value={bankDetails.accountNumber}
                                        onChange={(e) =>
                                            setBankDetails((b) => ({
                                                ...b,
                                                accountNumber: e.target.value,
                                            }))
                                        }
                                        disabled={!canUpdate}
                                    />
                                </div>
                                <div>
                                    <label className="form-label" htmlFor="bank-ifsc">
                                        IFSC code
                                    </label>
                                    <input
                                        id="bank-ifsc"
                                        type="text"
                                        className={crmInputClass}
                                        value={bankDetails.ifscCode}
                                        onChange={(e) =>
                                            setBankDetails((b) => ({
                                                ...b,
                                                ifscCode: e.target.value.toUpperCase(),
                                            }))
                                        }
                                        maxLength={11}
                                        disabled={!canUpdate}
                                    />
                                </div>
                            </div>
                        </CrmCard>
                    </div>

                    <div className="col-span-12 xl:col-span-7">
                        <CrmCard className="p-5">
                            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <i className="ri-file-text-line text-purple-600" aria-hidden="true" />
                                Documents
                            </h2>

                            {canUpdate && (
                                <div className="border border-gray-100 rounded-lg p-4 mb-5 bg-gray-50/80">
                                    <p className="text-xs font-semibold text-gray-600 mb-3">
                                        Add document
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className="form-label" htmlFor="doc-title">
                                                Title
                                            </label>
                                            <input
                                                id="doc-title"
                                                type="text"
                                                className={crmInputClass}
                                                value={draft.title}
                                                onChange={(e) =>
                                                    setDraft((d) => ({
                                                        ...d,
                                                        title: e.target.value,
                                                    }))
                                                }
                                                placeholder="e.g. GST Certificate"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label" htmlFor="doc-number">
                                                Document number
                                            </label>
                                            <input
                                                id="doc-number"
                                                type="text"
                                                className={crmInputClass}
                                                value={draft.documentNumber}
                                                onChange={(e) =>
                                                    setDraft((d) => ({
                                                        ...d,
                                                        documentNumber: e.target.value,
                                                    }))
                                                }
                                                placeholder="e.g. 08ABCDE1234F1Z5"
                                            />
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileChange}
                                        aria-label="Upload document file"
                                    />
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <button
                                            type="button"
                                            className="ti-btn ti-btn-outline-primary ti-btn-sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingDoc}
                                        >
                                            {uploadingDoc ? "Uploading…" : "Upload file"}
                                        </button>
                                        {draft.fileUrl && (
                                            <span className="text-xs text-gray-600 truncate max-w-[12rem]">
                                                {draft.fileName || "File attached"}
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            className="ti-btn ti-btn-primary ti-btn-sm ms-auto"
                                            onClick={addDocumentToList}
                                            disabled={!draft.fileUrl}
                                        >
                                            Add to list
                                        </button>
                                    </div>
                                </div>
                            )}

                            {documents.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-6 border border-dashed border-gray-200 rounded-lg">
                                    No documents yet
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="table table-bordered min-w-full text-sm mb-0">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Number</th>
                                                <th>File</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {documents.map((doc, index) => (
                                                <tr key={`${doc.fileUrl}-${index}`}>
                                                    <td>{doc.title}</td>
                                                    <td>{doc.documentNumber || "—"}</td>
                                                    <td className="max-w-[10rem] truncate">
                                                        {doc.fileName || "—"}
                                                    </td>
                                                    <td className="text-end whitespace-nowrap">
                                                        <a
                                                            href={doc.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="ti-btn ti-btn-sm ti-btn-soft-primary me-1"
                                                            aria-label={`Download ${doc.title}`}
                                                        >
                                                            <i className="ri-download-2-line" />
                                                        </a>
                                                        {canUpdate && (
                                                            <button
                                                                type="button"
                                                                className="ti-btn ti-btn-sm ti-btn-soft-danger"
                                                                onClick={() => removeDocument(index)}
                                                                aria-label={`Remove ${doc.title}`}
                                                            >
                                                                <i className="ri-delete-bin-line" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CrmCard>
                    </div>
                </div>
            )}
        </Fragment>
    );
}
