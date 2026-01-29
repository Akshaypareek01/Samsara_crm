import ApiService from './ApiService';

export interface MembershipPlan {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  basePrice: number;
  currency: string;
  taxConfig?: {
    gst: {
      rate: number;
      type: string;
      amount: number;
    };
    otherTaxes?: Array<any>;
  };
  discountConfig?: {
    maxDiscountPercentage: number;
    maxDiscountAmount?: number;
  };
  validityDays: number;
  features: string[];
  isActive: boolean;
  availableFrom: string;
  availableUntil?: string;
  planType: 'basic' | 'premium' | 'enterprise' | 'trial' | 'limited-time';
  maxUsers: number;
  razorpayPlanId?: string;
  appleProductId?: string;
  metadata?: any;
  totalPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMembershipPlanRequest {
  name: string;
  description: string;
  basePrice: number;
  currency?: string;
  taxConfig?: any;
  discountConfig?: any;
  validityDays: number;
  features: string[];
  isActive?: boolean;
  availableFrom?: string;
  availableUntil?: string;
  planType?: string;
  maxUsers?: number;
}

export interface UpdateMembershipPlanRequest extends Partial<CreateMembershipPlanRequest> { }

export interface GetMembershipPlansParams {
  sortBy?: string;
  limit?: number;
  page?: number;
  planType?: string;
  isActive?: boolean;
}

export interface MembershipPlansResponse {
  data: MembershipPlan[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class MembershipPlanService {
  /**
   * Get all membership plans
   */
  async getMembershipPlans(params: GetMembershipPlansParams = {}): Promise<MembershipPlansResponse> {
    try {
      const response = await ApiService.get('/membership-plans', params);

      let plansArray: MembershipPlan[] = [];
      let total = 0;
      let page = params.page || 1;
      let limit = params.limit || 10;
      let totalPages = 1;

      if (Array.isArray(response)) {
        plansArray = response;
        total = response.length;
        totalPages = Math.ceil(response.length / limit);
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response.results)) {
          plansArray = response.results;
          total = (response.total !== undefined && response.total !== null)
            ? response.total
            : response.results.length;
          page = response.page || page;
          limit = response.limit || limit;
          totalPages = response.totalPages || Math.ceil(total / limit);
        } else if (Array.isArray(response.data)) {
          plansArray = response.data;
          total = (response.total !== undefined && response.total !== null)
            ? response.total
            : response.data.length;
          page = response.page || page;
          limit = response.limit || limit;
          totalPages = response.totalPages || Math.ceil(total / limit);
        }
      }

      plansArray = plansArray.map((plan) => {
        if (plan.id && !plan._id) {
          return { ...plan, _id: plan.id };
        }
        return plan;
      });

      return {
        data: plansArray,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('❌ Get membership plans error:', error);
      throw error;
    }
  }

  /**
   * Get active membership plans
   */
  async getActiveMembershipPlans(): Promise<MembershipPlan[]> {
    try {
      const response = await ApiService.get('/membership-plans/active');
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error('❌ Get active membership plans error:', error);
      throw error;
    }
  }

  /**
   * Get membership plan by ID
   */
  async getMembershipPlanById(planId: string): Promise<MembershipPlan> {
    try {
      const response = await ApiService.get(`/membership-plans/${planId}`);
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Get membership plan by ID error:', error);
      throw error;
    }
  }

  /**
   * Create a new membership plan (admin only)
   */
  async createMembershipPlan(planData: CreateMembershipPlanRequest): Promise<MembershipPlan> {
    try {
      const response = await ApiService.post('/membership-plans', planData);
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Create membership plan error:', error);
      throw error;
    }
  }

  /**
   * Update membership plan (admin only)
   */
  async updateMembershipPlan(planId: string, planData: UpdateMembershipPlanRequest): Promise<MembershipPlan> {
    try {
      const response = await ApiService.patch(`/membership-plans/${planId}`, planData);
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Update membership plan error:', error);
      throw error;
    }
  }

  /**
   * Delete membership plan (admin only)
   */
  async deleteMembershipPlan(planId: string): Promise<void> {
    try {
      await ApiService.delete(`/membership-plans/${planId}`);
    } catch (error) {
      console.error('❌ Delete membership plan error:', error);
      throw error;
    }
  }

  /**
   * Toggle membership plan status (admin only)
   */
  async toggleMembershipPlanStatus(planId: string): Promise<MembershipPlan> {
    try {
      const response = await ApiService.patch(`/membership-plans/${planId}/toggle-status`);
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Toggle membership plan status error:', error);
      throw error;
    }
  }

  /**
   * Get membership plan stats
   */
  async getMembershipPlanStats(): Promise<any> {
    try {
      const response = await ApiService.get('/membership-plans/stats');
      return response;
    } catch (error) {
      console.error('❌ Get membership plan stats error:', error);
      throw error;
    }
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Get plan type badge color
   */
  getPlanTypeBadgeClass(planType: string): string {
    const classes: { [key: string]: string } = {
      basic: 'bg-info/10 text-info',
      premium: 'bg-success/10 text-success',
      enterprise: 'bg-primary/10 text-primary',
      trial: 'bg-warning/10 text-warning',
      'limited-time': 'bg-danger/10 text-danger',
    };
    return classes[planType] || 'bg-secondary/10 text-secondary';
  }
}

export default new MembershipPlanService();