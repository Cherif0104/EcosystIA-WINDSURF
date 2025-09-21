/**
 * Services API centralisés pour EcosystIA
 * Point d'entrée unique pour toutes les APIs
 */

import apiClient from './api';
import authService from './authService';
import projectsService from './projectsService';
import coursesService from './coursesService';
import crmService from './crmService';
import financeService from './financeService';
import timeTrackingService from './timeTrackingService';

// Service Goals
export const goalsService = {
  async getGoals(params?: any) {
    const response = await apiClient.get('/goals/', { params });
    return response.data;
  },
  
  async createGoal(data: any) {
    const response = await apiClient.post('/goals/', data);
    return response.data;
  },
  
  async updateGoalProgress(goalId: number, progress: number, comment?: string) {
    const response = await apiClient.post(`/goals/${goalId}/progress/`, {
      progress,
      comment
    });
    return response.data;
  },
  
  async getStats() {
    const response = await apiClient.get('/goals/stats/');
    return response.data;
  },
  
  async getDashboard() {
    const response = await apiClient.get('/goals/dashboard/');
    return response.data;
  },
};

// Service Analytics
export const analyticsService = {
  async getGlobalDashboard() {
    const response = await apiClient.get('/analytics/dashboard/');
    return response.data;
  },
  
  async getUserAnalytics() {
    const response = await apiClient.get('/analytics/users/');
    return response.data;
  },
  
  async getPerformanceMetrics() {
    const response = await apiClient.get('/analytics/performance/');
    return response.data;
  },
  
  async getRealTimeMetrics() {
    const response = await apiClient.get('/analytics/real-time/');
    return response.data;
  },
  
  async generateCustomReport(reportData: {
    report_name: string;
    modules: string[];
    date_range: { start_date: string; end_date: string };
    filters?: any;
    export_format?: string;
  }) {
    const response = await apiClient.post('/analytics/reports/custom/', reportData);
    return response.data;
  },
};

// Service Knowledge Base
export const knowledgeService = {
  async getCategories() {
    const response = await apiClient.get('/knowledge/categories/');
    return response.data;
  },
  
  async getArticles(params?: any) {
    const response = await apiClient.get('/knowledge/articles/', { params });
    return response.data;
  },
  
  async getArticle(id: number) {
    const response = await apiClient.get(`/knowledge/articles/${id}/`);
    return response.data;
  },
  
  async getFAQs() {
    const response = await apiClient.get('/knowledge/faqs/');
    return response.data;
  },
  
  async searchKnowledge(query: string) {
    const response = await apiClient.post('/knowledge/search/', { query });
    return response.data;
  },
};

// Service Jobs
export const jobsService = {
  async getJobs(params?: any) {
    const response = await apiClient.get('/jobs/', { params });
    return response.data;
  },
  
  async getJob(id: number) {
    const response = await apiClient.get(`/jobs/${id}/`);
    return response.data;
  },
  
  async createJob(data: any) {
    const response = await apiClient.post('/jobs/', data);
    return response.data;
  },
  
  async applyToJob(jobId: number, applicationData: any) {
    const response = await apiClient.post(`/jobs/${jobId}/apply/`, applicationData);
    return response.data;
  },
  
  async getMyApplications() {
    const response = await apiClient.get('/jobs/applications/');
    return response.data;
  },
};

// Service AI
export const aiService = {
  async createChatSession(contextType: string, contextId?: number) {
    const response = await apiClient.post('/ai/chat/', {
      context_type: contextType,
      context_id: contextId
    });
    return response.data;
  },
  
  async sendMessage(sessionId: number, message: string) {
    const response = await apiClient.post(`/ai/chat/${sessionId}/message/`, {
      content: message
    });
    return response.data;
  },
  
  async getChatHistory(sessionId: number) {
    const response = await apiClient.get(`/ai/chat/${sessionId}/messages/`);
    return response.data;
  },
  
  async getUsageStats() {
    const response = await apiClient.get('/ai/usage/');
    return response.data;
  },
};

// Export de tous les services
export {
  apiClient,
  authService,
  projectsService,
  coursesService,
  crmService,
  financeService,
  timeTrackingService,
  goalsService,
  analyticsService,
  knowledgeService,
  jobsService,
  aiService,
};

// Service par défaut pour l'import global
export default {
  auth: authService,
  projects: projectsService,
  courses: coursesService,
  crm: crmService,
  finance: financeService,
  timeTracking: timeTrackingService,
  goals: goalsService,
  analytics: analyticsService,
  knowledge: knowledgeService,
  jobs: jobsService,
  ai: aiService,
};
