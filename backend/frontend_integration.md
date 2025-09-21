# Configuration Frontend EcosystIA - Intégration avec le Backend Django

## Configuration Axios pour React

### 1. Installation des dépendances

```bash
npm install axios
npm install @types/axios
```

### 2. Configuration API Client

Créez le fichier `src/services/api.ts` :

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { User } from '../types';

// Configuration de base
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Interface pour les réponses API
interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// Instance Axios principale
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour les requêtes
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token invalide, rediriger vers login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Services API
export const apiService = {
  // Authentification
  auth: {
    login: (email: string, password: string) =>
      apiClient.post<{ access: string; refresh: string; user: User }>('/auth/token/', {
        email,
        password,
      }),
    
    logout: (refreshToken: string) =>
      apiClient.post('/auth/token/blacklist/', {
        refresh_token: refreshToken,
      }),
    
    register: (userData: Partial<User>) =>
      apiClient.post<User>('/users/register/', userData),
    
    getCurrentUser: () =>
      apiClient.get<User>('/users/current/'),
  },
  
  // Utilisateurs
  users: {
    list: (params?: any) =>
      apiClient.get<User[]>('/users/', { params }),
    
    get: (id: number) =>
      apiClient.get<User>(`/users/${id}/`),
    
    update: (id: number, data: Partial<User>) =>
      apiClient.patch<User>(`/users/${id}/`, data),
    
    updateProfile: (data: any) =>
      apiClient.patch('/users/profile/', data),
    
    changePassword: (oldPassword: string, newPassword: string) =>
      apiClient.post('/users/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPassword,
      }),
  },
  
  // Projets
  projects: {
    list: (params?: any) =>
      apiClient.get<Project[]>('/projects/', { params }),
    
    get: (id: number) =>
      apiClient.get<Project>(`/projects/${id}/`),
    
    create: (data: Partial<Project>) =>
      apiClient.post<Project>('/projects/', data),
    
    update: (id: number, data: Partial<Project>) =>
      apiClient.patch<Project>(`/projects/${id}/`, data),
    
    delete: (id: number) =>
      apiClient.delete(`/projects/${id}/`),
    
    addMember: (projectId: number, userId: number, role: string) =>
      apiClient.post(`/projects/${projectId}/members/`, {
        user: userId,
        role,
      }),
  },
  
  // Cours
  courses: {
    list: (params?: any) =>
      apiClient.get<Course[]>('/courses/', { params }),
    
    get: (id: number) =>
      apiClient.get<Course>(`/courses/${id}/`),
    
    create: (data: Partial<Course>) =>
      apiClient.post<Course>('/courses/', data),
    
    enroll: (courseId: number) =>
      apiClient.post(`/courses/${courseId}/enroll/`),
    
    updateProgress: (enrollmentId: number, lessonId: string) =>
      apiClient.post(`/courses/enrollments/${enrollmentId}/complete-lesson/`, {
        lesson_id: lessonId,
      }),
  },
  
  // Emplois
  jobs: {
    list: (params?: any) =>
      apiClient.get<Job[]>('/jobs/', { params }),
    
    get: (id: number) =>
      apiClient.get<Job>(`/jobs/${id}/`),
    
    create: (data: Partial<Job>) =>
      apiClient.post<Job>('/jobs/', data),
    
    apply: (jobId: number, coverLetter?: string) =>
      apiClient.post(`/jobs/${jobId}/apply/`, {
        cover_letter: coverLetter,
      }),
  },
  
  // CRM
  crm: {
    contacts: {
      list: (params?: any) =>
        apiClient.get<Contact[]>('/crm/contacts/', { params }),
      
      get: (id: number) =>
        apiClient.get<Contact>(`/crm/contacts/${id}/`),
      
      create: (data: Partial<Contact>) =>
        apiClient.post<Contact>('/crm/contacts/', data),
      
      update: (id: number, data: Partial<Contact>) =>
        apiClient.patch<Contact>(`/crm/contacts/${id}/`, data),
      
      delete: (id: number) =>
        apiClient.delete(`/crm/contacts/${id}/`),
    },
  },
  
  // Finance
  finance: {
    invoices: {
      list: (params?: any) =>
        apiClient.get<Invoice[]>('/finance/invoices/', { params }),
      
      get: (id: number) =>
        apiClient.get<Invoice>(`/finance/invoices/${id}/`),
      
      create: (data: Partial<Invoice>) =>
        apiClient.post<Invoice>('/finance/invoices/', data),
      
      update: (id: number, data: Partial<Invoice>) =>
        apiClient.patch<Invoice>(`/finance/invoices/${id}/`, data),
      
      delete: (id: number) =>
        apiClient.delete(`/finance/invoices/${id}/`),
    },
    
    expenses: {
      list: (params?: any) =>
        apiClient.get<Expense[]>('/finance/expenses/', { params }),
      
      create: (data: Partial<Expense>) =>
        apiClient.post<Expense>('/finance/expenses/', data),
      
      update: (id: number, data: Partial<Expense>) =>
        apiClient.patch<Expense>(`/finance/expenses/${id}/`, data),
    },
  },
  
  // IA
  ai: {
    createSession: (contextType: string, contextId?: number) =>
      apiClient.post('/ai/sessions/', {
        context_type: contextType,
        context_id: contextId,
      }),
    
    sendMessage: (sessionId: number, message: string) =>
      apiClient.post(`/ai/sessions/${sessionId}/messages/`, {
        content: message,
      }),
    
    getSessionHistory: (sessionId: number) =>
      apiClient.get(`/ai/sessions/${sessionId}/messages/`),
    
    getUsageStats: () =>
      apiClient.get('/ai/usage-stats/'),
  },
  
  // Time Tracking
  timeTracking: {
    logs: {
      list: (params?: any) =>
        apiClient.get<TimeLog[]>('/time-tracking/logs/', { params }),
      
      create: (data: Partial<TimeLog>) =>
        apiClient.post<TimeLog>('/time-tracking/logs/', data),
      
      update: (id: number, data: Partial<TimeLog>) =>
        apiClient.patch<TimeLog>(`/time-tracking/logs/${id}/`, data),
    },
    
    meetings: {
      list: (params?: any) =>
        apiClient.get<Meeting[]>('/time-tracking/meetings/', { params }),
      
      create: (data: Partial<Meeting>) =>
        apiClient.post<Meeting>('/time-tracking/meetings/', data),
      
      update: (id: number, data: Partial<Meeting>) =>
        apiClient.patch<Meeting>(`/time-tracking/meetings/${id}/`, data),
    },
  },
};

export default apiClient;
```

### 3. Hook personnalisé pour l'authentification

Créez le fichier `src/hooks/useAuth.ts` :

```typescript
import { useState, useEffect, createContext, useContext } from 'react';
import { apiService } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await apiService.auth.getCurrentUser();
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.auth.login(email, password);
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiService.auth.logout(refreshToken);
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  const register = async (userData: Partial<User>) => {
    try {
      const response = await apiService.auth.register(userData);
      setUser(response.data);
    } catch (error) {
      throw error;
    }
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');
      
      const response = await apiService.users.update(user.id, data);
      setUser(response.data);
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    register,
    updateUser,
  };
};
```

### 4. Variables d'environnement

Créez le fichier `.env.local` :

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Remplacement des données mock

Pour remplacer les données mock dans votre `App.tsx`, utilisez les services API :

```typescript
// Remplacez les imports de données mock
// import { mockCourses, mockJobs, ... } from './constants/data';

// Utilisez les hooks API à la place
const { data: courses, loading: coursesLoading } = useQuery('courses', () => 
  apiService.courses.list()
);

const { data: jobs, loading: jobsLoading } = useQuery('jobs', () => 
  apiService.jobs.list()
);
```

## Instructions de déploiement

### 1. Backend (Django)

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
pip install -r requirements.txt

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Démarrer le serveur
python manage.py runserver
```

### 2. Avec Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

### 3. Configuration de production

1. Modifiez les variables d'environnement dans `docker-compose.yml`
2. Configurez PostgreSQL et Redis
3. Ajoutez votre clé API Gemini
4. Configurez les domaines autorisés dans `ALLOWED_HOSTS`

## Endpoints API disponibles

- **Authentification**: `/api/v1/auth/`
- **Utilisateurs**: `/api/v1/users/`
- **Projets**: `/api/v1/projects/`
- **Cours**: `/api/v1/courses/`
- **Emplois**: `/api/v1/jobs/`
- **CRM**: `/api/v1/crm/`
- **Finance**: `/api/v1/finance/`
- **IA**: `/api/v1/ai/`
- **Documentation**: `/api/docs/`

Votre backend Django EcosystIA est maintenant prêt à supporter votre frontend React avec une architecture scalable pour 250,000 utilisateurs ! 🚀
