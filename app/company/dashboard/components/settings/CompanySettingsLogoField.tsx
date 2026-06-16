"use client";

import React, { RefObject, useEffect, useId, useRef, useState } from "react";
import ProfilePhotoCropModal from "@/shared/components/trainer/ProfilePhotoCropModal";
import {
    COMPANY_LOGO_OUTPUT_SIZE,
    validateImageUploadFile,
} from "@/shared/utils/imageCropUtils";

type CompanySettingsLogoFieldProps = {
    logoUrl: string;
    uploading: boolean;
    inputRef: RefObject<HTMLInputElement | null>;
    onFileReady: (file: File) => void | Promise<void>;
    onClear: () => void;
    onValidationError?: (message: string) => void;
};

/**
 * Logo upload dropzone with square crop, preview and change/remove actions.
 */
export default function CompanySettingsLogoField({
    logoUrl,
    uploading,
    inputRef,
    onFileReady,
    onClear,
    onValidationError,
}: CompanySettingsLogoFieldProps) {
    const internalInputRef = useRef<HTMLInputElement | null>(null);
    const zoomInputId = useId();
    const [cropOpen, setCropOpen] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [pendingFileName, setPendingFileName] = useState("company-logo.png");

    useEffect(() => {
        return () => {
            if (cropImageSrc?.startsWith("blob:")) {
                URL.revokeObjectURL(cropImageSrc);
            }
        };
    }, [cropImageSrc]);

    /**
     * Sync hidden input with optional parent ref.
     *
     * @param element - File input element or null on unmount.
     */
    const setLogoInputRef = (element: HTMLInputElement | null) => {
        internalInputRef.current = element;
        if (inputRef && "current" in inputRef) {
            (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = element;
        }
    };

    /**
     * Open file picker for logo replacement.
     */
    const openFilePicker = () => {
        (inputRef.current ?? internalInputRef.current)?.click();
    };

    /**
     * Close crop dialog and reset file input.
     */
    const closeCropModal = () => {
        setCropOpen(false);
        if (cropImageSrc?.startsWith("blob:")) {
            URL.revokeObjectURL(cropImageSrc);
        }
        setCropImageSrc(null);
        const input = inputRef.current ?? internalInputRef.current;
        if (input) input.value = "";
    };

    /**
     * Validate selected file and open the crop dialog.
     *
     * @param event - File input change event.
     */
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validationError = validateImageUploadFile(file);
        if (validationError) {
            onValidationError?.(validationError);
            event.target.value = "";
            return;
        }

        if (cropImageSrc?.startsWith("blob:")) {
            URL.revokeObjectURL(cropImageSrc);
        }

        setPendingFileName(file.name);
        setCropImageSrc(URL.createObjectURL(file));
        setCropOpen(true);
    };

    return (
        <div className="company-settings-logo">
            <input
                type="file"
                ref={setLogoInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload company logo"
            />

            <ProfilePhotoCropModal
                open={cropOpen}
                imageSrc={cropImageSrc}
                fileName={pendingFileName}
                onClose={closeCropModal}
                onConfirm={onFileReady}
                title="Crop company logo"
                hint="Drag to reposition and zoom. Your logo will be saved as a square PNG."
                cropShape="rect"
                zoomInputId={zoomInputId}
                exportOptions={{
                    outputSize: COMPANY_LOGO_OUTPUT_SIZE,
                    mimeType: "image/png",
                }}
            />

            {logoUrl ? (
                <div className="company-settings-logo__preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={logoUrl}
                        alt="Company logo preview"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                        }}
                    />
                    <div className="company-settings-logo__overlay">
                        <button
                            type="button"
                            className="company-settings-btn company-settings-btn--icon"
                            onClick={openFilePicker}
                            title="Change logo"
                            aria-label="Change company logo"
                            disabled={uploading || cropOpen}
                        >
                            <i className="ri-refresh-line" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className="company-settings-btn company-settings-btn--danger"
                            onClick={onClear}
                            title="Remove logo"
                            aria-label="Remove company logo"
                        >
                            <i className="ri-delete-bin-line" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    className="company-settings-logo__dropzone"
                    onClick={openFilePicker}
                    disabled={uploading || cropOpen}
                    aria-label="Upload company logo"
                >
                    {uploading ? (
                        <>
                            <span
                                className="company-settings-loading__spinner"
                                style={{ width: "1.5rem", height: "1.5rem" }}
                                aria-hidden="true"
                            />
                            <span className="text-xs font-medium">Uploading…</span>
                        </>
                    ) : (
                        <>
                            <i className="ri-image-add-line text-xl" aria-hidden="true" />
                            <span className="text-xs font-semibold">Add logo</span>
                        </>
                    )}
                </button>
            )}

            <div className="company-settings-logo__meta">
                <p className="font-semibold text-[#374151] !mb-1">Company logo</p>
                <p>
                    Shown on your dashboard and employee-facing pages. Choose an image, crop it to a
                    square, then upload. JPG or PNG up to 5MB.
                </p>
                {logoUrl && (
                    <button
                        type="button"
                        className="company-settings-btn company-settings-btn--ghost !mt-3 !h-9 !text-xs"
                        onClick={openFilePicker}
                        disabled={uploading || cropOpen}
                    >
                        <i className="ri-upload-2-line" aria-hidden="true" />
                        Replace image
                    </button>
                )}
            </div>
        </div>
    );
}
