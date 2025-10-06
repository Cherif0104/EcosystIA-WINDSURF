import { supabase } from '../src/lib/supabase.js';
import { logService } from './logService';

// Types pour la gestion des rôles et permissions
export interface CustomRole {
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

export interface Permission {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  module: string;
  action: string;
  resource?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  granted_at: string;
  granted_by?: string;
}

export interface UserGroup {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface UserGroupMembership {
  id: string;
  user_id: string;
  group_id: string;
  joined_at: string;
  joined_by?: string;
}

export interface GroupRole {
  id: string;
  group_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by?: string;
}

export interface RoleWithPermissions extends CustomRole {
  permissions: Permission[];
}

export interface UserWithRoles {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  custom_roles: CustomRole[];
  groups: UserGroup[];
}

export const roleManagementService = {
  // ========================================
  // GESTION DES RÔLES PERSONNALISÉS
  // ========================================

  async getCustomRoles(): Promise<CustomRole[]> {
    try {
      const { data, error } = await supabase
        .from('custom_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error fetching custom roles: ${error.message}`);
      }
      return data || [];
    } catch (error: any) {
      console.error('Exception lors de la récupération des rôles:', error.message);
      return [];
    }
  },

  async getCustomRoleById(roleId: string): Promise<CustomRole | null> {
    try {
      const { data, error } = await supabase
        .from('custom_roles')
        .select('*')
        .eq('id', roleId)
        .single();

      if (error) {
        throw new Error(`Error fetching custom role: ${error.message}`);
      }
      return data;
    } catch (error: any) {
      console.error('Exception lors de la récupération du rôle:', error.message);
      return null;
    }
  },

  async createCustomRole(roleData: {
    name: string;
    display_name: string;
    description?: string;
  }): Promise<CustomRole | null> {
    try {
      const { data, error } = await supabase
        .from('custom_roles')
        .insert([roleData])
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating custom role: ${error.message}`);
      }

      await logService.logUserManagement(
        data.created_by || 'system',
        'system@admin.com',
        'super_administrator',
        'Custom Role Created',
        `Custom role "${roleData.name}" created`
      );

      return data;
    } catch (error: any) {
      console.error('Exception lors de la création du rôle:', error.message);
      throw error;
    }
  },

  async updateCustomRole(roleId: string, updates: Partial<CustomRole>): Promise<CustomRole | null> {
    try {
      const { data, error } = await supabase
        .from('custom_roles')
        .update(updates)
        .eq('id', roleId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating custom role: ${error.message}`);
      }

      await logService.logUserManagement(
        data.created_by || 'system',
        'system@admin.com',
        'super_administrator',
        'Custom Role Updated',
        `Custom role "${data.name}" updated`
      );

      return data;
    } catch (error: any) {
      console.error('Exception lors de la mise à jour du rôle:', error.message);
      throw error;
    }
  },

  async deleteCustomRole(roleId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('custom_roles')
        .delete()
        .eq('id', roleId);

      if (error) {
        throw new Error(`Error deleting custom role: ${error.message}`);
      }

      await logService.logUserManagement(
        'system',
        'system@admin.com',
        'super_administrator',
        'Custom Role Deleted',
        `Custom role with ID ${roleId} deleted`
      );

      return true;
    } catch (error: any) {
      console.error('Exception lors de la suppression du rôle:', error.message);
      throw error;
    }
  },

  // ========================================
  // GESTION DES PERMISSIONS
  // ========================================

  async getPermissions(): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('module', { ascending: true })
        .order('action', { ascending: true });

      if (error) {
        throw new Error(`Error fetching permissions: ${error.message}`);
      }
      return data || [];
    } catch (error: any) {
      console.error('Exception lors de la récupération des permissions:', error.message);
      return [];
    }
  },

  async getPermissionsByModule(): Promise<Record<string, Permission[]>> {
    try {
      const permissions = await this.getPermissions();
      return permissions.reduce((acc, permission) => {
        if (!acc[permission.module]) {
          acc[permission.module] = [];
        }
        acc[permission.module].push(permission);
        return acc;
      }, {} as Record<string, Permission[]>);
    } catch (error: any) {
      console.error('Exception lors du groupement des permissions:', error.message);
      return {};
    }
  },

  // ========================================
  // GESTION DES PERMISSIONS DE RÔLES
  // ========================================

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          permission_id,
          permissions (
            id,
            name,
            display_name,
            description,
            module,
            action,
            resource,
            is_active,
            created_at,
            updated_at
          )
        `)
        .eq('role_id', roleId);

      if (error) {
        throw new Error(`Error fetching role permissions: ${error.message}`);
      }

      return data?.map(item => item.permissions).filter(Boolean) || [];
    } catch (error: any) {
      console.error('Exception lors de la récupération des permissions du rôle:', error.message);
      return [];
    }
  },

  async assignPermissionToRole(roleId: string, permissionId: string, grantedBy?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('role_permissions')
        .insert([{
          role_id: roleId,
          permission_id: permissionId,
          granted_by: grantedBy
        }]);

      if (error) {
        throw new Error(`Error assigning permission to role: ${error.message}`);
      }

      return true;
    } catch (error: any) {
      console.error('Exception lors de l\'attribution de permission:', error.message);
      throw error;
    }
  },

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId)
        .eq('permission_id', permissionId);

      if (error) {
        throw new Error(`Error removing permission from role: ${error.message}`);
      }

      return true;
    } catch (error: any) {
      console.error('Exception lors de la suppression de permission:', error.message);
      throw error;
    }
  },

  async updateRolePermissions(roleId: string, permissionIds: string[], grantedBy?: string): Promise<boolean> {
    try {
      // Supprimer toutes les permissions existantes
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      if (deleteError) {
        throw new Error(`Error clearing role permissions: ${deleteError.message}`);
      }

      // Ajouter les nouvelles permissions
      if (permissionIds.length > 0) {
        const rolePermissions = permissionIds.map(permissionId => ({
          role_id: roleId,
          permission_id: permissionId,
          granted_by: grantedBy
        }));

        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);

        if (insertError) {
          throw new Error(`Error assigning new permissions: ${insertError.message}`);
        }
      }

      await logService.logUserManagement(
        grantedBy || 'system',
        'system@admin.com',
        'super_administrator',
        'Role Permissions Updated',
        `Permissions updated for role ${roleId}`
      );

      return true;
    } catch (error: any) {
      console.error('Exception lors de la mise à jour des permissions:', error.message);
      throw error;
    }
  },

  // ========================================
  // GESTION DES GROUPES D'UTILISATEURS
  // ========================================

  async getUserGroups(): Promise<UserGroup[]> {
    try {
      const { data, error } = await supabase
        .from('user_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error fetching user groups: ${error.message}`);
      }
      return data || [];
    } catch (error: any) {
      console.error('Exception lors de la récupération des groupes:', error.message);
      return [];
    }
  },

  async createUserGroup(groupData: {
    name: string;
    display_name: string;
    description?: string;
  }): Promise<UserGroup | null> {
    try {
      const { data, error } = await supabase
        .from('user_groups')
        .insert([groupData])
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating user group: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.error('Exception lors de la création du groupe:', error.message);
      throw error;
    }
  },

  async updateUserGroup(groupId: string, updates: Partial<UserGroup>): Promise<UserGroup | null> {
    try {
      const { data, error } = await supabase
        .from('user_groups')
        .update(updates)
        .eq('id', groupId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating user group: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.error('Exception lors de la mise à jour du groupe:', error.message);
      throw error;
    }
  },

  async deleteUserGroup(groupId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_groups')
        .delete()
        .eq('id', groupId);

      if (error) {
        throw new Error(`Error deleting user group: ${error.message}`);
      }

      return true;
    } catch (error: any) {
      console.error('Exception lors de la suppression du groupe:', error.message);
      throw error;
    }
  },

  // ========================================
  // GESTION DES MEMBRES DE GROUPES
  // ========================================

  async getGroupMembers(groupId: string): Promise<UserWithRoles[]> {
    try {
      const { data, error } = await supabase
        .from('user_group_memberships')
        .select(`
          user_id,
          users (
            id,
            email,
            first_name,
            last_name,
            role
          )
        `)
        .eq('group_id', groupId);

      if (error) {
        throw new Error(`Error fetching group members: ${error.message}`);
      }

      return data?.map(item => item.users).filter(Boolean) || [];
    } catch (error: any) {
      console.error('Exception lors de la récupération des membres:', error.message);
      return [];
    }
  },

  async addUserToGroup(userId: string, groupId: string, addedBy?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_group_memberships')
        .insert([{
          user_id: userId,
          group_id: groupId,
          joined_by: addedBy
        }]);

      if (error) {
        throw new Error(`Error adding user to group: ${error.message}`);
      }

      return true;
    } catch (error: any) {
      console.error('Exception lors de l\'ajout d\'utilisateur au groupe:', error.message);
      throw error;
    }
  },

  async removeUserFromGroup(userId: string, groupId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_group_memberships')
        .delete()
        .eq('user_id', userId)
        .eq('group_id', groupId);

      if (error) {
        throw new Error(`Error removing user from group: ${error.message}`);
      }

      return true;
    } catch (error: any) {
      console.error('Exception lors de la suppression d\'utilisateur du groupe:', error.message);
      throw error;
    }
  },

  // ========================================
  // VÉRIFICATION DES PERMISSIONS
  // ========================================

  async checkUserPermission(userId: string, permissionName: string): Promise<boolean> {
    try {
      // Vérifier les permissions via le rôle système
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user role:', userError.message);
        return false;
      }

      // Vérifier les permissions via les rôles personnalisés
      const { data: rolePermissions, error: roleError } = await supabase
        .from('role_permissions')
        .select(`
          custom_roles!inner(name),
          permissions!inner(name)
        `)
        .eq('custom_roles.name', user.role);

      if (roleError) {
        console.error('Error fetching role permissions:', roleError.message);
        return false;
      }

      // Vérifier les permissions via les groupes
      const { data: groupPermissions, error: groupError } = await supabase
        .from('user_group_memberships')
        .select(`
          group_roles (
            custom_roles!inner(name),
            permissions!inner(name)
          )
        `)
        .eq('user_id', userId);

      if (groupError) {
        console.error('Error fetching group permissions:', groupError.message);
        return false;
      }

      // Vérifier si la permission existe
      const hasRolePermission = rolePermissions?.some(rp => rp.permissions.name === permissionName);
      const hasGroupPermission = groupPermissions?.some(gp => 
        gp.group_roles?.permissions?.name === permissionName
      );

      return hasRolePermission || hasGroupPermission || false;
    } catch (error: any) {
      console.error('Exception lors de la vérification de permission:', error.message);
      return false;
    }
  },

  // ========================================
  // UTILITAIRES
  // ========================================

  async getRoleWithPermissions(roleId: string): Promise<RoleWithPermissions | null> {
    try {
      const role = await this.getCustomRoleById(roleId);
      if (!role) return null;

      const permissions = await this.getRolePermissions(roleId);
      
      return {
        ...role,
        permissions
      };
    } catch (error: any) {
      console.error('Exception lors de la récupération du rôle avec permissions:', error.message);
      return null;
    }
  },

  async getRolesStatistics(): Promise<{
    total_roles: number;
    system_roles: number;
    custom_roles: number;
    active_roles: number;
    inactive_roles: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('custom_roles')
        .select('is_system_role, is_active');

      if (error) {
        throw new Error(`Error fetching roles statistics: ${error.message}`);
      }

      const stats = {
        total_roles: data?.length || 0,
        system_roles: data?.filter(r => r.is_system_role).length || 0,
        custom_roles: data?.filter(r => !r.is_system_role).length || 0,
        active_roles: data?.filter(r => r.is_active).length || 0,
        inactive_roles: data?.filter(r => !r.is_active).length || 0,
      };

      return stats;
    } catch (error: any) {
      console.error('Exception lors de la récupération des statistiques:', error.message);
      throw error;
    }
  }
};
