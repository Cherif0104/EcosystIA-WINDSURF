/**
 * Service Courses pour EcosystIA
 * Intégration complète avec l'API Courses Django
 */

import apiClient, { apiUtils } from './api';

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: User;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  difficulty_display: string;
  status: 'Draft' | 'Published' | 'Archived';
  status_display: string;
  icon: string;
  thumbnail?: string;
  tags: string[];
  prerequisites?: string;
  enrollment_count: number;
  completion_rate: number;
  rating: number;
  modules_count: number;
  lessons_count: number;
  is_enrolled: boolean;
  user_enrollment?: CourseEnrollment;
  created_at: string;
  updated_at: string;
  published_at?: string;
  modules?: Module[];
  files?: CourseFile[];
}

export interface Module {
  id: number;
  title: string;
  description?: string;
  order: number;
  is_published: boolean;
  lessons: Lesson[];
  lessons_count: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: number;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment' | 'discussion';
  type_display: string;
  duration: string;
  order: number;
  is_published: boolean;
  content?: string;
  video_url?: string;
  resources: any[];
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: number;
  course: Course;
  status: 'Enrolled' | 'In Progress' | 'Completed' | 'Dropped';
  status_display: string;
  progress: number;
  enrolled_at: string;
  started_at?: string;
  completed_at?: string;
  last_accessed: string;
  rating?: number;
  feedback?: string;
  completed_lessons_count: number;
  total_lessons_count: number;
}

export interface CourseFile {
  id: number;
  name: string;
  file: string;
  file_url: string;
  description?: string;
  uploaded_by: User;
  uploaded_at: string;
  file_size: number;
  file_type: string;
}

export const coursesService = {
  /**
   * Lister tous les cours (publics)
   */
  async getCourses(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    difficulty?: string;
    instructor?: number;
    tags?: string;
    rating_min?: number;
  }): Promise<{ results: Course[]; count: number; next?: string; previous?: string }> {
    try {
      const response = await apiClient.get('/courses/', { 
        params: apiUtils.getFilterParams(params || {})
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Récupérer un cours spécifique
   */
  async getCourse(id: number): Promise<Course> {
    try {
      const response = await apiClient.get<Course>(`/courses/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Créer un nouveau cours (instructeurs)
   */
  async createCourse(courseData: {
    title: string;
    description: string;
    duration: string;
    difficulty: string;
    status?: string;
    icon?: string;
    thumbnail?: string;
    tags?: string[];
    prerequisites?: string;
  }): Promise<Course> {
    try {
      const response = await apiClient.post<Course>('/courses/', courseData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Mettre à jour un cours
   */
  async updateCourse(id: number, courseData: Partial<Course>): Promise<Course> {
    try {
      const response = await apiClient.patch<Course>(`/courses/${id}/`, courseData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * S'inscrire à un cours
   */
  async enrollCourse(courseId: number): Promise<CourseEnrollment> {
    try {
      const response = await apiClient.post<CourseEnrollment>(`/courses/${courseId}/enroll/`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Se désinscrire d'un cours
   */
  async unenrollCourse(courseId: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`/courses/${courseId}/unenroll/`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Récupérer mes inscriptions
   */
  async getMyEnrollments(params?: {
    status?: string;
    search?: string;
  }): Promise<CourseEnrollment[]> {
    try {
      const response = await apiClient.get<CourseEnrollment[]>('/courses/enrollments/', {
        params: apiUtils.getFilterParams(params || {})
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Marquer une leçon comme complétée
   */
  async markLessonProgress(lessonId: number, completed: boolean): Promise<{
    message: string;
    progress: number;
    status: string;
  }> {
    try {
      const response = await apiClient.post('/courses/lessons/progress/', {
        lesson_id: lessonId,
        completed
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Noter un cours
   */
  async rateCourse(courseId: number, rating: number, feedback?: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`/courses/${courseId}/rate/`, {
        rating,
        feedback
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Récupérer mes cours créés (instructeurs)
   */
  async getMyCourses(params?: {
    status?: string;
    search?: string;
  }): Promise<Course[]> {
    try {
      const response = await apiClient.get<Course[]>('/courses/my/', {
        params: apiUtils.getFilterParams(params || {})
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Récupérer les modules d'un cours
   */
  async getCourseModules(courseId: number): Promise<Module[]> {
    try {
      const response = await apiClient.get<Module[]>(`/courses/${courseId}/modules/`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Créer un module dans un cours
   */
  async createModule(courseId: number, moduleData: {
    title: string;
    description?: string;
    order: number;
    is_published?: boolean;
  }): Promise<Module> {
    try {
      const response = await apiClient.post<Module>(`/courses/${courseId}/modules/`, moduleData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Récupérer les leçons d'un module
   */
  async getModuleLessons(moduleId: number): Promise<Lesson[]> {
    try {
      const response = await apiClient.get<Lesson[]>(`/courses/modules/${moduleId}/lessons/`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Créer une leçon dans un module
   */
  async createLesson(moduleId: number, lessonData: {
    title: string;
    type: string;
    duration: string;
    order: number;
    content?: string;
    video_url?: string;
    is_published?: boolean;
  }): Promise<Lesson> {
    try {
      const response = await apiClient.post<Lesson>(`/courses/modules/${moduleId}/lessons/`, lessonData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Récupérer les statistiques des cours
   */
  async getCourseStats(): Promise<{
    total_courses: number;
    published_courses: number;
    draft_courses: number;
    total_enrollments: number;
    active_enrollments: number;
    completed_enrollments: number;
    total_lessons: number;
    total_modules: number;
    average_rating: number;
    average_completion_rate: number;
  }> {
    try {
      const response = await apiClient.get('/courses/stats/');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Récupérer les données du dashboard cours
   */
  async getDashboardData(): Promise<{
    recent_courses: Course[];
    recent_enrollments: CourseEnrollment[];
    in_progress_courses: CourseEnrollment[];
    popular_courses: Course[];
  }> {
    try {
      const response = await apiClient.get('/courses/dashboard/');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },
};

export default coursesService;
