import ApiService from './ApiService';
import type { PaginatedResponse } from './marketingContactService';

export interface MarketingFolder {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  status?: boolean;
  contactCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketingFolderPayload {
  name: string;
  description?: string;
  status?: boolean;
}

export interface GetMarketingFoldersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  search?: string;
}

/**
 * CRM API client for marketing contact folders/segments.
 */
class MarketingFolderService {
  /**
   * List marketing folders with optional search.
   */
  async getFolders(params: GetMarketingFoldersParams = {}): Promise<PaginatedResponse<MarketingFolder>> {
    const response = await ApiService.get('/marketing/folders', params);
    return {
      results: response.results || [],
      page: response.page || params.page || 1,
      limit: response.limit || params.limit || 50,
      totalPages: response.totalPages || 1,
      totalResults: response.totalResults || 0,
    };
  }

  /**
   * Create a marketing folder.
   */
  async createFolder(payload: MarketingFolderPayload): Promise<MarketingFolder> {
    return ApiService.post('/marketing/folders', payload);
  }

  /**
   * Update a marketing folder.
   */
  async updateFolder(id: string, payload: Partial<MarketingFolderPayload>): Promise<MarketingFolder> {
    return ApiService.patch(`/marketing/folders/${id}`, payload);
  }

  /**
   * Delete a marketing folder (contacts are unassigned, not deleted).
   */
  async deleteFolder(id: string): Promise<void> {
    await ApiService.delete(`/marketing/folders/${id}`);
  }
}

export default new MarketingFolderService();
