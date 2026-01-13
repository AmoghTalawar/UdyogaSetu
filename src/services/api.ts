// Frontend API Client for Backend Microservice
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface Job {
  id: string;
  title: string;
  description: string;
  company_id: string;
  location: string;
  job_type: string;
  experience_level: string;
  salary_min: number | null;
  salary_max: number | null;
  skills_required: string[];
  status: string;
  created_at: string;
}

interface JobApplication {
  id: string;
  job_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  resume_url: string;
  cover_letter: string | null;
  status: string;
  application_method: string;
  language: string;
  created_at: string;
}

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  logo_url: string | null;
  description: string | null;
  website: string | null;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Request failed' };
      }

      return { success: true, data };
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Jobs API
  async getJobs(params?: {
    search?: string;
    location?: string;
    job_type?: string;
    experience_level?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Job>>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return this.request(`/api/jobs${query ? `?${query}` : ''}`);
  }

  async getJob(id: string): Promise<ApiResponse<Job>> {
    return this.request(`/api/jobs/${id}`);
  }

  async createJob(jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    return this.request('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(id: string, jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    return this.request(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteJob(id: string): Promise<ApiResponse<void>> {
    return this.request(`/api/jobs/${id}`, { method: 'DELETE' });
  }

  // Applications API
  async getApplications(params?: {
    job_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<JobApplication>>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return this.request(`/api/applications${query ? `?${query}` : ''}`);
  }

  async getApplication(id: string): Promise<ApiResponse<JobApplication>> {
    return this.request(`/api/applications/${id}`);
  }

  async createApplication(
    applicationData: Partial<JobApplication>
  ): Promise<ApiResponse<JobApplication>> {
    return this.request('/api/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async updateApplicationStatus(
    id: string,
    status: string
  ): Promise<ApiResponse<JobApplication>> {
    return this.request(`/api/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteApplication(id: string): Promise<ApiResponse<void>> {
    return this.request(`/api/applications/${id}`, { method: 'DELETE' });
  }

  // Companies API
  async getCompanies(
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Company>>> {
    return this.request(`/api/companies?page=${page}&limit=${limit}`);
  }

  async getCompany(id: string): Promise<ApiResponse<Company>> {
    return this.request(`/api/companies/${id}`);
  }

  async createCompany(
    companyData: Partial<Company>
  ): Promise<ApiResponse<Company>> {
    return this.request('/api/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  async updateCompany(
    id: string,
    companyData: Partial<Company>
  ): Promise<ApiResponse<Company>> {
    return this.request(`/api/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;
