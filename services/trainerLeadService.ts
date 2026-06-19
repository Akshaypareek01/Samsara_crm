import ApiService from './ApiService';
import { TRAINER_CATEGORY_OPTIONS } from '@/constants/trainerCategories';
import { TRAINER_CITY_OPTIONS } from '@/constants/trainerCities';

/**
 * Quick/partial trainer registration lead — collected from the short
 * lead-capture form (NOT the full Trainer registration flow). Stored in its
 * own `TrainerLead` collection on the backend so it can be reviewed,
 * filtered, and exported separately by admins.
 */

/** Years-of-experience buckets offered on the quick lead-capture form. */
export const TRAINER_LEAD_EXPERIENCE_OPTIONS = [
  '2 to 4 years',
  '5 to 8 years',
  '8 to 12 years',
  'Above 12 years',
] as const;

export type TrainerLeadExperience = (typeof TRAINER_LEAD_EXPERIENCE_OPTIONS)[number];

export const TRAINER_LEAD_STATUS_OPTIONS = ['New', 'Contacted', 'Converted', 'Rejected'] as const;
export type TrainerLeadStatus = (typeof TRAINER_LEAD_STATUS_OPTIONS)[number];

export { TRAINER_CATEGORY_OPTIONS, TRAINER_CITY_OPTIONS };

export interface TrainerLead {
  _id?: string;
  id?: string;
  name: string;
  mobile: string;
  email: string;
  specialization: string;
  city: string;
  pinCode: string;
  experience: string;
  linkedin?: string;
  instagram?: string;
  status?: TrainerLeadStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTrainerLeadRequest {
  name: string;
  mobile: string;
  email: string;
  specialization: string;
  city: string;
  pinCode: string;
  experience: string;
  linkedin?: string;
  instagram?: string;
}

export interface GetTrainerLeadsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  name?: string;
  city?: string;
  specialization?: string;
  experience?: string;
  status?: string;
}

export interface TrainerLeadsResponse {
  results: TrainerLead[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

class TrainerLeadService {
  /**
   * Submit the quick/partial trainer registration form (public endpoint).
   */
  async createTrainerLead(leadData: CreateTrainerLeadRequest): Promise<TrainerLead> {
    try {
      const response = await ApiService.post('/trainer-leads', leadData);
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Create trainer lead error:', error);
      throw error;
    }
  }

  /**
   * Get all trainer leads with pagination/filtering (admin only).
   */
  async getTrainerLeads(params: GetTrainerLeadsParams = {}): Promise<TrainerLeadsResponse> {
    try {
      const response = await ApiService.get('/trainer-leads', params);
      return {
        results: response.results || [],
        page: response.page || params.page || 1,
        limit: response.limit || params.limit || 10,
        totalPages: response.totalPages || 1,
        totalResults: response.totalResults || 0,
      };
    } catch (error) {
      console.error('❌ Get trainer leads error:', error);
      throw error;
    }
  }

  /**
   * Update a trainer lead's triage status (admin only).
   */
  async updateTrainerLeadStatus(leadId: string, status: TrainerLeadStatus): Promise<TrainerLead> {
    try {
      return await ApiService.patch(`/trainer-leads/${leadId}`, { status });
    } catch (error) {
      console.error('❌ Update trainer lead error:', error);
      throw error;
    }
  }

  /**
   * Delete a trainer lead (admin only).
   */
  async deleteTrainerLead(leadId: string): Promise<void> {
    try {
      await ApiService.delete(`/trainer-leads/${leadId}`);
    } catch (error) {
      console.error('❌ Delete trainer lead error:', error);
      throw error;
    }
  }

  /**
   * Download trainer leads matching the given filter as an .xlsx file
   * (admin only) and trigger a browser download.
   */
  async exportTrainerLeads(params: Omit<GetTrainerLeadsParams, 'page' | 'limit' | 'sortBy'> = {}): Promise<void> {
    const blob = await ApiService.downloadFile('/trainer-leads/export', params);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trainer-leads-${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export default new TrainerLeadService();
