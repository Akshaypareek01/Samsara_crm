import ApiService from './ApiService';

export type MarketingContactStatus = 'active' | 'unsubscribed';

export interface MarketingFolderRef {
  _id?: string;
  id?: string;
  name?: string;
}

export interface MarketingContact {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  tags?: string[];
  folderId?: MarketingFolderRef | string | null;
  source?: 'manual' | 'import';
  status?: MarketingContactStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketingContactPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  tags?: string[];
  folderId?: string | null;
  status?: MarketingContactStatus;
}

export interface GetMarketingContactsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  search?: string;
  folderId?: string;
  tag?: string;
  status?: MarketingContactStatus;
}

export interface PaginatedResponse<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface ImportContactsResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}

/**
 * CRM API client for marketing contacts (list, CRUD, import/export).
 */
class MarketingContactService {
  /**
   * Fetch paginated marketing contacts with optional filters.
   */
  async getContacts(params: GetMarketingContactsParams = {}): Promise<PaginatedResponse<MarketingContact>> {
    const response = await ApiService.get('/marketing/contacts', params);
    return {
      results: response.results || [],
      page: response.page || params.page || 1,
      limit: response.limit || params.limit || 10,
      totalPages: response.totalPages || 1,
      totalResults: response.totalResults || 0,
    };
  }

  /**
   * Create a new marketing contact.
   */
  async createContact(payload: MarketingContactPayload): Promise<MarketingContact> {
    return ApiService.post('/marketing/contacts', payload);
  }

  /**
   * Update an existing marketing contact.
   */
  async updateContact(id: string, payload: Partial<MarketingContactPayload>): Promise<MarketingContact> {
    return ApiService.patch(`/marketing/contacts/${id}`, payload);
  }

  /**
   * Delete a marketing contact.
   */
  async deleteContact(id: string): Promise<void> {
    await ApiService.delete(`/marketing/contacts/${id}`);
  }

  /**
   * Download Excel import template and trigger browser save.
   */
  async downloadImportTemplate(): Promise<void> {
    const blob = await ApiService.downloadFile('/marketing/contacts/import-template');
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'marketing-contacts-template.xlsx';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export contacts matching filters as Excel.
   */
  async exportContacts(params: Omit<GetMarketingContactsParams, 'page' | 'limit' | 'sortBy'> = {}): Promise<void> {
    const blob = await ApiService.downloadFile('/marketing/contacts/export', params);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `marketing-contacts-${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Import contacts from an Excel file upload.
   */
  async importContacts(file: File): Promise<ImportContactsResult> {
    const formData = new FormData();
    formData.append('file', file);
    return ApiService.uploadFile('/marketing/contacts/import', formData);
  }
}

export default new MarketingContactService();
