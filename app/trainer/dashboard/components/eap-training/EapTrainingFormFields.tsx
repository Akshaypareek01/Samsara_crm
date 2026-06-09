"use client";

import React from "react";
import type { EapDurationHours } from "@/services/eapTrainingService";
import { formatEapDurationLabel } from "@/shared/utils/eapTrainingUtils";
import type { EapTrainingFormState } from "@/hooks/useEapTrainingForm";

type EapTrainingFormFieldsProps = {
  formId: string;
  form: EapTrainingFormState;
  durationOptions: readonly EapDurationHours[];
  uploading: boolean;
  fileRef: React.RefObject<HTMLInputElement>;
  onSubmit: (e: React.FormEvent) => void;
  onTitleChange: (value: string) => void;
  onCoverFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenCoverFilePicker: () => void;
  onRemoveCover: () => void;
  onToggleDuration: (hours: EapDurationHours) => void;
  onSyllabusDescriptionChange: (durationHours: EapDurationHours, value: string) => void;
};

/**
 * Shared form fields for create/edit EAP training program pages.
 */
const EapTrainingFormFields: React.FC<EapTrainingFormFieldsProps> = ({
  formId,
  form,
  durationOptions,
  uploading,
  fileRef,
  onSubmit,
  onTitleChange,
  onCoverFileChange,
  onOpenCoverFilePicker,
  onRemoveCover,
  onToggleDuration,
  onSyllabusDescriptionChange,
}) => (
  <form id={formId} className="eap-training-drawer-form trainer-eap-form-page__form" onSubmit={onSubmit}>
    <section className="eap-training-drawer-section" aria-labelledby="eap-cover-section">
      <h3 className="eap-training-drawer-section__title" id="eap-cover-section">
        <i className="ri-image-line" aria-hidden="true" />
        Cover image
      </h3>
      <input
        ref={fileRef}
        id="eap-cover-file"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="eap-training-drawer-file-input"
        onChange={onCoverFileChange}
        aria-label="Upload cover image file"
      />
      <div
        className={`eap-training-drawer-cover ${
          form.coverImage ? "eap-training-drawer-cover--has-image" : ""
        }`}
      >
        {form.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.coverImage}
            alt="Training cover preview"
            className="eap-training-drawer-cover__preview"
          />
        ) : (
          <div className="eap-training-drawer-cover__empty">
            <i className="ri-image-add-line" aria-hidden="true" />
            <span className="font-medium text-sm text-[#374151]">No cover image yet</span>
            <p className="eap-training-drawer-cover__hint">
              Upload a program cover shown to companies. JPG or PNG, max 5MB, 16:9 recommended.
            </p>
          </div>
        )}

        <div className="eap-training-drawer-cover__toolbar">
          <button
            type="button"
            className="eap-training-drawer-btn eap-training-drawer-btn--primary eap-training-drawer-btn--grow"
            onClick={onOpenCoverFilePicker}
            disabled={uploading}
            aria-label={form.coverImage ? "Change cover image" : "Upload cover image"}
          >
            {uploading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                Uploading…
              </>
            ) : (
              <>
                <i className="ri-upload-2-line" aria-hidden="true" />
                {form.coverImage ? "Change image" : "Upload image"}
              </>
            )}
          </button>
          {form.coverImage && (
            <button
              type="button"
              className="eap-training-drawer-btn eap-training-drawer-btn--danger"
              onClick={onRemoveCover}
              disabled={uploading}
              aria-label="Remove cover image"
            >
              <i className="ri-delete-bin-line" aria-hidden="true" />
              Remove
            </button>
          )}
        </div>
      </div>
    </section>

    <section className="eap-training-drawer-section" aria-labelledby="eap-details-section">
      <h3 className="eap-training-drawer-section__title" id="eap-details-section">
        <i className="ri-file-text-line" aria-hidden="true" />
        Program details
      </h3>
      <div className="eap-training-drawer-field">
        <label htmlFor="eap-title">Program title</label>
        <input
          id="eap-title"
          type="text"
          className="form-control"
          value={form.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g. Stress Management Workshop"
          required
        />
      </div>
      <div className="eap-training-drawer-field">
        <span className="eap-training-drawer-field__label" id="eap-durations-label">
          Session durations
        </span>
        <div className="eap-training-drawer-chips" role="group" aria-labelledby="eap-durations-label">
          {durationOptions.map((hours) => (
            <button
              key={hours}
              type="button"
              className={`eap-training-drawer-chip ${
                form.durationOptions.includes(hours) ? "eap-training-drawer-chip--selected" : ""
              }`}
              onClick={() => onToggleDuration(hours)}
              aria-pressed={form.durationOptions.includes(hours)}
            >
              {formatEapDurationLabel(hours)}
            </button>
          ))}
        </div>
        <p className="eap-training-drawer-hint">Select one or more durations companies can book.</p>
      </div>
    </section>

    {form.syllabus.length > 0 && (
      <section className="eap-training-drawer-section" aria-labelledby="eap-syllabus-section">
        <h3 className="eap-training-drawer-section__title" id="eap-syllabus-section">
          <i className="ri-file-text-line" aria-hidden="true" />
          Session content
        </h3>
        <p className="eap-training-drawer-hint mb-3">
          Describe what each session covers. This is shown to companies when they browse and book.
        </p>
        {form.syllabus.map((entry) => (
          <div key={entry.durationHours} className="eap-training-drawer-syllabus">
            <label
              htmlFor={`eap-syllabus-${entry.durationHours}`}
              className="eap-training-drawer-syllabus__head"
            >
              {formatEapDurationLabel(entry.durationHours)} session
            </label>
            <textarea
              id={`eap-syllabus-${entry.durationHours}`}
              className="form-control eap-training-drawer-syllabus__textarea"
              rows={4}
              value={entry.description}
              onChange={(e) => onSyllabusDescriptionChange(entry.durationHours, e.target.value)}
              placeholder="Describe the session outline, topics covered, and outcomes…"
              aria-label={`Session content for ${formatEapDurationLabel(entry.durationHours)}`}
            />
          </div>
        ))}
      </section>
    )}
  </form>
);

export default EapTrainingFormFields;
