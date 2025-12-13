import ApiService from './ApiService';

export interface Coupon {
  _id?: string;
  id?: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  maxDiscountPercentage?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount?: number;
  usageLimitPerUser?: number;
  applicablePlans?: string[];
  applicableUserCategories?: ('Personal' | 'Corporate')[];
  isActive?: boolean;
  createdBy?: string;
  metadata?: any;
  isValid?: boolean;
  isExpired?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCouponRequest {
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageLimitPerUser?: number;
  applicablePlans?: string[];
  applicableUserCategories?: ('Personal' | 'Corporate')[];
  isActive?: boolean;
}

export interface UpdateCouponRequest extends Partial<CreateCouponRequest> {}

export interface GetCouponsParams {
  sortBy?: string;
  limit?: number;
  page?: number;
  search?: string;
  isActive?: boolean;
}

export interface CouponsResponse {
  data: Coupon[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ValidateCouponRequest {
  code: string;
  planId: string;
  orderAmount: number;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  finalAmount?: number;
  message?: string;
}

class CouponService {
  /**
   * Get all coupons with optional filters
   */
 async getCoupons(params: GetCouponsParams = {}): Promise<CouponsResponse> {
  try {
    // Remove 'search' param and use backend-supported params only
    const { search, ...backendParams } = params;
    
    // Add search functionality using 'code' filter if search exists
    // if (search) {
    //   backendParams.code = search;
    // }
    
    const response = await ApiService.get('/coupons', backendParams);
    
    let couponsArray: Coupon[] = [];
    let total = 0;
    let page = params.page || 1;
    let limit = params.limit || 10;
    let totalPages = 1;

    if (Array.isArray(response)) {
      couponsArray = response;
      total = response.length;
      totalPages = Math.ceil(response.length / limit);
    } else if (response && typeof response === 'object') {
      if (Array.isArray(response.results)) {
        couponsArray = response.results;
        total = (response.total !== undefined && response.total !== null) 
          ? response.total 
          : response.results.length;
        page = response.page || page;
        limit = response.limit || limit;
        totalPages = response.totalPages || Math.ceil(total / limit);
      } else if (Array.isArray(response.data)) {
        couponsArray = response.data;
        total = (response.total !== undefined && response.total !== null) 
          ? response.total 
          : response.data.length;
        page = response.page || page;
        limit = response.limit || limit;
        totalPages = response.totalPages || Math.ceil(total / limit);
      }
    }

    couponsArray = couponsArray.map((coupon) => {
      if (coupon.id && !coupon._id) {
        return { ...coupon, _id: coupon.id };
      }
      return coupon;
    });

    return {
      data: couponsArray,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ Get coupons error:', error);
    throw error;
  }
}

  /**
   * Get active coupons
   */
  async getActiveCoupons(): Promise<Coupon[]> {
    try {
      const response = await ApiService.get('/coupons/active');
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error('❌ Get active coupons error:', error);
      throw error;
    }
  }

  /**
   * Get coupon by ID
   */
  async getCouponById(couponId: string): Promise<Coupon> {
    try {
      const response = await ApiService.get(`/coupons/${couponId}`);
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Get coupon by ID error:', error);
      throw error;
    }
  }

  /**
   * Get coupon by code
   */
  async getCouponByCode(code: string): Promise<Coupon> {
    try {
      const response = await ApiService.get(`/coupons/code/${code}`);
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Get coupon by code error:', error);
      throw error;
    }
  }

  /**
   * Create a new coupon (admin only)
   */
  async createCoupon(couponData: CreateCouponRequest): Promise<Coupon> {
    try {
      const response = await ApiService.post('/coupons', couponData);
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Create coupon error:', error);
      throw error;
    }
  }

  /**
   * Update coupon (admin only)
   */
  async updateCoupon(couponId: string, couponData: UpdateCouponRequest): Promise<Coupon> {
    try {
      const response = await ApiService.patch(`/coupons/${couponId}`, couponData);
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Update coupon error:', error);
      throw error;
    }
  }

  /**
   * Delete coupon (admin only)
   */
  async deleteCoupon(couponId: string): Promise<void> {
    try {
      await ApiService.delete(`/coupons/${couponId}`);
    } catch (error) {
      console.error('❌ Delete coupon error:', error);
      throw error;
    }
  }

  /**
   * Toggle coupon status (admin only)
   */
  async toggleCouponStatus(couponId: string): Promise<Coupon> {
    try {
      const response = await ApiService.patch(`/coupons/${couponId}/toggle-status`);
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Toggle coupon status error:', error);
      throw error;
    }
  }

  /**
   * Validate coupon code
   */
  async validateCoupon(data: ValidateCouponRequest): Promise<ValidateCouponResponse> {
    try {
      const response = await ApiService.post('/coupons/validate', data);
      return response;
    } catch (error) {
      console.error('❌ Validate coupon error:', error);
      throw error;
    }
  }

  /**
   * Get coupons for a specific plan
   */
  async getCouponsForPlan(planId: string): Promise<Coupon[]> {
    try {
      const response = await ApiService.get(`/coupons/plan/${planId}`);
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error('❌ Get coupons for plan error:', error);
      throw error;
    }
  }

  /**
   * Get coupon stats (admin only)
   */
  async getCouponStats(): Promise<any> {
    try {
      const response = await ApiService.get('/coupons/stats');
      return response;
    } catch (error) {
      console.error('❌ Get coupon stats error:', error);
      throw error;
    }
  }
}

export default new CouponService();