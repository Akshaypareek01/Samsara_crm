"use client";

import React, { useEffect, useState, useCallback } from "react";
import Pageheader from "@/shared/layout-components/page-header/pageheader";
import Seo from "@/shared/layout-components/seo/seo";
import ApiService from "@/services/ApiService";

interface Member {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
  level: string;
  companyId?: { _id: string } | string;
}

/** Resolve Mongo id whether API returns `_id` or `id`. */
const getMemberId = (member: Member): string | undefined =>
  member._id || member.id;

interface CompanyData {
  _id?: string;
  id?: string;
  companyId?: string;
}

const getStoredCompany = (): CompanyData | null => {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getCompanyMongoId = (): string | null => {
  const company = getStoredCompany();
  if (!company) return null;
  return company._id || company.id || null;
};

const getCompanyKey = (): string | null => {
  const company = getStoredCompany();
  return company?.companyId || null;
};

// ─── Modal modes ─────────────────────────────────────────────
type ModalMode = "add" | "edit" | "view" | null;

const EMPTY_FORM = { fullName: "", email: "", level: "beginner" };

const MembersPage = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [initError, setInitError] = useState("");

  // ─── Modal state ──────────────────────────────────────────
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ─── Delete confirm state ─────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ─── Fetch members ────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    const companyKey = getCompanyKey();
    if (!companyKey) {
      setInitError("Company data not found. Please log out and log in again.");
      return;
    }
    try {
      setLoading(true);
      const data = await ApiService.get("/company-users", {
        companyKey,
        search,
        page,
        limit: 10,
      });
      setMembers(data.results || []);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error("FETCH MEMBERS ERROR:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  // ─── Open modals ──────────────────────────────────────────
  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setFormError("");
    setSelectedMember(null);
    setModalMode("add");
  };

  const openView = (member: Member) => {
    setSelectedMember(member);
    setModalMode("view");
  };

  const openEdit = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      fullName: member.fullName,
      email: member.email,
      level: member.level,
    });
    setFormError("");
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedMember(null);
    setFormData(EMPTY_FORM);
    setFormError("");
  };

  // ─── Add member ───────────────────────────────────────────
  const handleAddMember = async () => {
    setFormError("");
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setFormError("Full name and email are required.");
      return;
    }
    const companyMongoId = getCompanyMongoId();
    if (!companyMongoId) {
      setFormError("Company ID not found. Please log out and log in again.");
      return;
    }
    try {
      setSubmitting(true);
      await ApiService.post("/company-users", {
        companyId: companyMongoId,
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        level: formData.level,
        status: true,
      });
      closeModal();
      void fetchMembers();
    } catch (err: any) {
      setFormError(err.message || "Failed to add member. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Edit member ──────────────────────────────────────────
  const handleEditMember = async () => {
    setFormError("");
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setFormError("Full name and email are required.");
      return;
    }
    if (!selectedMember) return;
    const memberId = getMemberId(selectedMember);
    if (!memberId) {
      setFormError("Member id missing. Please refresh and try again.");
      return;
    }
    try {
      setSubmitting(true);
      await ApiService.patch(`/company-users/${memberId}`, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        level: formData.level,
      });
      closeModal();
      void fetchMembers();
    } catch (err: any) {
      setFormError(err.message || "Failed to update member. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete member ────────────────────────────────────────
  const confirmDelete = (member: Member) => {
    setMemberToDelete(member);
    setDeleteError("");
    setShowDeleteConfirm(true);
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    const memberId = getMemberId(memberToDelete);
    if (!memberId) {
      setDeleteError("Member id missing. Please refresh and try again.");
      return;
    }
    try {
      setDeleting(true);
      setDeleteError("");
      await ApiService.delete(`/company-users/${memberId}`);
      setShowDeleteConfirm(false);
      setMemberToDelete(null);
      void fetchMembers();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete member. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────
  const levelBadgeClass = (level: string) => {
    switch (level) {
      case "advanced":
        return "badge bg-success/10 text-success";
      case "intermediate":
        return "badge bg-warning/10 text-warning";
      default:
        return "badge bg-info/10 text-info";
    }
  };

  const isFormModal = modalMode === "add" || modalMode === "edit";

  return (
    <div>
      <Seo title={"Members"} />
      <Pageheader
        currentpage="Members"
        activepage="Company"
        mainpage="Dashboard"
      />

      {initError && (
        <div className="alert alert-danger mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
          {initError}
        </div>
      )}

      <div className="box">
        <div className="box-header flex justify-between items-center">
          <h5 className="text-lg font-bold">Members</h5>
          <button
            onClick={openAdd}
            className="ti-btn ti-btn-primary"
            disabled={!!initError}
          >
            + Add Member
          </button>
        </div>

        <div className="box-body">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />

          {loading ? (
            <p className="text-center py-6 text-gray-400">Loading...</p>
          ) : members.length === 0 ? (
            <p className="text-center py-6 text-gray-400">No members found.</p>
          ) : (
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border text-left">Name</th>
                  <th className="p-2 border text-left">Email</th>
                  <th className="p-2 border text-left">Level</th>
                  <th className="p-2 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={getMemberId(m) ?? m.email} className="hover:bg-gray-50">
                    <td className="p-2 border">{m.fullName}</td>
                    <td className="p-2 border">{m.email}</td>
                    <td className="p-2 border">
                      <span className={levelBadgeClass(m.level)}>
                        {m.level}
                      </span>
                    </td>
                    <td className="p-2 border">
                      <div className="flex items-center justify-center gap-2">
                        {/* View */}
                        <button
                          onClick={() => openView(m)}
                          title="View"
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-primary/10 text-primary transition-colors"
                        >
                          <i className="ri-eye-line text-base"></i>
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(m)}
                          title="Edit"
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-warning/10 text-warning transition-colors"
                        >
                          <i className="ri-pencil-line text-base"></i>
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => confirmDelete(m)}
                          title="Delete"
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-danger/10 text-danger transition-colors"
                        >
                          <i className="ri-delete-bin-line text-base"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="ti-btn ti-btn-sm"
            >
              Prev
            </button>
            <span className="text-sm text-gray-500">
              Page {page} {totalPages > 1 ? `of ${totalPages}` : ""}
            </span>
            <button
              disabled={members.length < 10 || page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="ti-btn ti-btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Modal ──────────────────────────────────── */}
      {isFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                {modalMode === "add" ? "Add Member" : "Edit Member"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="border p-2 w-full mb-2 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border p-2 w-full mb-2 rounded"
              disabled={modalMode === "edit"} // email is unique key, safer not to change
            />
            <select
              value={formData.level}
              onChange={(e) =>
                setFormData({ ...formData, level: e.target.value })
              }
              className="border p-2 w-full mb-4 rounded"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {formError && (
              <p className="text-red-500 text-sm mb-3">{formError}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="ti-btn"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={
                  modalMode === "add" ? handleAddMember : handleEditMember
                }
                className="ti-btn ti-btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? modalMode === "add"
                    ? "Adding..."
                    : "Saving..."
                  : modalMode === "add"
                  ? "Add"
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal ────────────────────────────────────────── */}
      {modalMode === "view" && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">Member Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Full Name</p>
                <p className="font-semibold text-sm">{selectedMember.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Email</p>
                <p className="font-semibold text-sm">{selectedMember.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Level</p>
                <span className={levelBadgeClass(selectedMember.level)}>
                  {selectedMember.level}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={closeModal} className="ti-btn">
                Close
              </button>
              <button
                onClick={() => openEdit(selectedMember)}
                className="ti-btn ti-btn-primary"
              >
                <i className="ri-pencil-line me-1"></i> Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ──────────────────────────────── */}
      {showDeleteConfirm && memberToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0">
                <i className="ri-delete-bin-line text-danger text-lg"></i>
              </span>
              <h3 className="font-bold text-base">Delete Member</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-gray-700">
                {memberToDelete.fullName}
              </span>
              ? This action cannot be undone.
            </p>
            {deleteError && (
              <p className="text-red-500 text-sm mb-3">{deleteError}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setMemberToDelete(null);
                }}
                className="ti-btn"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMember}
                className="ti-btn ti-btn-danger"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersPage;