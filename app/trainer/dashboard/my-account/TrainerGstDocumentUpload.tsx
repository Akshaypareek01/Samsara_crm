"use client";

import React, { RefObject } from "react";

type TrainerGstDocumentUploadProps = {
  documentUrl: string;
  isPdf: boolean;
  gstDocumentInputRef: RefObject<HTMLInputElement | null>;
  uploading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
};

/**
 * GST certificate upload control for the trainer My Account page.
 *
 * @param props - Document preview URL, refs, and upload handlers.
 */
export default function TrainerGstDocumentUpload({
  documentUrl,
  isPdf,
  gstDocumentInputRef,
  uploading,
  onChange,
  onClear,
}: TrainerGstDocumentUploadProps) {
  return (
    <>
      <input
        type="file"
        ref={gstDocumentInputRef as RefObject<HTMLInputElement>}
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={onChange}
        className="hidden"
        aria-hidden="true"
      />
      <div className="trainer-account-pan-upload">
        <button
          type="button"
          className="trainer-account-pan-upload__preview"
          onClick={() => gstDocumentInputRef.current?.click()}
          disabled={uploading}
          aria-label="Upload GST document"
        >
          {documentUrl && !isPdf ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={documentUrl} alt="GST document preview" />
          ) : documentUrl && isPdf ? (
            <span className="trainer-account-pan-upload__pdf" aria-hidden="true">
              <i className="ri-file-pdf-line" />
            </span>
          ) : uploading ? (
            <span className="spinner-border spinner-border-sm text-primary" role="status" />
          ) : (
            <span className="trainer-account-pan-upload__placeholder" aria-hidden="true">
              <i className="ri-bill-line" />
            </span>
          )}
        </button>
        <div className="trainer-account-pan-upload__info">
          <strong>Upload GST certificate</strong>
          <p>
            Upload a clear photo or scan of your GST registration certificate. JPG, PNG, or PDF — max 5MB.
          </p>
          {documentUrl && (
            <div className="trainer-account-pan-upload__actions">
              {isPdf && (
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="trainer-account-pan-upload__link"
                >
                  View PDF
                </a>
              )}
              <button
                type="button"
                onClick={onClear}
                className="trainer-account-pan-upload__remove"
              >
                Remove document
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
