"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import MarketingFolderService, { MarketingFolder } from "@/services/marketingFolderService";
import {
  CrmModal,
  CrmBtnPrimary,
  CrmBtnDelete,
  CrmLoading,
  crmInputClass,
  crmLabelClass,
} from "../../components";

interface MarketingFoldersModalProps {
  open: boolean;
  onClose: () => void;
  onFoldersChange: () => void;
  canCreate: boolean;
  canDelete: boolean;
}

/**
 * Modal to create and manage marketing contact folders/segments.
 */
const MarketingFoldersModal = ({
  open,
  onClose,
  onFoldersChange,
  canCreate,
  canDelete,
}: MarketingFoldersModalProps) => {
  const [folders, setFolders] = useState<MarketingFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    loadFolders();
  }, [open]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const response = await MarketingFolderService.getFolders({ limit: 100, sortBy: "name:asc" });
      setFolders(response.results);
    } catch (err: any) {
      Swal.fire("Error!", err.message || "Failed to load folders", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new marketing folder from the modal form.
   */
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = folderName.trim();
    if (!name) {
      Swal.fire("Error!", "Folder name is required", "error");
      return;
    }

    try {
      setSaving(true);
      await MarketingFolderService.createFolder({
        name,
        description: folderDescription.trim(),
      });
      setFolderName("");
      setFolderDescription("");
      await loadFolders();
      onFoldersChange();
      Swal.fire("Created!", "Folder added successfully.", "success");
    } catch (err: any) {
      Swal.fire("Error!", err.message || "Failed to create folder", "error");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Delete a folder after confirmation (contacts are unassigned, not deleted).
   */
  const handleDeleteFolder = async (folder: MarketingFolder) => {
    const confirm = await Swal.fire({
      title: "Delete folder?",
      text: `"${folder.name}" will be removed. Contacts in this folder will be kept without a folder.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!confirm.isConfirmed) return;

    try {
      await MarketingFolderService.deleteFolder(folder._id || folder.id!);
      await loadFolders();
      onFoldersChange();
    } catch (err: any) {
      Swal.fire("Error!", err.message || "Failed to delete folder", "error");
    }
  };

  return (
    <CrmModal open={open} onClose={onClose} title="Manage Folders">
      <p className="text-[11px] text-gray-500 mb-4">
        Folders group contacts for filtering and email campaigns. Create folders here, then assign them when adding contacts.
      </p>

      {canCreate && (
        <form onSubmit={handleCreateFolder} className="space-y-3 mb-5 pb-5 border-b border-gray-100">
          <div>
            <label className={crmLabelClass} htmlFor="new-folder-name">
              New folder name
            </label>
            <input
              id="new-folder-name"
              className={crmInputClass}
              placeholder="e.g. Mumbai Clients"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </div>
          <div>
            <label className={crmLabelClass} htmlFor="new-folder-description">
              Description (optional)
            </label>
            <input
              id="new-folder-description"
              className={crmInputClass}
              placeholder="Short note about this segment"
              value={folderDescription}
              onChange={(e) => setFolderDescription(e.target.value)}
            />
          </div>
          <CrmBtnPrimary type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create Folder"}
          </CrmBtnPrimary>
        </form>
      )}

      {loading ? (
        <CrmLoading label="Loading folders..." />
      ) : folders.length === 0 ? (
        <p className="text-[11px] text-gray-500" role="status">
          No folders yet. Create your first folder above.
        </p>
      ) : (
        <ul className="space-y-2" aria-label="Marketing folders">
          {folders.map((folder) => (
            <li
              key={folder._id || folder.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded border border-gray-100 bg-gray-50/50"
            >
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-gray-900 truncate">{folder.name}</p>
                <p className="text-[10px] text-gray-500">
                  {folder.contactCount ?? 0} contact{(folder.contactCount ?? 0) === 1 ? "" : "s"}
                  {folder.description ? ` · ${folder.description}` : ""}
                </p>
              </div>
              {canDelete && (
                <CrmBtnDelete onClick={() => handleDeleteFolder(folder)} title={`Delete ${folder.name}`} />
              )}
            </li>
          ))}
        </ul>
      )}
    </CrmModal>
  );
};

export default MarketingFoldersModal;
