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
  /**
   * Aggregated dashboard metrics for authenticated company (from bookings).
   * GET /v1/companies/dashboard/overview
   */
  async getDashboardOverview(
    period?: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'
  ): Promise<Record<string, unknown>> {
    try {
      return await ApiService.get('/companies/dashboard/overview', period ? { period } : undefined);
    } catch (error) {
      console.error('❌ Get company dashboard overview error:', error);
      throw error;
    }
  }

  /**
   * Full programs + reports bundle (company JWT).
   * GET /v1/companies/insights
   */
  async getInsights(): Promise<Record<string, unknown>> {
    try {
      return await ApiService.get('/companies/insights');
    } catch (error) {
      console.error('❌ Get company insights error:', error);
      throw error;
    }
  }

  /**
   * Portal employee list (company JWT). Same row shape as insights employee-scores.
   */
  async listPortalEmployees(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    department?: string;
  } = {}): Promise<{
    total: number;
    employees: unknown[];
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      return await ApiService.get('/companies/employees', params);
    } catch (error) {
      console.error('❌ List portal employees error:', error);
      throw error;
    }
  }

  /**
   * Create employee for logged-in company (JWT).
   */
  async createPortalEmployee(body: {
    fullName: string;
    email: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    status?: boolean;
    department?: string;
  }): Promise<Record<string, unknown>> {
    try {
      return await ApiService.post('/companies/employees', body);
    } catch (error) {
      console.error('❌ Create portal employee error:', error);
      throw error;
    }
  }

  /**
   * Update employee by id (company JWT).
   */
  async updatePortalEmployee(
    employeeId: string,
    body: {
      fullName?: string;
      email?: string;
      level?: 'beginner' | 'intermediate' | 'advanced';
      status?: boolean;
      department?: string;
    }
  ): Promise<Record<string, unknown>> {
    try {
      return await ApiService.patch(`/companies/employees/${employeeId}`, body);
    } catch (error) {
      console.error('❌ Update portal employee error:', error);
      throw error;
    }
  }

  /**
   * Soft-delete employee (optional JSON body with `reason`).
   */
  async deletePortalEmployee(employeeId: string, body: { reason?: string } = {}): Promise<void> {
    try {
      await ApiService.delete(`/companies/employees/${employeeId}`, body);
    } catch (error) {
      console.error('❌ Delete portal employee error:', error);
      throw error;
    }
  }

  /**
   * Paginated deletion history (soft-deleted employees).
   */
  async listPortalDeletionHistory(params: { page?: number; limit?: number } = {}): Promise<{
    total: number;
    rows: Array<{
      employeeName: string;
      email?: string;
      deletedBy: string;
      deletionDateTime: string;
      reason: string;
    }>;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      return await ApiService.get('/companies/employees/deletion-history', params);
    } catch (error) {
      console.error('❌ Deletion history error:', error);
      throw error;
    }
  }

  /**
   * Download CSV export (bookings or employees) for the authenticated company.
   */
  async downloadCompanyReportsExport(type: 'bookings' | 'employees'): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Export is only available in the browser');
    }
    try {
      const blob = await ApiService.downloadFile('/companies/reports/export', { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `company-export-${type}.csv`;
      a.rel = 'noopener';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Company reports export error:', error);
      throw error;
    }
  }

  /**
   * Paginated company users as employee wellness rows (insights pipeline).
   * GET /v1/companies/insights/employee-scores
   *
   * @param params - page, limit, search
   */
  async getEmployeeWellnessScores(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    department?: string;
  } = {}): Promise<{
    total: number;
    employees: unknown[];
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      return await ApiService.get('/companies/insights/employee-scores', params);
    } catch (error) {
      console.error('❌ Get employee wellness scores error:', error);
      throw error;
    }
  }
}

export default new CompanyService();

