import ApiService from './ApiService';

export interface Schedule {
  days: string[];
  startTime: string;
  endTime: string;
}

export interface Teacher {
  _id: string;
  name: string;
  email?: string;
  teacherCategory?: string;
  profileImage?: string;
  [key: string]: any;
}

export interface Class {
  _id?: string;
  title: string;
  description?: string;
  password?: string;
  meeting_number?: string;
  teacher?: string | Teacher; // Can be ID string or populated Teacher object
  status?: boolean;
  schedule?: string;
  startTime?: string;
  endTime?: string;
  level?: string[];
  image?: string;
  classType?: 'online' | 'offline';
  classCategory?: string;
  duration?: number;
  maxCapacity?: number;
  schedules?: Schedule[];
  perfectFor?: string[];
  skipIf?: string[];
  whatYoullGain?: string[];
  students?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClassRequest {
  title: string;
  description?: string;
  password?: string;
  meeting_number?: string;
  teacher?: string;
  status?: boolean;
  schedule?: string;
  startTime?: string;
  endTime?: string;
  level?: string[];
  image?: string;
  classType?: 'online' | 'offline';
  classCategory?: string;
  duration?: number;
  maxCapacity?: number;
  schedules?: Schedule[];
  perfectFor?: string[];
  skipIf?: string[];
  whatYoullGain?: string[];
}

export interface UpdateClassRequest extends Partial<CreateClassRequest> {}

class ClassService {
  /**
   * Get all classes
   */
  async getAllClasses(params?: {
    role?: string;
    sortBy?: string;
    limit?: number;
    page?: number;
  }): Promise<{ classes?: Class[]; data?: Class[]; results?: Class[]; total?: number; page?: number; totalPages?: number } | Class[]> {
    try {
      const response = await ApiService.get('/classes', params);
      // If response is already an array, return it as is
      if (Array.isArray(response)) {
        return response;
      }
      // Otherwise return the response object
      return response;
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  }

  /**
   * Get upcoming classes
   */
  async getUpcomingClasses(): Promise<Class[]> {
    try {
      const response = await ApiService.get('/classes/upcoming');
      return response;
    } catch (error: any) {
      console.error('Error fetching upcoming classes:', error);
      throw error;
    }
  }

  /**
   * Get class by ID
   */
  async getClassById(classId: string): Promise<Class> {
    try {
      const response = await ApiService.get(`/classes/${classId}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching class:', error);
      throw error;
    }
  }

  /**
   * Create a new class
   */
  async createClass(data: CreateClassRequest): Promise<Class> {
    try {
      const response = await ApiService.post('/classes', data);
      return response;
    } catch (error: any) {
      console.error('Error creating class:', error);
      throw error;
    }
  }

  /**
   * Update a class
   */
  async updateClass(classId: string, data: UpdateClassRequest): Promise<Class> {
    try {
      const response = await ApiService.put(`/classes/${classId}`, data);
      return response;
    } catch (error: any) {
      console.error('Error updating class:', error);
      throw error;
    }
  }

  /**
   * Delete a class
   */
  async deleteClass(classId: string): Promise<void> {
    try {
      await ApiService.delete(`/classes/${classId}`);
    } catch (error: any) {
      console.error('Error deleting class:', error);
      throw error;
    }
  }

  /**
   * Start a class meeting
   */
  async startClass(classId: string): Promise<any> {
    try {
      const response = await ApiService.post(`/classes/start-class/${classId}`);
      return response;
    } catch (error: any) {
      console.error('Error starting class:', error);
      throw error;
    }
  }

  /**
   * End a class meeting
   */
  async endClass(classId: string, data?: { token?: string; meetingId?: string }): Promise<any> {
    try {
      const response = await ApiService.post(`/classes/end_meeting/${classId}`, data || {});
      return response;
    } catch (error: any) {
      console.error('Error ending class:', error);
      throw error;
    }
  }

  /**
   * Get all teachers
   */
  async getAllTeachers(): Promise<any[]> {
    try {
      const response = await ApiService.get('/classes/teachers');
      // If response is already an array, return it as is
      if (Array.isArray(response)) {
        return response;
      }
      // Handle object responses
      if (response && Array.isArray(response.teachers)) {
        return response.teachers;
      }
      if (response && Array.isArray(response.data)) {
        return response.data;
      }
      if (response && response.results && Array.isArray(response.results)) {
        return response.results;
      }
      // Default to empty array if structure is unknown
      return [];
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  }
}

export default new ClassService();

