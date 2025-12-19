import ApiService from './ApiService';

export interface UserMembership {
  _id?: string;
  id?: string;
  userId: string;
  planId: string;
  planName: string;
  validityDays: number;
  status: 'active' | 'inactive' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  amountPaid: number;
  originalAmount: number;
  discountAmount?: number;
  currency: string;
  daysRemaining?: number;
  isActive?: boolean;
  isExpired?: boolean;
  createdAt?: string;
}

class MembershipService {
  /**
   * Get user's active membership
   */
  async getUserActiveMembership(userId: string): Promise<UserMembership | null> {
    try {
      const response = await ApiService.get(`/memberships/active`);
      return response || null;
    } catch (error: any) {
      // If 404, user has no active membership
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        return null;
      }
      console.error('❌ Get user membership error:', error);
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
   * Format date
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

export default new MembershipService();