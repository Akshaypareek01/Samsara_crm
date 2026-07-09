"use client";
import React, { RefObject, useEffect, useId, useRef, useState } from 'react';
import ProfilePhotoCropModal from '@/shared/components/trainer/ProfilePhotoCropModal';
import {
  COMPANY_LOGO_OUTPUT_SIZE,
  validateImageUploadFile,
  ALLOWED_IMAGE_ACCEPT,
  ALLOWED_IMAGE_FORMATS_LABEL,
} from '@/shared/utils/imageCropUtils';
import '@/shared/styles/trainer-form.css';

interface CompanyLogoUploadProps {
  logoUrl: string;
  logoInputRef: RefObject<HTMLInputElement | null>;
  uploadingLogo: boolean;
  /** Called with the cropped logo file ready for upload. */
  onLogoFileReady: (file: File) => void | Promise<void>;
  onClearLogo: () => void;
  hasError?: boolean;
  /** Optional validation error handler (e.g. Swal). */
  onLogoValidationError?: (message: string) => void;
}

/**
 * Company logo upload control with square crop before upload.
 *
 * @param props - Logo URL, refs and upload handlers.
 * @returns Hidden file input, crop dialog and logo upload row.
 */
const CompanyLogoUpload: React.FC<CompanyLogoUploadProps> = ({
  logoUrl,
  logoInputRef,
  uploadingLogo,
  onLogoFileReady,
  onClearLogo,
  hasError = false,
  onLogoValidationError,
}) => {
  const internalInputRef = useRef<HTMLInputElement | null>(null);
  const zoomInputId = useId();
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState('company-logo.png');

  useEffect(() => {
    return () => {
      if (cropImageSrc?.startsWith('blob:')) {
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
    if (logoInputRef && 'current' in logoInputRef) {
      (logoInputRef as React.MutableRefObject<HTMLInputElement | null>).current = element;
    }
  };

  /**
   * Close crop dialog and reset file input.
   */
  const closeCropModal = () => {
    setCropOpen(false);
    if (cropImageSrc?.startsWith('blob:')) {
      URL.revokeObjectURL(cropImageSrc);
    }
    setCropImageSrc(null);
    const input = logoInputRef.current ?? internalInputRef.current;
    if (input) input.value = '';
  };

  /**
   * Validate selected file and open the crop dialog.
   *
   * @param event - File input change event.
   */
  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateImageUploadFile(file);
    if (validationError) {
      onLogoValidationError?.(validationError);
      event.target.value = '';
      return;
    }

    if (cropImageSrc?.startsWith('blob:')) {
      URL.revokeObjectURL(cropImageSrc);
    }

    setPendingFileName(file.name);
    setCropImageSrc(URL.createObjectURL(file));
    setCropOpen(true);
  };

  return (
    <>
      <input
        type="file"
        ref={setLogoInputRef}
        accept={ALLOWED_IMAGE_ACCEPT}
        onChange={handleLogoSelect}
        className="hidden"
        aria-hidden="true"
      />

      <ProfilePhotoCropModal
        open={cropOpen}
        imageSrc={cropImageSrc}
        fileName={pendingFileName}
        onClose={closeCropModal}
        onConfirm={onLogoFileReady}
        title="Crop company logo"
        hint="Drag to reposition and zoom. Your logo will be saved as a square PNG."
        cropShape="rect"
        zoomInputId={zoomInputId}
        exportOptions={{
          outputSize: COMPANY_LOGO_OUTPUT_SIZE,
          mimeType: 'image/png',
        }}
      />

      <div className={`trainer-form-profile-row${hasError ? ' trainer-form-control-error rounded-xl' : ''}`}>
        <button
          type="button"
          className="trainer-form-profile-circle !rounded-xl"
          onClick={() => (logoInputRef.current ?? internalInputRef.current)?.click()}
          disabled={uploadingLogo || cropOpen}
          aria-label="Upload company logo"
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Company logo preview" className="!rounded-xl object-contain p-1" />
          ) : uploadingLogo ? (
            <span className="spinner-border spinner-border-sm text-primary" role="status" />
          ) : (
            <i className="ri-building-line text-[28px] text-[#c9bef8]" aria-hidden="true" />
          )}
        </button>
        <div className="trainer-form-profile-info flex-1 min-w-0">
          <strong>Upload your company logo</strong>
          <p>
            Click to choose a logo, crop it to a square, then upload. Use a clear logo on a light
            background. {ALLOWED_IMAGE_FORMATS_LABEL} only, max 5MB recommended.
          </p>
          {logoUrl && (
            <button
              type="button"
              onClick={onClearLogo}
              className="text-xs text-danger font-semibold mt-1 hover:underline"
            >
              Remove logo
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default CompanyLogoUpload;
