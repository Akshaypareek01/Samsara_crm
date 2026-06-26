"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import membershipPlanService, { MembershipPlan } from "@/services/membershipPlanService";
import membershipService from "@/services/membershipService";
import { showBulkAssignMembershipResultDialog } from "@/shared/utils/bulkAssignMembershipDialog";
import Swal from "sweetalert2";

type UsersAssignMembershipDrawerProps = {
  open: boolean;
  selectedUsers: Map<string, string>;
  onClose: () => void;
  onAssigned: (allSucceeded: boolean) => void;
};

/**
 * Side drawer for assigning a membership plan to multiple selected users.
 */
export default function UsersAssignMembershipDrawer({
  open,
  selectedUsers,
  onClose,
  onAssigned,
}: UsersAssignMembershipDrawerProps) {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  const selectedPlan = useMemo(
    () => plans.find((p) => (p._id || p.id) === selectedPlanId) ?? null,
    [plans, selectedPlanId]
  );

  const loadPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      const response = await membershipPlanService.getMembershipPlans({
        isActive: true,
        limit: 100,
        page: 1,
        sortBy: "name:asc",
      });
      setPlans(response.data);
    } catch (error) {
      console.error("Error loading membership plans:", error);
      void Swal.fire("Error", "Failed to load membership plans.", "error");
    } finally {
      setPlansLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setSelectedPlanId(null);
    void loadPlans();
  }, [open, loadPlans]);

  const handleAssign = async () => {
    if (!selectedPlanId || selectedUsers.size === 0) {
      void Swal.fire("Missing selection", "Choose a membership plan first.", "warning");
      return;
    }

    const planName = selectedPlan?.name || "selected plan";
    const confirm = await Swal.fire({
      title: "Assign membership?",
      html: `Grant <strong>${planName}</strong> to <strong>${selectedUsers.size}</strong> selected user(s)?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Assign membership",
      confirmButtonColor: "#ed662e",
    });

    if (!confirm.isConfirmed) return;

    const usersById = new Map<string, { name: string }>();
    selectedUsers.forEach((name, id) => usersById.set(id, { name }));

    try {
      setAssigning(true);
      const result = await membershipService.assignMembershipToUsers(
        Array.from(selectedUsers.keys()),
        selectedPlanId,
        usersById
      );

      await showBulkAssignMembershipResultDialog(result, planName);

      if (result.succeeded.length > 0) {
        const allSucceeded = result.failed.length === 0;
        onAssigned(allSucceeded);
        if (allSucceeded) {
          onClose();
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to assign memberships.";
      void Swal.fire("Assignment failed", message, "error");
    } finally {
      setAssigning(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[1055] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-bodybg shadow-xl z-[1060] flex flex-col animate-slide-in-right"
        role="dialog"
        aria-labelledby="assign-membership-drawer-title"
        aria-modal="true"
      >
        <div className="flex items-center justify-between py-3 px-4 border-b border-defaultborder shrink-0">
          <div>
            <h3 id="assign-membership-drawer-title" className="text-base font-semibold mb-0">
              Assign membership
            </h3>
            <p className="text-xs text-muted mb-0 mt-1">
              {selectedUsers.size} user{selectedUsers.size === 1 ? "" : "s"} selected
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ti-btn ti-btn-sm ti-btn-ghost !p-1"
            aria-label="Close assign membership drawer"
          >
            <i className="ri-close-line" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-sm text-muted mb-4">
            Select a plan to grant to all selected users. Users who already have an active
            membership will be skipped with an error.
          </p>

          {plansLoading ? (
            <p className="text-center py-8 text-sm text-muted">Loading plans…</p>
          ) : plans.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted">
              No active membership plans found.
            </p>
          ) : (
            <div className="flex flex-col gap-3" role="radiogroup" aria-label="Membership plans">
              {plans.map((plan) => {
                const planId = plan._id || plan.id || "";
                const isSelected = selectedPlanId === planId;
                return (
                  <button
                    key={planId}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`text-start p-4 rounded-lg border transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                        : "border-defaultborder hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedPlanId(planId)}
                  >
                    <div className="font-semibold text-primary">{plan.name}</div>
                    {plan.description && (
                      <p className="text-xs text-muted mt-1 line-clamp-2">{plan.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      <span className="badge bg-light text-defaulttextcolor">
                        {membershipPlanService.formatCurrency(plan.basePrice, plan.currency)}
                      </span>
                      <span className="badge bg-light text-defaulttextcolor">
                        {plan.validityDays} days
                      </span>
                      <span
                        className={`badge ${membershipPlanService.getPlanTypeBadgeClass(plan.planType)}`}
                      >
                        {plan.planType}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-defaultborder p-4 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            className="flex-1 ti-btn ti-btn-primary disabled:opacity-50"
            disabled={assigning || !selectedPlanId || selectedUsers.size === 0}
            onClick={() => void handleAssign()}
            aria-busy={assigning}
          >
            {assigning ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Assigning…
              </>
            ) : (
              <>
                <i className="ri-vip-crown-line me-1" aria-hidden="true" />
                Assign to {selectedUsers.size} user{selectedUsers.size === 1 ? "" : "s"}
              </>
            )}
          </button>
          <button
            type="button"
            className="flex-1 ti-btn ti-btn-light"
            onClick={onClose}
            disabled={assigning}
          >
            Cancel
          </button>
        </div>
      </aside>
    </>
  );
}
