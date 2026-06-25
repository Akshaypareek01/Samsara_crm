"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import { Base_url } from "@/Config/BaseUrl";
import TrainerService, {
  TrainerAccountDetails,
  TrainerImage,
  UpdateTrainerRequest,
} from "@/services/trainerService";
import {
  validateTrainerPanNumber,
  validateTrainerGstNumber,
} from "@/app/trainer/dashboard/utils/trainerAccountValidation";

const emptyAccountDetails: TrainerAccountDetails = {
  upiId: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  accountHolderName: "",
  panNumber: "",
  panDocument: null,
  gstNumber: "",
  gstDocument: null,
};

/**
 * Validates trainer payout account fields when non-empty.
 *
 * @param details - Form values to validate.
 * @returns Error message or empty string when valid.
 */
export function validateTrainerAccountDetails(details: TrainerAccountDetails): string {
  const upiId = (details.upiId || "").trim();
  const accountNumber = (details.accountNumber || "").trim();
  const ifscCode = (details.ifscCode || "").trim();
  const panError = validateTrainerPanNumber(details.panNumber || "");
  const gstError = validateTrainerGstNumber(details.gstNumber || "");

  if (panError) return panError;
  if (gstError) return gstError;
  if (upiId && !/^.+@.+$/.test(upiId)) {
    return "Please enter a valid UPI ID (e.g. name@bank)";
  }
  if (accountNumber && !/^[0-9]+$/.test(accountNumber)) {
    return "Account number must contain digits only";
  }
  if (ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
    return "Please enter a valid IFSC code";
  }
  return "";
}

/**
 * State and handlers for the trainer My Account payout form.
 *
 * @returns Account form state and submit handler.
 */
export function useTrainerAccountForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPanDocument, setUploadingPanDocument] = useState(false);
  const [uploadingGstDocument, setUploadingGstDocument] = useState(false);
  const [savingPanDocument, setSavingPanDocument] = useState(false);
  const [savingGstDocument, setSavingGstDocument] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<TrainerAccountDetails>({ ...emptyAccountDetails });
  const panDocumentInputRef = useRef<HTMLInputElement>(null);
  const gstDocumentInputRef = useRef<HTMLInputElement>(null);
  const formDataRef = useRef(formData);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const patchDetails = useCallback((patch: Partial<TrainerAccountDetails>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  /**
   * Persists the given account details to the backend (PATCH /trainers/me),
   * without the local-only validation `handleSubmit` applies. Used by the
   * per-document "Save" buttons so a PAN/GST upload can be attached to the
   * account without requiring the full form to be valid/submitted.
   *
   * @param overrides - Fields to merge on top of the latest known form state.
   */
  const persistAccountDetails = useCallback(
    async (overrides: Partial<TrainerAccountDetails>) => {
      const next: TrainerAccountDetails = { ...formDataRef.current, ...overrides };
      const payload: UpdateTrainerRequest = {
        accountDetails: {
          upiId: (next.upiId || "").trim(),
          bankName: (next.bankName || "").trim(),
          accountNumber: (next.accountNumber || "").trim(),
          ifscCode: (next.ifscCode || "").trim().toUpperCase(),
          accountHolderName: (next.accountHolderName || "").trim(),
          panNumber: (next.panNumber || "").trim().toUpperCase(),
          panDocument: next.panDocument?.path
            ? { key: next.panDocument.key || "", path: next.panDocument.path }
            : { key: "", path: "" },
          gstNumber: (next.gstNumber || "").trim().toUpperCase(),
          gstDocument: next.gstDocument?.path
            ? { key: next.gstDocument.key || "", path: next.gstDocument.path }
            : { key: "", path: "" },
        },
      };
      await TrainerService.updateMyProfile(payload);
      await fetchAccountDetails();
    },
    // fetchAccountDetails is stable (only depends on router); declared above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const fetchAccountDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const profile = await TrainerService.getMyProfile();
      const account = profile.accountDetails || {};
      setFormData({
        upiId: account.upiId || "",
        bankName: account.bankName || "",
        accountNumber: account.accountNumber || "",
        ifscCode: account.ifscCode || "",
        accountHolderName: account.accountHolderName || "",
        panNumber: account.panNumber || "",
        panDocument: account.panDocument?.path ? account.panDocument : null,
        gstNumber: account.gstNumber || "",
        gstDocument: account.gstDocument?.path ? account.gstDocument : null,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load account details";
      setError(msg);
      Swal.fire("Error!", msg, "error");
      if (msg.includes("401") || msg.includes("Unauthorized")) {
        router.push("/trainer/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchAccountDetails();
  }, [fetchAccountDetails]);

  /**
   * Uploads a PAN card image or PDF to storage and stores the URL in form state.
   *
   * @param file - Selected PAN document file.
   */
  const uploadPanDocument = useCallback(async (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    if (!isImage && !isPdf) {
      Swal.fire("Error!", "Please upload a JPG, PNG, or PDF file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("Error!", "File must be 5MB or smaller", "error");
      return;
    }

    try {
      setUploadingPanDocument(true);
      const body = new FormData();
      body.append("file", file);
      const token = localStorage.getItem("token");
      const response = await axios.post(`${Base_url}/upload`, body, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.data.success || !response.data.url) {
        throw new Error("Upload failed: Invalid response");
      }

      const imageData: TrainerImage = {
        key: `trainer-pan/${response.data.fileName || file.name}`,
        path: response.data.url,
      };

      patchDetails({ panDocument: imageData });
      Swal.fire("Uploaded!", "Now click Save to attach it to your account", "success");
    } catch (uploadErr: unknown) {
      const axiosErr = uploadErr as { response?: { data?: { message?: string } }; message?: string };
      Swal.fire(
        "Error!",
        axiosErr.response?.data?.message || axiosErr.message || "Failed to upload PAN document",
        "error"
      );
    } finally {
      setUploadingPanDocument(false);
    }
  }, [patchDetails]);

  /** Persists the currently selected PAN document to the backend. */
  const savePanDocument = useCallback(async () => {
    try {
      setSavingPanDocument(true);
      await persistAccountDetails({ panDocument: formDataRef.current.panDocument });
      Swal.fire("Saved!", "PAN document saved to your account", "success");
    } catch (saveErr: unknown) {
      const axiosErr = saveErr as { response?: { data?: { message?: string } }; message?: string };
      Swal.fire(
        "Error!",
        axiosErr.response?.data?.message || axiosErr.message || "Failed to save PAN document",
        "error"
      );
    } finally {
      setSavingPanDocument(false);
    }
  }, [persistAccountDetails]);

  /**
   * Handles PAN document file input change.
   *
   * @param e - File input change event.
   */
  const handlePanDocumentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void uploadPanDocument(file);
      if (panDocumentInputRef.current) panDocumentInputRef.current.value = "";
    },
    [uploadPanDocument]
  );

  /** Clears the uploaded PAN document from form state. Click Save to persist the removal. */
  const clearPanDocument = useCallback(() => {
    patchDetails({ panDocument: null });
    if (panDocumentInputRef.current) panDocumentInputRef.current.value = "";
  }, [patchDetails]);

  /**
   * Uploads a GST certificate image or PDF to storage and stores the URL in form state.
   *
   * @param file - Selected GST document file.
   */
  const uploadGstDocument = useCallback(async (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    if (!isImage && !isPdf) {
      Swal.fire("Error!", "Please upload a JPG, PNG, or PDF file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("Error!", "File must be 5MB or smaller", "error");
      return;
    }

    try {
      setUploadingGstDocument(true);
      const body = new FormData();
      body.append("file", file);
      const token = localStorage.getItem("token");
      const response = await axios.post(`${Base_url}/upload`, body, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.data.success || !response.data.url) {
        throw new Error("Upload failed: Invalid response");
      }

      const imageData: TrainerImage = {
        key: `trainer-gst/${response.data.fileName || file.name}`,
        path: response.data.url,
      };

      patchDetails({ gstDocument: imageData });
      Swal.fire("Uploaded!", "Now click Save to attach it to your account", "success");
    } catch (uploadErr: unknown) {
      const axiosErr = uploadErr as { response?: { data?: { message?: string } }; message?: string };
      Swal.fire(
        "Error!",
        axiosErr.response?.data?.message || axiosErr.message || "Failed to upload GST document",
        "error"
      );
    } finally {
      setUploadingGstDocument(false);
    }
  }, [patchDetails]);

  /** Persists the currently selected GST document to the backend. */
  const saveGstDocument = useCallback(async () => {
    try {
      setSavingGstDocument(true);
      await persistAccountDetails({ gstDocument: formDataRef.current.gstDocument });
      Swal.fire("Saved!", "GST document saved to your account", "success");
    } catch (saveErr: unknown) {
      const axiosErr = saveErr as { response?: { data?: { message?: string } }; message?: string };
      Swal.fire(
        "Error!",
        axiosErr.response?.data?.message || axiosErr.message || "Failed to save GST document",
        "error"
      );
    } finally {
      setSavingGstDocument(false);
    }
  }, [persistAccountDetails]);

  /**
   * Handles GST document file input change.
   *
   * @param e - File input change event.
   */
  const handleGstDocumentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void uploadGstDocument(file);
      if (gstDocumentInputRef.current) gstDocumentInputRef.current.value = "";
    },
    [uploadGstDocument]
  );

  /** Clears the uploaded GST document from form state. Click Save to persist the removal. */
  const clearGstDocument = useCallback(() => {
    patchDetails({ gstDocument: null });
    if (gstDocumentInputRef.current) gstDocumentInputRef.current.value = "";
  }, [patchDetails]);

  /**
   * Persists payout account details via PATCH /trainers/me.
   *
   * @param e - Form submit event.
   * @returns True when save succeeded.
   */
  const handleSubmit = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();

    const validationError = validateTrainerAccountDetails(formData);
    if (validationError) {
      Swal.fire("Validation Error", validationError, "warning");
      return false;
    }

    try {
      setSaving(true);
      setError("");

      const payload: UpdateTrainerRequest = {
        accountDetails: {
          upiId: (formData.upiId || "").trim(),
          bankName: (formData.bankName || "").trim(),
          accountNumber: (formData.accountNumber || "").trim(),
          ifscCode: (formData.ifscCode || "").trim().toUpperCase(),
          accountHolderName: (formData.accountHolderName || "").trim(),
          panNumber: (formData.panNumber || "").trim().toUpperCase(),
          panDocument: formData.panDocument?.path
            ? {
                key: formData.panDocument.key || "",
                path: formData.panDocument.path,
              }
            : { key: "", path: "" },
          gstNumber: (formData.gstNumber || "").trim().toUpperCase(),
          gstDocument: formData.gstDocument?.path
            ? {
                key: formData.gstDocument.key || "",
                path: formData.gstDocument.path,
              }
            : { key: "", path: "" },
        },
      };

      await TrainerService.updateMyProfile(payload);
      await fetchAccountDetails();
      Swal.fire("Saved!", "Your account details have been updated.", "success");
      return true;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        "Failed to save account details";
      setError(msg);
      Swal.fire("Error!", msg, "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    uploadingPanDocument,
    uploadingGstDocument,
    savingPanDocument,
    savingGstDocument,
    error,
    formData,
    panDocumentInputRef,
    gstDocumentInputRef,
    patchDetails,
    handlePanDocumentChange,
    clearPanDocument,
    savePanDocument,
    handleGstDocumentChange,
    clearGstDocument,
    saveGstDocument,
    handleSubmit,
    fetchAccountDetails,
  };
}
