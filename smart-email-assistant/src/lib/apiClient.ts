import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'http://localhost:8081';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ProviderRequest {
  provider: string;
}


// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Auth API
// apiClient.ts

export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post('/api/auth/login', { username, password }),   // ✅ username

  register: (username: string, email: string, password: string) =>
    apiClient.post('/api/auth/register', { username, email, password }), // ✅ matches RegisterRequest
};


// Email API
export interface GenerateEmailRequest {
  emailContent: string;
  tone: string;
  promptVersion: string;
  provider?: string;
  mode?: string;
}

export interface ThreadReplyRequest {
  previousEmails: string[];
  emailContent: string;
  tone?: string;
}

export interface ScoreQualityRequest {
  emailContent: string;
}

export interface DetectRiskRequest {
  emailContent: string;
}

export const emailApi = {
  generate: (data: GenerateEmailRequest) =>
    apiClient.post('/api/email/generate', data),
  threadReply: (data: ThreadReplyRequest) =>
    apiClient.post('/api/email/thread-reply', data),
  getHistory: () =>
    apiClient.get('/api/email/history'),
  getAnalytics: () =>
    apiClient.get('/api/email/analytics'),
  scoreQuality: (data: ScoreQualityRequest) =>
    apiClient.post('/api/email/score-quality', data),
  detectRisk: (data: DetectRiskRequest) =>
    apiClient.post('/api/email/detect-risk', data),
    detectIntent: (data: { emailContent: string }) => 
    apiClient.post('/api/email/detect-intent', data),
  generateSubject: (data: { emailContent: string }) => 
    apiClient.post('/api/email/subject', data),
  summarize: (data: { emailContent: string }) => 
    apiClient.post('/api/email/summarize', data),
  generateFollowUp: (data: { emailContent: string; days?: number }) => 
    apiClient.post('/api/email/follow-up', data),
  getHistoryByIntent: (intent: string) => 
    apiClient.get(`/api/email/history/intent/${intent}`),
sendEmail: (data: SendEmailRequest) => apiClient.post('/api/email/send-email', data),
// src/lib/apiClient.ts - ADD THIS
getUserDashboard: () => apiClient.get('/api/user/dashboard'),
switchProvider: (data: ProviderRequest) => apiClient.put('/api/user/ai-provider', data),

};
