import axios from 'axios';
import { Base_url } from '../Config/BaseUrl';

class ApiService {
  private baseURL: string;
  private axiosInstance: ReturnType<typeof axios.create>;

  constructor() {
    this.baseURL = Base_url;

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const token = await this.getAuthToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔐 Added auth token to request:', config.url);
          } else {
            console.log('⚠️ No auth token available for request:', config.url);
          }
        } catch (error) {
          console.error('Error adding auth token to request:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
      
    );

    // Response interceptor to handle common errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            await this.removeAuthToken();
            console.log('Unauthorized access. Please login again.');
            if (
              typeof window !== 'undefined' &&
              window.location.pathname.startsWith('/company/dashboard')
            ) {
              const next = encodeURIComponent(
                window.location.pathname + window.location.search
              );
              window.location.assign(`/company/login?next=${next}`);
            }
          } catch (tokenError) {
            console.error('Error removing auth token:', tokenError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Check if we're in browser environment
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // Get auth token from storage - using localStorage for Next.js
  async getAuthToken(): Promise<string | null> {
    try {
      if (!this.isBrowser()) {
        return null;
      }
      const token = localStorage.getItem('token');
      console.log('🔑 Retrieved token from storage:', token ? 'Token exists' : 'No token found');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Set auth token in storage - using localStorage for Next.js
  async setAuthToken(token: string): Promise<void> {
    try {
      if (!this.isBrowser()) {
        throw new Error('localStorage is not available in server-side context');
      }
      localStorage.setItem('token', token);
    } catch (error) {
      console.error('Error setting auth token:', error);
      throw new Error('Failed to save authentication token');
    }
  }

  // Remove auth token from storage - using localStorage for Next.js
  async removeAuthToken(): Promise<void> {
    try {
      if (!this.isBrowser()) {
        return;
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('Auth');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Error removing auth token:', error);
      throw new Error('Failed to remove authentication token');
    }
  }

  // Get user data from storage
  async getUser(): Promise<any | null> {
    try {
      if (!this.isBrowser()) {
        return null;
      }
      const userString = localStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Set user data in storage
  async setUser(user: any): Promise<void> {
    try {
      if (!this.isBrowser()) {
        throw new Error('localStorage is not available in server-side context');
      }
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user data:', error);
      throw new Error('Failed to save user data');
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      if (!this.isBrowser()) {
        return false;
      }
      const auth = localStorage.getItem('Auth');
      const token = localStorage.getItem('token');
      
      // Check both auth status and token existence
      return auth === 'true' && token !== null;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  // Generic request method with error handling
  private async request(config: any): Promise<any> {
    try {
      console.log("Making request with config:", config);
      const response = await this.axiosInstance(config);
      console.log("Axios response:", response);
      console.log("Response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Request error:", error);
      this.handleError(error);
      throw error;
    }
  }

  // Handle different types of errors
  private handleError(error: any): void {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error(`HTTP Error ${status}:`, data);
      
      switch (status) {
        case 400:
          throw new Error(data.message || 'Bad request. Please check your input.');
        case 401:
          throw new Error('Unauthorized access. Please login again.');
        case 403:
          throw new Error(data.message || 'Access forbidden. You don\'t have permission for this action.');
        case 404:
          throw new Error('Resource not found.');
        case 422:
          throw new Error(data.message || 'Validation error. Please check your input.');
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(data.message || `Request failed with status ${status}`);
      }
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.request);
      throw new Error('Network error. Please check your internet connection.');
    } else {
      // Other error
      console.error('Request Error:', error.message);
      throw new Error(error.message || 'An unexpected error occurred.');
    }
  }

  // GET request
  async get(endpoint: string, params: Record<string, any> = {}, forceRefresh: boolean = false): Promise<any> {
    try {
      console.log(`=== API SERVICE GET: ${endpoint} ===`);
      console.log("Params:", params);
      console.log("Force Refresh:", forceRefresh);
      
      // Prepare request config
      const requestConfig: any = {
        method: 'GET',
        url: endpoint,
        params,
      };
      
      // Add cache-control headers to force refresh if needed
      if (forceRefresh) {
        requestConfig.headers = {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        };
        // Also add timestamp to params to bypass any query param caching
        requestConfig.params = { ...params, _t: Date.now() };
      }
      
      console.log("Full URL:", `${this.baseURL}${endpoint}`);
      const response = await this.request(requestConfig);
      console.log(`=== API SERVICE GET RESPONSE: ${endpoint} ===`);
      console.log("Response:", response);
      return response;
    } catch (error) {
      console.error(`=== API SERVICE GET ERROR: ${endpoint} ===`);
      console.error("Error:", error);
      throw error;
    }
  }

  // POST request
  async post(endpoint: string, data: Record<string, any> = {}): Promise<any> {
    try {
      console.log(`=== API SERVICE POST: ${endpoint} ===`);
      console.log("Request data:", data);
      console.log("Full URL:", `${this.baseURL}${endpoint}`);
      
      const response = await this.request({
        method: 'POST',
        url: endpoint,
        data,
      });
      
      console.log(`=== API SERVICE POST RESPONSE: ${endpoint} ===`);
      console.log("Response:", response);
      return response;
    } catch (error) {
      console.error(`=== API SERVICE POST ERROR: ${endpoint} ===`);
      console.error("Error:", error);
      throw error;
    }
  }

  // PUT request
  async put(endpoint: string, data: Record<string, any> = {}): Promise<any> {
    try {
      return await this.request({
        method: 'PUT',
        url: endpoint,
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  // PATCH request
  async patch(endpoint: string, data: Record<string, any> = {}): Promise<any> {
    try {
      return await this.request({
        method: 'PATCH',
        url: endpoint,
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  // DELETE request
  async delete(endpoint: string, data: Record<string, any> = {}): Promise<any> {
    try {
      const config: any = {
        method: 'DELETE',
        url: endpoint,
      };
      
      if (Object.keys(data).length > 0) {
        config.data = data;
      }
      
      return await this.request(config);
    } catch (error) {
      throw error;
    }
  }

  // Upload file method
  async uploadFile(endpoint: string, formData: FormData, onProgress?: (progressEvent: any) => void): Promise<any> {
    try {
      return await this.request({
        method: 'POST',
        url: endpoint,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress,
      });
    } catch (error) {
      throw error;
    }
  }

  // Download file method
  async downloadFile(endpoint: string, params: Record<string, any> = {}): Promise<Blob> {
    try {
      const response = await this.axiosInstance({
        method: 'GET',
        url: endpoint,
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
}

export default new ApiService();

