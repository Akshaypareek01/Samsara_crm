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

export interface AssignMembershipResult {
  success: boolean;
  message?: string;
  data?: UserMembership;
}

export interface BulkAssignMembershipResult {
  succeeded: Array<{ userId: string; userName: string; membership?: UserMembership }>;
  failed: Array<{ userId: string; userName: string; error: string }>;
}

/**
 * Extract a human-readable message from API/axios errors.
 */
export function getAssignMembershipErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  const anyErr = err as { response?: { data?: { message?: string } } };
  return (
    anyErr?.response?.data?.message ||
    'Failed to assign membership'
  );
}

class MembershipService {
  /**
   * Admin: assign a membership plan to a user (manual grant, no payment).
   */
  async assignMembershipToUser(userId: string, planId: string): Promise<AssignMembershipResult> {
    const response = await ApiService.post('/admin/membership/assign', { userId, planId });
    return {
      success: response?.success ?? true,
      message: response?.message,
      data: response?.data,
    };
  }

  /**
   * Admin: assign the same plan to multiple users; continues on per-user failures.
   */
  async assignMembershipToUsers(
    userIds: string[],
    planId: string,
    usersById: Map<string, { name: string }>
  ): Promise<BulkAssignMembershipResult> {
    const succeeded: BulkAssignMembershipResult['succeeded'] = [];
    const failed: BulkAssignMembershipResult['failed'] = [];

    for (const userId of userIds) {
      const label = usersById.get(userId)?.name || userId;
      try {
        const result = await this.assignMembershipToUser(userId, planId);
        succeeded.push({ userId, userName: label, membership: result.data });
      } catch (err: unknown) {
        failed.push({
          userId,
          userName: label,
          error: getAssignMembershipErrorMessage(err),
        });
      }
    }

    return { succeeded, failed };
  }

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