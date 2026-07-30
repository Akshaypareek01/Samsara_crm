"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import MarketingFolderService from "@/services/marketingFolderService";
import { CrmModal, CrmBtnPrimary, crmInputClass, crmSelectClass, crmLabelClass } from "../../components";
import type { MarketingContact, MarketingContactPayload } from "@/services/marketingContactService";
import type { MarketingFolder } from "@/services/marketingFolderService";

interface MarketingContactFormModalProps {
  open: boolean;
  editingContact: MarketingContact | null;
  formData: MarketingContactPayload;
  tagsInput: string;
  folders: MarketingFolder[];
  canCreateFolder: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (data: MarketingContactPayload) => void;
  onTagsChange: (value: string) => void;
  onFoldersChange: () => void;
  onOpenManageFolders: () => void;
}

/**
 * Modal form for creating or editing a marketing contact.
 */
const MarketingContactFormModal = ({
  open,
  editingContact,
  formData,
  tagsInput,
  folders,
  canCreateFolder,
  onClose,
  onSubmit,
  onFormChange,
  onTagsChange,
  onFoldersChange,
  onOpenManageFolders,
}: MarketingContactFormModalProps) => {
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  /**
   * Create a folder inline and select it on the contact form.
   */
  const handleQuickCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) {
      Swal.fire("Error!", "Enter a folder name", "error");
      return;
    }

    try {
      setCreatingFolder(true);
      const folder = await MarketingFolderService.createFolder({ name });
      setNewFolderName("");
      onFoldersChange();
      onFormChange({ ...formData, folderId: folder._id || folder.id || null });
      Swal.fire("Created!", `"${name}" folder is ready.`, "success");
    } catch (err: any) {
      Swal.fire("Error!", err.message || "Failed to create folder", "error");
    } finally {
      setCreatingFolder(false);
    }
  };

  return (
    <CrmModal open={open} onClose={onClose} title={editingContact ? "Edit Contact" : "Add Contact"}>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className={crmLabelClass} htmlFor="contact-name">
            Name
          </label>
          <input
            id="contact-name"
            required
            className={crmInputClass}
            value={formData.name}
            onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className={crmLabelClass} htmlFor="contact-email">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            className={crmInputClass}
            value={formData.email}
            onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={crmLabelClass} htmlFor="contact-phone">
              Phone
            </label>
            <input
              id="contact-phone"
              className={crmInputClass}
              value={formData.phone || ""}
              onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className={crmLabelClass} htmlFor="contact-company">
              Company
            </label>
            <input
              id="contact-company"
              className={crmInputClass}
              value={formData.company || ""}
              onChange={(e) => onFormChange({ ...formData, company: e.target.value })}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <label className={crmLabelClass} htmlFor="contact-folder">
              Folder
            </label>
            <button
              type="button"
              className="text-[10px] font-semibold text-purple-600 hover:text-purple-700"
              onClick={onOpenManageFolders}
            >
              Manage folders
            </button>
          </div>
          <select
            id="contact-folder"
            className={crmSelectClass}
            value={formData.folderId || ""}
            onChange={(e) => onFormChange({ ...formData, folderId: e.target.value || null })}
          >
            <option value="">No folder</option>
            {folders.map((folder) => (
              <option key={folder._id || folder.id} value={folder._id || folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
          {folders.length === 0 && (
            <p className="mt-1.5 text-[10px] text-gray-500">
              No folders yet — create one below or open Manage folders.
            </p>
          )}
          {canCreateFolder && (
            <div className="flex gap-2 mt-2">
              <input
                id="contact-new-folder"
                className={crmInputClass}
                placeholder="New folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                aria-label="New folder name"
              />
              <button
                type="button"
                disabled={creatingFolder}
                className="ti-btn bg-white border border-gray-200 text-gray-700 !text-[10px] !py-[0.45rem] !px-[0.75rem] !rounded-[0.35rem] whitespace-nowrap disabled:opacity-70"
                onClick={handleQuickCreateFolder}
              >
                {creatingFolder ? "Adding..." : "Add folder"}
              </button>
            </div>
          )}
        </div>
        <div>
          <label className={crmLabelClass} htmlFor="contact-tags">
            Tags (comma-separated)
          </label>
          <input id="contact-tags" className={crmInputClass} value={tagsInput} onChange={(e) => onTagsChange(e.target.value)} />
        </div>
        <div>
          <label className={crmLabelClass} htmlFor="contact-status">
            Status
          </label>
          <select
            id="contact-status"
            className={crmSelectClass}
            value={formData.status || "active"}
            onChange={(e) => onFormChange({ ...formData, status: e.target.value as MarketingContactPayload["status"] })}
          >
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="ti-btn bg-light" onClick={onClose}>
            Cancel
          </button>
          <CrmBtnPrimary type="submit">{editingContact ? "Save Changes" : "Create Contact"}</CrmBtnPrimary>
        </div>
      </form>
    </CrmModal>
  );
};

export default MarketingContactFormModal;
