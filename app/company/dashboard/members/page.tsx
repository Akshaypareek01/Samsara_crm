"use client";

import React, { useEffect, useState, useCallback } from "react";
import Pageheader from "@/shared/layout-components/page-header/pageheader";
import Seo from "@/shared/layout-components/seo/seo";
import ApiService from "@/services/ApiService";

interface Member {
  _id: string;
  fullName: string;
  email: string;
  level: string;
  companyId?: { _id: string } | string;
}

interface CompanyData {
  _id?: string;
  id?: string;
  companyId?: string; // business key e.g. "AB12CD34"
}

/** Read the saved company object from localStorage (set by ApiService.setUser on login) */
const getStoredCompany = (): CompanyData | null => {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Mongo _id — used as companyId in POST /company-users */
const getCompanyMongoId = (): string | null => {
  const company = getStoredCompany();
  if (!company) return null;
  return company._id || company.id || null;
};

/** Business key e.g. "AB12CD34" — used for listing members */
const getCompanyKey = (): string | null => {
  const company = getStoredCompany();
  return company?.companyId || null;
};

const MembersPage = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    level: "beginner",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [initError, setInitError] = useState("");

  // ─── Fetch members ───────────────────────────────────────────────────────────
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

      console.log("MEMBERS DATA:", data);
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

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  // ─── Add Member ──────────────────────────────────────────────────────────────
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

      setShowModal(false);
      setFormData({ fullName: "", email: "", level: "beginner" });
      fetchMembers();
    } catch (err: any) {
      console.error("ADD MEMBER ERROR:", err);
      setFormError(err.message || "Failed to add member. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ fullName: "", email: "", level: "beginner" });
    setFormError("");
  };

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

  return (
    <div>
      <Seo title={"Members"} />
      <Pageheader
        currentpage="Members"
        activepage="Company"
        mainpage="Dashboard"
      />

      {/* Init error banner */}
      {initError && (
        <div className="alert alert-danger mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
          {initError}
        </div>
      )}

      <div className="box">
        <div className="box-header flex justify-between items-center">
          <h5 className="text-lg font-bold">Members</h5>
          <button
            onClick={() => setShowModal(true)}
            className="ti-btn ti-btn-primary"
            disabled={!!initError}
          >
            + Add Member
          </button>
        </div>

        <div className="box-body">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />

          {/* Table */}
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
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m._id} className="hover:bg-gray-50">
                    <td className="p-2 border">{m.fullName}</td>
                    <td className="p-2 border">{m.email}</td>
                    <td className="p-2 border">
                      <span className={levelBadgeClass(m.level)}>
                        {m.level}
                      </span>
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

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <h3 className="font-bold text-lg mb-4">Add Member</h3>

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
                onClick={handleCloseModal}
                className="ti-btn"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="ti-btn ti-btn-primary"
                disabled={submitting}
              >
                {submitting ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersPage;