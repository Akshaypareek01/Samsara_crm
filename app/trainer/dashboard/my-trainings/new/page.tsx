"use client";

import Seo from "@/shared/layout-components/seo/seo";
import Pageheader from "@/shared/layout-components/page-header/pageheader";
import React, { Fragment } from "react";
import { useRouter } from "next/navigation";
import { useEapTrainerAccess } from "@/hooks/useEapTrainerAccess";
import TrainerEapTrainingFormPage from "../../components/eap-training/TrainerEapTrainingFormPage";
import { TRAINER_MY_TRAININGS_PATH } from "../../utils/trainerEapTrainingRoutes";
import "@/shared/styles/eap-training-page.css";

/**
 * Create a new EAP training program.
 */
const TrainerEapTrainingCreatePage = () => {
  const router = useRouter();
  const { loading: accessLoading, accessDenied } = useEapTrainerAccess();

  if (accessDenied) return null;

  return (
    <Fragment>
      <Seo title="Create Training Program" />
      <Pageheader currentpage="Create Program" activepage="Trainer" mainpage="My Training" />

      <div className="eap-training-page">
        {accessLoading ? (
          <div className="trainer-eap-form-page__loading" role="status" aria-live="polite">
            <div className="spinner-border text-primary">
              <span className="visually-hidden">Loading…</span>
            </div>
          </div>
        ) : (
          <TrainerEapTrainingFormPage
            mode="create"
            onSaved={() => router.push(TRAINER_MY_TRAININGS_PATH)}
            onCancel={() => router.push(TRAINER_MY_TRAININGS_PATH)}
          />
        )}
      </div>
    </Fragment>
  );
};

export default TrainerEapTrainingCreatePage;
