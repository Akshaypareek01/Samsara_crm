import ApiService from './ApiService';

interface AdminLoginRequest {
  email: string;
  password: string;
}

interface AdminData {
  status: boolean;
  name: string;
  username: string;
  email: string;
  password: string;
  id: string;
}

interface TokenData {
  token: string;
  expires: string;
}

interface AdminLoginResponse {
  admin: AdminData;
  tokens: {
    access: TokenData;
    refresh: TokenData;
  };
}

class AdminService {
  /**
   * Admin login
   * @param email - Admin email
   * @param password - Admin password
   * @returns Promise with login response containing token
   */
  async login(email: string, password: string): Promise<AdminLoginResponse> {
    try {
      const response = await ApiService.post('/admin/login', {
        email,
        password,
      }) as AdminLoginResponse;

      // Extract access token from nested structure
      const accessToken = response?.tokens?.access?.token;
      
      if (accessToken) {
        // Save access token to localStorage
        await ApiService.setAuthToken(accessToken);
        
        // Set auth status
        if (typeof window !== 'undefined') {
          localStorage.setItem('Auth', 'true');
          // Optionally save refresh token
          if (response.tokens?.refresh?.token) {
            localStorage.setItem('refreshToken', response.tokens.refresh.token);
          }
        }
        
        // Save admin data
        if (response.admin) {
          await ApiService.setUser(response.admin);
        }

        console.log('✅ Admin login successful');
        return response;
      }

      throw new Error('No access token received from server');
    } catch (error: any) {
      console.error('❌ Admin login error:', error);
      throw error;
    }
  }

  /**
   * Admin logout
   */
  async logout(): Promise<void> {
    try {
      await ApiService.removeAuthToken();
      // Also remove refresh token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refreshToken');
      }
      console.log('✅ Admin logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  }

  /**
   * Check if admin is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return await ApiService.isAuthenticated();
  }
}

export default new AdminService();

