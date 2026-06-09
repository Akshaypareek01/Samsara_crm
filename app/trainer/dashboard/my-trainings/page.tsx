"use client";

import Seo from "@/shared/layout-components/seo/seo";
import Pageheader from "@/shared/layout-components/page-header/pageheader";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import EapTrainingService, { type EapTraining } from "@/services/eapTrainingService";
import { useEapTrainerAccess } from "@/hooks/useEapTrainerAccess";
import EapTrainingsLanding from "../components/eap-training/EapTrainingsLanding";
import {
  getEapTrainingRouteId,
  trainerEapTrainingCreatePath,
  trainerEapTrainingPreviewPath,
} from "../utils/trainerEapTrainingRoutes";
import "@/shared/styles/eap-training-page.css";

/**
 * EAP trainer page for managing custom training programs.
 */
const MyTrainingsPage = () => {
  const router = useRouter();
  const { loading: accessLoading, accessDenied } = useEapTrainerAccess();
  const [trainings, setTrainings] = useState<EapTraining[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrainings = useCallback(async () => {
    const list = await EapTrainingService.listMine();
    setTrainings(list);
  }, []);

  useEffect(() => {
    if (accessLoading || accessDenied) return;

    let cancelled = false;
    const init = async () => {
      try {
        setLoading(true);
        await loadTrainings();
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load trainings";
          void Swal.fire({ icon: "error", title: "Error", text: message });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void init();
    return () => {
      cancelled = true;
    };
  }, [accessLoading, accessDenied, loadTrainings]);

  /**
   * Navigate to the company-facing preview page.
   *
   * @param training - Training to preview.
   */
  const openPreview = (training: EapTraining) => {
    const id = getEapTrainingRouteId(training);
    if (id) router.push(trainerEapTrainingPreviewPath(id));
  };

  /**
   * Confirm and delete a training program.
   *
   * @param training - Training to delete.
   */
  const handleDelete = async (training: EapTraining) => {
    const id = getEapTrainingRouteId(training);
    if (!id) return;
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete training?",
      text: `"${training.title}" will be removed permanently.`,
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    try {
      await EapTrainingService.deleteTraining(id);
      void Swal.fire({ icon: "success", title: "Deleted" });
      await loadTrainings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      void Swal.fire({ icon: "error", title: "Error", text: message });
    }
  };

  if (accessDenied) return null;

  const pageLoading = accessLoading || loading;

  return (
    <Fragment>
      <Seo title="My Training" />
      <Pageheader currentpage="My Training" activepage="Trainer" mainpage="My Training" />

      <div className="eap-training-page">
        <header className="eap-training-page__header justify-end">
          <button
            type="button"
            className="eap-training-btn eap-training-btn--primary"
            onClick={() => router.push(trainerEapTrainingCreatePath())}
            aria-label="Create new training program"
          >
            <i className="ri-add-line" aria-hidden="true" />
            New training
          </button>
        </header>

        <EapTrainingsLanding
          trainers={[]}
          trainings={trainings}
          loading={pageLoading}
          showPageTitle={false}
          showTrainersSection={false}
          trainingsSectionTitle="Your Training Programs"
          trainingsSectionSubtitle="Programs you offer — companies can browse and book these sessions."
          onTrainingPreview={openPreview}
          onTrainingDelete={(training) => void handleDelete(training)}
        />

        {!pageLoading && trainings.length === 0 && (
          <div className="eap-training-empty">
            <p className="mb-3">No training programs yet.</p>
            <button
              type="button"
              className="eap-training-btn eap-training-btn--primary"
              onClick={() => router.push(trainerEapTrainingCreatePath())}
            >
              Create your first program
            </button>
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default MyTrainingsPage;
