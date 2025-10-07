import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  refactoredRoleManagementService, 
  Role, 
  Module, 
  RoleModulePermissions,
  UserWithRole,
  PermissionUpdate
} from '../services/refactoredRoleManagementService';

// =====================================================
// TYPES POUR LE STORE DES PERMISSIONS
// =====================================================

interface PermissionState {
  // État des données
  roles: Role[];
  modules: Module[];
  permissions: RoleModulePermissions;
  users: UserWithRole[];
  loading: boolean;
  error: string | null;
  
  // Actions de base (CRUD)
  fetchRoles: () => Promise<void>;
  fetchModules: () => Promise<void>;
  fetchPermissions: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  
  // Actions de gestion des permissions
  updatePermission: (roleId: string, moduleId: string, permissions: PermissionUpdate) => Promise<void>;
  updateMultiplePermissions: (updates: Array<{
    roleId: string;
    moduleId: string;
    permissions: PermissionUpdate;
  }>) => Promise<void>;
  
  // Actions de gestion des rôles
  createRole: (roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateRole: (roleId: string, roleData: Partial<Role>) => Promise<void>;
  deleteRole: (roleId: string) => Promise<void>;
  
  // Actions de gestion des modules
  createModule: (moduleData: Omit<Module, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateModule: (moduleId: string, moduleData: Partial<Module>) => Promise<void>;
  
  // Actions de gestion des utilisateurs
  updateUserRole: (userId: string, roleId: string) => Promise<void>;
  
  // Actions utilitaires
  clearError: () => void;
  reset: () => void;
  resetToDefaultPermissions: () => Promise<void>;
  exportPermissions: () => Promise<void>;
  importPermissions: (config: any) => Promise<void>;
  
  // Actions de vérification
  checkUserPermission: (userId: string, moduleName: string, action: string) => Promise<boolean>;
  fetchUserPermissions: (userId: string) => Promise<Record<string, any>>;
}

// =====================================================
// STORE ZUSTAND POUR LES PERMISSIONS
// =====================================================

export const usePermissionStore = create<PermissionState>()(
  devtools(
    (set, get) => ({
      // État initial
      roles: [],
      modules: [],
      permissions: {},
      users: [],
      loading: false,
      error: null,

      // =====================================================
      // ACTIONS DE RÉCUPÉRATION DES DONNÉES
      // =====================================================

      /**
       * Récupère tous les rôles
       */
      fetchRoles: async () => {
        set({ loading: true, error: null });
        
        try {
          const roles = await refactoredRoleManagementService.fetchRoles();
          set({ roles, loading: false });
        } catch (error) {
          console.error('Erreur lors du chargement des rôles:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des rôles',
            loading: false 
          });
        }
      },

      /**
       * Récupère tous les modules
       */
      fetchModules: async () => {
        try {
          const modules = await refactoredRoleManagementService.fetchModules();
          set({ modules });
        } catch (error) {
          console.error('Erreur lors du chargement des modules:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des modules'
          });
        }
      },

      /**
       * Récupère toutes les permissions
       */
      fetchPermissions: async () => {
        try {
          const permissions = await refactoredRoleManagementService.fetchPermissions();
          set({ permissions });
        } catch (error) {
          console.error('Erreur lors du chargement des permissions:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des permissions'
          });
        }
      },

      /**
       * Récupère tous les utilisateurs avec leurs rôles
       */
      fetchUsers: async () => {
        try {
          const users = await refactoredRoleManagementService.fetchUsers();
          set({ users });
        } catch (error) {
          console.error('Erreur lors du chargement des utilisateurs:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des utilisateurs'
          });
        }
      },

      // =====================================================
      // ACTIONS DE GESTION DES PERMISSIONS
      // =====================================================

      /**
       * Met à jour une permission spécifique
       */
      updatePermission: async (roleId, moduleId, permissionData) => {
        set({ error: null });
        
        try {
          await refactoredRoleManagementService.updatePermission(roleId, moduleId, permissionData);
          
          // Recharger les permissions pour mettre à jour l'état local
          await get().fetchPermissions();
          
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la permission:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la permission'
          });
          throw error;
        }
      },

      /**
       * Met à jour plusieurs permissions en une seule fois
       */
      updateMultiplePermissions: async (updates) => {
        set({ error: null });
        
        try {
          await refactoredRoleManagementService.updateMultiplePermissions(updates);
          
          // Recharger les permissions pour mettre à jour l'état local
          await get().fetchPermissions();
          
        } catch (error) {
          console.error('Erreur lors de la mise à jour des permissions:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour des permissions'
          });
          throw error;
        }
      },

      // =====================================================
      // ACTIONS DE GESTION DES RÔLES
      // =====================================================

      /**
       * Crée un nouveau rôle
       */
      createRole: async (roleData) => {
        set({ error: null });
        
        try {
          await refactoredRoleManagementService.createRole(roleData);
          
          // Recharger les rôles pour mettre à jour l'état local
          await get().fetchRoles();
          
        } catch (error) {
          console.error('Erreur lors de la création du rôle:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la création du rôle'
          });
          throw error;
        }
      },

      /**
       * Met à jour un rôle existant
       */
      updateRole: async (roleId, roleData) => {
        set({ error: null });
        
        try {
          await refactoredRoleManagementService.updateRole(roleId, roleData);
          
          // Recharger les rôles pour mettre à jour l'état local
          await get().fetchRoles();
          
        } catch (error) {
          console.error('Erreur lors de la mise à jour du rôle:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du rôle'
          });
          throw error;
        }
      },

      /**
       * Supprime un rôle
       */
      deleteRole: async (roleId) => {
        set({ error: null });
        
        try {
          await refactoredRoleManagementService.deleteRole(roleId);
          
          // Recharger les rôles pour mettre à jour l'état local
          await get().fetchRoles();
          
        } catch (error) {
          console.error('Erreur lors de la suppression du rôle:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la suppression du rôle'
          });
          throw error;
        }
      },

      // =====================================================
      // ACTIONS DE GESTION DES MODULES
      // =====================================================

      /**
       * Crée un nouveau module
       */
      createModule: async (moduleData) => {
        set({ error: null });
        
        try {
          await refactoredRoleManagementService.createModule(moduleData);
          
          // Recharger les modules pour mettre à jour l'état local
          await get().fetchModules();
          
        } catch (error) {
          console.error('Erreur lors de la création du module:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la création du module'
          });
          throw error;
        }
      },

      /**
       * Met à jour un module existant
       */
      updateModule: async (moduleId, moduleData) => {
        set({ error: null });
        
        try {
          await refactoredRoleManagementService.updateModule(moduleId, moduleData);
          
          // Recharger les modules pour mettre à jour l'état local
          await get().fetchModules();
          
        } catch (error) {
          console.error('Erreur lors de la mise à jour du module:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du module'
          });
          throw error;
        }
      },

      // =====================================================
      // ACTIONS DE GESTION DES UTILISATEURS
      // =====================================================

      /**
       * Met à jour le rôle d'un utilisateur
       */
      updateUserRole: async (userId, roleId) => {
        set({ error: null });
        
        try {
          await refactoredRoleManagementService.updateUserRole(userId, roleId);
          
          // Recharger les utilisateurs pour mettre à jour l'état local
          await get().fetchUsers();
          
        } catch (error) {
          console.error('Erreur lors de la mise à jour du rôle utilisateur:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du rôle utilisateur'
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
          roles: [],
          modules: [],
          permissions: {},
          users: [],
          loading: false,
          error: null
        });
      },

      /**
       * Réinitialise toutes les permissions aux valeurs par défaut
       */
      resetToDefaultPermissions: async () => {
        set({ error: null });
        
        try {
          await refactoredRoleManagementService.resetToDefaultPermissions();
          
          // Recharger toutes les données
          await Promise.all([
            get().fetchRoles(),
            get().fetchModules(),
            get().fetchPermissions()
          ]);
          
        } catch (error) {
          console.error('Erreur lors de la réinitialisation des permissions:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la réinitialisation des permissions'
          });
          throw error;
        }
      },

      /**
       * Exporte la configuration actuelle des permissions
       */
      exportPermissions: async () => {
        try {
          const config = await refactoredRoleManagementService.exportPermissions();
          
          // Créer un fichier de téléchargement
          const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ecosystia-permissions-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
        } catch (error) {
          console.error('Erreur lors de l\'export des permissions:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de l\'export des permissions'
          });
          throw error;
        }
      },

      /**
       * Importe une configuration de permissions
       */
      importPermissions: async (config) => {
        set({ error: null });
        
        try {
          await refactoredRoleManagementService.importPermissions(config);
          
          // Recharger toutes les données
          await Promise.all([
            get().fetchRoles(),
            get().fetchModules(),
            get().fetchPermissions()
          ]);
          
        } catch (error) {
          console.error('Erreur lors de l\'import des permissions:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de l\'import des permissions'
          });
          throw error;
        }
      },

      // =====================================================
      // ACTIONS DE VÉRIFICATION
      // =====================================================

      /**
       * Vérifie si un utilisateur a une permission spécifique
       */
      checkUserPermission: async (userId, moduleName, action) => {
        try {
          return await refactoredRoleManagementService.checkUserPermission(
            userId, 
            moduleName, 
            action as any
          );
        } catch (error) {
          console.error('Erreur lors de la vérification de permission:', error);
          return false;
        }
      },

      /**
       * Récupère toutes les permissions d'un utilisateur
       */
      fetchUserPermissions: async (userId) => {
        try {
          return await refactoredRoleManagementService.fetchUserPermissions(userId);
        } catch (error) {
          console.error('Erreur lors de la récupération des permissions utilisateur:', error);
          return {};
        }
      }
    }),
    {
      name: 'permission-store'
    }
  )
);

// =====================================================
// HOOKS UTILITAIRES POUR LES COMPOSANTS
// =====================================================

/**
 * Hook pour obtenir uniquement les rôles
 */
export const useRoles = () => {
  return usePermissionStore(state => state.roles);
};

/**
 * Hook pour obtenir uniquement les modules
 */
export const useModules = () => {
  return usePermissionStore(state => state.modules);
};

/**
 * Hook pour obtenir uniquement les permissions
 */
export const usePermissions = () => {
  return usePermissionStore(state => state.permissions);
};

/**
 * Hook pour obtenir uniquement les utilisateurs
 */
export const useUsers = () => {
  return usePermissionStore(state => state.users);
};

/**
 * Hook pour obtenir l'état de chargement
 */
export const usePermissionLoading = () => {
  return usePermissionStore(state => state.loading);
};

/**
 * Hook pour obtenir l'erreur actuelle
 */
export const usePermissionError = () => {
  return usePermissionStore(state => state.error);
};

/**
 * Hook pour les actions de gestion des permissions
 */
export const usePermissionActions = () => {
  return usePermissionStore(state => ({
    fetchRoles: state.fetchRoles,
    fetchModules: state.fetchModules,
    fetchPermissions: state.fetchPermissions,
    fetchUsers: state.fetchUsers,
    updatePermission: state.updatePermission,
    updateMultiplePermissions: state.updateMultiplePermissions,
    createRole: state.createRole,
    updateRole: state.updateRole,
    deleteRole: state.deleteRole,
    createModule: state.createModule,
    updateModule: state.updateModule,
    updateUserRole: state.updateUserRole,
    resetToDefaultPermissions: state.resetToDefaultPermissions,
    exportPermissions: state.exportPermissions,
    importPermissions: state.importPermissions,
    checkUserPermission: state.checkUserPermission,
    fetchUserPermissions: state.fetchUserPermissions,
    clearError: state.clearError
  }));
};
