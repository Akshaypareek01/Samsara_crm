"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import TrainerService, {
  TrainerAccountDetails,
  UpdateTrainerRequest,
} from "@/services/trainerService";

const emptyAccountDetails: TrainerAccountDetails = {
  upiId: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  accountHolderName: "",
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
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<TrainerAccountDetails>({ ...emptyAccountDetails });

  const patchDetails = useCallback((patch: Partial<TrainerAccountDetails>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

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
    error,
    formData,
    patchDetails,
    handleSubmit,
    fetchAccountDetails,
  };
}
