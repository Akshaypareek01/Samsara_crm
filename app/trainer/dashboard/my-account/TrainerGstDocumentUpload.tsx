"use client";

import React, { RefObject } from "react";
import { useAuthenticatedImage } from "@/hooks/useAuthenticatedImage";

type TrainerGstDocumentUploadProps = {
  documentUrl: string;
  isPdf: boolean;
  gstDocumentInputRef: RefObject<HTMLInputElement | null>;
  uploading: boolean;
  saving: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onSave: () => void;
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
  saving,
  onChange,
  onClear,
  onSave,
}: TrainerGstDocumentUploadProps) {
  const { src: previewSrc, failed: previewFailed, handleError } = useAuthenticatedImage(
    !isPdf ? documentUrl : null
  );

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
          {documentUrl && !isPdf && !previewFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewSrc} alt="GST document preview" onError={handleError} />
          ) : documentUrl && isPdf ? (
            <span className="trainer-account-pan-upload__pdf" aria-hidden="true">
              <i className="ri-file-pdf-line" />
            </span>
          ) : uploading ? (
            <span className="spinner-border spinner-border-sm text-primary" role="status" />
          ) : documentUrl && previewFailed ? (
            <span className="trainer-account-pan-upload__pdf" aria-hidden="true">
              <i className="ri-image-line" />
            </span>
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
              {(isPdf || previewFailed) && (
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="trainer-account-pan-upload__link"
                >
                  {isPdf ? "View PDF" : "Open document"}
                </a>
              )}
              <button
                type="button"
                onClick={onSave}
                disabled={saving || uploading}
                className="trainer-account-pan-upload__save"
              >
                {saving ? "Saving…" : "Save"}
              </button>
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
