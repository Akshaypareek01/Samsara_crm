import ApiService from './ApiService';

/* ================= TYPES ================= */

export interface PeriodCycle {
  _id?: string;
  startDate: string;
  endDate?: string;
  cycleLengthDays?: number;
  periodLengthDays?: number;
  isPredicted?: boolean;
}


export interface AdminPeriodOverview {
  hasData: boolean;
  currentPhase?: string;
  currentCycleDay?: number;
  averageCycleLength?: number;
  lastPeriodStart?: string;
  nextPredictedPeriod?: string;
  isIrregular?: boolean;
  pregnancyMode?: boolean;
}

/* ================= SERVICE ================= */

class AdminPeriodService {
  /**
   * Get period overview for a user (ADMIN)
   */
  async getUserPeriodOverview(userId: string): Promise<AdminPeriodOverview> {
    const response = await ApiService.get(
      `/admin/period/users/${userId}/overview`,
      {},
      true
    );
    return response.data || response;
  }

  /**
   * Get period cycle history for a user (ADMIN)
   */
  async getUserPeriodCycles(userId: string): Promise<PeriodCycle[]> {
    const response = await ApiService.get(
      `/admin/period/users/${userId}/cycles`,
      {},
      true
    );
    return response.data || response;
  }
}

export default new AdminPeriodService();
