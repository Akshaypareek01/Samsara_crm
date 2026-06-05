"use client";

import Seo from "@/shared/layout-components/seo/seo";
import Pageheader from "@/shared/layout-components/page-header/pageheader";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import TrainerService from "@/services/trainerService";
import EapTrainingService, { type EapTraining } from "@/services/eapTrainingService";
import EapTrainingCard from "../components/eap-training/EapTrainingCard";
import EapTrainingForm from "../components/eap-training/EapTrainingForm";
import "@/shared/styles/eap-training-page.css";

/**
 * EAP trainer page for managing custom training programs.
 */
const MyTrainingsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trainings, setTrainings] = useState<EapTraining[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EapTraining | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const loadTrainings = useCallback(async () => {
    const list = await EapTrainingService.listMine();
    setTrainings(list);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        setLoading(true);
        const profile = await TrainerService.getMyProfile();
        if (profile.category !== "EAP Trainer") {
          if (!cancelled) {
            setAccessDenied(true);
            router.replace("/trainer/dashboard");
          }
          return;
        }
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
  }, [loadTrainings, router]);

  /**
   * Open the create training form.
   */
  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  /**
   * Open the edit form for a training.
   *
   * @param training - Training to edit.
   */
  const openEdit = (training: EapTraining) => {
    setEditing(training);
    setFormOpen(true);
  };

  /**
   * Confirm and delete a training program.
   *
   * @param training - Training to delete.
   */
  const handleDelete = async (training: EapTraining) => {
    const id = training._id || training.id;
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

  return (
    <Fragment>
      <Seo title="My Training" />
      <Pageheader currentpage="My Training" activepage="Trainer" mainpage="My Training" />

      <div className="eap-training-page">
        <header className="eap-training-page__header">
          <div>
            <h1 className="eap-training-page__title">My Training Programs</h1>
            <p className="eap-training-page__subtitle">
              Create programs with duration options and session bullet points for companies to book.
            </p>
          </div>
          <button
            type="button"
            className="eap-training-btn eap-training-btn--primary"
            onClick={openCreate}
            aria-label="Create new training program"
          >
            <i className="ri-add-line" aria-hidden="true" />
            New training
          </button>
        </header>

        {loading ? (
          <div className="text-center py-12">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading trainings…</span>
            </div>
          </div>
        ) : trainings.length === 0 ? (
          <div className="eap-training-empty">
            <p className="mb-3">No training programs yet.</p>
            <button type="button" className="eap-training-btn eap-training-btn--primary" onClick={openCreate}>
              Create your first program
            </button>
          </div>
        ) : (
          <div className="eap-training-grid">
            {trainings.map((training) => (
              <EapTrainingCard
                key={training._id || training.id}
                training={training}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <EapTrainingForm
        open={formOpen}
        training={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={() => void loadTrainings()}
      />
    </Fragment>
  );
};

export default MyTrainingsPage;
