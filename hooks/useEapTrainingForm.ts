"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Base_url } from "@/Config/BaseUrl";
import EapTrainingService, {
  EAP_DURATION_OPTIONS,
  type CreateEapTrainingRequest,
  type EapDurationHours,
  type EapSyllabusEntry,
  type EapTraining,
} from "@/services/eapTrainingService";
import {
  getSyllabusEntryDescription,
  normalizeEapDurationHours,
} from "@/shared/utils/eapTrainingUtils";

export type EapTrainingFormState = {
  title: string;
  coverImage: string;
  durationOptions: EapDurationHours[];
  syllabus: EapSyllabusEntry[];
};

const emptyForm = (): EapTrainingFormState => ({
  title: "",
  coverImage: "",
  durationOptions: [],
  syllabus: [],
});

/**
 * Normalize duration options from API (legacy 6h → 24h).
 *
 * @param options - Raw duration options from training record.
 */
function normalizeDurationOptions(options: number[]): EapDurationHours[] {
  const normalized = options.map((h) => normalizeEapDurationHours(h));
  return Array.from(new Set(normalized)).sort((a, b) => a - b) as EapDurationHours[];
}

/**
 * Build syllabus entries aligned with selected duration options.
 *
 * @param durations - Selected duration hours.
 * @param existing - Existing syllabus to preserve descriptions where possible.
 */
function buildSyllabusForDurations(
  durations: EapDurationHours[],
  existing: EapSyllabusEntry[] = []
): EapSyllabusEntry[] {
  return durations.map((hours) => {
    const match = existing.find((s) => s.durationHours === hours);
    return {
      durationHours: hours,
      description: match?.description ?? "",
    };
  });
}

/**
 * Map API syllabus to form state, including legacy points arrays.
 *
 * @param syllabus - Syllabus from training record.
 */
function mapSyllabusToForm(syllabus: EapTraining["syllabus"]): EapSyllabusEntry[] {
  return syllabus.map((entry) => ({
    durationHours: normalizeEapDurationHours(entry.durationHours),
    description: getSyllabusEntryDescription(entry),
  }));
}

type UseEapTrainingFormOptions = {
  training?: EapTraining | null;
  onSaved: () => void;
};

/**
 * Form state and handlers for creating or editing an EAP training program.
 *
 * @param options - Training record (edit) and save callback.
 */
export function useEapTrainingForm({ training, onSaved }: UseEapTrainingFormOptions) {
  const [form, setForm] = useState<EapTrainingFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (training) {
      const durationOptions = normalizeDurationOptions(training.durationOptions);
      const mappedSyllabus = mapSyllabusToForm(training.syllabus);
      setForm({
        title: training.title,
        coverImage: training.coverImage,
        durationOptions,
        syllabus: buildSyllabusForDurations(durationOptions, mappedSyllabus),
      });
      return;
    }
    setForm(emptyForm());
  }, [training]);

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
   * Update syllabus description for a duration block.
   *
   * @param durationHours - Duration block to update.
   * @param value - New description text.
   */
  const updateSyllabusDescription = (durationHours: EapDurationHours, value: string) => {
    setForm((prev) => ({
      ...prev,
      syllabus: prev.syllabus.map((entry) =>
        entry.durationHours === durationHours ? { ...entry, description: value } : entry
      ),
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
      description: entry.description.trim(),
    }));
    if (cleanedSyllabus.some((s) => !s.description)) {
      void Swal.fire({ icon: "warning", title: "Add session content for each selected duration" });
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save training";
      void Swal.fire({ icon: "error", title: "Error", text: message });
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    setForm,
    saving,
    uploading,
    fileRef,
    durationOptions: EAP_DURATION_OPTIONS,
    openCoverFilePicker,
    handleCoverFileChange,
    toggleDuration,
    updateSyllabusDescription,
    handleSubmit,
  };
}
