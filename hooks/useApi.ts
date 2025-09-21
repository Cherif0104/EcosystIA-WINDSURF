/**
 * Hooks personnalisés pour l'intégration API avec React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiServices from '../services';

// Clés de requête standardisées
export const queryKeys = {
  // Authentication
  currentUser: ['user', 'current'],
  
  // Projects
  projects: (filters?: any) => ['projects', filters],
  project: (id: number) => ['projects', id],
  projectTasks: (projectId: number, filters?: any) => ['projects', projectId, 'tasks', filters],
  myTasks: (filters?: any) => ['tasks', 'my', filters],
  projectStats: ['projects', 'stats'],
  projectDashboard: ['projects', 'dashboard'],
  
  // Courses
  courses: (filters?: any) => ['courses', filters],
  course: (id: number) => ['courses', id],
  myCourses: ['courses', 'my'],
  myEnrollments: (filters?: any) => ['courses', 'enrollments', filters],
  courseStats: ['courses', 'stats'],
  courseDashboard: ['courses', 'dashboard'],
  
  // CRM
  contacts: (filters?: any) => ['crm', 'contacts', filters],
  contact: (id: number) => ['crm', 'contacts', id],
  contactInteractions: (contactId: number) => ['crm', 'contacts', contactId, 'interactions'],
  deals: (filters?: any) => ['crm', 'deals', filters],
  crmStats: ['crm', 'stats'],
  crmDashboard: ['crm', 'dashboard'],
  
  // Finance
  invoices: (filters?: any) => ['finance', 'invoices', filters],
  invoice: (id: number) => ['finance', 'invoices', id],
  expenses: (filters?: any) => ['finance', 'expenses', filters],
  budgets: ['finance', 'budgets'],
  financeStats: (year?: number) => ['finance', 'stats', year],
  financeDashboard: ['finance', 'dashboard'],
  cashFlow: (months?: number) => ['finance', 'cash-flow', months],
  
  // Time Tracking
  timeLogs: (filters?: any) => ['time-tracking', 'logs', filters],
  activeSession: ['time-tracking', 'timer'],
  meetings: (filters?: any) => ['time-tracking', 'meetings', filters],
  timeStats: ['time-tracking', 'stats'],
  timeDashboard: ['time-tracking', 'dashboard'],
  weeklyReport: (weekStart?: string) => ['time-tracking', 'reports', 'weekly', weekStart],
  monthlyReport: (year?: number, month?: number) => ['time-tracking', 'reports', 'monthly', year, month],
  
  // Goals
  goals: (filters?: any) => ['goals', filters],
  goal: (id: number) => ['goals', id],
  myGoals: ['goals', 'my'],
  assignedGoals: ['goals', 'assigned'],
  goalsStats: ['goals', 'stats'],
  goalsDashboard: ['goals', 'dashboard'],
  
  // Analytics
  globalDashboard: ['analytics', 'dashboard'],
  userAnalytics: ['analytics', 'users'],
  performanceMetrics: ['analytics', 'performance'],
  realTimeMetrics: ['analytics', 'real-time'],
  
  // Knowledge Base
  knowledgeCategories: ['knowledge', 'categories'],
  knowledgeArticles: (filters?: any) => ['knowledge', 'articles', filters],
  knowledgeArticle: (id: number) => ['knowledge', 'articles', id],
  knowledgeFAQs: ['knowledge', 'faqs'],
  
  // Jobs
  jobs: (filters?: any) => ['jobs', filters],
  job: (id: number) => ['jobs', id],
  myJobApplications: ['jobs', 'applications'],
  
  // AI
  aiChatHistory: (sessionId: number) => ['ai', 'chat', sessionId, 'messages'],
  aiUsageStats: ['ai', 'usage'],
};

// Hooks pour Projects
export const useProjects = (filters?: any) => {
  return useQuery({
    queryKey: queryKeys.projects(filters),
    queryFn: () => apiServices.projects.getProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProject = (id: number) => {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: () => apiServices.projects.getProject(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiServices.projects.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectStats });
    },
  });
};

export const useMyTasks = (filters?: any) => {
  return useQuery({
    queryKey: queryKeys.myTasks(filters),
    queryFn: () => apiServices.projects.getMyTasks(filters),
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });
};

// Hooks pour Courses
export const useCourses = (filters?: any) => {
  return useQuery({
    queryKey: queryKeys.courses(filters),
    queryFn: () => apiServices.courses.getCourses(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes pour les cours publics
  });
};

export const useCourse = (id: number) => {
  return useQuery({
    queryKey: queryKeys.course(id),
    queryFn: () => apiServices.courses.getCourse(id),
    enabled: !!id,
  });
};

export const useEnrollCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiServices.courses.enrollCourse,
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.course(courseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.myEnrollments() });
    },
  });
};

// Hooks pour CRM
export const useContacts = (filters?: any) => {
  return useQuery({
    queryKey: queryKeys.contacts(filters),
    queryFn: () => apiServices.crm.contacts.list(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useContact = (id: number) => {
  return useQuery({
    queryKey: queryKeys.contact(id),
    queryFn: () => apiServices.crm.contacts.get(id),
    enabled: !!id,
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiServices.crm.contacts.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'contacts'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.crmStats });
    },
  });
};

// Hooks pour Finance
export const useInvoices = (filters?: any) => {
  return useQuery({
    queryKey: queryKeys.invoices(filters),
    queryFn: () => apiServices.finance.invoices.list(filters),
    staleTime: 1 * 60 * 1000, // 1 minute pour les données financières
  });
};

export const useFinanceStats = (year?: number) => {
  return useQuery({
    queryKey: queryKeys.financeStats(year),
    queryFn: () => apiServices.finance.getStats(year),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRecordPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, paymentData }: { invoiceId: number; paymentData: any }) =>
      apiServices.finance.invoices.recordPayment(invoiceId, paymentData),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(invoiceId) });
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeStats() });
    },
  });
};

// Hooks pour Time Tracking
export const useTimeLogs = (filters?: any) => {
  return useQuery({
    queryKey: queryKeys.timeLogs(filters),
    queryFn: () => apiServices.timeTracking.logs.list(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useActiveSession = () => {
  return useQuery({
    queryKey: queryKeys.activeSession,
    queryFn: () => apiServices.timeTracking.timer.getActiveSession(),
    refetchInterval: 10000, // Rafraîchir toutes les 10 secondes
    staleTime: 0, // Toujours considérer comme périmé
  });
};

export const useStartTimer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiServices.timeTracking.timer.startSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeSession });
      queryClient.invalidateQueries({ queryKey: queryKeys.timeStats });
    },
  });
};

export const useStopTimer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiServices.timeTracking.timer.stopSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeSession });
      queryClient.invalidateQueries({ queryKey: queryKeys.timeLogs() });
      queryClient.invalidateQueries({ queryKey: queryKeys.timeStats });
    },
  });
};

// Hooks pour Goals
export const useGoals = (filters?: any) => {
  return useQuery({
    queryKey: queryKeys.goals(filters),
    queryFn: () => apiServices.goals.getGoals(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUpdateGoalProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ goalId, progress, comment }: { goalId: number; progress: number; comment?: string }) =>
      apiServices.goals.updateGoalProgress(goalId, progress, comment),
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goal(goalId) });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.goalsStats });
    },
  });
};

// Hooks pour Analytics
export const useGlobalDashboard = () => {
  return useQuery({
    queryKey: queryKeys.globalDashboard,
    queryFn: () => apiServices.analytics.getGlobalDashboard(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60000, // Rafraîchir chaque minute
  });
};

export const usePerformanceMetrics = () => {
  return useQuery({
    queryKey: queryKeys.performanceMetrics,
    queryFn: () => apiServices.analytics.getPerformanceMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRealTimeMetrics = () => {
  return useQuery({
    queryKey: queryKeys.realTimeMetrics,
    queryFn: () => apiServices.analytics.getRealTimeMetrics(),
    refetchInterval: 5000, // Rafraîchir toutes les 5 secondes
    staleTime: 0,
  });
};

// Hook générique pour les mutations avec invalidation automatique
export const useApiMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    invalidateKeys?: any[][];
    onSuccessMessage?: string;
    onErrorMessage?: string;
  }
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalider les clés spécifiées
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      
      // Afficher message de succès
      if (options?.onSuccessMessage && typeof window !== 'undefined' && window.showToast) {
        window.showToast(options.onSuccessMessage, 'success');
      }
    },
    onError: (error) => {
      // Afficher message d'erreur
      const errorMessage = options?.onErrorMessage || 
        (error instanceof Error ? error.message : 'Une erreur est survenue');
      
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(errorMessage, 'error');
      }
    },
  });
};

// Hook pour les requêtes avec retry automatique
export const useApiQuery = <TData>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  options?: {
    staleTime?: number;
    refetchInterval?: number;
    enabled?: boolean;
    retry?: number;
  }
) => {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes par défaut
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled,
    retry: options?.retry || 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export default {
  // Projects
  useProjects,
  useProject,
  useCreateProject,
  useMyTasks,
  
  // Courses
  useCourses,
  useCourse,
  useEnrollCourse,
  
  // CRM
  useContacts,
  useContact,
  useCreateContact,
  
  // Finance
  useInvoices,
  useFinanceStats,
  useRecordPayment,
  
  // Time Tracking
  useTimeLogs,
  useActiveSession,
  useStartTimer,
  useStopTimer,
  
  // Goals
  useGoals,
  useUpdateGoalProgress,
  
  // Analytics
  useGlobalDashboard,
  usePerformanceMetrics,
  useRealTimeMetrics,
  
  // Utilitaires
  useApiMutation,
  useApiQuery,
};