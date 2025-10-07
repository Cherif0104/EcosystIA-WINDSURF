import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Project } from '../types/Project';

// =====================================================
// TYPES POUR LE STORE DES PROJETS
// =====================================================

interface ProjectState {
  // État des données
  projects: Project[];
  loading: boolean;
  error: string | null;
  
  // Actions de base (CRUD)
  fetchProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Actions utilitaires
  clearError: () => void;
  reset: () => void;
  
  // Actions de recherche et filtrage
  searchProjects: (query: string) => Project[];
  filterProjectsByStatus: (status: string) => Project[];
  filterProjectsByPriority: (priority: string) => Project[];
  
  // Getters
  getProjectById: (id: string) => Project | undefined;
  getProjectStats: () => {
    total: number;
    completed: number;
    inProgress: number;
    highPriority: number;
  };
}

// =====================================================
// STORE ZUSTAND POUR LES PROJETS
// =====================================================

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set, get) => ({
        // État initial
        projects: [],
        loading: false,
        error: null,

        // =====================================================
        // ACTIONS CRUD
        // =====================================================

        /**
         * Récupère tous les projets depuis la base de données
         */
        fetchProjects: async () => {
          set({ loading: true, error: null });
          
          try {
            // TODO: Remplacer par l'appel au service réel
            // const projects = await projectsService.getAllProjects();
            
            // Simulation d'un appel API
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Pour l'instant, utiliser des données vides
            set({ projects: [], loading: false });
            
          } catch (error) {
            console.error('Erreur lors du chargement des projets:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Erreur inconnue',
              loading: false 
            });
          }
        },

        /**
         * Ajoute un nouveau projet
         */
        addProject: async (projectData) => {
          set({ error: null });
          
          try {
            // TODO: Remplacer par l'appel au service réel
            // const newProject = await projectsService.createProject(projectData);
            
            // Simulation d'un appel API
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Créer un nouveau projet avec un ID temporaire
            const newProject: Project = {
              ...projectData,
              id: Date.now().toString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            set(state => ({
              projects: [newProject, ...state.projects]
            }));
            
          } catch (error) {
            console.error('Erreur lors de la création du projet:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la création'
            });
            throw error;
          }
        },

        /**
         * Met à jour un projet existant
         */
        updateProject: async (id, projectData) => {
          set({ error: null });
          
          try {
            // TODO: Remplacer par l'appel au service réel
            // const updatedProject = await projectsService.updateProject(id, projectData);
            
            // Simulation d'un appel API
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Mettre à jour le projet localement
            set(state => ({
              projects: state.projects.map(project =>
                project.id === id
                  ? { ...project, ...projectData, updated_at: new Date().toISOString() }
                  : project
              )
            }));
            
          } catch (error) {
            console.error('Erreur lors de la mise à jour du projet:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
            });
            throw error;
          }
        },

        /**
         * Supprime un projet
         */
        deleteProject: async (id) => {
          set({ error: null });
          
          try {
            // TODO: Remplacer par l'appel au service réel
            // await projectsService.deleteProject(id);
            
            // Simulation d'un appel API
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Supprimer le projet localement
            set(state => ({
              projects: state.projects.filter(project => project.id !== id)
            }));
            
          } catch (error) {
            console.error('Erreur lors de la suppression du projet:', error);
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
            projects: [],
            loading: false,
            error: null
          });
        },

        // =====================================================
        // ACTIONS DE RECHERCHE ET FILTRAGE
        // =====================================================

        /**
         * Recherche des projets par terme
         */
        searchProjects: (query) => {
          const { projects } = get();
          if (!query.trim()) return projects;
          
          const lowercaseQuery = query.toLowerCase();
          return projects.filter(project =>
            project.title.toLowerCase().includes(lowercaseQuery) ||
            project.description.toLowerCase().includes(lowercaseQuery) ||
            project.client_name?.toLowerCase().includes(lowercaseQuery)
          );
        },

        /**
         * Filtre les projets par statut
         */
        filterProjectsByStatus: (status) => {
          const { projects } = get();
          return projects.filter(project => project.status === status);
        },

        /**
         * Filtre les projets par priorité
         */
        filterProjectsByPriority: (priority) => {
          const { projects } = get();
          return projects.filter(project => project.priority === priority);
        },

        // =====================================================
        // GETTERS
        // =====================================================

        /**
         * Récupère un projet par son ID
         */
        getProjectById: (id) => {
          const { projects } = get();
          return projects.find(project => project.id === id);
        },

        /**
         * Calcule les statistiques des projets
         */
        getProjectStats: () => {
          const { projects } = get();
          
          return {
            total: projects.length,
            completed: projects.filter(p => p.status === 'completed').length,
            inProgress: projects.filter(p => p.status === 'in_progress').length,
            highPriority: projects.filter(p => p.priority === 'high').length
          };
        }
      }),
      {
        name: 'ecosystia-project-store',
        partialize: (state) => ({
          // Ne persister que les projets, pas les états de chargement
          projects: state.projects
        })
      }
    ),
    {
      name: 'project-store'
    }
  )
);

// =====================================================
// HOOKS UTILITAIRES POUR LES COMPOSANTS
// =====================================================

/**
 * Hook pour obtenir uniquement les projets (sans les actions)
 */
export const useProjects = () => {
  return useProjectStore(state => state.projects);
};

/**
 * Hook pour obtenir les statistiques des projets
 */
export const useProjectStats = () => {
  return useProjectStore(state => state.getProjectStats());
};

/**
 * Hook pour obtenir l'état de chargement
 */
export const useProjectLoading = () => {
  return useProjectStore(state => state.loading);
};

/**
 * Hook pour obtenir l'erreur actuelle
 */
export const useProjectError = () => {
  return useProjectStore(state => state.error);
};

/**
 * Hook pour les actions CRUD des projets
 */
export const useProjectActions = () => {
  return useProjectStore(state => ({
    fetchProjects: state.fetchProjects,
    addProject: state.addProject,
    updateProject: state.updateProject,
    deleteProject: state.deleteProject,
    clearError: state.clearError
  }));
};
