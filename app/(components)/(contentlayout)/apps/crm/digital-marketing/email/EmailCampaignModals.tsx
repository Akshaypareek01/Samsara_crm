"use client";

import React from "react";
import { CrmModal, CrmBtnPrimary, crmInputClass, crmSelectClass, crmLabelClass } from "../../components";
import type { EmailCampaign, EmailCampaignPayload, EmailTemplate } from "@/services/emailMarketingService";
import type { MarketingFolder } from "@/services/marketingFolderService";
import type { MarketingContact } from "@/services/marketingContactService";

interface EmailCampaignModalsProps {
  showCampaignModal: boolean;
  showTemplateModal: boolean;
  editingCampaign: EmailCampaign | null;
  editingTemplate: EmailTemplate | null;
  campaignForm: EmailCampaignPayload;
  templateForm: { name: string; subject: string; bodyHtml?: string; bodyText?: string; status?: boolean };
  recipientMode: "folder" | "contact";
  templates: EmailTemplate[];
  folders: MarketingFolder[];
  contacts: MarketingContact[];
  onCloseCampaign: () => void;
  onCloseTemplate: () => void;
  onSaveCampaign: (e: React.FormEvent) => void;
  onSaveTemplate: (e: React.FormEvent) => void;
  onCampaignFormChange: (data: EmailCampaignPayload) => void;
  onTemplateFormChange: (data: EmailCampaignModalsProps["templateForm"]) => void;
  onRecipientModeChange: (mode: "folder" | "contact") => void;
  onApplyTemplate: (templateId: string) => void;
}

/**
 * Campaign and template modals for the email marketing page.
 */
const EmailCampaignModals = ({
  showCampaignModal,
  showTemplateModal,
  editingCampaign,
  editingTemplate,
  campaignForm,
  templateForm,
  recipientMode,
  templates,
  folders,
  contacts,
  onCloseCampaign,
  onCloseTemplate,
  onSaveCampaign,
  onSaveTemplate,
  onCampaignFormChange,
  onTemplateFormChange,
  onRecipientModeChange,
  onApplyTemplate,
}: EmailCampaignModalsProps) => (
  <>
    <CrmModal
      open={showCampaignModal}
      onClose={onCloseCampaign}
      title={editingCampaign ? "Edit Campaign" : "New Campaign"}
    >
      <form onSubmit={onSaveCampaign} className="space-y-3">
        <div>
          <label className={crmLabelClass} htmlFor="campaign-name">
            Campaign name
          </label>
          <input
            id="campaign-name"
            required
            className={crmInputClass}
            value={campaignForm.name}
            onChange={(e) => onCampaignFormChange({ ...campaignForm, name: e.target.value })}
          />
        </div>
        <div>
          <label className={crmLabelClass} htmlFor="campaign-template">
            Template (optional)
          </label>
          <select
            id="campaign-template"
            className={crmSelectClass}
            value={campaignForm.templateId || ""}
            onChange={(e) => onApplyTemplate(e.target.value)}
          >
            <option value="">None</option>
            {templates.map((t) => (
              <option key={t._id || t.id} value={t._id || t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={crmLabelClass} htmlFor="campaign-subject">
            Subject
          </label>
          <input
            id="campaign-subject"
            required
            className={crmInputClass}
            value={campaignForm.subject}
            onChange={(e) => onCampaignFormChange({ ...campaignForm, subject: e.target.value })}
          />
        </div>
        <div>
          <label className={crmLabelClass}>Recipients</label>
          <div className="flex gap-4 mb-2">
            <label className="inline-flex items-center gap-1 text-[12px]">
              <input
                type="radio"
                name="recipientMode"
                checked={recipientMode === "folder"}
                onChange={() => onRecipientModeChange("folder")}
              />
              Folder
            </label>
            <label className="inline-flex items-center gap-1 text-[12px]">
              <input
                type="radio"
                name="recipientMode"
                checked={recipientMode === "contact"}
                onChange={() => onRecipientModeChange("contact")}
              />
              Single contact
            </label>
          </div>
          {recipientMode === "folder" ? (
            <select
              id="campaign-folder"
              className={crmSelectClass}
              required={recipientMode === "folder"}
              value={campaignForm.folderId || ""}
              onChange={(e) => onCampaignFormChange({ ...campaignForm, folderId: e.target.value || null })}
            >
              <option value="">Select folder</option>
              {folders.map((f) => (
                <option key={f._id || f.id} value={f._id || f.id}>
                  {f.name} ({f.contactCount ?? 0})
                </option>
              ))}
            </select>
          ) : (
            <select
              id="campaign-contact"
              className={crmSelectClass}
              required={recipientMode === "contact"}
              value={campaignForm.contactId || ""}
              onChange={(e) => onCampaignFormChange({ ...campaignForm, contactId: e.target.value || null })}
            >
              <option value="">Select contact</option>
              {contacts.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className={crmLabelClass} htmlFor="campaign-body-text">
            Plain text body
          </label>
          <textarea
            id="campaign-body-text"
            rows={4}
            className={crmInputClass}
            value={campaignForm.bodyText || ""}
            onChange={(e) => onCampaignFormChange({ ...campaignForm, bodyText: e.target.value })}
          />
        </div>
        <div>
          <label className={crmLabelClass} htmlFor="campaign-body-html">
            HTML body
          </label>
          <textarea
            id="campaign-body-html"
            rows={5}
            className={crmInputClass}
            value={campaignForm.bodyHtml || ""}
            onChange={(e) => onCampaignFormChange({ ...campaignForm, bodyHtml: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="ti-btn bg-light" onClick={onCloseCampaign}>
            Cancel
          </button>
          <CrmBtnPrimary type="submit">Save Draft</CrmBtnPrimary>
        </div>
      </form>
    </CrmModal>

    <CrmModal
      open={showTemplateModal}
      onClose={onCloseTemplate}
      title={editingTemplate ? "Edit Template" : "New Template"}
    >
      <form onSubmit={onSaveTemplate} className="space-y-3">
        <div>
          <label className={crmLabelClass} htmlFor="template-name">
            Template name
          </label>
          <input
            id="template-name"
            required
            className={crmInputClass}
            value={templateForm.name}
            onChange={(e) => onTemplateFormChange({ ...templateForm, name: e.target.value })}
          />
        </div>
        <div>
          <label className={crmLabelClass} htmlFor="template-subject">
            Subject
          </label>
          <input
            id="template-subject"
            required
            className={crmInputClass}
            value={templateForm.subject}
            onChange={(e) => onTemplateFormChange({ ...templateForm, subject: e.target.value })}
          />
        </div>
        <div>
          <label className={crmLabelClass} htmlFor="template-body-text">
            Plain text
          </label>
          <textarea
            id="template-body-text"
            rows={4}
            className={crmInputClass}
            value={templateForm.bodyText || ""}
            onChange={(e) => onTemplateFormChange({ ...templateForm, bodyText: e.target.value })}
          />
        </div>
        <div>
          <label className={crmLabelClass} htmlFor="template-body-html">
            HTML
          </label>
          <textarea
            id="template-body-html"
            rows={5}
            className={crmInputClass}
            value={templateForm.bodyHtml || ""}
            onChange={(e) => onTemplateFormChange({ ...templateForm, bodyHtml: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="ti-btn bg-light" onClick={onCloseTemplate}>
            Cancel
          </button>
          <CrmBtnPrimary type="submit">Save Template</CrmBtnPrimary>
        </div>
      </form>
    </CrmModal>
  </>
);

export default EmailCampaignModals;
