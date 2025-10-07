import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, Role } from '../types';

// =====================================================
// TYPES POUR LE STORE DES UTILISATEURS
// =====================================================

interface UserState {
  // État des données
  users: User[];
  roles: Role[];
  loading: boolean;
  error: string | null;
  
  // Actions de base (CRUD)
  fetchUsers: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // Actions utilitaires
  clearError: () => void;
  reset: () => void;
  
  // Actions de recherche et filtrage
  searchUsers: (query: string) => User[];
  filterUsersByRole: (role: string) => User[];
  filterUsersByStatus: (status: string) => User[];
  
  // Getters
  getUserById: (id: string) => User | undefined;
  getUserByEmail: (email: string) => User | undefined;
  getUserStats: () => {
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
  };
}

// =====================================================
// STORE ZUSTAND POUR LES UTILISATEURS
// =====================================================

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        // État initial
        users: [],
        roles: [],
        loading: false,
        error: null,

        // =====================================================
        // ACTIONS CRUD
        // =====================================================

        /**
         * Récupère tous les utilisateurs depuis la base de données
         */
        fetchUsers: async () => {
          set({ loading: true, error: null });
          
          try {
            // TODO: Remplacer par l'appel au service réel
            // const users = await userService.getAllUsers();
            
            // Simulation d'un appel API
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Pour l'instant, utiliser des données vides
            set({ users: [], loading: false });
            
          } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Erreur inconnue',
              loading: false 
            });
          }
        },

        /**
         * Récupère tous les rôles depuis la base de données
         */
        fetchRoles: async () => {
          try {
            // TODO: Remplacer par l'appel au service réel
            // const roles = await roleService.getAllRoles();
            
            // Simulation d'un appel API
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Pour l'instant, utiliser des données vides
            set({ roles: [] });
            
          } catch (error) {
            console.error('Erreur lors du chargement des rôles:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors du chargement des rôles'
            });
          }
        },

        /**
         * Ajoute un nouvel utilisateur
         */
        addUser: async (userData) => {
          set({ error: null });
          
          try {
            // TODO: Remplacer par l'appel au service réel
            // const newUser = await userService.createUser(userData);
            
            // Simulation d'un appel API
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Créer un nouvel utilisateur avec un ID temporaire
            const newUser: User = {
              ...userData,
              id: Date.now().toString()
            };
            
            set(state => ({
              users: [...state.users, newUser]
            }));
            
          } catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la création'
            });
            throw error;
          }
        },

        /**
         * Met à jour un utilisateur existant
         */
        updateUser: async (id, userData) => {
          set({ error: null });
          
          try {
            // TODO: Remplacer par l'appel au service réel
            // const updatedUser = await userService.updateUser(id, userData);
            
            // Simulation d'un appel API
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Mettre à jour l'utilisateur localement
            set(state => ({
              users: state.users.map(user =>
                user.id === id
                  ? { ...user, ...userData }
                  : user
              )
            }));
            
          } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
            });
            throw error;
          }
        },

        /**
         * Supprime un utilisateur
         */
        deleteUser: async (id) => {
          set({ error: null });
          
          try {
            // TODO: Remplacer par l'appel au service réel
            // await userService.deleteUser(id);
            
            // Simulation d'un appel API
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Supprimer l'utilisateur localement
            set(state => ({
              users: state.users.filter(user => user.id !== id)
            }));
            
          } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur:', error);
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
            users: [],
            roles: [],
            loading: false,
            error: null
          });
        },

        // =====================================================
        // ACTIONS DE RECHERCHE ET FILTRAGE
        // =====================================================

        /**
         * Recherche des utilisateurs par terme
         */
        searchUsers: (query) => {
          const { users } = get();
          if (!query.trim()) return users;
          
          const lowercaseQuery = query.toLowerCase();
          return users.filter(user =>
            user.name.toLowerCase().includes(lowercaseQuery) ||
            user.email.toLowerCase().includes(lowercaseQuery) ||
            user.role?.toLowerCase().includes(lowercaseQuery)
          );
        },

        /**
         * Filtre les utilisateurs par rôle
         */
        filterUsersByRole: (role) => {
          const { users } = get();
          return users.filter(user => user.role === role);
        },

        /**
         * Filtre les utilisateurs par statut
         */
        filterUsersByStatus: (status) => {
          const { users } = get();
          return users.filter(user => user.status === status);
        },

        // =====================================================
        // GETTERS
        // =====================================================

        /**
         * Récupère un utilisateur par son ID
         */
        getUserById: (id) => {
          const { users } = get();
          return users.find(user => user.id === id);
        },

        /**
         * Récupère un utilisateur par son email
         */
        getUserByEmail: (email) => {
          const { users } = get();
          return users.find(user => user.email === email);
        },

        /**
         * Calcule les statistiques des utilisateurs
         */
        getUserStats: () => {
          const { users } = get();
          
          const stats = {
            total: users.length,
            active: users.filter(u => u.status === 'active').length,
            inactive: users.filter(u => u.status === 'inactive').length,
            byRole: {} as Record<string, number>
          };

          // Compter par rôle
          users.forEach(user => {
            const role = user.role || 'undefined';
            stats.byRole[role] = (stats.byRole[role] || 0) + 1;
          });

          return stats;
        }
      }),
      {
        name: 'ecosystia-user-store',
        partialize: (state) => ({
          // Ne persister que les utilisateurs et rôles, pas les états de chargement
          users: state.users,
          roles: state.roles
        })
      }
    ),
    {
      name: 'user-store'
    }
  )
);

// =====================================================
// HOOKS UTILITAIRES POUR LES COMPOSANTS
// =====================================================

/**
 * Hook pour obtenir uniquement les utilisateurs (sans les actions)
 */
export const useUsers = () => {
  return useUserStore(state => state.users);
};

/**
 * Hook pour obtenir uniquement les rôles (sans les actions)
 */
export const useRoles = () => {
  return useUserStore(state => state.roles);
};

/**
 * Hook pour obtenir les statistiques des utilisateurs
 */
export const useUserStats = () => {
  return useUserStore(state => state.getUserStats());
};

/**
 * Hook pour obtenir l'état de chargement
 */
export const useUserLoading = () => {
  return useUserStore(state => state.loading);
};

/**
 * Hook pour obtenir l'erreur actuelle
 */
export const useUserError = () => {
  return useUserStore(state => state.error);
};

/**
 * Hook pour les actions CRUD des utilisateurs
 */
export const useUserActions = () => {
  return useUserStore(state => ({
    fetchUsers: state.fetchUsers,
    fetchRoles: state.fetchRoles,
    addUser: state.addUser,
    updateUser: state.updateUser,
    deleteUser: state.deleteUser,
    clearError: state.clearError
  }));
};
