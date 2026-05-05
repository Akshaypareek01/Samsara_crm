import ApiService from './ApiService';

export interface TrainerImage {
  key: string;
  path: string;
}

export interface Trainer {
  id?: string;
  _id?: string;
  name: string;
  title: string;
  bio: string;
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

export interface CreateTrainerRequest {
  name: string;
  title: string;
  bio: string;
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

export interface UpdateTrainerRequest {
  name?: string;
  title?: string;
  bio?: string;
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
  specialistIn?: string;
  typeOfTraining?: string;
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

export const SPECIALIST_OPTIONS = [
  'Employees',
  'Mid Level Managers',
  'Leadership',
  'GenZ',
];

export const TYPE_OF_TRAINING_OPTIONS = [
  // Employees
  'Masterclass for Employee Wellbeing',
  'Emotional Intelligence Skill Workshop',
  'Mindfulness at Work',
  'Resilience during Change & Uncertainty',
  'The Mental Health Toolkit: Daily Self-Care for Working Professionals',
  'Managing Anxiety at Work: Coping with High-Pressure Moments',
  'Work-Life Balance and Digital Wellbeing',
  'Stress Management and Emotional Resilience',
  'Peer Support & Mental Health Champions Program',
  'Building Psychological Safety at Work',
  'Enhancing Collaboration through Emotional Intelligence',
  // Mid-Level Managers
  "Myndwell's Emerging Leader Series",
  'Emerging Leader Skill Assessment',
  'Weekly Sessions',
  'Continuous Learning Support',
  'Personalized One-on-One Sessions',
  'Post-Intervention Assessment',
  'Mastering Managerial Effectiveness',
  'Understanding Stress and Burnout',
  'Impactful Communication: Fostering Genuine Connections',
  'Boosting Team Performance & Upholding Organizational Culture',
  'Cultivating Leadership Excellence in Managers',
  "Navigating Performance Appraisal Dynamics: A Manager's Guide",
  'Manager Sensitization Program',
  'How to Have Difficult Conversations: A Guide for Leaders',
  'Feedback Mastery: Enhancing Communication and Performance',
  'Leading with Empathy: Mental Health Leadership Training',
  'Creating a Mentally Healthy Environment: A Culture of Psychological Safety',
  'Preventing Burnout: A Leadership Lens',
  'Emotional Intelligence for Managers',
  // Leadership
  'Strategic Leadership in Evolving Workplaces',
  'Building Inclusive Leadership Practices',
  'Leading Change with Emotional Intelligence',
  'Resilient Leadership: Thriving Through Disruption',
  'Fostering a Culture of Innovation and Growth',
  'Mentoring and Coaching for High-Performance Teams',
  'Leadership Agility: Adapting to Uncertainty',
  'Mental Health Leadership: Supporting Workforce Wellbeing',
  // GenZ
  'From Campus to Corporate: The Real-World Starter Pack',
  'Emotional Intelligence 2.0: Thriving Beyond IQ',
  'The Resilience Playbook: Fail Fast, Rise Faster',
  'Unstoppable Confidence: Owning Your Story at Work',
  'Digital Detox for Digital Natives: Reclaiming Focus & Energy',
  'Collaborate & Conquer: Cracking Multigenerational Workplaces',
  'EQ in Action: Empathy as Your Superpower',
  'Thriving as a Fresher: Adapting to the Corporate World',
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


