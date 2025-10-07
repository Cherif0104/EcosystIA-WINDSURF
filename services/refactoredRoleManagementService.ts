import { supabase } from './supabaseClient';

// =====================================================
// TYPES POUR LE SYSTÈME DE PERMISSIONS REFACTORISÉ
// =====================================================

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Module {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  icon?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Permission {
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_manage: boolean;
}

export interface RolePermission {
  id: string;
  role_id: string;
  module_id: string;
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_manage: boolean;
  created_at: string;
  updated_at: string;
  granted_by?: string;
}

export interface RoleModulePermissions {
  [roleId: string]: {
    [moduleId: string]: Permission;
  };
}

export interface PermissionUpdate {
  can_view?: boolean;
  can_create?: boolean;
  can_update?: boolean;
  can_delete?: boolean;
  can_manage?: boolean;
}

export interface UserWithRole {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role_id?: string;
  status: string;
  last_login?: string;
  email_verified: boolean;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  preferred_language: string;
  timezone: string;
  created_at: string;
  updated_at: string;
  role?: Role;
}

// =====================================================
// SERVICE REFACTORISÉ POUR LA GESTION DES RÔLES
// =====================================================

export class RefactoredRoleManagementService {
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  // =====================================================
  // MÉTHODES DE CACHE
  // =====================================================

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  // =====================================================
  // GESTION DES RÔLES
  // =====================================================

  /**
   * Récupère tous les rôles
   */
  async fetchRoles(): Promise<Role[]> {
    const cacheKey = 'roles';
    const cached = this.getCachedData<Role[]>(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('is_active', true)
      .order('display_name');

    if (error) {
      console.error('Erreur lors de la récupération des rôles:', error);
      throw new Error(`Impossible de récupérer les rôles: ${error.message}`);
    }

    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Récupère un rôle par son ID
   */
  async fetchRoleById(roleId: string): Promise<Role | null> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du rôle:', error);
      return null;
    }

    return data;
  }

  /**
   * Crée un nouveau rôle
   */
  async createRole(roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .insert(roleData)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du rôle:', error);
      throw new Error(`Impossible de créer le rôle: ${error.message}`);
    }

    this.clearCache();
    return data;
  }

  /**
   * Met à jour un rôle
   */
  async updateRole(roleId: string, roleData: Partial<Role>): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .update(roleData)
      .eq('id', roleId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      throw new Error(`Impossible de mettre à jour le rôle: ${error.message}`);
    }

    this.clearCache();
    return data;
  }

  /**
   * Supprime un rôle (soft delete)
   */
  async deleteRole(roleId: string): Promise<void> {
    const { error } = await supabase
      .from('roles')
      .update({ is_active: false })
      .eq('id', roleId)
      .eq('is_system_role', false); // Empêche la suppression des rôles système

    if (error) {
      console.error('Erreur lors de la suppression du rôle:', error);
      throw new Error(`Impossible de supprimer le rôle: ${error.message}`);
    }

    this.clearCache();
  }

  // =====================================================
  // GESTION DES MODULES
  // =====================================================

  /**
   * Récupère tous les modules
   */
  async fetchModules(): Promise<Module[]> {
    const cacheKey = 'modules';
    const cached = this.getCachedData<Module[]>(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (error) {
      console.error('Erreur lors de la récupération des modules:', error);
      throw new Error(`Impossible de récupérer les modules: ${error.message}`);
    }

    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Crée un nouveau module
   */
  async createModule(moduleData: Omit<Module, 'id' | 'created_at' | 'updated_at'>): Promise<Module> {
    const { data, error } = await supabase
      .from('modules')
      .insert(moduleData)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du module:', error);
      throw new Error(`Impossible de créer le module: ${error.message}`);
    }

    this.clearCache();
    return data;
  }

  /**
   * Met à jour un module
   */
  async updateModule(moduleId: string, moduleData: Partial<Module>): Promise<Module> {
    const { data, error } = await supabase
      .from('modules')
      .update(moduleData)
      .eq('id', moduleId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du module:', error);
      throw new Error(`Impossible de mettre à jour le module: ${error.message}`);
    }

    this.clearCache();
    return data;
  }

  // =====================================================
  // GESTION DES PERMISSIONS
  // =====================================================

  /**
   * Récupère toutes les permissions sous forme de matrice
   */
  async fetchPermissions(): Promise<RoleModulePermissions> {
    const cacheKey = 'permissions_matrix';
    const cached = this.getCachedData<RoleModulePermissions>(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('role_permissions')
      .select(`
        *,
        roles(name, display_name),
        modules(name, display_name)
      `);

    if (error) {
      console.error('Erreur lors de la récupération des permissions:', error);
      throw new Error(`Impossible de récupérer les permissions: ${error.message}`);
    }

    const matrix = this.transformToMatrix(data);
    this.setCachedData(cacheKey, matrix);
    return matrix;
  }

  /**
   * Met à jour une permission spécifique
   */
  async updatePermission(
    roleId: string,
    moduleId: string,
    permissions: PermissionUpdate
  ): Promise<void> {
    const { error } = await supabase
      .from('role_permissions')
      .upsert({
        role_id: roleId,
        module_id: moduleId,
        ...permissions
      });

    if (error) {
      console.error('Erreur lors de la mise à jour de la permission:', error);
      throw new Error(`Impossible de mettre à jour la permission: ${error.message}`);
    }

    this.clearCache();
  }

  /**
   * Met à jour plusieurs permissions en une seule fois
   */
  async updateMultiplePermissions(
    updates: Array<{
      roleId: string;
      moduleId: string;
      permissions: PermissionUpdate;
    }>
  ): Promise<void> {
    const upsertData = updates.map(({ roleId, moduleId, permissions }) => ({
      role_id: roleId,
      module_id: moduleId,
      ...permissions
    }));

    const { error } = await supabase
      .from('role_permissions')
      .upsert(upsertData);

    if (error) {
      console.error('Erreur lors de la mise à jour des permissions:', error);
      throw new Error(`Impossible de mettre à jour les permissions: ${error.message}`);
    }

    this.clearCache();
  }

  /**
   * Supprime toutes les permissions d'un rôle
   */
  async clearRolePermissions(roleId: string): Promise<void> {
    const { error } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);

    if (error) {
      console.error('Erreur lors de la suppression des permissions:', error);
      throw new Error(`Impossible de supprimer les permissions: ${error.message}`);
    }

    this.clearCache();
  }

  // =====================================================
  // GESTION DES UTILISATEURS
  // =====================================================

  /**
   * Récupère tous les utilisateurs avec leurs rôles
   */
  async fetchUsers(): Promise<UserWithRole[]> {
    const cacheKey = 'users_with_roles';
    const cached = this.getCachedData<UserWithRole[]>(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('status', 'active')
      .order('name');

    if (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw new Error(`Impossible de récupérer les utilisateurs: ${error.message}`);
    }

    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Met à jour le rôle d'un utilisateur
   */
  async updateUserRole(userId: string, roleId: string): Promise<UserWithRole> {
    const { data, error } = await supabase
      .from('users')
      .update({ role_id: roleId })
      .eq('id', userId)
      .select(`
        *,
        role:roles(*)
      `)
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du rôle utilisateur:', error);
      throw new Error(`Impossible de mettre à jour le rôle utilisateur: ${error.message}`);
    }

    this.clearCache();
    return data;
  }

  // =====================================================
  // MÉTHODES UTILITAIRES
  // =====================================================

  /**
   * Transforme les données de permissions en matrice
   */
  private transformToMatrix(data: any[]): RoleModulePermissions {
    const matrix: RoleModulePermissions = {};

    data.forEach((permission: any) => {
      const roleId = permission.role_id;
      const moduleId = permission.module_id;

      if (!matrix[roleId]) {
        matrix[roleId] = {};
      }

      matrix[roleId][moduleId] = {
        can_view: permission.can_view,
        can_create: permission.can_create,
        can_update: permission.can_update,
        can_delete: permission.can_delete,
        can_manage: permission.can_manage
      };
    });

    return matrix;
  }

  /**
   * Vérifie si un utilisateur a une permission spécifique
   */
  async checkUserPermission(
    userId: string,
    moduleName: string,
    action: 'view' | 'create' | 'update' | 'delete' | 'manage'
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        role:roles(
          role_permissions(
            can_view,
            can_create,
            can_update,
            can_delete,
            can_manage,
            modules(name)
          )
        )
      `)
      .eq('id', userId)
      .single();

    if (error || !data?.role) {
      return false;
    }

    const permission = data.role.role_permissions?.find(
      (p: any) => p.modules?.name === moduleName
    );

    if (!permission) {
      return false;
    }

    switch (action) {
      case 'view':
        return permission.can_view;
      case 'create':
        return permission.can_create;
      case 'update':
        return permission.can_update;
      case 'delete':
        return permission.can_delete;
      case 'manage':
        return permission.can_manage;
      default:
        return false;
    }
  }

  /**
   * Récupère les permissions d'un utilisateur pour tous les modules
   */
  async fetchUserPermissions(userId: string): Promise<Record<string, Permission>> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        role:roles(
          role_permissions(
            can_view,
            can_create,
            can_update,
            can_delete,
            can_manage,
            modules(name)
          )
        )
      `)
      .eq('id', userId)
      .single();

    if (error || !data?.role) {
      return {};
    }

    const permissions: Record<string, Permission> = {};

    data.role.role_permissions?.forEach((permission: any) => {
      const moduleName = permission.modules?.name;
      if (moduleName) {
        permissions[moduleName] = {
          can_view: permission.can_view,
          can_create: permission.can_create,
          can_update: permission.can_update,
          can_delete: permission.can_delete,
          can_manage: permission.can_manage
        };
      }
    });

    return permissions;
  }

  // =====================================================
  // MÉTHODES DE RÉINITIALISATION
  // =====================================================

  /**
   * Réinitialise toutes les permissions aux valeurs par défaut
   */
  async resetToDefaultPermissions(): Promise<void> {
    // Supprimer toutes les permissions existantes
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete();

    if (deleteError) {
      console.error('Erreur lors de la suppression des permissions:', deleteError);
      throw new Error(`Impossible de supprimer les permissions: ${deleteError.message}`);
    }

    // Réinsérer les permissions par défaut
    const roles = await this.fetchRoles();
    const modules = await this.fetchModules();

    const defaultPermissions = [];

    // Super administrateur : toutes les permissions
    const superAdminRole = roles.find(r => r.name === 'super_administrator');
    if (superAdminRole) {
      modules.forEach(module => {
        defaultPermissions.push({
          role_id: superAdminRole.id,
          module_id: module.id,
          can_view: true,
          can_create: true,
          can_update: true,
          can_delete: true,
          can_manage: true
        });
      });
    }

    // Administrateur : permissions limitées
    const adminRole = roles.find(r => r.name === 'administrator');
    if (adminRole) {
      modules.forEach(module => {
        const canManage = ['user_management'].includes(module.name);
        const canCreate = ['projects', 'courses', 'jobs'].includes(module.name);
        const canUpdate = ['projects', 'courses', 'jobs', 'user_management', 'settings'].includes(module.name);
        const canDelete = ['projects', 'courses', 'jobs'].includes(module.name);

        defaultPermissions.push({
          role_id: adminRole.id,
          module_id: module.id,
          can_view: true,
          can_create: canCreate,
          can_update: canUpdate,
          can_delete: canDelete,
          can_manage: canManage
        });
      });
    }

    // Autres rôles : permissions de base
    const otherRoles = roles.filter(r => !['super_administrator', 'administrator'].includes(r.name));
    otherRoles.forEach(role => {
      modules.forEach(module => {
        const canView = ['dashboard', 'projects', 'courses', 'time_tracking', 'settings'].includes(module.name);
        const canCreate = ['manager', 'teacher', 'trainer'].includes(role.name) && ['projects', 'courses'].includes(module.name);
        const canUpdate = ['manager', 'teacher', 'trainer'].includes(role.name) && ['projects', 'courses'].includes(module.name);

        defaultPermissions.push({
          role_id: role.id,
          module_id: module.id,
          can_view: canView,
          can_create: canCreate,
          can_update: canUpdate,
          can_delete: false,
          can_manage: false
        });
      });
    });

    // Insérer toutes les permissions par défaut
    const { error: insertError } = await supabase
      .from('role_permissions')
      .insert(defaultPermissions);

    if (insertError) {
      console.error('Erreur lors de la réinsertion des permissions:', insertError);
      throw new Error(`Impossible de réinitialiser les permissions: ${insertError.message}`);
    }

    this.clearCache();
  }

  /**
   * Exporte la configuration actuelle des permissions
   */
  async exportPermissions(): Promise<{
    roles: Role[];
    modules: Module[];
    permissions: RoleModulePermissions;
  }> {
    const [roles, modules, permissions] = await Promise.all([
      this.fetchRoles(),
      this.fetchModules(),
      this.fetchPermissions()
    ]);

    return {
      roles,
      modules,
      permissions
    };
  }

  /**
   * Importe une configuration de permissions
   */
  async importPermissions(config: {
    roles: Role[];
    modules: Module[];
    permissions: RoleModulePermissions;
  }): Promise<void> {
    // Supprimer toutes les permissions existantes
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete();

    if (deleteError) {
      throw new Error(`Impossible de supprimer les permissions existantes: ${deleteError.message}`);
    }

    // Insérer les nouvelles permissions
    const permissionsToInsert = [];
    
    Object.entries(config.permissions).forEach(([roleId, modulePermissions]) => {
      Object.entries(modulePermissions).forEach(([moduleId, permission]) => {
        permissionsToInsert.push({
          role_id: roleId,
          module_id: moduleId,
          ...permission
        });
      });
    });

    const { error: insertError } = await supabase
      .from('role_permissions')
      .insert(permissionsToInsert);

    if (insertError) {
      throw new Error(`Impossible d'importer les permissions: ${insertError.message}`);
    }

    this.clearCache();
  }
}

// =====================================================
// INSTANCE SINGLETON DU SERVICE
// =====================================================

export const refactoredRoleManagementService = new RefactoredRoleManagementService();
