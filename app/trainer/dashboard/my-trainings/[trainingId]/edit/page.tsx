"use client";

import Seo from "@/shared/layout-components/seo/seo";
import Pageheader from "@/shared/layout-components/page-header/pageheader";
import React, { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import EapTrainingService, { type EapTraining } from "@/services/eapTrainingService";
import { useEapTrainerAccess } from "@/hooks/useEapTrainerAccess";
import TrainerEapTrainingFormPage from "../../../components/eap-training/TrainerEapTrainingFormPage";
import {
  TRAINER_MY_TRAININGS_PATH,
  trainerEapTrainingPreviewPath,
} from "../../../utils/trainerEapTrainingRoutes";
import "@/shared/styles/eap-training-page.css";

/**
 * Edit an existing EAP training program.
 */
const TrainerEapTrainingEditPage = () => {
  const router = useRouter();
  const params = useParams();
  const trainingId = typeof params.trainingId === "string" ? params.trainingId : "";
  const { loading: accessLoading, accessDenied } = useEapTrainerAccess();
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
      <Seo title={training?.title ? `Edit ${training.title}` : "Edit Training Program"} />
      <Pageheader currentpage="Edit Program" activepage="Trainer" mainpage="My Training" />

      <div className="eap-training-page">
        {!accessLoading && error && !loading && (
          <div className="trainer-eap-preview-page__empty">
            <p>{error}</p>
            <Link href={TRAINER_MY_TRAININGS_PATH} className="eap-training-btn eap-training-btn--primary">
              Back to programs
            </Link>
          </div>
        )}

        {!accessLoading && !error && (
          <TrainerEapTrainingFormPage
            mode="edit"
            training={training}
            loading={loading}
            onSaved={() => router.push(trainerEapTrainingPreviewPath(trainingId))}
            onCancel={() => router.push(trainerEapTrainingPreviewPath(trainingId))}
          />
        )}
      </div>
    </Fragment>
  );
};

export default TrainerEapTrainingEditPage;
