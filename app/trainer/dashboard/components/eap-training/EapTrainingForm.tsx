"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Base_url } from "@/Config/BaseUrl";
import CompanyRightDrawer from "@/app/company/dashboard/components/CompanyRightDrawer";
import EapTrainingService, {
  EAP_DURATION_OPTIONS,
  type CreateEapTrainingRequest,
  type EapDurationHours,
  type EapSyllabusEntry,
  type EapTraining,
} from "@/services/eapTrainingService";
import "./eap-training-form-drawer.css";

type EapTrainingFormProps = {
  open: boolean;
  training?: EapTraining | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  title: string;
  coverImage: string;
  durationOptions: EapDurationHours[];
  syllabus: EapSyllabusEntry[];
};

const FORM_ID = "eap-training-drawer-form";

const emptyForm = (): FormState => ({
  title: "",
  coverImage: "",
  durationOptions: [],
  syllabus: [],
});

/**
 * Build syllabus entries aligned with selected duration options.
 *
 * @param durations - Selected duration hours.
 * @param existing - Existing syllabus to preserve points where possible.
 */
function buildSyllabusForDurations(
  durations: EapDurationHours[],
  existing: EapSyllabusEntry[] = []
): EapSyllabusEntry[] {
  return durations.map((hours) => {
    const match = existing.find((s) => s.durationHours === hours);
    return {
      durationHours: hours,
      points: match?.points?.length ? [...match.points] : [""],
    };
  });
}

/**
 * Right-side drawer form for creating or editing an EAP training program.
 */
const EapTrainingForm: React.FC<EapTrainingFormProps> = ({
  open,
  training,
  onClose,
  onSaved,
}) => {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (training) {
      setForm({
        title: training.title,
        coverImage: training.coverImage,
        durationOptions: [...training.durationOptions],
        syllabus: training.syllabus.map((s) => ({
          durationHours: s.durationHours,
          points: [...s.points],
        })),
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, training]);

  /**
   * Open the hidden file picker for cover image upload.
   */
  const openCoverFilePicker = () => {
    if (!uploading) fileRef.current?.click();
  };

  /**
   * Validate and upload cover image via the shared storage endpoint.
   *
   * @param file - Selected image file.
   */
  const uploadCover = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      void Swal.fire({ icon: "error", title: "Invalid file", text: "Please select an image file." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      void Swal.fire({ icon: "error", title: "File too large", text: "Image must be under 5MB." });
      return;
    }

    try {
      setUploading(true);
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
        setForm((prev) => ({ ...prev, coverImage: response.data.url }));
        void Swal.fire({ icon: "success", title: "Cover uploaded", timer: 1500, showConfirmButton: false });
      } else {
        throw new Error("Upload failed");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload image";
      void Swal.fire({ icon: "error", title: "Upload failed", text: message });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  /**
   * Handle cover image file selection from the file input.
   */
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void uploadCover(file);
  };

  /**
   * Toggle a duration option and sync syllabus blocks.
   *
   * @param hours - Duration to toggle.
   */
  const toggleDuration = (hours: EapDurationHours) => {
    setForm((prev) => {
      const selected = prev.durationOptions.includes(hours);
      const durationOptions = selected
        ? prev.durationOptions.filter((d) => d !== hours)
        : [...prev.durationOptions, hours].sort((a, b) => a - b);
      return {
        ...prev,
        durationOptions,
        syllabus: buildSyllabusForDurations(durationOptions, prev.syllabus),
      };
    });
  };

  /**
   * Update a syllabus point at the given index.
   */
  const updatePoint = (durationHours: EapDurationHours, index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      syllabus: prev.syllabus.map((entry) =>
        entry.durationHours === durationHours
          ? {
              ...entry,
              points: entry.points.map((p, i) => (i === index ? value : p)),
            }
          : entry
      ),
    }));
  };

  /**
   * Append an empty point row for a duration block.
   */
  const addPoint = (durationHours: EapDurationHours) => {
    setForm((prev) => ({
      ...prev,
      syllabus: prev.syllabus.map((entry) =>
        entry.durationHours === durationHours
          ? { ...entry, points: [...entry.points, ""] }
          : entry
      ),
    }));
  };

  /**
   * Remove a point row from a duration block.
   */
  const removePoint = (durationHours: EapDurationHours, index: number) => {
    setForm((prev) => ({
      ...prev,
      syllabus: prev.syllabus.map((entry) => {
        if (entry.durationHours !== durationHours) return entry;
        const points = entry.points.filter((_, i) => i !== index);
        return { ...entry, points: points.length ? points : [""] };
      }),
    }));
  };

  /**
   * Validate and submit the training form.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      void Swal.fire({ icon: "warning", title: "Title required" });
      return;
    }
    if (!form.coverImage) {
      void Swal.fire({ icon: "warning", title: "Cover image required" });
      return;
    }
    if (form.durationOptions.length === 0) {
      void Swal.fire({ icon: "warning", title: "Select at least one duration" });
      return;
    }
    const cleanedSyllabus = form.syllabus.map((entry) => ({
      durationHours: entry.durationHours,
      points: entry.points.map((p) => p.trim()).filter(Boolean),
    }));
    if (cleanedSyllabus.some((s) => s.points.length === 0)) {
      void Swal.fire({ icon: "warning", title: "Add at least one point per duration" });
      return;
    }

    const payload: CreateEapTrainingRequest = {
      title: form.title.trim(),
      coverImage: form.coverImage,
      durationOptions: form.durationOptions,
      syllabus: cleanedSyllabus,
    };

    try {
      setSaving(true);
      const id = training?._id || training?.id;
      if (id) {
        await EapTrainingService.updateTraining(id, payload);
        void Swal.fire({ icon: "success", title: "Training updated" });
      } else {
        await EapTrainingService.createTraining(payload);
        void Swal.fire({ icon: "success", title: "Training created" });
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save training";
      void Swal.fire({ icon: "error", title: "Error", text: message });
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <div className="eap-training-drawer-footer" role="group" aria-label="Form actions">
      <button
        type="submit"
        form={FORM_ID}
        className="eap-training-drawer-footer__submit"
        disabled={saving || uploading}
      >
        {saving ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            Saving…
          </>
        ) : training ? (
          <>
            <i className="ri-save-line" aria-hidden="true" />
            Update training
          </>
        ) : (
          <>
            <i className="ri-add-line" aria-hidden="true" />
            Create training
          </>
        )}
      </button>
      <button
        type="button"
        className="eap-training-drawer-footer__cancel"
        onClick={onClose}
        disabled={saving}
      >
        Cancel
      </button>
    </div>
  );

  return (
    <CompanyRightDrawer
      open={open}
      title={training ? "Edit training program" : "Create training program"}
      onClose={onClose}
      maxWidthClass="max-w-xl"
      ariaLabelledBy="eap-training-drawer-title"
      footer={footer}
    >
      <form id={FORM_ID} className="eap-training-drawer-form" onSubmit={handleSubmit}>
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
            onChange={handleCoverFileChange}
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
                onClick={openCoverFilePicker}
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
                  onClick={() => setForm((prev) => ({ ...prev, coverImage: "" }))}
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
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Stress Management Workshop"
              required
            />
          </div>
          <div className="eap-training-drawer-field">
            <span className="eap-training-drawer-field__label" id="eap-durations-label">
              Session durations
            </span>
            <div
              className="eap-training-drawer-chips"
              role="group"
              aria-labelledby="eap-durations-label"
            >
              {EAP_DURATION_OPTIONS.map((hours) => (
                <button
                  key={hours}
                  type="button"
                  className={`eap-training-drawer-chip ${
                    form.durationOptions.includes(hours) ? "eap-training-drawer-chip--selected" : ""
                  }`}
                  onClick={() => toggleDuration(hours)}
                  aria-pressed={form.durationOptions.includes(hours)}
                >
                  {hours} hr{hours === 1 ? "" : "s"}
                </button>
              ))}
            </div>
            <p className="eap-training-drawer-hint">Select one or more durations companies can book.</p>
          </div>
        </section>

        {form.syllabus.length > 0 && (
          <section className="eap-training-drawer-section" aria-labelledby="eap-syllabus-section">
            <h3 className="eap-training-drawer-section__title" id="eap-syllabus-section">
              <i className="ri-list-check-2" aria-hidden="true" />
              Session outline
            </h3>
            <p className="eap-training-drawer-hint mb-3">
              Add bullet points shown to companies for each duration.
            </p>
            {form.syllabus.map((entry) => (
              <div key={entry.durationHours} className="eap-training-drawer-syllabus">
                <p className="eap-training-drawer-syllabus__head">
                  {entry.durationHours} hour session
                </p>
                {entry.points.map((point, index) => (
                  <div key={index} className="eap-training-drawer-point">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => updatePoint(entry.durationHours, index, e.target.value)}
                      placeholder={`Bullet point ${index + 1}`}
                      aria-label={`Point ${index + 1} for ${entry.durationHours} hour session`}
                    />
                    <button
                      type="button"
                      className="eap-training-drawer-point__remove"
                      onClick={() => removePoint(entry.durationHours, index)}
                      aria-label="Remove point"
                      disabled={entry.points.length === 1}
                    >
                      <i className="ri-close-line" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="eap-training-drawer-add-point"
                  onClick={() => addPoint(entry.durationHours)}
                >
                  <i className="ri-add-line" aria-hidden="true" />
                  Add point
                </button>
              </div>
            ))}
          </section>
        )}
      </form>
    </CompanyRightDrawer>
  );
};

export default EapTrainingForm;
