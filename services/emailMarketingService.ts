import ApiService from './ApiService';
import type { PaginatedResponse } from './marketingContactService';

export type EmailCampaignStatus = 'draft' | 'sending' | 'sent' | 'partial' | 'failed';

export interface EmailTemplate {
  _id?: string;
  id?: string;
  name: string;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailTemplatePayload {
  name: string;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  status?: boolean;
}

export interface EmailCampaign {
  _id?: string;
  id?: string;
  name: string;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  templateId?: string | { _id?: string; id?: string; name?: string } | null;
  folderId?: string | { _id?: string; id?: string; name?: string } | null;
  contactId?: string | { _id?: string; id?: string; name?: string; email?: string } | null;
  status?: EmailCampaignStatus;
  stats?: { total: number; sent: number; failed: number };
  sentAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailCampaignPayload {
  name: string;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  templateId?: string | null;
  folderId?: string | null;
  contactId?: string | null;
}

export interface GetEmailTemplatesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  search?: string;
}

export interface GetEmailCampaignsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  search?: string;
  status?: EmailCampaignStatus;
}

/**
 * CRM API client for email templates and campaigns.
 */
class EmailMarketingService {
  /**
   * List email templates.
   */
  async getTemplates(params: GetEmailTemplatesParams = {}): Promise<PaginatedResponse<EmailTemplate>> {
    const response = await ApiService.get('/marketing/templates', params);
    return {
      results: response.results || [],
      page: response.page || params.page || 1,
      limit: response.limit || params.limit || 50,
      totalPages: response.totalPages || 1,
      totalResults: response.totalResults || 0,
    };
  }

  /**
   * Create an email template.
   */
  async createTemplate(payload: EmailTemplatePayload): Promise<EmailTemplate> {
    return ApiService.post('/marketing/templates', payload);
  }

  /**
   * Update an email template.
   */
  async updateTemplate(id: string, payload: Partial<EmailTemplatePayload>): Promise<EmailTemplate> {
    return ApiService.patch(`/marketing/templates/${id}`, payload);
  }

  /**
   * Delete an email template.
   */
  async deleteTemplate(id: string): Promise<void> {
    await ApiService.delete(`/marketing/templates/${id}`);
  }

  /**
   * List email campaigns.
   */
  async getCampaigns(params: GetEmailCampaignsParams = {}): Promise<PaginatedResponse<EmailCampaign>> {
    const response = await ApiService.get('/marketing/campaigns', params);
    return {
      results: response.results || [],
      page: response.page || params.page || 1,
      limit: response.limit || params.limit || 10,
      totalPages: response.totalPages || 1,
      totalResults: response.totalResults || 0,
    };
  }

  /**
   * Create a draft email campaign.
   */
  async createCampaign(payload: EmailCampaignPayload): Promise<EmailCampaign> {
    return ApiService.post('/marketing/campaigns', payload);
  }

  /**
   * Update a draft email campaign.
   */
  async updateCampaign(id: string, payload: Partial<EmailCampaignPayload>): Promise<EmailCampaign> {
    return ApiService.patch(`/marketing/campaigns/${id}`, payload);
  }

  /**
   * Delete an email campaign.
   */
  async deleteCampaign(id: string): Promise<void> {
    await ApiService.delete(`/marketing/campaigns/${id}`);
  }

  /**
   * Send a draft campaign to its folder or single contact.
   */
  async sendCampaign(id: string): Promise<EmailCampaign> {
    const response = await ApiService.post(`/marketing/campaigns/${id}/send`, {});
    return response.data || response;
  }
}

export default new EmailMarketingService();
