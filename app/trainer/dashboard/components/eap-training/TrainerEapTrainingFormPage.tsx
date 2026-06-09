"use client";

import React from "react";
import Link from "next/link";
import type { EapTraining } from "@/services/eapTrainingService";
import { useEapTrainingForm } from "@/hooks/useEapTrainingForm";
import EapTrainingFormFields from "./EapTrainingFormFields";
import {
  TRAINER_MY_TRAININGS_PATH,
  trainerEapTrainingPreviewPath,
  getEapTrainingRouteId,
} from "../../utils/trainerEapTrainingRoutes";
import "./eap-training-form-drawer.css";
import "./trainer-eap-form-page.css";

const FORM_ID = "trainer-eap-training-form";

type TrainerEapTrainingFormPageProps = {
  mode: "create" | "edit";
  training?: EapTraining | null;
  loading?: boolean;
  onSaved: () => void;
  onCancel: () => void;
};

/**
 * Full-page create/edit form for an EAP training program.
 */
const TrainerEapTrainingFormPage: React.FC<TrainerEapTrainingFormPageProps> = ({
  mode,
  training,
  loading = false,
  onSaved,
  onCancel,
}) => {
  const {
    form,
    setForm,
    saving,
    uploading,
    fileRef,
    durationOptions,
    openCoverFilePicker,
    handleCoverFileChange,
    toggleDuration,
    updateSyllabusDescription,
    handleSubmit,
  } = useEapTrainingForm({ training, onSaved });

  const trainingId = training ? getEapTrainingRouteId(training) : "";
  const isEdit = mode === "edit";
  const pageTitle = isEdit ? "Edit training program" : "Create training program";
  const pageSubtitle = isEdit
    ? "Update how this program appears to companies."
    : "Set up a new program companies can browse and book.";

  if (loading) {
    return (
      <div className="trainer-eap-form-page">
        <div className="trainer-eap-form-page__loading" role="status" aria-live="polite">
          <div className="spinner-border text-primary">
            <span className="visually-hidden">Loading program…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trainer-eap-form-page">
      <Link href={TRAINER_MY_TRAININGS_PATH} className="trainer-eap-form-page__back">
        <i className="ri-arrow-left-line" aria-hidden="true" />
        Back to programs
      </Link>

      <header className="trainer-eap-form-page__header">
        <div>
          <h1 className="trainer-eap-form-page__title">{pageTitle}</h1>
          <p className="trainer-eap-form-page__subtitle">{pageSubtitle}</p>
        </div>
        {isEdit && trainingId && (
          <Link
            href={trainerEapTrainingPreviewPath(trainingId)}
            className="trainer-eap-form-page__preview-link"
            aria-label="Preview program as companies see it"
          >
            <i className="ri-eye-line" aria-hidden="true" />
            Preview
          </Link>
        )}
      </header>

      <div className="trainer-eap-form-page__card">
        <EapTrainingFormFields
          formId={FORM_ID}
          form={form}
          durationOptions={durationOptions}
          uploading={uploading}
          fileRef={fileRef}
          onSubmit={handleSubmit}
          onTitleChange={(value) => setForm((prev) => ({ ...prev, title: value }))}
          onCoverFileChange={handleCoverFileChange}
          onOpenCoverFilePicker={openCoverFilePicker}
          onRemoveCover={() => setForm((prev) => ({ ...prev, coverImage: "" }))}
          onToggleDuration={toggleDuration}
          onSyllabusDescriptionChange={updateSyllabusDescription}
        />
      </div>

      <div className="trainer-eap-form-page__actions" role="group" aria-label="Form actions">
        <button
          type="submit"
          form={FORM_ID}
          className="trainer-eap-form-page__submit"
          disabled={saving || uploading}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              Saving…
            </>
          ) : isEdit ? (
            <>
              <i className="ri-save-line" aria-hidden="true" />
              Save changes
            </>
          ) : (
            <>
              <i className="ri-add-line" aria-hidden="true" />
              Create program
            </>
          )}
        </button>
        <button
          type="button"
          className="trainer-eap-form-page__cancel"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TrainerEapTrainingFormPage;
