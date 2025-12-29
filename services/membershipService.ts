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
  const response = await ApiService.get(
    `/admin/membership/users/${userId}/overview`,
    {},
    true
  );

  return response.data?.activeMembership ?? null;
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