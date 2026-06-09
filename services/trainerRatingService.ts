import ApiService from './ApiService';
import type { Trainer } from './trainerService';

export interface TrainerRatingSummary {
  averageRating: number;
  totalReviews: number;
}

export interface TrainerRating {
  id?: string;
  _id?: string;
  booking: string | Record<string, unknown>;
  trainer: string | Trainer;
  company: string | Record<string, unknown>;
  rating: number;
  feedback?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PendingRatingAlert {
  bookingId: string;
  bookingDate: string;
  startTime: string;
  duration: number;
  typeOfTraining: string[];
  trainer: Trainer | null;
  eapTraining?: { title?: string } | null;
}

export interface PaginatedTrainerReviews {
  results: TrainerRating[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface PendingRatingsResponse {
  results: PendingRatingAlert[];
  totalResults: number;
  page: number;
  limit: number;
}

/**
 * API client for CRM trainer session ratings.
 */
const TrainerRatingService = {
  /**
   * Completed sessions awaiting a rating from the current company.
   */
  async getPendingRatings(params?: { page?: number; limit?: number }): Promise<PendingRatingsResponse> {
    const response = await ApiService.get('/trainer-ratings/pending', params ?? {});
    return response;
  },

  /**
   * Submit a rating for a completed booking.
   */
  async createRating(payload: {
    bookingId: string;
    rating: number;
    feedback?: string;
  }): Promise<TrainerRating> {
    const response = await ApiService.post('/trainer-ratings', payload);
    return response;
  },

  /**
   * Update an existing session rating.
   */
  async updateRating(
    bookingId: string,
    payload: { rating: number; feedback?: string }
  ): Promise<TrainerRating> {
    const response = await ApiService.put(`/trainer-ratings/bookings/${bookingId}`, payload);
    return response;
  },

  /**
   * Get rating for a booking if one exists (null when unrated).
   */
  async getRatingByBooking(bookingId: string): Promise<TrainerRating | null> {
    const response = await ApiService.get(`/trainer-ratings/bookings/${bookingId}`);
    if (!response) return null;
    return response;
  },

  /**
   * Aggregate rating summary for a trainer.
   */
  async getTrainerSummary(trainerId: string): Promise<TrainerRatingSummary> {
    const response = await ApiService.get(`/trainer-ratings/trainers/${trainerId}/summary`);
    return response;
  },

  /**
   * Paginated session reviews for a trainer.
   */
  async getTrainerReviews(
    trainerId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedTrainerReviews> {
    const response = await ApiService.get(
      `/trainer-ratings/trainers/${trainerId}/reviews`,
      params ?? {}
    );
    return response;
  },
};

export default TrainerRatingService;

/**
 * Extract public rating summary from a trainer record.
 *
 * @param trainer - Trainer object from API.
 * @returns Summary with zero defaults when missing.
 */
export function getTrainerRatingSummary(
  trainer: Pick<Trainer, 'ratingSummary'> | null | undefined
): TrainerRatingSummary {
  return {
    averageRating: trainer?.ratingSummary?.averageRating ?? 0,
    totalReviews: trainer?.ratingSummary?.totalReviews ?? 0,
  };
}

/**
 * Whether a trainer has at least one published review.
 *
 * @param summary - Rating summary object.
 * @returns True when stars should be shown in UI.
 */
export function hasTrainerReviews(summary: TrainerRatingSummary): boolean {
  return summary.totalReviews > 0 && summary.averageRating > 0;
}
