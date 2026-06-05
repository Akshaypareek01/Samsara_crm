import ApiService from './ApiService';
import {
  TRAINER_CATEGORY_OPTIONS,
  type TrainerCategory,
} from '@/constants/trainerCategories';
import { TRAINER_CITY_OPTIONS, type TrainerCity } from '@/constants/trainerCities';

export { TRAINER_CATEGORY_OPTIONS, TRAINER_CITY_OPTIONS };
export type { TrainerCategory, TrainerCity };

export interface TrainerImage {
  key: string;
  path: string;
}

/** Maximum education entries allowed per trainer profile. */
export const MAX_TRAINER_EDUCATION_ENTRIES = 5;

/** Maximum certification entries allowed per trainer profile. */
export const MAX_TRAINER_CERTIFICATION_ENTRIES = 5;

/** Highest academic qualification details */
export interface TrainerEducation {
  qualification?: string;
  university?: string;
  yearOfCompletion?: number | null;
}

/** Professional certification / course details */
export interface TrainerCertification {
  name?: string;
  institute?: string;
  year?: number | null;
}

/** Personal & professional detail fields shared across trainer payloads */
export interface TrainerProfileDetails {
  dateOfBirth?: string | null;
  city?: string;
  pinCode?: string;
  experience?: string;
  education?: TrainerEducation[];
  certification?: TrainerCertification[];
}

export interface Trainer extends TrainerProfileDetails {
  id?: string;
  _id?: string;
  name: string;
  title: string;
  bio: string;
  category?: TrainerCategory | string;
  email?: string;
  mobile?: string;
  specialistIn: string | string[];
  typeOfTraining: string | string[];
  duration?: string;
  images?: TrainerImage[];
  profilePhoto?: TrainerImage | null;
  status?: boolean;
  /** When false, companies cannot create new bookings for this trainer. */
  acceptingBookings?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Whether a trainer profile allows new bookings (active and not opted out).
 *
 * @param trainer - Trainer or minimal pick with `status` and `acceptingBookings`.
 * @returns True when booking creation should be allowed in the UI and API.
 */
export function isTrainerAcceptingBookings(
  trainer: Pick<Trainer, 'status' | 'acceptingBookings'> | null | undefined
): boolean {
  if (!trainer) return false;
  if (trainer.status === false) return false;
  return trainer.acceptingBookings !== false;
}

export interface CreateTrainerRequest extends TrainerProfileDetails {
  name: string;
  title: string;
  bio: string;
  category: TrainerCategory | string;
  email: string;
  mobile: string;
  specialistIn: string | string[];
  typeOfTraining: string | string[];
  duration?: string;
  images?: TrainerImage[];
  profilePhoto?: TrainerImage | null;
  status?: boolean;
  acceptingBookings?: boolean;
}

export interface UpdateTrainerRequest extends TrainerProfileDetails {
  name?: string;
  title?: string;
  bio?: string;
  category?: TrainerCategory | string;
  email?: string;
  mobile?: string;
  specialistIn?: string | string[];
  typeOfTraining?: string | string[];
  duration?: string;
  images?: TrainerImage[];
  profilePhoto?: TrainerImage | null;
  status?: boolean;
  acceptingBookings?: boolean;
}

export interface GetTrainersParams {
  name?: string;
  category?: string;
  excludeCategory?: string;
  specialistIn?: string;
  typeOfTraining?: string;
  city?: string;
  status?: boolean;
  acceptingBookings?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface TrainersResponse {
  results: Trainer[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

/** Audience the trainer works with (UI label: "Training For") */
export const SPECIALIST_OPTIONS = [
  'GenZ',
  'Team Lead',
  'Manager',
  'Senior Manager',
  'Leadership',
];

/** Wellness disciplines the trainer offers (UI label: "Specializations") */
export const TYPE_OF_TRAINING_OPTIONS = [
  'Yoga',
  'Desktop Yoga',
  'Laughter Yoga',
  'Meditation',
  'Breath Work',
  'Sound Healing',
  'Yoga Nidra',
  'EAP Training',
  'Psychologist',
];

/**
 * Builds select options from current choices plus any legacy values already saved on the profile.
 *
 * @param baseOptions - Current allowed options for new selections.
 * @param selected - Values already stored on the trainer record.
 * @returns Merged option list without duplicates.
 */
export function mergeTrainerSelectOptions(
  baseOptions: readonly string[],
  selected: string | string[] | undefined
): string[] {
  const selectedList = Array.isArray(selected) ? selected : selected ? [selected] : [];
  const extras = selectedList.filter((value) => value && !baseOptions.includes(value));
  return [...baseOptions, ...extras];
}

/** Years-of-experience ranges shown at registration */
export const EXPERIENCE_OPTIONS = [
  '3 to 5 years',
  '5 to 8 years',
  '8 to 12 years',
  '12 to 15 years',
  'Above 15 years',
];

class TrainerService {
  /**
   * Get all trainers with optional filters
   */
  async getTrainers(params: GetTrainersParams = {}): Promise<TrainersResponse> {
    try {
      const response = await ApiService.get('/trainers', params);

      // Normalize id field
      if (response.results && Array.isArray(response.results)) {
        response.results = response.results.map((trainer: Trainer) => {
          if (trainer.id && !trainer._id) {
            return { ...trainer, _id: trainer.id };
          }
          return trainer;
        });
      }

      return {
        results: response.results || [],
        page: response.page || params.page || 1,
        limit: response.limit || params.limit || 10,
        totalPages: response.totalPages || 1,
        totalResults: response.totalResults || 0,
      };
    } catch (error) {
      console.error('❌ Get trainers error:', error);
      throw error;
    }
  }

  /**
   * Get trainer by MongoDB ID
   */
  async getTrainerById(trainerId: string): Promise<Trainer> {
    try {
      const response = await ApiService.get(`/trainers/${trainerId}`);
      // Normalize id field
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Get trainer by ID error:', error);
      throw error;
    }
  }

  /**
   * Create a new trainer
   */
  async createTrainer(trainerData: CreateTrainerRequest): Promise<Trainer> {
    try {
      const response = await ApiService.post('/trainers', trainerData);
      // Normalize id field
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Create trainer error:', error);
      throw error;
    }
  }

  /**
   * Update trainer
   */
  async updateTrainer(trainerId: string, trainerData: UpdateTrainerRequest): Promise<Trainer> {
    try {
      const response = await ApiService.patch(`/trainers/${trainerId}`, trainerData);
      // Normalize id field
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Update trainer error:', error);
      throw error;
    }
  }

  /**
   * Delete trainer
   */
  async deleteTrainer(trainerId: string): Promise<void> {
    try {
      await ApiService.delete(`/trainers/${trainerId}`);
    } catch (error) {
      console.error('❌ Delete trainer error:', error);
      throw error;
    }
  }

  /**
   * Add image to trainer
   */
  async addTrainerImage(trainerId: string, image: TrainerImage): Promise<Trainer> {
    try {
      const response = await ApiService.post(`/trainers/${trainerId}/images`, image);
      // Handle response structure - API returns { status, message, data }
      const trainer = response.data || response;
      if (trainer.id && !trainer._id) {
        return { ...trainer, _id: trainer.id };
      }
      return trainer;
    } catch (error) {
      console.error('❌ Add trainer image error:', error);
      throw error;
    }
  }

  /**
   * Remove image from trainer
   */
  async removeTrainerImage(trainerId: string, imageIndex: number): Promise<Trainer> {
    try {
      const response = await ApiService.delete(`/trainers/${trainerId}/images/${imageIndex}`);
      // Handle response structure - API returns { status, message, data }
      const trainer = response.data || response;
      if (trainer.id && !trainer._id) {
        return { ...trainer, _id: trainer.id };
      }
      return trainer;
    } catch (error) {
      console.error('❌ Remove trainer image error:', error);
      throw error;
    }
  }

  /**
   * Update trainer profile photo
   */
  async updateProfilePhoto(trainerId: string, photo: TrainerImage): Promise<Trainer> {
    try {
      const response = await ApiService.patch(`/trainers/${trainerId}/profile-photo`, photo);
      // Handle response structure - API returns { status, message, data }
      const trainer = response.data || response;
      if (trainer.id && !trainer._id) {
        return { ...trainer, _id: trainer.id };
      }
      return trainer;
    } catch (error) {
      console.error('❌ Update profile photo error:', error);
      throw error;
    }
  }

  /**
   * Send login OTP
   * Endpoint: POST /v1/trainer-auth/send-login-otp
   */
  async sendLoginOtp(email: string): Promise<any> {
    try {
      const response = await ApiService.post('/trainer-auth/send-login-otp', { email });
      return response;
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      throw error;
    }
  }

  /**
   * Login with OTP
   * Endpoint: POST /v1/trainer-auth/login
   * Response: { trainer: {...}, tokens: { access: {...}, refresh: {...} } }
   */
  async login(email: string, otp: string): Promise<any> {
    try {
      const response = await ApiService.post('/trainer-auth/login', { email, otp });
      // If response contains token, save it
      if (response.tokens?.access?.token) {
        await ApiService.setAuthToken(response.tokens.access.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('Auth', 'true');
          localStorage.setItem('userType', 'trainer');
          if (response.tokens.refresh?.token) {
            localStorage.setItem('refreshToken', response.tokens.refresh.token);
          }
        }
        // Save trainer data
        if (response.trainer) {
          await ApiService.setUser(response.trainer);
        }
      }
      return response;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  /**
   * Get current trainer profile (for authenticated trainer)
   */
  async getMyProfile(): Promise<Trainer> {
    try {
      const response = await ApiService.get('/trainers/me');
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Get my profile error:', error);
      throw error;
    }
  }

  /**
   * Update current trainer profile
   */
  async updateMyProfile(trainerData: UpdateTrainerRequest): Promise<Trainer> {
    try {
      const response = await ApiService.patch('/trainers/me', trainerData);
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Update my profile error:', error);
      throw error;
    }
  }
}

export default new TrainerService();


