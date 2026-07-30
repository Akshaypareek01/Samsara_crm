"use client";

import React, { useCallback, useEffect, useState } from "react";
import CompanyService, { Company } from "@/services/companyService";
import membershipPlanService, { MembershipPlan } from "@/services/membershipPlanService";
import { crmTdClass } from "../components";
import Swal from "sweetalert2";

type CompanyAppMembershipCellsProps = {
  company: Company;
  canEdit: boolean;
  onUpdated: () => void;
};

/**
 * Renders app membership toggle, plan label, and seat usage for a company row.
 */
export default function CompanyAppMembershipCells({
  company,
  canEdit,
  onUpdated,
}: CompanyAppMembershipCellsProps) {
  const [saving, setSaving] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [pendingEnable, setPendingEnable] = useState(false);

  const mongoId = company._id || company.id;
  const enabled = company.appMembershipEnabled === true;
  const cap = company.numberOfEmployees ?? 0;
  const used = company.membershipSlotsUsed ?? 0;
  const remaining = company.membershipSlotsRemaining ?? Math.max(0, cap - used);
  const planLabel = company.appMembershipPlanName || "Not set";

  const loadPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      const response = await membershipPlanService.getMembershipPlans({
        isActive: true,
        limit: 100,
        page: 1,
        sortBy: "name:asc",
      });
      setPlans(response.data.filter((plan) => plan.name !== "Trial Plan"));
    } catch (error) {
      console.error("Failed to load membership plans:", error);
      void Swal.fire("Error", "Failed to load membership plans.", "error");
    } finally {
      setPlansLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!showPlanModal) return;
    void loadPlans();
  }, [showPlanModal, loadPlans]);

  /**
   * Persist app membership settings for this company.
   */
  const saveMembershipSettings = async (
    nextEnabled: boolean,
    planId: string | null | undefined
  ) => {
    if (!mongoId) return;

    try {
      setSaving(true);
      await CompanyService.updateCompanyAppMembership(mongoId, {
        appMembershipEnabled: nextEnabled,
        appMembershipPlanId: planId ?? null,
      });
      onUpdated();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update app membership.";
      void Swal.fire("Error", message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!canEdit || saving) return;

    if (enabled) {
      const confirm = await Swal.fire({
        title: "Disable app membership?",
        text: "Existing memberships stay active. New signups will not receive auto membership.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Disable",
      });
      if (!confirm.isConfirmed) return;
      await saveMembershipSettings(false, company.appMembershipPlanId ?? null);
      return;
    }

    if (!company.appMembershipPlanId) {
      setPendingEnable(true);
      setShowPlanModal(true);
      return;
    }

    await saveMembershipSettings(true, company.appMembershipPlanId);
  };

  const handlePlanSelect = async (planId: string) => {
    setShowPlanModal(false);
    await saveMembershipSettings(pendingEnable ? true : enabled, planId);
    setPendingEnable(false);
  };

  return (
    <>
      <td className={crmTdClass}>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="form-check-input"
            checked={enabled}
            disabled={!canEdit || saving}
            onChange={() => void handleToggle()}
            aria-label={`App membership for ${company.companyName || company.companyId}`}
          />
          <span className="text-[11px] text-gray-600">{enabled ? "On" : "Off"}</span>
        </label>
      </td>
      <td className={`${crmTdClass} text-gray-600`}>
        {canEdit ? (
          <button
            type="button"
            className="text-[11px] font-semibold text-primary hover:underline disabled:opacity-50"
            disabled={saving}
            onClick={() => {
              setPendingEnable(false);
              setShowPlanModal(true);
            }}
            aria-label={`Select membership plan for ${company.companyName || company.companyId}`}
          >
            {planLabel}
          </button>
        ) : (
          <span className="text-[11px]">{planLabel}</span>
        )}
      </td>
      <td className={crmTdClass}>
        {enabled ? (
          <div className="text-[11px] leading-4">
            <div className="font-semibold text-gray-800">
              {used} / {cap} used
            </div>
            <div className={remaining === 0 ? "text-red-600 font-semibold" : "text-emerald-600"}>
              {remaining} left
            </div>
          </div>
        ) : (
          <span className="text-[11px] text-gray-400">—</span>
        )}
      </td>

      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1065] p-4">
          <div
            className="bg-white dark:bg-bodybg rounded-lg p-5 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="company-plan-picker-title"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 id="company-plan-picker-title" className="text-base font-semibold mb-0">
                Select membership plan
              </h4>
              <button
                type="button"
                className="ti-btn ti-btn-sm ti-btn-ghost"
                onClick={() => {
                  setShowPlanModal(false);
                  setPendingEnable(false);
                }}
                aria-label="Close plan picker"
              >
                <i className="ri-close-line" aria-hidden="true" />
              </button>
            </div>
            <p className="text-xs text-muted mb-4">
              {pendingEnable
                ? "Choose a plan before enabling app membership for this company."
                : "Choose which plan corporate registrants will receive."}
            </p>
            {plansLoading ? (
              <p className="text-sm text-muted py-6 text-center">Loading plans…</p>
            ) : plans.length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">No active plans found.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {plans.map((plan) => {
                  const planId = plan._id || plan.id || "";
                  return (
                    <button
                      key={planId}
                      type="button"
                      className="text-start p-3 rounded-lg border border-defaultborder hover:border-primary/50 transition-colors"
                      onClick={() => void handlePlanSelect(planId)}
                      disabled={saving}
                    >
                      <div className="font-semibold text-primary text-sm">{plan.name}</div>
                      <div className="text-[11px] text-muted mt-1">
                        {plan.validityDays} days · {membershipPlanService.formatCurrency(plan.basePrice, plan.currency)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
