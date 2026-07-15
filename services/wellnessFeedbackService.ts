import ApiService from './ApiService';

export type WellnessFeedbackTrainerContext = {
  trainerId: string;
  name: string;
  order: number;
};

export type WellnessFeedbackContext = {
  bookingId: string;
  companyId: string;
  companyName: string;
  sessionDate: string;
  sessionAttendedOptions: string[];
  sessionAttendedPrefill: string[];
  trainers: WellnessFeedbackTrainerContext[];
  trainerMode: string;
};

export type TrainerFeedbackPayload = {
  trainerId?: string;
  order: number;
  name: string;
  ratings: {
    knowledge?: number;
    communication?: number;
    engagement?: number;
    energy?: number;
    usefulness?: number;
  };
  likedMost?: string;
  suggestions?: string;
};

export type WellnessFeedbackSubmitPayload = {
  token: string;
  employeeName?: string;
  city?: string;
  companyName?: string;
  sessionDate?: string;
  sessionsAttended?: string[];
  sessionOther?: string;
  trainerMode?: string;
  trainers?: TrainerFeedbackPayload[];
  overallSatisfaction: string;
  enjoyedActivities?: string[];
  stressRelief: string;
  wantMoreSessions: string;
  preferredTopics?: string[];
  additionalComments?: string;
};

export type WellnessFeedbackShareLink = {
  url: string;
  expiresAt: string;
};

/**
 * API client for booking-scoped wellness feedback.
 */
class WellnessFeedbackService {
  /**
   * Creates a signed share link for a completed booking (company auth).
   *
   * @param bookingId - Completed booking id.
   */
  async createShareLink(bookingId: string): Promise<WellnessFeedbackShareLink> {
    const response = await ApiService.post(
      `/wellness-feedback/bookings/${bookingId}/share-link`,
      {}
    );
    return response.data as WellnessFeedbackShareLink;
  }

  /**
   * Resolves a share token to prefill context (public).
   *
   * @param token - Signed token from share URL.
   */
  async getFeedbackContext(token: string): Promise<WellnessFeedbackContext> {
    const response = await ApiService.get('/wellness-feedback/context', { token });
    return response.data as WellnessFeedbackContext;
  }

  /**
   * Submits employee wellness feedback (public).
   *
   * @param payload - Form submission body.
   */
  async submitFeedback(payload: WellnessFeedbackSubmitPayload): Promise<{ id: string }> {
    const response = await ApiService.post('/wellness-feedback', payload);
    return response.data as { id: string };
  }
}

const wellnessFeedbackService = new WellnessFeedbackService();
export default wellnessFeedbackService;
