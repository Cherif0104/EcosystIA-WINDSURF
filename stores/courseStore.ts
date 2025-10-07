import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Course } from '../types';

// =====================================================
// TYPES POUR LE STORE DES COURS
// =====================================================

interface CourseState {
  // État des données
  courses: Course[];
  loading: boolean;
  error: string | null;
  
  // Actions de base (CRUD)
  fetchCourses: () => Promise<void>;
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  
  // Actions utilitaires
  clearError: () => void;
  reset: () => void;
  
  // Actions de recherche et filtrage
  searchCourses: (query: string) => Course[];
  filterCoursesByStatus: (status: string) => Course[];
  filterCoursesByCategory: (category: string) => Course[];
  
  // Getters
  getCourseById: (id: string) => Course | undefined;
  getCourseStats: () => {
    total: number;
    published: number;
    draft: number;
    byCategory: Record<string, number>;
  };
}

// =====================================================
// STORE ZUSTAND POUR LES COURS
// =====================================================

export const useCourseStore = create<CourseState>()(
  devtools(
    persist(
      (set, get) => ({
        // État initial
        courses: [],
        loading: false,
        error: null,

        // =====================================================
        // ACTIONS CRUD
        // =====================================================

        /**
         * Récupère tous les cours depuis la base de données
         */
        fetchCourses: async () => {
          set({ loading: true, error: null });
          
          try {
            // TODO: Remplacer par l'appel au service réel
            // const courses = await courseService.getAllCourses();
            
            // Simulation d'un appel API
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Pour l'instant, utiliser des données vides
            set({ courses: [], loading: false });
            
          } catch (error) {
            console.error('Erreur lors du chargement des cours:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Erreur inconnue',
              loading: false 
            });
          }
        },

        /**
         * Ajoute un nouveau cours
         */
        addCourse: async (courseData) => {
          set({ error: null });
          
          try {
            // TODO: Remplacer par l'appel au service réel
            // const newCourse = await courseService.createCourse(courseData);
            
            // Simulation d'un appel API
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Créer un nouveau cours avec un ID temporaire
            const newCourse: Course = {
              ...courseData,
              id: Date.now().toString()
            };
            
            set(state => ({
              courses: [newCourse, ...state.courses]
            }));
            
          } catch (error) {
            console.error('Erreur lors de la création du cours:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la création'
            });
            throw error;
          }
        },

        /**
         * Met à jour un cours existant
         */
        updateCourse: async (id, courseData) => {
          set({ error: null });
          
          try {
            // TODO: Remplacer par l'appel au service réel
            // const updatedCourse = await courseService.updateCourse(id, courseData);
            
            // Simulation d'un appel API
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Mettre à jour le cours localement
            set(state => ({
              courses: state.courses.map(course =>
                course.id === id
                  ? { ...course, ...courseData }
                  : course
              )
            }));
            
          } catch (error) {
            console.error('Erreur lors de la mise à jour du cours:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
            });
            throw error;
          }
        },

        /**
         * Supprime un cours
         */
        deleteCourse: async (id) => {
          set({ error: null });
          
          try {
            // TODO: Remplacer par l'appel au service réel
            // await courseService.deleteCourse(id);
            
            // Simulation d'un appel API
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Supprimer le cours localement
            set(state => ({
              courses: state.courses.filter(course => course.id !== id)
            }));
            
          } catch (error) {
            console.error('Erreur lors de la suppression du cours:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la suppression'
            });
            throw error;
          }
        },

        // =====================================================
        // ACTIONS UTILITAIRES
        // =====================================================

        /**
         * Efface l'erreur actuelle
         */
        clearError: () => {
          set({ error: null });
        },

        /**
         * Remet le store à son état initial
         */
        reset: () => {
          set({
            courses: [],
            loading: false,
            error: null
          });
        },

        // =====================================================
        // ACTIONS DE RECHERCHE ET FILTRAGE
        // =====================================================

        /**
         * Recherche des cours par terme
         */
        searchCourses: (query) => {
          const { courses } = get();
          if (!query.trim()) return courses;
          
          const lowercaseQuery = query.toLowerCase();
          return courses.filter(course =>
            course.title.toLowerCase().includes(lowercaseQuery) ||
            course.description.toLowerCase().includes(lowercaseQuery) ||
            course.category.toLowerCase().includes(lowercaseQuery)
          );
        },

        /**
         * Filtre les cours par statut
         */
        filterCoursesByStatus: (status) => {
          const { courses } = get();
          return courses.filter(course => course.status === status);
        },

        /**
         * Filtre les cours par catégorie
         */
        filterCoursesByCategory: (category) => {
          const { courses } = get();
          return courses.filter(course => course.category === category);
        },

        // =====================================================
        // GETTERS
        // =====================================================

        /**
         * Récupère un cours par son ID
         */
        getCourseById: (id) => {
          const { courses } = get();
          return courses.find(course => course.id === id);
        },

        /**
         * Calcule les statistiques des cours
         */
        getCourseStats: () => {
          const { courses } = get();
          
          const stats = {
            total: courses.length,
            published: courses.filter(c => c.status === 'published').length,
            draft: courses.filter(c => c.status === 'draft').length,
            byCategory: {} as Record<string, number>
          };

          // Compter par catégorie
          courses.forEach(course => {
            const category = course.category;
            stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
          });

          return stats;
        }
      }),
      {
        name: 'ecosystia-course-store',
        partialize: (state) => ({
          // Ne persister que les cours, pas les états de chargement
          courses: state.courses
        })
      }
    ),
    {
      name: 'course-store'
    }
  )
);

// =====================================================
// HOOKS UTILITAIRES POUR LES COMPOSANTS
// =====================================================

/**
 * Hook pour obtenir uniquement les cours (sans les actions)
 */
export const useCourses = () => {
  return useCourseStore(state => state.courses);
};

/**
 * Hook pour obtenir les statistiques des cours
 */
export const useCourseStats = () => {
  return useCourseStore(state => state.getCourseStats());
};

/**
 * Hook pour obtenir l'état de chargement
 */
export const useCourseLoading = () => {
  return useCourseStore(state => state.loading);
};

/**
 * Hook pour obtenir l'erreur actuelle
 */
export const useCourseError = () => {
  return useCourseStore(state => state.error);
};

/**
 * Hook pour les actions CRUD des cours
 */
export const useCourseActions = () => {
  return useCourseStore(state => ({
    fetchCourses: state.fetchCourses,
    addCourse: state.addCourse,
    updateCourse: state.updateCourse,
    deleteCourse: state.deleteCourse,
    clearError: state.clearError
  }));
};
