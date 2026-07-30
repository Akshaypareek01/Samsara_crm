"use client";

import React, { Fragment, useEffect, useState } from "react";
import Seo from "@/shared/layout-components/seo/seo";
import Swal from "sweetalert2";
import { hasPermission } from "@/shared/utils/permissionUtils";
import EmailMarketingService, {
  EmailCampaign,
  EmailCampaignPayload,
  EmailTemplate,
  EmailTemplatePayload,
} from "@/services/emailMarketingService";
import MarketingFolderService, { MarketingFolder } from "@/services/marketingFolderService";
import MarketingContactService, { MarketingContact } from "@/services/marketingContactService";
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
} from "../../components";
import EmailCampaignModals from "./EmailCampaignModals";

type ActiveTab = "campaigns" | "templates";

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-secondary/10 text-secondary",
  sending: "bg-info/10 text-info",
  sent: "bg-success/10 text-success",
  partial: "bg-warning/10 text-warning",
  failed: "bg-danger/10 text-danger",
};

const emptyCampaign: EmailCampaignPayload = {
  name: "",
  subject: "",
  bodyHtml: "",
  bodyText: "",
  templateId: null,
  folderId: null,
  contactId: null,
};

const emptyTemplate: EmailTemplatePayload = {
  name: "",
  subject: "",
  bodyHtml: "",
  bodyText: "",
  status: true,
};

/**
 * Resolve populated ref id for selects.
 */
const refId = (value: unknown) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    const obj = value as { _id?: string; id?: string };
    return obj._id || obj.id || "";
  }
  return "";
};

const EmailMarketingPage = () => {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("campaigns");
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [folders, setFolders] = useState<MarketingFolder[]>([]);
  const [contacts, setContacts] = useState<MarketingContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [campaignForm, setCampaignForm] = useState<EmailCampaignPayload>(emptyCampaign);
  const [templateForm, setTemplateForm] = useState<EmailTemplatePayload>(emptyTemplate);
  const [recipientMode, setRecipientMode] = useState<"folder" | "contact">("folder");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setAdminUser(JSON.parse(userStr));
  }, []);

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    if (activeTab === "campaigns") fetchCampaigns();
    else fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page]);

  const loadLookups = async () => {
    try {
      const [folderRes, contactRes, templateRes] = await Promise.all([
        MarketingFolderService.getFolders({ limit: 100, sortBy: "name:asc" }),
        MarketingContactService.getContacts({ limit: 100, sortBy: "name:asc", status: "active" }),
        EmailMarketingService.getTemplates({ limit: 100, sortBy: "name:asc" }),
      ]);
      setFolders(folderRes.results);
      setContacts(contactRes.results);
      setTemplates(templateRes.results);
    } catch (err) {
      console.error("Failed to load email marketing lookups:", err);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await EmailMarketingService.getCampaigns({ page, limit: 10, sortBy: "createdAt:desc" });
      setCampaigns(response.results);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      Swal.fire("Error!", err.message || "Failed to load campaigns", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await EmailMarketingService.getTemplates({ page, limit: 10, sortBy: "createdAt:desc" });
      setTemplates(response.results);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      Swal.fire("Error!", err.message || "Failed to load templates", "error");
    } finally {
      setLoading(false);
    }
  };

  const applyTemplateToCampaign = (templateId: string) => {
    const template = templates.find((t) => (t._id || t.id) === templateId);
    if (!template) return;
    setCampaignForm((prev) => ({
      ...prev,
      templateId,
      subject: template.subject,
      bodyHtml: template.bodyHtml || "",
      bodyText: template.bodyText || "",
    }));
  };

  const openCampaignModal = (campaign?: EmailCampaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setCampaignForm({
        name: campaign.name,
        subject: campaign.subject,
        bodyHtml: campaign.bodyHtml || "",
        bodyText: campaign.bodyText || "",
        templateId: refId(campaign.templateId) || null,
        folderId: refId(campaign.folderId) || null,
        contactId: refId(campaign.contactId) || null,
      });
      setRecipientMode(refId(campaign.contactId) ? "contact" : "folder");
    } else {
      setEditingCampaign(null);
      setCampaignForm(emptyCampaign);
      setRecipientMode("folder");
    }
    setShowCampaignModal(true);
  };

  const saveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: EmailCampaignPayload = {
      ...campaignForm,
      folderId: recipientMode === "folder" ? campaignForm.folderId || null : null,
      contactId: recipientMode === "contact" ? campaignForm.contactId || null : null,
    };

    try {
      if (editingCampaign) {
        await EmailMarketingService.updateCampaign(editingCampaign._id || editingCampaign.id!, payload);
      } else {
        await EmailMarketingService.createCampaign(payload);
      }
      setShowCampaignModal(false);
      fetchCampaigns();
      Swal.fire("Saved!", "Campaign saved as draft.", "success");
    } catch (err: any) {
      Swal.fire("Error!", err.message || "Failed to save campaign", "error");
    }
  };

  const sendCampaign = async (campaign: EmailCampaign) => {
    const confirm = await Swal.fire({
      title: "Send campaign?",
      text: "Emails will be sent via SES to all active recipients.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Send now",
    });
    if (!confirm.isConfirmed) return;

    try {
      await EmailMarketingService.sendCampaign(campaign._id || campaign.id!);
      Swal.fire("Sent!", "Campaign send completed.", "success");
      fetchCampaigns();
    } catch (err: any) {
      Swal.fire("Error!", err.message || "Failed to send campaign", "error");
    }
  };

  const deleteCampaign = async (campaign: EmailCampaign) => {
    const confirm = await Swal.fire({
      title: "Delete campaign?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;
    try {
      await EmailMarketingService.deleteCampaign(campaign._id || campaign.id!);
      fetchCampaigns();
    } catch (err: any) {
      Swal.fire("Error!", err.message || "Failed to delete campaign", "error");
    }
  };

  const openTemplateModal = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name,
        subject: template.subject,
        bodyHtml: template.bodyHtml || "",
        bodyText: template.bodyText || "",
        status: template.status ?? true,
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm(emptyTemplate);
    }
    setShowTemplateModal(true);
  };

  const saveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await EmailMarketingService.updateTemplate(editingTemplate._id || editingTemplate.id!, templateForm);
      } else {
        await EmailMarketingService.createTemplate(templateForm);
      }
      setShowTemplateModal(false);
      fetchTemplates();
      loadLookups();
      Swal.fire("Saved!", "Template saved.", "success");
    } catch (err: any) {
      Swal.fire("Error!", err.message || "Failed to save template", "error");
    }
  };

  const deleteTemplate = async (template: EmailTemplate) => {
    const confirm = await Swal.fire({ title: "Delete template?", icon: "warning", showCancelButton: true });
    if (!confirm.isConfirmed) return;
    try {
      await EmailMarketingService.deleteTemplate(template._id || template.id!);
      fetchTemplates();
      loadLookups();
    } catch (err: any) {
      Swal.fire("Error!", err.message || "Failed to delete template", "error");
    }
  };

  const canCreate = hasPermission(adminUser, "digitalMarketing.email", "create");
  const canUpdate = hasPermission(adminUser, "digitalMarketing.email", "update");
  const canDelete = hasPermission(adminUser, "digitalMarketing.email", "delete");

  return (
    <Fragment>
      <Seo title="Email Marketing" />
      <div className="p-[10px]">
        <CrmPageHeader
          title="Email Marketing"
          subtitle="Draft and send email campaigns to folders or individual contacts"
          actions={
            canCreate ? (
              activeTab === "campaigns" ? (
                <CrmBtnPrimary onClick={() => openCampaignModal()}>
                  <i className="ri-add-line text-xs" aria-hidden="true" /> New Campaign
                </CrmBtnPrimary>
              ) : (
                <CrmBtnPrimary onClick={() => openTemplateModal()}>
                  <i className="ri-add-line text-xs" aria-hidden="true" /> New Template
                </CrmBtnPrimary>
              )
            ) : null
          }
        />

        <CrmCard>
          <div className="px-[10px] pt-[10px] border-b border-gray-100">
            <nav className="flex gap-6" role="tablist" aria-label="Email marketing sections">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "campaigns"}
                className={`pb-3 px-1 border-b-2 font-semibold text-[12px] transition-colors ${
                  activeTab === "campaigns"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
                onClick={() => {
                  setActiveTab("campaigns");
                  setPage(1);
                }}
              >
                Campaigns
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "templates"}
                className={`pb-3 px-1 border-b-2 font-semibold text-[12px] transition-colors ${
                  activeTab === "templates"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
                onClick={() => {
                  setActiveTab("templates");
                  setPage(1);
                }}
              >
                Templates
              </button>
            </nav>
          </div>

          <div className="p-[10px]">
          {loading ? (
            <CrmLoading label={activeTab === "campaigns" ? "Loading campaigns..." : "Loading templates..."} />
          ) : activeTab === "campaigns" ? (
            <CrmTableWrapper>
              <table className={crmTableClass}>
                <thead>
                  <tr className={crmTheadTrClass}>
                    <th className={crmThClass}>Name</th>
                    <th className={crmThClass}>Subject</th>
                    <th className={crmThClass}>Status</th>
                    <th className={crmThClass}>Sent</th>
                    <th className={crmThActionsClass}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign._id || campaign.id} className={crmTbodyTrClass}>
                      <td className={`${crmTdClass} font-medium`}>{campaign.name}</td>
                      <td className={crmTdClass}>{campaign.subject}</td>
                      <td className={crmTdClass}>
                        <span className={`badge ${STATUS_BADGE[campaign.status || "draft"]}`}>
                          {campaign.status || "draft"}
                        </span>
                      </td>
                      <td className={crmTdClass}>
                        {campaign.stats
                          ? `${campaign.stats.sent}/${campaign.stats.total}${campaign.stats.failed ? ` (${campaign.stats.failed} failed)` : ""}`
                          : "—"}
                      </td>
                      <td className={crmTdActionsClass}>
                        <CrmActionGroup>
                          {campaign.status === "draft" && canUpdate && (
                            <>
                              <CrmBtnEdit onClick={() => openCampaignModal(campaign)} title="Edit campaign" />
                              <button
                                type="button"
                                className="ti-btn ti-btn-sm bg-success text-white"
                                title="Send campaign"
                                onClick={() => sendCampaign(campaign)}
                              >
                                Send
                              </button>
                            </>
                          )}
                          {canDelete && campaign.status !== "sending" && (
                            <CrmBtnDelete onClick={() => deleteCampaign(campaign)} title="Delete campaign" />
                          )}
                        </CrmActionGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CrmTableWrapper>
          ) : (
            <CrmTableWrapper>
              <table className={crmTableClass}>
                <thead>
                  <tr className={crmTheadTrClass}>
                    <th className={crmThClass}>Name</th>
                    <th className={crmThClass}>Subject</th>
                    <th className={crmThActionsClass}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr key={template._id || template.id} className={crmTbodyTrClass}>
                      <td className={`${crmTdClass} font-medium`}>{template.name}</td>
                      <td className={crmTdClass}>{template.subject}</td>
                      <td className={crmTdActionsClass}>
                        <CrmActionGroup>
                          {canUpdate && <CrmBtnEdit onClick={() => openTemplateModal(template)} title="Edit template" />}
                          {canDelete && (
                            <CrmBtnDelete onClick={() => deleteTemplate(template)} title="Delete template" />
                          )}
                        </CrmActionGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CrmTableWrapper>
          )}
          </div>
        </CrmCard>

        <EmailCampaignModals
          showCampaignModal={showCampaignModal}
          showTemplateModal={showTemplateModal}
          editingCampaign={editingCampaign}
          editingTemplate={editingTemplate}
          campaignForm={campaignForm}
          templateForm={templateForm}
          recipientMode={recipientMode}
          templates={templates}
          folders={folders}
          contacts={contacts}
          onCloseCampaign={() => setShowCampaignModal(false)}
          onCloseTemplate={() => setShowTemplateModal(false)}
          onSaveCampaign={saveCampaign}
          onSaveTemplate={saveTemplate}
          onCampaignFormChange={setCampaignForm}
          onTemplateFormChange={setTemplateForm}
          onRecipientModeChange={setRecipientMode}
          onApplyTemplate={applyTemplateToCampaign}
        />
      </div>
    </Fragment>
  );
};

export default EmailMarketingPage;
