"use client";

import React, { RefObject } from "react";

type CompanySettingsLogoFieldProps = {
    logoUrl: string;
    uploading: boolean;
    inputRef: RefObject<HTMLInputElement | null>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
};

/**
 * Logo upload dropzone with preview and change/remove actions.
 */
export default function CompanySettingsLogoField({
    logoUrl,
    uploading,
    inputRef,
    onFileChange,
    onClear,
}: CompanySettingsLogoFieldProps) {
    return (
        <div className="company-settings-logo">
            <input
                type="file"
                ref={inputRef as RefObject<HTMLInputElement>}
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
                aria-label="Upload company logo"
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
                            onClick={() => inputRef.current?.click()}
                            title="Change logo"
                            aria-label="Change company logo"
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
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
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
                <p>Shown on your dashboard and employee-facing pages. JPG, PNG, or GIF up to 5MB.</p>
                {logoUrl && (
                    <button
                        type="button"
                        className="company-settings-btn company-settings-btn--ghost !mt-3 !h-9 !text-xs"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                    >
                        <i className="ri-upload-2-line" aria-hidden="true" />
                        Replace image
                    </button>
                )}
            </div>
        </div>
    );
}
