import ApiService from './ApiService';

export interface User {
  _id?: string;
  id?: string; // API returns 'id' field
  name: string;
  email: string;
  role: 'user' | 'teacher' | 'admin';
  mobile?: string;
  gender?: string;
  dob?: string;
  age?: string;
  Address?: string;
  city?: string;
  pincode?: string;
  country?: string;
  height?: string;
  weight?: string;
  targetWeight?: string;
  bodyshape?: string;
  weeklyyogaplan?: string;
  practicetime?: string;
  focusarea?: string[];
  goal?: string[];
  health_issues?: string[];
  howyouknowus?: string;
  PriorExperience?: string;
  description?: string;
  achievements?: string[];
  userCategory?: 'Personal' | 'Corporate';
  teacherCategory?: string;
  teachingExperience?: string;
  expertise?: string[];
  qualification?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  additional_courses?: Array<{
    course: string;
    institution: string;
    year: string;
  }>;
  company_name?: string | {
    _id?: string;
    companyName?: string;
    companyId?: string;
  };
  companyId?: string;
  corporate_id?: string;
  profileImage?: string;
  isActive?: boolean;
  active?: boolean; // API returns 'active' field
  status?: boolean; // API returns 'status' field
  AboutMe?: string;
  notificationToken?: string;
  favoriteClasses?: string[];
  favoriteEvents?: string[];
  favoriteTeachers?: string[];
  notificationPreferences?: any;
  attendance?: any[];
  classFeedback?: any[];
  images?: any[];
  assessments?: any[];
  metadata?: {
    trialPlanAssignedAt?: string;
    trialPlanUsed?: boolean;
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'teacher';
  [key: string]: any;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  [key: string]: any;
}

export interface GetUsersParams {
  role?: 'user' | 'teacher';
  sortBy?: string;
  limit?: number;
  page?: number;
  search?: string;
  userCategory?: 'Personal' | 'Corporate';
  companyId?: string;
  companyName?: string;
  corporate_id?: string;
  mobile?: string;
  city?: string;
  status?: 'true' | 'false' | boolean;
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class UserService {
  /**
   * Get all users with optional filters
   */
  async getUsers(params: GetUsersParams = {}): Promise<UsersResponse> {
    try {
      const response = await ApiService.get('/users', params);
      
      // Handle API response format: { results: [...], total?, page?, limit?, totalPages? }
      let usersArray: User[] = [];
      let total = 0;
      let page = params.page || 1;
      let limit = params.limit || 10;
      let totalPages = 1;

      if (Array.isArray(response)) {
        // Direct array response
        usersArray = response;
        total = response.length;
        totalPages = Math.ceil(response.length / limit);
      } else if (response && typeof response === 'object') {
        // Handle { results: [...] } format
        if (Array.isArray(response.results)) {
          usersArray = response.results;
          // Use total if it exists (even if 0), otherwise fall back to results.length
          total = (response.total !== undefined && response.total !== null) 
            ? response.total 
            : response.results.length;
          page = response.page || page;
          limit = response.limit || limit;
          totalPages = response.totalPages || Math.ceil(total / limit);
        } else if (Array.isArray(response.data)) {
          // Handle { data: [...] } format
          usersArray = response.data;
          // Use total if it exists (even if 0), otherwise fall back to data.length
          // This ensures we get the total count across all pages, not just current page
          total = (response.total !== undefined && response.total !== null) 
            ? response.total 
            : response.data.length;
          page = response.page || page;
          limit = response.limit || limit;
          totalPages = response.totalPages || Math.ceil(total / limit);
        }
      }

      // Normalize id field - convert 'id' to '_id' for consistency
      usersArray = usersArray.map((user) => {
        if (user.id && !user._id) {
          return { ...user, _id: user.id };
        }
        return user;
      });

      return {
        data: usersArray,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('❌ Get users error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await ApiService.get(`/users/${userId}`);
      // Normalize id field
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Get user by ID error:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await ApiService.post('/users', userData);
      // Normalize id field
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Create user error:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await ApiService.patch(`/users/${userId}`, userData);
      // Normalize id field
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Update user error:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await ApiService.delete(`/users/${userId}`);
    } catch (error) {
      console.error('❌ Delete user error:', error);
      throw error;
    }
  }

  /**
   * Bulk delete users (admin CRM).
   *
   * @param userIds - MongoDB user ids to delete.
   */
  async bulkDeleteUsers(userIds: string[]): Promise<{ deleted: number; failed: Array<{ userId: string; message: string }> }> {
    try {
      return await ApiService.post('/users/bulk-delete', { userIds });
    } catch (error) {
      console.error('❌ Bulk delete users error:', error);
      throw error;
    }
  }

  /**
   * Get all users (role: user)
   */
  async getAllUsers(params: Omit<GetUsersParams, 'role'> = {}): Promise<UsersResponse> {
    return this.getUsers({ ...params, role: 'user' });
  }

  /**
   * Get all teachers (role: teacher)
   */
  async getAllTeachers(params: Omit<GetUsersParams, 'role'> = {}): Promise<UsersResponse> {
    return this.getUsers({ ...params, role: 'teacher' });
  }
}

export default new UserService();
