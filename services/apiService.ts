/**
 * Service API pour l'intégration React-Django avec authentification JWT
 * Configuration centralisée pour toutes les requêtes API
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Types pour l'authentification
interface LoginCredentials {
  username: string;
  password: string;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar?: string;
  is_verified: boolean;
  created_at: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Configuration de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private api: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Charger les tokens depuis localStorage
    this.loadTokensFromStorage();

    // Intercepteurs pour gérer l'authentification automatiquement
    this.setupInterceptors();
  }

  /**
   * Configuration des intercepteurs Axios
   */
  private setupInterceptors(): void {
    // Intercepteur de requête - ajouter le token d'authentification
    this.api.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse - gérer le renouvellement automatique des tokens
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Charger les tokens depuis localStorage
   */
  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  /**
   * Sauvegarder les tokens dans localStorage
   */
  private saveTokensToStorage(tokens: AuthTokens): void {
    this.accessToken = tokens.access;
    this.refreshToken = tokens.refresh;
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }

  /**
   * Supprimer les tokens du localStorage
   */
  private clearTokensFromStorage(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Renouveler le token d'accès
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
        refresh: this.refreshToken,
      });

      const { access } = response.data;
      this.accessToken = access;
      localStorage.setItem('access_token', access);
    } catch (error) {
      this.clearTokensFromStorage();
      throw error;
    }
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Connexion utilisateur
   */
  public async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const response = await this.api.post<{ user: User; tokens: AuthTokens }>('/auth/login/', credentials);
      
      this.saveTokensToStorage(response.data.tokens);
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de connexion');
    }
  }

  /**
   * Inscription utilisateur
   */
  public async signup(signupData: SignupData): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const response = await this.api.post<{ user: User; tokens: AuthTokens }>('/auth/signup/', signupData);
      
      this.saveTokensToStorage(response.data.tokens);
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur d\'inscription');
    }
  }

  /**
   * Déconnexion utilisateur
   */
  public async logout(): Promise<void> {
    try {
      if (this.refreshToken) {
        await this.api.post('/auth/logout/', { refresh: this.refreshToken });
      }
    } catch (error) {
      console.warn('Erreur lors de la déconnexion:', error);
    } finally {
      this.clearTokensFromStorage();
    }
  }

  /**
   * Obtenir le profil utilisateur actuel
   */
  public async getCurrentUser(): Promise<User> {
    try {
      const response = await this.api.get<User>('/auth/me/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  public async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const response = await this.api.patch<User>('/auth/me/', profileData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  }

  /**
   * Changer le mot de passe
   */
  public async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await this.api.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  }

  /**
   * Réinitialisation du mot de passe
   */
  public async resetPassword(email: string): Promise<void> {
    try {
      await this.api.post('/auth/password-reset/', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe');
    }
  }

  // ============================================
  // SERVICES POUR LES DIFFÉRENTS MODULES
  // ============================================

  /**
   * Service Projects
   */
  public projects = {
    getAll: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await this.api.get('/projects/', { params });
      return response.data;
    },

    getById: async (id: number): Promise<any> => {
      const response = await this.api.get(`/projects/${id}/`);
      return response.data;
    },

    create: async (projectData: any): Promise<any> => {
      const response = await this.api.post('/projects/', projectData);
      return response.data;
    },

    update: async (id: number, projectData: any): Promise<any> => {
      const response = await this.api.patch(`/projects/${id}/`, projectData);
      return response.data;
    },

    delete: async (id: number): Promise<void> => {
      await this.api.delete(`/projects/${id}/`);
    },

    getStats: async (): Promise<any> => {
      const response = await this.api.get('/projects/stats/');
      return response.data;
    },
  };

  /**
   * Service Courses
   */
  public courses = {
    getAll: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await this.api.get('/courses/', { params });
      return response.data;
    },

    getById: async (id: number): Promise<any> => {
      const response = await this.api.get(`/courses/${id}/`);
      return response.data;
    },

    enroll: async (id: number): Promise<any> => {
      const response = await this.api.post(`/courses/${id}/enroll/`);
      return response.data;
    },

    getProgress: async (id: number): Promise<any> => {
      const response = await this.api.get(`/courses/${id}/progress/`);
      return response.data;
    },
  };

  /**
   * Service Jobs
   */
  public jobs = {
    getAll: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await this.api.get('/jobs/', { params });
      return response.data;
    },

    getById: async (id: number): Promise<any> => {
      const response = await this.api.get(`/jobs/${id}/`);
      return response.data;
    },

    apply: async (id: number, applicationData: any): Promise<any> => {
      const response = await this.api.post(`/jobs/${id}/apply/`, applicationData);
      return response.data;
    },
  };

  /**
   * Service CRM
   */
  public crm = {
    getContacts: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await this.api.get('/crm/contacts/', { params });
      return response.data;
    },

    createContact: async (contactData: any): Promise<any> => {
      const response = await this.api.post('/crm/contacts/', contactData);
      return response.data;
    },

    getDeals: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await this.api.get('/crm/deals/', { params });
      return response.data;
    },
  };

  /**
   * Service Finance
   */
  public finance = {
    getInvoices: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await this.api.get('/finance/invoices/', { params });
      return response.data;
    },

    createInvoice: async (invoiceData: any): Promise<any> => {
      const response = await this.api.post('/finance/invoices/', invoiceData);
      return response.data;
    },

    getStats: async (): Promise<any> => {
      const response = await this.api.get('/finance/stats/');
      return response.data;
    },
  };

  /**
   * Service Time Tracking
   */
  public timeTracking = {
    getEntries: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await this.api.get('/time-tracking/', { params });
      return response.data;
    },

    startTimer: async (projectId: number, description?: string): Promise<any> => {
      const response = await this.api.post('/time-tracking/start/', {
        project: projectId,
        description,
      });
      return response.data;
    },

    stopTimer: async (entryId: number): Promise<any> => {
      const response = await this.api.post(`/time-tracking/${entryId}/stop/`);
      return response.data;
    },
  };

  /**
   * Service Goals (OKRs)
   */
  public goals = {
    getAll: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await this.api.get('/goals/', { params });
      return response.data;
    },

    create: async (goalData: any): Promise<any> => {
      const response = await this.api.post('/goals/', goalData);
      return response.data;
    },

    updateProgress: async (id: number, progress: number): Promise<any> => {
      const response = await this.api.patch(`/goals/${id}/`, { progress });
      return response.data;
    },
  };

  /**
   * Service Meetings
   */
  public meetings = {
    getAll: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await this.api.get('/meetings/', { params });
      return response.data;
    },

    create: async (meetingData: any): Promise<any> => {
      const response = await this.api.post('/meetings/', meetingData);
      return response.data;
    },

    join: async (id: number): Promise<any> => {
      const response = await this.api.post(`/meetings/${id}/join/`);
      return response.data;
    },

    getUpcoming: async (): Promise<any[]> => {
      const response = await this.api.get('/meetings/upcoming/');
      return response.data;
    },
  };

  /**
   * Service Notifications
   */
  public notifications = {
    getAll: async (params?: any): Promise<PaginatedResponse<any>> => {
      const response = await this.api.get('/notifications/', { params });
      return response.data;
    },

    markAsRead: async (id: number): Promise<void> => {
      await this.api.post(`/notifications/${id}/mark-read/`);
    },

    markAllAsRead: async (): Promise<void> => {
      await this.api.post('/notifications/mark-all-read/');
    },

    getUnreadCount: async (): Promise<number> => {
      const response = await this.api.get('/notifications/unread-count/');
      return response.data.unread_count;
    },
  };

  /**
   * Service Analytics
   */
  public analytics = {
    getDashboard: async (): Promise<any> => {
      const response = await this.api.get('/analytics/dashboard/');
      return response.data;
    },

    getUserStats: async (): Promise<any> => {
      const response = await this.api.get('/analytics/users/');
      return response.data;
    },

    getProjectStats: async (): Promise<any> => {
      const response = await this.api.get('/analytics/projects/');
      return response.data;
    },
  };

  /**
   * Méthode générique pour faire des requêtes personnalisées
   */
  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api(config);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de requête API');
    }
  }

  /**
   * Upload de fichiers
   */
  public async uploadFile(file: File, endpoint: string, additionalData?: any): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    try {
      const response = await this.api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'upload');
    }
  }
}

// Instance singleton du service API
export const apiService = new ApiService();

// Export des types pour utilisation dans les composants
export type { 
  User, 
  LoginCredentials, 
  SignupData, 
  AuthTokens, 
  ApiResponse, 
  PaginatedResponse 
};
