"use client";

import Pageheader from "@/shared/layout-components/page-header/pageheader";
import Seo from "@/shared/layout-components/seo/seo";
import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import membershipPlanService, { MembershipPlan } from "@/services/membershipPlanService";
import membershipService, {
  BulkAssignMembershipResult,
  UserMembership,
} from "@/services/membershipService";
import UserService, { User } from "@/services/userService";
import { hasPermission } from "@/shared/utils/permissionUtils";
import Swal from "sweetalert2";

type Step = 1 | 2;

/**
 * CRM flow: pick a plan, then pick users, then grant membership via admin API.
 */
const AddMembershipPage = () => {
  const [adminUser, setAdminUser] = useState<Record<string, unknown> | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [totalUserPages, setTotalUserPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<Map<string, string>>(new Map());
  const [assigning, setAssigning] = useState(false);
  const [assignResult, setAssignResult] = useState<BulkAssignMembershipResult | null>(
    null
  );
  const [userMemberships, setUserMemberships] = useState<
    Map<string, UserMembership | null>
  >(new Map());
  const [membershipsLoading, setMembershipsLoading] = useState(false);

  const userLimit = 15;

  const selectedPlan = useMemo(
    () => plans.find((p) => (p._id || p.id) === selectedPlanId) ?? null,
    [plans, selectedPlanId]
  );

  const canAssign = hasPermission(adminUser, "membershipManagement", "create");

  useEffect(() => {
    const userStr =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (userStr) setAdminUser(JSON.parse(userStr));
  }, []);

  const fetchPlans = useCallback(async () => {
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
      console.error("Error loading plans:", error);
      Swal.fire("Error", "Failed to load membership plans.", "error");
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const params: Record<string, unknown> = {
        page: userPage,
        limit: userLimit,
        sortBy: "name:asc",
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const response = await UserService.getAllUsers(params);
      const list = response.data || [];
      setUsers(list);
      setTotalUserPages(response.totalPages || 1);
      await loadMembershipsForUsers(list);
    } catch (error) {
      console.error("Error loading users:", error);
      Swal.fire("Error", "Failed to load users.", "error");
    } finally {
      setUsersLoading(false);
    }
  }, [userPage, searchTerm]);

  const loadMembershipsForUsers = async (list: User[]) => {
    setMembershipsLoading(true);
    const map = new Map<string, UserMembership | null>();
    await Promise.all(
      list.map(async (user) => {
        const userId = user._id || user.id;
        if (!userId) return;
        try {
          const membership = await membershipService.getUserActiveMembership(userId);
          map.set(userId, membership);
        } catch {
          map.set(userId, null);
        }
      })
    );
    setUserMemberships(map);
    setMembershipsLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    if (step === 2) fetchUsers();
  }, [step, fetchUsers]);

  const toggleUser = (user: User) => {
    const userId = user._id || user.id;
    if (!userId) return;
    const label = user.name || user.email;
    setSelectedUsers((prev) => {
      const next = new Map(prev);
      if (next.has(userId)) next.delete(userId);
      else next.set(userId, label);
      return next;
    });
  };

  const selectAllOnPage = () => {
    setSelectedUsers((prev) => {
      const next = new Map(prev);
      users.forEach((u) => {
        const id = u._id || u.id;
        if (id) next.set(id, u.name || u.email);
      });
      return next;
    });
  };

  const clearSelection = () => setSelectedUsers(new Map());

  const goToUsersStep = () => {
    if (!selectedPlanId) {
      Swal.fire("Select a plan", "Choose a membership plan to continue.", "warning");
      return;
    }
    setAssignResult(null);
    setStep(2);
  };

  const showAssignResultDialog = (result: BulkAssignMembershipResult) => {
    const { succeeded, failed } = result;
    const allFailed = succeeded.length === 0 && failed.length > 0;
    const allSucceeded = failed.length === 0;

    const failedList = failed
      .map(
        (f) =>
          `<li class="mb-1"><strong>${escapeHtml(f.userName)}</strong>: ${escapeHtml(f.error)}</li>`
      )
      .join("");

    const succeededList = succeeded
      .map((s) => `<li class="mb-1">${escapeHtml(s.userName)}</li>`)
      .join("");

    let html = "";
    if (failed.length > 0) {
      html += `<p class="text-danger font-medium mb-2">Could not assign (${failed.length}):</p><ul class="text-start text-sm list-disc ps-4 mb-3">${failedList}</ul>`;
    }
    if (succeeded.length > 0) {
      html += `<p class="text-success font-medium mb-2">Assigned successfully (${succeeded.length}):</p><ul class="text-start text-sm list-disc ps-4">${succeededList}</ul>`;
    }

    const singleFailMsg = failed.length === 1 ? failed[0].error : null;

    void Swal.fire({
      title: allSucceeded
        ? "Membership assigned"
        : allFailed
          ? singleFailMsg || "Assignment failed"
          : "Some assignments failed",
      html: allSucceeded
        ? `<p>${succeeded.length} user(s) now have <strong>${escapeHtml(selectedPlan?.name || "the plan")}</strong>.</p>`
        : html,
      icon: allSucceeded ? "success" : allFailed ? "error" : "warning",
      confirmButtonColor: "#845adf",
      width: failed.length > 3 ? "32rem" : undefined,
    });
  };

  const handleAssign = async () => {
    if (!selectedPlanId || selectedUsers.size === 0) {
      Swal.fire(
        "Missing selection",
        "Select a plan and at least one user.",
        "warning"
      );
      return;
    }

    const confirm = await Swal.fire({
      title: "Assign membership?",
      html: `Grant <strong>${selectedPlan?.name}</strong> to <strong>${selectedUsers.size}</strong> user(s)?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Assign",
      confirmButtonColor: "#845adf",
    });

    if (!confirm.isConfirmed) return;

    const usersById = new Map<string, { name: string }>();
    selectedUsers.forEach((name, id) => usersById.set(id, { name }));

    try {
      setAssigning(true);
      setAssignResult(null);
      const result = await membershipService.assignMembershipToUsers(
        Array.from(selectedUsers.keys()),
        selectedPlanId,
        usersById
      );

      setAssignResult(result);
      showAssignResultDialog(result);

      if (result.succeeded.length > 0) {
        setSelectedUsers(new Map());
        if (result.failed.length === 0) {
          setStep(1);
          setSelectedPlanId(null);
          setAssignResult(null);
        } else {
          await fetchUsers();
        }
      }
    } catch (error) {
      console.error("Assign error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to assign memberships.";
      setAssignResult({
        succeeded: [],
        failed: Array.from(selectedUsers.entries()).map(([userId, userName]) => ({
          userId,
          userName,
          error: message,
        })),
      });
      void Swal.fire({
        title: "Assignment failed",
        text: message,
        icon: "error",
        confirmButtonColor: "#845adf",
      });
    } finally {
      setAssigning(false);
    }
  };

  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  return (
    <Fragment>
      <Seo title="Add Membership" />
      <Pageheader
        currentpage="Add Membership"
        activepage="Membership Management"
        mainpage="Add Membership"
      />

      <div className="grid grid-cols-12 gap-x-6">
        <div className="xl:col-span-12 col-span-12">
          <div className="box">
            <div className="box-header flex flex-wrap items-center justify-between gap-3">
              <div className="box-title">Grant membership to users</div>
              <nav
                className="flex items-center gap-2 text-[0.8rem]"
                aria-label="Assignment steps"
              >
                <span
                  className={`badge ${step === 1 ? "bg-primary text-white" : "bg-light text-defaulttextcolor"}`}
                >
                  1. Select plan
                </span>
                <i className="ri-arrow-right-s-line text-muted" aria-hidden />
                <span
                  className={`badge ${step === 2 ? "bg-primary text-white" : "bg-light text-defaulttextcolor"}`}
                >
                  2. Select users
                </span>
              </nav>
            </div>

            <div className="box-body">
              {step === 1 && (
                <section aria-labelledby="plan-step-heading">
                  <h2 id="plan-step-heading" className="text-[0.9rem] font-semibold mb-3">
                    Choose a membership plan
                  </h2>
                  {plansLoading ? (
                    <p className="text-center py-8 text-muted">Loading plans…</p>
                  ) : plans.length === 0 ? (
                    <p className="text-center py-8 text-muted">
                      No active plans. Create or activate a plan first.
                    </p>
                  ) : (
                    <div
                      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                      role="radiogroup"
                      aria-label="Membership plans"
                    >
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
                            <p className="text-[0.75rem] text-muted mt-1 line-clamp-2">
                              {plan.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3 text-[0.7rem]">
                              <span className="badge bg-light text-defaulttextcolor">
                                {membershipPlanService.formatCurrency(
                                  plan.basePrice,
                                  plan.currency
                                )}
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
                  <div className="flex justify-end mt-6">
                    <button
                      type="button"
                      className="ti-btn ti-btn-primary"
                      disabled={!selectedPlanId}
                      onClick={goToUsersStep}
                    >
                      Next: Select users
                      <i className="ri-arrow-right-line ms-1" aria-hidden />
                    </button>
                  </div>
                </section>
              )}

              {step === 2 && (
                <section aria-labelledby="users-step-heading">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <h2 id="users-step-heading" className="text-[0.9rem] font-semibold">
                        Select users
                      </h2>
                      {selectedPlan && (
                        <p className="text-[0.75rem] text-muted mt-1">
                          Plan: <span className="text-primary font-medium">{selectedPlan.name}</span>
                          {" · "}
                          {selectedUsers.size} selected
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="ti-btn ti-btn-light"
                      onClick={() => setStep(1)}
                    >
                      <i className="ri-arrow-left-line me-1" aria-hidden />
                      Change plan
                    </button>
                  </div>

                  {assignResult && assignResult.failed.length > 0 && (
                    <div
                      className="alert alert-danger mb-4"
                      role="alert"
                      aria-live="polite"
                    >
                      <div className="flex items-start gap-2">
                        <i className="ri-error-warning-line text-lg mt-0.5" aria-hidden />
                        <div className="flex-1">
                          <p className="font-semibold mb-2">Assignment errors</p>
                          <ul className="text-[0.8rem] mb-0 ps-3 list-disc">
                            {assignResult.failed.map((f) => (
                              <li key={f.userId}>
                                <span className="font-medium">{f.userName}</span>
                                {" — "}
                                {f.error}
                              </li>
                            ))}
                          </ul>
                          {assignResult.succeeded.length > 0 && (
                            <p className="text-[0.75rem] mt-2 mb-0 text-success">
                              {assignResult.succeeded.length} user(s) were assigned
                              successfully.
                            </p>
                          )}
                          <button
                            type="button"
                            className="ti-btn ti-btn-sm ti-btn-danger mt-3"
                            onClick={() => setAssignResult(null)}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    <input
                      type="search"
                      className="ti-form-control flex-1 min-w-[200px]"
                      placeholder="Search by name or email…"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setUserPage(1);
                      }}
                      aria-label="Search users"
                    />
                    <button
                      type="button"
                      className="ti-btn ti-btn-secondary"
                      onClick={() => fetchUsers()}
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      className="ti-btn ti-btn-light"
                      onClick={selectAllOnPage}
                    >
                      Select page
                    </button>
                    <button
                      type="button"
                      className="ti-btn ti-btn-light"
                      onClick={clearSelection}
                    >
                      Clear
                    </button>
                  </div>

                  {usersLoading ? (
                    <p className="text-center py-8 text-muted">Loading users…</p>
                  ) : users.length === 0 ? (
                    <p className="text-center py-8 text-muted">No users found.</p>
                  ) : (
                    <div className="table-responsive border rounded-lg">
                      <table className="table table-hover whitespace-nowrap min-w-full mb-0">
                        <thead>
                          <tr>
                            <th className="w-12">
                              <span className="sr-only">Select</span>
                            </th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Category</th>
                            <th>Current membership</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => {
                            const userId = user._id || user.id || "";
                            const checked = selectedUsers.has(userId);
                            const activeMembership = userMemberships.get(userId);
                            const assignFailed = assignResult?.failed.find(
                              (f) => f.userId === userId
                            );
                            return (
                              <tr
                                key={userId}
                                className={`cursor-pointer ${assignFailed ? "bg-danger/5" : ""}`}
                                onClick={() => toggleUser(user)}
                              >
                                <td onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={checked}
                                    onChange={() => toggleUser(user)}
                                    aria-label={`Select ${user.name}`}
                                  />
                                </td>
                                <td className="font-medium">{user.name}</td>
                                <td className="text-muted text-[0.8rem]">{user.email}</td>
                                <td>
                                  <span className="badge bg-light text-defaulttextcolor text-[0.65rem]">
                                    {user.userCategory || "Personal"}
                                  </span>
                                </td>
                                <td className="text-[0.75rem]">
                                  {membershipsLoading ? (
                                    <span className="text-muted">…</span>
                                  ) : activeMembership ? (
                                    <span
                                      className="badge bg-warning/10 text-warning"
                                      title={membershipService.formatDate(
                                        activeMembership.endDate
                                      )}
                                    >
                                      Active: {activeMembership.planName}
                                    </span>
                                  ) : (
                                    <span className="badge bg-success/10 text-success">
                                      None
                                    </span>
                                  )}
                                  {assignFailed && (
                                    <p className="text-danger text-[0.7rem] mt-1 mb-0">
                                      {assignFailed.error}
                                    </p>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {totalUserPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <button
                        type="button"
                        className="ti-btn ti-btn-sm ti-btn-light"
                        disabled={userPage <= 1}
                        onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                        aria-label="Previous page"
                      >
                        Previous
                      </button>
                      <span className="self-center text-[0.8rem] text-muted">
                        Page {userPage} of {totalUserPages}
                      </span>
                      <button
                        type="button"
                        className="ti-btn ti-btn-sm ti-btn-light"
                        disabled={userPage >= totalUserPages}
                        onClick={() => setUserPage((p) => p + 1)}
                        aria-label="Next page"
                      >
                        Next
                      </button>
                    </div>
                  )}

                  <div className="flex justify-end mt-6">
                    {canAssign ? (
                      <button
                        type="button"
                        className="ti-btn ti-btn-primary"
                        disabled={assigning || selectedUsers.size === 0}
                        onClick={handleAssign}
                        aria-busy={assigning}
                      >
                        {assigning ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden
                            />
                            Assigning…
                          </>
                        ) : (
                          <>
                            <i className="ri-user-add-line me-1" aria-hidden />
                            Assign to {selectedUsers.size} user
                            {selectedUsers.size === 1 ? "" : "s"}
                          </>
                        )}
                      </button>
                    ) : (
                      <p className="text-danger text-[0.8rem]">
                        You do not have permission to assign memberships.
                      </p>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default AddMembershipPage;
