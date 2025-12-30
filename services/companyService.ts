import ApiService from './ApiService';

export interface ContactPerson {
  name?: string;
  email?: string;
  mobileNumber?: string;
  designation?: string;
}

export interface Company {
  id?: string;
  _id?: string;
  companyId: string;
  companyName?: string;
  companyLogo?: string;
  email?: string;
  domain?: string;
  numberOfEmployees?: number;
  gstNumber?: string;
  address?: string;
  city?: string;
  pincode?: string;
  country?: string;
  contactPerson1?: ContactPerson;
  contactPerson2?: ContactPerson;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyRequest {
  companyName?: string;
  companyLogo?: string;
  email?: string;
  domain?: string;
  numberOfEmployees?: number;
  gstNumber?: string;
  address?: string;
  city?: string;
  pincode?: string;
  country?: string;
  contactPerson1?: ContactPerson;
  contactPerson2?: ContactPerson;
  status?: boolean;
}

export interface UpdateCompanyRequest {
  companyName?: string;
  companyLogo?: string;
  email?: string;
  domain?: string;
  numberOfEmployees?: number;
  gstNumber?: string;
  address?: string;
  city?: string;
  pincode?: string;
  country?: string;
  contactPerson1?: ContactPerson;
  contactPerson2?: ContactPerson;
  status?: boolean;
}

export interface GetCompaniesParams {
  companyName?: string;
  email?: string;
  domain?: string;
  status?: boolean;
  companyId?: string;
  sortBy?: string;
  limit?: number;
  page?: number;
}

export interface CompaniesResponse {
  results: Company[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

class CompanyService {
  /**
   * Get all companies with optional filters
   */
  async getCompanies(params: GetCompaniesParams = {}): Promise<CompaniesResponse> {
    try {
      const response = await ApiService.get('/companies', params);

      // Normalize id field - convert 'id' to '_id' for consistency
      if (response.results && Array.isArray(response.results)) {
        response.results = response.results.map((company: Company) => {
          if (company.id && !company._id) {
            return { ...company, _id: company.id };
          }
          return company;
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
      console.error('❌ Get companies error:', error);
      throw error;
    }
  }

  /**
   * Get company by MongoDB ID
   */
  async getCompanyById(companyId: string): Promise<Company> {
    try {
      const response = await ApiService.get(`/companies/${companyId}`);
      // Normalize id field
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Get company by ID error:', error);
      throw error;
    }
  }

  /**
   * Get company by companyId (unique identifier)
   */
  async getCompanyByCompanyId(companyId: string): Promise<Company> {
    try {
      const response = await ApiService.get(`/companies/company-id/${companyId}`);
      // Normalize id field
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Get company by companyId error:', error);
      throw error;
    }
  }

  /**
   * Check if company exists by companyId
   */
  async checkCompanyExists(companyId: string): Promise<boolean> {
    try {
      const response = await ApiService.get(`/companies/check/${companyId}`);
      return response.exists === true;
    } catch (error) {
      console.error('❌ Check company exists error:', error);
      throw error;
    }
  }

  /**
   * Create a new company
   */
  async createCompany(companyData: CreateCompanyRequest): Promise<Company> {
    try {
      const response = await ApiService.post('/companies', companyData);
      // Normalize id field
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Create company error:', error);
      throw error;
    }
  }

  /**
   * Update company
   */
  async updateCompany(companyId: string, companyData: UpdateCompanyRequest): Promise<Company> {
    try {
      const response = await ApiService.patch(`/companies/${companyId}`, companyData);
      // Normalize id field
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Update company error:', error);
      throw error;
    }
  }

  /**
   * Delete company
   */
  async deleteCompany(companyId: string): Promise<void> {
    try {
      await ApiService.delete(`/companies/${companyId}`);
    } catch (error) {
      console.error('❌ Delete company error:', error);
      throw error;
    }
  }

  /**
   * Get company profile (for authenticated company)
   */
  async getCompanyProfile(): Promise<Company> {
    try {
      const response = await ApiService.get('/companies/profile');
      // Normalize id field
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Get company profile error:', error);
      throw error;
    }
  }

  /**
   * Update company profile (for authenticated company)
   */
  async updateCompanyProfile(companyData: UpdateCompanyRequest): Promise<Company> {
    try {
      const response = await ApiService.patch('/companies/profile', companyData);
      // Normalize id field
      if (response.id && !response._id) {
        return { ...response, _id: response.id };
      }
      return response;
    } catch (error) {
      console.error('❌ Update company profile error:', error);
      throw error;
    }
  }
  /**
   * Send login OTP
   * Endpoint: POST /v1/companies/login/send-otp
   */
  async sendLoginOtp(email: string): Promise<any> {
    try {
      const response = await ApiService.post('/companies/login/send-otp', { email });
      return response;
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      throw error;
    }
  }

  /**
   * Verify login OTP
   * Endpoint: POST /v1/companies/login/verify-otp
   * Response: { company: {...}, tokens: { access: {...}, refresh: {...} } }
   */
  async verifyLoginOtp(email: string, otp: string): Promise<any> {
    try {
      const response = await ApiService.post('/companies/login/verify-otp', { email, otp });
      // If response contains token, save it
      if (response.tokens?.access?.token) {
        await ApiService.setAuthToken(response.tokens.access.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('Auth', 'true');
          if (response.tokens.refresh?.token) {
            localStorage.setItem('refreshToken', response.tokens.refresh.token);
          }
        }
        // Save company data (response contains 'company' not 'user')
        if (response.company) {
          await ApiService.setUser(response.company);
        }
      }
      return response;
    } catch (error) {
      console.error('❌ Verify OTP error:', error);
      throw error;
    }
  }
}

export default new CompanyService();

