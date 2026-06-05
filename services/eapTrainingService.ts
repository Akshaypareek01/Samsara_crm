import ApiService from './ApiService';

/** Allowed EAP session durations in hours. */
export const EAP_DURATION_OPTIONS = [1, 2, 4, 6] as const;

export type EapDurationHours = (typeof EAP_DURATION_OPTIONS)[number];

export interface EapSyllabusEntry {
  durationHours: EapDurationHours;
  points: string[];
}

export interface EapTraining {
  id?: string;
  _id?: string;
  trainer: string | EapTrainingTrainerPopulated;
  title: string;
  coverImage: string;
  durationOptions: EapDurationHours[];
  syllabus: EapSyllabusEntry[];
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Trainer object when EAP training list/detail populates trainer. */
export interface EapTrainingTrainerPopulated {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  bio?: string;
  specialistIn?: string | string[];
  city?: string;
  experience?: string;
  profilePhoto?: { path?: string; key?: string } | null;
  status?: boolean;
  acceptingBookings?: boolean;
  category?: string;
}

export interface CreateEapTrainingRequest {
  title: string;
  coverImage: string;
  durationOptions: EapDurationHours[];
  syllabus: EapSyllabusEntry[];
  status?: boolean;
}

export type UpdateEapTrainingRequest = Partial<CreateEapTrainingRequest>;

export interface ListEapTrainingsParams {
  trainerId?: string;
  search?: string;
  trainerName?: string;
  duration?: EapDurationHours;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface EapTrainingsResponse {
  results: EapTraining[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

/**
 * Normalize Mongo id fields on an EAP training record.
 *
 * @param training - Raw API training object.
 */
function normalizeTraining(training: EapTraining): EapTraining {
  if (training.id && !training._id) {
    return { ...training, _id: training.id };
  }
  return training;
}

/**
 * API client for EAP training CRUD and company listing.
 */
class EapTrainingService {
  /**
   * List trainings owned by the authenticated EAP trainer.
   */
  async listMine(): Promise<EapTraining[]> {
    const response = await ApiService.get('/eap-trainings/mine');
    const list = Array.isArray(response) ? response : response?.results ?? [];
    return list.map((t: EapTraining) => normalizeTraining(t));
  }

  /**
   * Create a new EAP training (EAP trainers only).
   *
   * @param body - Training payload.
   */
  async createTraining(body: CreateEapTrainingRequest): Promise<EapTraining> {
    const response = await ApiService.post('/eap-trainings', body);
    return normalizeTraining(response);
  }

  /**
   * Update an existing EAP training owned by the trainer.
   *
   * @param id - Training id.
   * @param body - Partial update payload.
   */
  async updateTraining(id: string, body: UpdateEapTrainingRequest): Promise<EapTraining> {
    const response = await ApiService.patch(`/eap-trainings/${id}`, body);
    return normalizeTraining(response);
  }

  /**
   * Delete an EAP training owned by the trainer.
   *
   * @param id - Training id.
   */
  async deleteTraining(id: string): Promise<void> {
    await ApiService.delete(`/eap-trainings/${id}`);
  }

  /**
   * List active EAP trainings for the company portal.
   *
   * @param params - Optional filters (e.g. trainerId).
   */
  async listTrainings(params: ListEapTrainingsParams = {}): Promise<EapTrainingsResponse> {
    const response = await ApiService.get('/eap-trainings', params);
    const results = (response.results || []).map((t: EapTraining) => normalizeTraining(t));
    return {
      results,
      page: response.page || params.page || 1,
      limit: response.limit || params.limit || 10,
      totalPages: response.totalPages || 1,
      totalResults: response.totalResults || results.length,
    };
  }

  /**
   * Fetch a single EAP training by id.
   *
   * @param id - Training id.
   */
  async getTrainingById(id: string): Promise<EapTraining> {
    const response = await ApiService.get(`/eap-trainings/${id}`);
    return normalizeTraining(response);
  }
}

export default new EapTrainingService();
