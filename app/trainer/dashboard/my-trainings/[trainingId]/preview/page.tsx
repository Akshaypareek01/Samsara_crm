"use client";

import Seo from "@/shared/layout-components/seo/seo";
import Pageheader from "@/shared/layout-components/page-header/pageheader";
import React, { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import EapTrainingService, { type EapTraining } from "@/services/eapTrainingService";
import { useEapTrainerAccess } from "@/hooks/useEapTrainerAccess";
import CompanyEapTrainingDetailView from "@/app/company/dashboard/components/eap-trainers/CompanyEapTrainingDetailView";
import {
  TRAINER_MY_TRAININGS_PATH,
  trainerEapTrainingEditPath,
} from "../../../utils/trainerEapTrainingRoutes";
import "@/app/company/dashboard/components/eap-trainers/company-eap-trainers-page.css";
import "../../../components/eap-training/trainer-eap-form-page.css";
import "@/shared/styles/eap-training-page.css";

/**
 * Preview an EAP training program as companies see it.
 */
const TrainerEapTrainingPreviewPage = () => {
  const params = useParams();
  const trainingId = typeof params.trainingId === "string" ? params.trainingId : "";
  const { profile, loading: accessLoading, accessDenied } = useEapTrainerAccess();
  const [training, setTraining] = useState<EapTraining | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!trainingId || accessLoading || accessDenied) return;

    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await EapTrainingService.getTrainingById(trainingId);
        if (!cancelled) setTraining(data);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load program");
          setTraining(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [trainingId, accessLoading, accessDenied]);

  if (accessDenied) return null;

  return (
    <Fragment>
      <Seo title={training?.title ? `Preview ${training.title}` : "Preview Program"} />
      <Pageheader currentpage="Program Preview" activepage="Trainer" mainpage="My Training" />

      <div className="eap-training-page">
        <div className="trainer-eap-preview-page">
          <div className="trainer-eap-preview-page__toolbar">
            <Link href={TRAINER_MY_TRAININGS_PATH} className="trainer-eap-preview-page__back">
              <i className="ri-arrow-left-line" aria-hidden="true" />
              Back to programs
            </Link>
            {trainingId && !error && (
              <Link
                href={trainerEapTrainingEditPath(trainingId)}
                className="trainer-eap-preview-page__edit"
                aria-label="Edit this program"
              >
                <i className="ri-edit-line" aria-hidden="true" />
                Edit program
              </Link>
            )}
          </div>

          {(accessLoading || loading) && (
            <div className="trainer-eap-form-page__loading" role="status" aria-live="polite">
              <div className="spinner-border text-primary">
                <span className="visually-hidden">Loading preview…</span>
              </div>
            </div>
          )}

          {!loading && !accessLoading && error && (
            <div className="trainer-eap-preview-page__empty">
              <p>{error}</p>
              <Link href={TRAINER_MY_TRAININGS_PATH} className="eap-training-btn eap-training-btn--primary">
                Back to programs
              </Link>
            </div>
          )}

          {!loading && !accessLoading && training && (
            <div className="trainer-eap-preview-page__card">
              <CompanyEapTrainingDetailView
                training={training}
                fullTrainer={profile}
                previewMode
                hideBackLink
              />
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default TrainerEapTrainingPreviewPage;
