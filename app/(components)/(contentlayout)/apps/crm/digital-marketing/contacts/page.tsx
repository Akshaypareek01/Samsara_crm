"use client";

import React, { Fragment, useEffect, useRef, useState } from "react";
import Seo from "@/shared/layout-components/seo/seo";
import Swal from "sweetalert2";
import { hasPermission } from "@/shared/utils/permissionUtils";
import MarketingContactService, {
  MarketingContact,
  MarketingContactPayload,
} from "@/services/marketingContactService";
import MarketingFolderService, { MarketingFolder } from "@/services/marketingFolderService";
import {
  CrmPageHeader,
  CrmCard,
  CrmTableWrapper,
  crmTableClass,
  crmTheadTrClass,
  crmThClass,
  crmTbodyTrClass,
  crmTdClass,
  crmThActionsClass,
  crmTdActionsClass,
  CrmBtnPrimary,
  CrmBtnEdit,
  CrmBtnDelete,
  CrmActionGroup,
  CrmLoading,
  crmInputClass,
  crmSelectClass,
  crmLabelClass,
} from "../../components";
import MarketingContactFormModal from "./MarketingContactFormModal";
import MarketingFoldersModal from "./MarketingFoldersModal";

const emptyForm: MarketingContactPayload = {
  name: "",
  email: "",
  phone: "",
  company: "",
  tags: [],
  folderId: null,
  status: "active",
};

/**
 * Resolve folder display name from populated or raw folderId.
 */
const getFolderName = (folderId: MarketingContact["folderId"]) => {
  if (!folderId) return "—";
  if (typeof folderId === "object") return folderId.name || "—";
  return "—";
};

/**
 * Resolve folder id string for form selects.
 */
const getFolderIdValue = (folderId: MarketingContact["folderId"]) => {
  if (!folderId) return "";
  if (typeof folderId === "object") return folderId._id || folderId.id || "";
  return folderId;
};

const MarketingContactsPage = () => {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [contacts, setContacts] = useState<MarketingContact[]>([]);
  const [folders, setFolders] = useState<MarketingFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [folderFilter, setFolderFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showFoldersModal, setShowFoldersModal] = useState(false);
  const [editingContact, setEditingContact] = useState<MarketingContact | null>(null);
  const [formData, setFormData] = useState<MarketingContactPayload>(emptyForm);
  const [tagsInput, setTagsInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setAdminUser(JSON.parse(userStr));
  }, []);

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, folderFilter, tagFilter, statusFilter]);

  const fetchFolders = async () => {
    try {
      const response = await MarketingFolderService.getFolders({ limit: 100, sortBy: "name:asc" });
      setFolders(response.results);
    } catch (err) {
      console.error("Failed to load folders:", err);
    }
  };

  const buildFilterParams = () => {
    const params: Record<string, string> = {};
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (folderFilter) params.folderId = folderFilter;
    if (tagFilter.trim()) params.tag = tagFilter.trim();
    if (statusFilter) params.status = statusFilter;
    return params;
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await MarketingContactService.getContacts({
        page,
        limit: 10,
        sortBy: "createdAt:desc",
        ...buildFilterParams(),
      });
      setContacts(response.results);
      setTotalPages(response.totalPages);
      setTotalResults(response.totalResults);
    } catch (err: any) {
      setError(err.message || "Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingContact(null);
    setFormData(emptyForm);
    setTagsInput("");
    setShowModal(true);
  };

  const openEditModal = (contact: MarketingContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || "",
      company: contact.company || "",
      tags: contact.tags || [],
      folderId: getFolderIdValue(contact.folderId) || null,
      status: contact.status || "active",
    });
    setTagsInput((contact.tags || []).join(", "));
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: MarketingContactPayload = {
      ...formData,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      folderId: formData.folderId || null,
    };

    try {
      if (editingContact) {
        await MarketingContactService.updateContact(editingContact._id || editingContact.id!, payload);
        Swal.fire("Updated!", "Contact saved successfully.", "success");
      } else {
        await MarketingContactService.createContact(payload);
        Swal.fire("Created!", "Contact added successfully.", "success");
      }
      setShowModal(false);
      fetchContacts();
      fetchFolders();
    } catch (err: any) {
      Swal.fire("Error!", err.message || "Failed to save contact", "error");
    }
  };

  const handleDelete = async (contact: MarketingContact) => {
    const result = await Swal.fire({
      title: "Delete contact?",
      text: `${contact.name} (${contact.email}) will be removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      await MarketingContactService.deleteContact(contact._id || contact.id!);
      Swal.fire("Deleted!", "Contact removed.", "success");
      fetchContacts();
      fetchFolders();
    } catch (err: any) {
      Swal.fire("Error!", err.message || "Failed to delete contact", "error");
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await MarketingContactService.exportContacts(buildFilterParams());
    } catch (err: any) {
      Swal.fire("Error!", err.message || "Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const result = await MarketingContactService.importContacts(file);
      Swal.fire(
        "Import complete",
        `Imported: ${result.imported}, Failed: ${result.failed}`,
        result.failed > 0 ? "warning" : "success"
      );
      fetchContacts();
      fetchFolders();
    } catch (err: any) {
      Swal.fire("Error!", err.message || "Import failed", "error");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const canCreate = hasPermission(adminUser, "digitalMarketing.contacts", "create");
  const canUpdate = hasPermission(adminUser, "digitalMarketing.contacts", "update");
  const canDelete = hasPermission(adminUser, "digitalMarketing.contacts", "delete");

  return (
    <Fragment>
      <Seo title="Marketing Contacts" />
      <div className="p-[10px]">
        <CrmPageHeader
          title="Marketing Contacts"
          subtitle={`Manage standalone marketing contacts — ${totalResults} total`}
          actions={
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="ti-btn bg-white border border-gray-200 text-gray-700 !text-[0.75rem] !py-[0.45rem] !px-[0.75rem] !rounded-[0.35rem]"
                onClick={() => setShowFoldersModal(true)}
              >
                <i className="ri-folder-line me-1" aria-hidden="true" />
                Manage Folders
              </button>
              <button
                type="button"
                className="ti-btn bg-white border border-gray-200 text-gray-700 !text-[0.75rem] !py-[0.45rem] !px-[0.75rem] !rounded-[0.35rem]"
                onClick={() => MarketingContactService.downloadImportTemplate()}
              >
                <i className="ri-download-2-line me-1" aria-hidden="true" />
                Template
              </button>
              {canCreate && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    aria-label="Import contacts Excel file"
                    onChange={handleImportFile}
                  />
                  <button
                    type="button"
                    disabled={importing}
                    className="ti-btn bg-info text-white !text-[0.75rem] !py-[0.45rem] !px-[0.75rem] !rounded-[0.35rem] disabled:opacity-70"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {importing ? "Importing..." : "Import Excel"}
                  </button>
                </>
              )}
              <button
                type="button"
                disabled={exporting}
                className="ti-btn bg-success text-white !text-[0.75rem] !py-[0.45rem] !px-[0.75rem] !rounded-[0.35rem] disabled:opacity-70"
                onClick={handleExport}
              >
                {exporting ? "Exporting..." : "Export Excel"}
              </button>
              {canCreate && (
                <CrmBtnPrimary onClick={openCreateModal}>
                  <i className="ri-add-line text-xs" aria-hidden="true" /> Add Contact
                </CrmBtnPrimary>
              )}
            </div>
          }
        />

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-100 text-red-600 text-[11px]" role="alert">
            {error}
          </div>
        )}

        <CrmCard>
          <div className="p-[10px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
            <div>
              <label className={crmLabelClass} htmlFor="contact-search">
                Search
              </label>
              <input
                id="contact-search"
                type="search"
                className={crmInputClass}
                placeholder="Name, email, company..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div>
              <label className={crmLabelClass} htmlFor="contact-folder-filter">
                Folder
              </label>
              <select
                id="contact-folder-filter"
                className={crmSelectClass}
                value={folderFilter}
                onChange={(e) => {
                  setFolderFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All folders</option>
                {folders.map((folder) => (
                  <option key={folder._id || folder.id} value={folder._id || folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={crmLabelClass} htmlFor="contact-tag-filter">
                Tag
              </label>
              <input
                id="contact-tag-filter"
                type="text"
                className={crmInputClass}
                placeholder="Filter by tag"
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div>
              <label className={crmLabelClass} htmlFor="contact-status-filter">
                Status
              </label>
              <select
                id="contact-status-filter"
                className={crmSelectClass}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <CrmLoading label="Loading contacts..." />
          ) : (
            <>
              <CrmTableWrapper>
                <table className={crmTableClass}>
                  <thead>
                    <tr className={crmTheadTrClass}>
                      <th className={crmThClass}>Name</th>
                      <th className={crmThClass}>Email</th>
                      <th className={crmThClass}>Phone</th>
                      <th className={crmThClass}>Company</th>
                      <th className={crmThClass}>Folder</th>
                      <th className={crmThClass}>Tags</th>
                      <th className={crmThClass}>Status</th>
                      <th className={crmThActionsClass}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.length === 0 ? (
                      <tr className={crmTbodyTrClass}>
                        <td className={crmTdClass} colSpan={8}>
                          No contacts found.
                        </td>
                      </tr>
                    ) : (
                      contacts.map((contact) => (
                        <tr key={contact._id || contact.id} className={crmTbodyTrClass}>
                          <td className={`${crmTdClass} font-medium`}>{contact.name}</td>
                          <td className={crmTdClass}>{contact.email}</td>
                          <td className={crmTdClass}>{contact.phone || "—"}</td>
                          <td className={crmTdClass}>{contact.company || "—"}</td>
                          <td className={crmTdClass}>{getFolderName(contact.folderId)}</td>
                          <td className={crmTdClass}>{(contact.tags || []).join(", ") || "—"}</td>
                          <td className={crmTdClass}>
                            <span
                              className={`badge ${
                                contact.status === "unsubscribed" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                              }`}
                            >
                              {contact.status || "active"}
                            </span>
                          </td>
                          <td className={crmTdActionsClass}>
                            <CrmActionGroup>
                              {canUpdate && <CrmBtnEdit onClick={() => openEditModal(contact)} title="Edit contact" />}
                              {canDelete && (
                                <CrmBtnDelete onClick={() => handleDelete(contact)} title="Delete contact" />
                              )}
                            </CrmActionGroup>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CrmTableWrapper>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
                  <span className="text-[11px] text-gray-500">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="ti-btn ti-btn-sm bg-light"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="ti-btn ti-btn-sm bg-light"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CrmCard>

        <MarketingContactFormModal
          open={showModal}
          editingContact={editingContact}
          formData={formData}
          tagsInput={tagsInput}
          folders={folders}
          canCreateFolder={canCreate}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          onFormChange={setFormData}
          onTagsChange={setTagsInput}
          onFoldersChange={fetchFolders}
          onOpenManageFolders={() => setShowFoldersModal(true)}
        />

        <MarketingFoldersModal
          open={showFoldersModal}
          onClose={() => setShowFoldersModal(false)}
          onFoldersChange={fetchFolders}
          canCreate={canCreate}
          canDelete={canDelete}
        />
      </div>
    </Fragment>
  );
};

export default MarketingContactsPage;
