"use client";
import React, { RefObject } from 'react';
import '@/shared/styles/trainer-form.css';

interface CompanyLogoUploadProps {
  logoUrl: string;
  logoInputRef: RefObject<HTMLInputElement | null>;
  uploadingLogo: boolean;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearLogo: () => void;
  hasError?: boolean;
}

/**
 * Company logo upload control matching the trainer profile photo row layout.
 *
 * @param props - Logo URL, refs and upload handlers.
 * @returns Hidden file input and logo upload row.
 */
const CompanyLogoUpload: React.FC<CompanyLogoUploadProps> = ({
  logoUrl,
  logoInputRef,
  uploadingLogo,
  onLogoChange,
  onClearLogo,
  hasError = false,
}) => (
  <>
    <input
      type="file"
      ref={logoInputRef as RefObject<HTMLInputElement>}
      accept="image/*"
      onChange={onLogoChange}
      className="hidden"
      aria-hidden="true"
    />
    <div className={`trainer-form-profile-row${hasError ? ' trainer-form-control-error rounded-xl' : ''}`}>
      <button
        type="button"
        className="trainer-form-profile-circle !rounded-xl"
        onClick={() => logoInputRef.current?.click()}
        disabled={uploadingLogo}
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
          Click to upload. Use a clear logo on a light background. JPG or PNG, max 5MB
          recommended.
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

export default CompanyLogoUpload;
