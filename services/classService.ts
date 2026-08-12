import ApiService from './ApiService';
import { Base_url } from '../Config/BaseUrl';

export interface Schedule {
  date?: string;
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
  zoomAccountUsed?: string;
  zoomJoinUrl?: string;
  zoomStartUrl?: string;
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
  latitude?: number;
  longitude?: number;
  students?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Returns true when the class has a live Zoom meeting id.
 * @param classItem - Class record to inspect
 */
export function hasActiveMeeting(classItem: Pick<Class, 'meeting_number'>): boolean {
  return Boolean(classItem.meeting_number && String(classItem.meeting_number).trim() !== '');
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
  latitude?: number;
  longitude?: number;
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
   * Delete a class (backend ends Zoom first when a live meeting exists).
   * @param classId - Class document id
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
   * Start a Zoom meeting for a class.
   * @param classId - Class document id
   */
  async startClass(classId: string): Promise<any> {
    try {
      const response = await ApiService.post(`/classes/start-meeting/${classId}`);
      return response;
    } catch (error: any) {
      console.error('Error starting class:', error);
      throw error;
    }
  }

  /**
   * End a Zoom meeting for a class.
   * @param classId - Class document id
   * @param data - Optional legacy payload (ignored by backend)
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
   * Build the legacy Meeting SDK join page URL (mobile/web embeds).
   * Prefer getBrowserJoinUrl for CRM admin joins.
   * @param classId - Class document id
   * @param userName - Display name in Zoom
   * @param role - Zoom SDK role (1 = host, 0 = attendee)
   */
  getJoinMeetingUrl(classId: string, userName = 'Admin', role = 0): string {
    const params = new URLSearchParams({
      classId,
      userName,
      role: String(role),
    });
    return `${Base_url}/zoom/join-meeting?${params.toString()}`;
  }

  /**
   * CRM admin/trainer join as Zoom host via Meeting SDK (desktop browser tab).
   * Always uses role=1 + forceHost — does not fall back to attendee WC.
   * @param classId - Class document id
   * @param asHost - When true, request host SDK join (default true for CRM)
   * @param userName - Display name in meeting
   */
  async getBrowserJoinUrl(classId: string, asHost = true, userName = 'Admin'): Promise<string> {
    try {
      const response = await ApiService.get('/zoom/getMeetingDetails', {
        classId,
        asHost: asHost ? '1' : '0',
      });
      const data = response?.data || response;

      if (asHost) {
        const sdkParams = new URLSearchParams({
          role: '1',
          forceHost: '1',
          userName,
        });
        sdkParams.set('classId', classId);
        if (data?.meetingNumber) sdkParams.set('meetingNumber', String(data.meetingNumber));
        if (data?.password) sdkParams.set('password', String(data.password));
        if (data?.accountId) sdkParams.set('accountId', String(data.accountId));
        // Zoom SDK leaveUrl — back to CRM classes, not consumer Amplify
        const crmOrigin =
          typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        sdkParams.set('leaveUrl', `${crmOrigin}/apps/crm/classes/`);

        // Prefer server sdk path if present, but always force host flags for CRM
        return `${Base_url}/zoom/join-meeting?${sdkParams.toString()}`;
      }

      const joinUrl = data?.joinUrl as string | undefined;
      if (joinUrl) {
        const match = joinUrl.match(/^(https?:\/\/[^/]+)\/j\/(\d+)(\?[\s\S]*)?$/i);
        if (match) {
          return `${match[1]}/wc/join/${match[2]}${match[3] || ''}`;
        }
        if (/\/wc\/join\//i.test(joinUrl)) {
          return joinUrl;
        }
        return joinUrl;
      }
      if (data?.meetingNumber) {
        const pwd = data.password ? `?pwd=${encodeURIComponent(data.password)}` : '';
        return `https://zoom.us/wc/join/${data.meetingNumber}${pwd}`;
      }
      throw new Error('No meeting join URL available for this class');
    } catch (error: any) {
      console.error('Error fetching browser join URL:', error);
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

