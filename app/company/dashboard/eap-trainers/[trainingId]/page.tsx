"use client";

import Seo from "@/shared/layout-components/seo/seo";
import React, { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import EapTrainingService, { type EapTraining } from "@/services/eapTrainingService";
import TrainerService, { type Trainer } from "@/services/trainerService";
import { getEapTrainingTrainerId } from "@/shared/utils/eapTrainingTrainerUtils";
import CompanyEapTrainingDetailView from "../../components/eap-trainers/CompanyEapTrainingDetailView";
import "../../components/eap-trainers/company-eap-trainers-page.css";

/**
 * Company EAP training program detail page.
 */
const EapTrainingDetailPage = () => {
  const params = useParams();
  const trainingId = typeof params.trainingId === "string" ? params.trainingId : "";

  const [training, setTraining] = useState<EapTraining | null>(null);
  const [fullTrainer, setFullTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [trainerLoading, setTrainerLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!trainingId) {
      setError("Invalid program id");
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        setFullTrainer(null);
        const data = await EapTrainingService.getTrainingById(trainingId);
        if (cancelled) return;
        setTraining(data);
        setLoading(false);

        const trainerId = getEapTrainingTrainerId(data);
        if (trainerId) {
          try {
            setTrainerLoading(true);
            const trainer = await TrainerService.getTrainerById(trainerId);
            if (!cancelled) setFullTrainer(trainer);
          } catch {
            if (!cancelled) setFullTrainer(null);
          } finally {
            if (!cancelled) setTrainerLoading(false);
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load program");
          setTraining(null);
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [trainingId]);

  return (
    <Fragment>
      <Seo title={training?.title ? `${training.title} — EAP` : "EAP Program"} />

      <div className="company-eap-trainers-page">
        {loading ? (
          <div className="text-center py-16">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading program…</span>
            </div>
          </div>
        ) : error || !training ? (
          <div className="company-eap-detail-empty">
            <p className="company-eap-detail-empty__text">
              {error || "This training program could not be found."}
            </p>
            <Link href="/company/dashboard/eap-trainers" className="company-eap-btn company-eap-btn--primary">
              Back to programs
            </Link>
          </div>
        ) : (
          <CompanyEapTrainingDetailView
            training={training}
            fullTrainer={fullTrainer}
            trainerLoading={trainerLoading}
          />
        )}
      </div>
    </Fragment>
  );
};

export default EapTrainingDetailPage;
