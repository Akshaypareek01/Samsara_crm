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
  specialistIn: string;
  typeOfTraining: string;
  duration: string;
  images?: TrainerImage[];
  profilePhoto?: TrainerImage | null;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTrainerRequest {
  name: string;
  title: string;
  bio: string;
  specialistIn: string;
  typeOfTraining: string;
  duration: string;
  images?: TrainerImage[];
  profilePhoto?: TrainerImage | null;
  status?: boolean;
}

export interface UpdateTrainerRequest {
  name?: string;
  title?: string;
  bio?: string;
  specialistIn?: string;
  typeOfTraining?: string;
  duration?: string;
  images?: TrainerImage[];
  profilePhoto?: TrainerImage | null;
  status?: boolean;
}

export interface GetTrainersParams {
  name?: string;
  specialistIn?: string;
  typeOfTraining?: string;
  status?: boolean;
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
  'Mental Health',
  'Fitness',
  'Yoga',
  'Pilates',
  'Strength Training',
  'Cardio',
  'Weight Loss',
  'Weight Gain',
  'Nutrition',
  'Ayurveda',
  'Meditation',
  'Wellness',
  'Rehabilitation',
  'Sports Training',
  'Dance Fitness',
  'HIIT',
  'CrossFit',
  'Bodybuilding',
  'General Training',
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
}

export default new TrainerService();

