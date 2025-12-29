import ApiService from './ApiService';

export interface MoodEntry {
  _id?: string;
  mood: 'very_sad' | 'sad' | 'neutral' | 'happy' | 'very_happy';
  note?: string;
  date: string;
  time: string;
  createdAt?: string;
}

export interface WeightEntry {
  _id?: string;
  weight: number;
  unit: 'kg' | 'lbs';
  date: string;
  notes?: string;
}

export interface WaterEntry {
  _id?: string;
  date: Date;
  targetGlasses: number;
  targetMl: number;
  intakeTimeline: Array<{
    amountMl: number;
    time: string;
  }>;
  totalIntake: number;
  status: 'Hydrated' | 'Mildly dehydrated' | 'Dehydrated';
  weeklySummary: Array<{
    date: Date;
    totalMl: number;
  }>;
  dailyAverage?: number;
  bestDay?: number;
  streak?: number;
}

export interface HydrationStatus {
  currentIntake: number;
  targetMl: number;
  targetGlasses: number;
  percentage: number;
  status: 'Hydrated' | 'Mildly dehydrated' | 'Dehydrated';
  remainingMl: number;
  remainingGlasses: number;
  intakeTimeline: Array<{
    amountMl: number;
    time: string;
  }>;
  date: Date;
}

export interface WeeklySummary {
  period: string;
  totalDays: number;
  dailyAverage: number;
  bestDay: number;
  streak: number;
  chartData: Array<{
    date: string;
    totalMl: number;
    targetMl: number;
    status: string;
  }>;
  summary: {
    totalIntake: number;
    averagePerDay: number;
    bestDay: number;
    currentStreak: number;
  };
}


export interface TrackerDashboard {
  weight?: any;
  water?: WaterEntry;
  mood?: any;
  temperature?: any;
  fat?: any;
  bmi?: any;
  bodyStatus?: any;
  step?: any;
  sleep?: any;
  workout?: any;
  caloriesTarget?: any;
}

class TrackerService {
  /**
   * Get user's complete tracker dashboard (ADMIN)
   * @param userId - The target user's ID
   */
  async getUserTrackerDashboard(userId: string): Promise<TrackerDashboard> {
    try {
      const response = await ApiService.get(`/admin/trackers/users/${userId}/dashboard`, {}, true);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error fetching user tracker dashboard:', error);
      throw error;
    }
  }

  /**
   * Get user's tracker status for debugging (ADMIN)
   * @param userId - The target user's ID
   */
  async getUserTrackerStatus(userId: string): Promise<any> {
    try {
      const response = await ApiService.get(`/admin/trackers/users/${userId}/status`, {}, true);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error fetching user tracker status:', error);
      throw error;
    }
  }

  /**
   * WATER TRACKING METHODS (ADMIN)
   */

  /**
   * Get user's today water data (ADMIN)
   * @param userId - The target user's ID
   */
  async getUserTodayWaterData(userId: string): Promise<WaterEntry> {
    try {
      const response = await ApiService.get(`/admin/trackers/users/${userId}/water/today`, {}, true);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error fetching user today water data:', error);
      throw error;
    }
  }

  /**
   * Get user's water history (ADMIN)
   * @param userId - The target user's ID
   * @param days - Number of days to fetch history for
   */
  async getUserWaterHistory(userId: string, days: number = 30): Promise<WaterEntry[]> {
    try {
      const response = await ApiService.get(`/admin/trackers/users/${userId}/water/history?days=${days}`, {}, true);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error fetching user water history:', error);
      throw error;
    }
  }

  /**
   * Get user's water entry by ID (ADMIN)
   * @param userId - The target user's ID
   * @param entryId - The water entry ID
   */
  async getUserWaterById(userId: string, entryId: string): Promise<WaterEntry> {
    try {
      const response = await ApiService.get(`/admin/trackers/users/${userId}/water/${entryId}`, {}, true);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error fetching user water entry:', error);
      throw error;
    }
  }

  /**
   * Get user's hydration status (ADMIN)
   * @param userId - The target user's ID
   */
  async getUserHydrationStatus(userId: string): Promise<HydrationStatus> {
    try {
      const response = await ApiService.get(`/admin/trackers/users/${userId}/water/hydration-status`, {}, true);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error fetching user hydration status:', error);
      throw error;
    }
  }

  /**
   * Get user's weekly water summary (ADMIN)
   * @param userId - The target user's ID
   * @param days - Number of days for the summary
   */
  async getUserWeeklyWaterSummary(userId: string, days: number = 7): Promise<WeeklySummary> {
    try {
      const response = await ApiService.get(`/admin/trackers/users/${userId}/water/weekly-summary?days=${days}`, {}, true);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error fetching user weekly water summary:', error);
      throw error;
    }
  }

  /**
   * MOOD TRACKING
   * Admin currently uses dashboard endpoint for latest mood
   * Dedicated admin mood endpoints will be added only if history/analytics is required
   */
  async getUserMoods(userId: string): Promise<MoodEntry[]> {
    console.warn('⚠️ Mood tracking admin endpoints not yet implemented in backend');
    console.warn('TODO: Create admin-mood.controller.js and add routes');
    return [];
  }


  /**
   * HELPER METHODS (for creating mood entries as current user, not admin function)
   */
  async createMoodEntry(moodData: Omit<MoodEntry, '_id' | 'createdAt'>): Promise<MoodEntry> {
    try {
      const backendMoodData = {
        mood: this.getBackendMoodFromFrontend(moodData.mood),
        moodId: this.getMoodIdFromMood(moodData.mood),
        whatWasItAbout: moodData.note ? [moodData.note] : [],
        comments: moodData.note || ''
      };
      
      const response = await ApiService.post('/moods', backendMoodData);
      const backendMood = response.success ? response.data : response;
      
      return {
        _id: backendMood._id,
        mood: this.getMoodFromMoodId(backendMood.moodId) || backendMood.mood,
        note: backendMood.comments || backendMood.whatWasItAbout?.[0] || '',
        date: new Date(backendMood.createdAt || Date.now()).toISOString().split('T')[0],
        time: new Date(backendMood.createdAt || Date.now()).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        createdAt: backendMood.createdAt
      };
    } catch (error) {
      console.error('❌ Error creating mood entry:', error);
      throw error;
    }
  }

  // Helper methods for mood conversion
  private getMoodFromMoodId(moodId: number): string {
    const moodIdMap: { [key: number]: string } = {
      1: 'neutral',
      2: 'angry',
      3: 'happy',
      4: 'sad',
      5: 'exhausted',
      6: 'anxious',
      7: 'very_sad',
      8: 'in_love',
      9: 'bored',
      10: 'confident',
      11: 'very_happy',
      12: 'happy'
    };
    
    return moodIdMap[moodId] || 'neutral';
  }

  private getBackendMoodFromFrontend(frontendMood: string): string {
    const moodMap: { [key: string]: string } = {
      'very_happy': 'Happy',
      'happy': 'Happy',
      'neutral': 'Normal',
      'sad': 'Sad',
      'very_sad': 'Depressed',
      'angry': 'Angry',
      'excited': 'Excited',
      'relaxed': 'Relaxed',
      'confident': 'Confident',
      'anxious': 'Anxious',
      'exhausted': 'Exhausted',
      'depressed': 'Depressed',
      'in_love': 'In Love',
      'bored': 'Bored'
    };
    
    return moodMap[frontendMood] || frontendMood.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private getMoodIdFromMood(mood: string): number {
    const moodMap: { [key: string]: number } = {
      'Normal': 1,
      'Angry': 2, 
      'Happy': 3,
      'Sad': 4,
      'Exhausted': 5,
      'Anxious': 6,
      'Depressed': 7,
      'In Love': 8,
      'Bored': 9,
      'Confident': 10,
      'Excited': 11,
      'Relaxed': 12
    };
    
    const normalizedMood = mood.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return moodMap[normalizedMood] || 1;
  }
}

export default new TrackerService();

/*
 * ============================================================================
 * 🎉 WATER TRACKING - ADMIN ENDPOINTS! 🎉
 * ============================================================================
 *
 * ✅ IMPLEMENTED (Admin Water Tracking):
 * - GET /v1/admin/trackers/users/:userId/dashboard
 * - GET /v1/admin/trackers/users/:userId/water/today
 * - GET /v1/admin/trackers/users/:userId/water/history
 * - GET /v1/admin/trackers/users/:userId/water/hydration-status
 * - GET /v1/admin/trackers/users/:userId/water/weekly-summary
 *
 * 🔐 Authentication:
 * - Requires admin JWT token in Authorization header
 * - Admin middleware verifies role === 'admin'
 * - Can view any user's water tracking data
 * ============================================================================
 */