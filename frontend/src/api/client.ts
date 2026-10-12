import {
  AuthResponse, User, Profile, Resume, ResumeAnalysis,
  CareerRole, CareerRecommendation, RoleGapAnalysis,
  JobListing, JobMatch, SavedJob, LearningRoadmap, DashboardSummary
} from '../types';

const API_BASE = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('careercompass_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.detail || response.statusText || 'Request failed';
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: { email: string; password: string; full_name: string }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  getCurrentUser: () => request<User>('/auth/me'),

  // Profile & Onboarding
  getProfile: () => request<Profile>('/users/profile'),

  updateProfile: (profile: Partial<Profile>) =>
    request<Profile>('/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    }),

  submitOnboarding: (data: Partial<Profile>) =>
    request<User>('/users/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  deleteAccount: () =>
    request<void>('/users/account', {
      method: 'DELETE',
    }),

  // Resumes
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<Resume>('/resumes/upload', {
      method: 'POST',
      body: formData,
    });
  },

  listResumes: () => request<Resume[]>('/resumes'),

  getResume: (resumeId: number) => request<Resume>(`/resumes/${resumeId}`),

  updateResumeAnalysis: (resumeId: number, update: Partial<ResumeAnalysis>) =>
    request<ResumeAnalysis>(`/resumes/${resumeId}/analysis`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    }),

  deleteResume: (resumeId: number) =>
    request<void>(`/resumes/${resumeId}`, {
      method: 'DELETE',
    }),

  // Careers
  listRoles: (search?: string, domain?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (domain) params.append('domain', domain);
    const q = params.toString() ? `?${params.toString()}` : '';
    return request<CareerRole[]>(`/careers/roles${q}`);
  },

  getRole: (roleId: number) => request<CareerRole>(`/careers/roles/${roleId}`),

  getRecommendations: (limit = 6) =>
    request<CareerRecommendation[]>(`/careers/recommendations?limit=${limit}`),

  getGapAnalysis: (roleId: number) =>
    request<RoleGapAnalysis>(`/careers/gap-analysis/${roleId}`),

  // Jobs
  listJobs: (search?: string, domain?: string, jobType?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (domain) params.append('domain', domain);
    if (jobType) params.append('job_type', jobType);
    const q = params.toString() ? `?${params.toString()}` : '';
    return request<JobListing[]>(`/jobs${q}`);
  },

  matchJob: (jobId: number) => request<JobMatch>(`/jobs/${jobId}/match`),

  matchCustomJD: (payload: { job_title?: string; company_name?: string; job_description: string }) =>
    request<JobMatch>('/jobs/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  getSavedJobs: () => request<SavedJob[]>('/jobs/saved'),

  saveJob: (jobId: number, status = 'saved', notes?: string) =>
    request<SavedJob>(`/jobs/${jobId}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    }),

  updateSavedJobStatus: (savedId: number, status: string, notes?: string) => {
    const params = new URLSearchParams({ status });
    if (notes) params.append('notes', notes);
    return request<SavedJob>(`/jobs/saved/${savedId}?${params.toString()}`, {
      method: 'PATCH',
    });
  },

  deleteSavedJob: (savedId: number) =>
    request<void>(`/jobs/saved/${savedId}`, {
      method: 'DELETE',
    }),

  // Learning Roadmaps
  generateRoadmap: (payload: { role_id?: number; target_role?: string; pace?: string }) =>
    request<LearningRoadmap>('/learning/roadmaps/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  listRoadmaps: () => request<LearningRoadmap[]>('/learning/roadmaps'),

  getRoadmap: (roadmapId: number) => request<LearningRoadmap>(`/learning/roadmaps/${roadmapId}`),

  toggleStep: (stepId: number) =>
    request<{ step_id: number; is_completed: boolean; roadmap_progress_percentage: number }>(
      `/learning/steps/${stepId}/toggle`,
      { method: 'PATCH' }
    ),

  deleteRoadmap: (roadmapId: number) =>
    request<void>(`/learning/roadmaps/${roadmapId}`, {
      method: 'DELETE',
    }),

  // Dashboard
  getDashboardSummary: () => request<DashboardSummary>('/dashboard/summary'),

  // Admin
  getAdminMetrics: () => request<any>('/admin/metrics'),
  getJobStatus: () => request<any>('/admin/jobs/status'),
  seedAdminData: () => request<any>('/admin/seed-data', { method: 'POST' }),
};
