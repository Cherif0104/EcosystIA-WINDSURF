import { supabase } from '../src/lib/supabase.js';
import { User, Role } from '../types';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive?: boolean;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: Role;
  isActive?: boolean;
}

export interface UserFilters {
  role?: Role;
  isActive?: boolean;
  search?: string;
}

export const userManagementService = {
  // Récupérer tous les utilisateurs avec filtres
  async getUsers(filters: UserFilters = {}): Promise<User[]> {
    try {
      let query = supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          is_active,
          created_at,
          updated_at,
          last_login
        `);

      // Appliquer les filtres
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      if (filters.search) {
        query = query.or(`email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error.message);
        throw new Error(error.message);
      }

      return data?.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login
      })) || [];
    } catch (error: any) {
      console.error('Exception lors de la récupération des utilisateurs:', error.message);
      throw error;
    }
  },

  // Créer un nouvel utilisateur
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // Créer l'utilisateur dans auth.users
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role
        }
      });

      if (authError) {
        console.error('Erreur lors de la création de l\'utilisateur auth:', authError.message);
        throw new Error(authError.message);
      }

      if (!authUser.user) {
        throw new Error('Utilisateur non créé');
      }

      // Créer l'entrée dans public.users
      const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .insert([{
          id: authUser.user.id,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          is_active: userData.isActive ?? true
        }])
        .select()
        .single();

      if (publicError) {
        console.error('Erreur lors de la création de l\'utilisateur public:', publicError.message);
        throw new Error(publicError.message);
      }

      return {
        id: publicUser.id,
        email: publicUser.email,
        firstName: publicUser.first_name,
        lastName: publicUser.last_name,
        role: publicUser.role,
        isActive: publicUser.is_active,
        createdAt: publicUser.created_at,
        updatedAt: publicUser.updated_at
      };
    } catch (error: any) {
      console.error('Exception lors de la création de l\'utilisateur:', error.message);
      throw error;
    }
  },

  // Mettre à jour un utilisateur
  async updateUser(userId: string, updateData: UpdateUserData): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: updateData.firstName,
          last_name: updateData.lastName,
          role: updateData.role,
          is_active: updateData.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', error.message);
        throw new Error(error.message);
      }

      // Mettre à jour aussi les métadonnées dans auth.users
      if (updateData.firstName || updateData.lastName || updateData.role) {
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            first_name: updateData.firstName || data.first_name,
            last_name: updateData.lastName || data.last_name,
            role: updateData.role || data.role
          }
        });
      }

      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error: any) {
      console.error('Exception lors de la mise à jour de l\'utilisateur:', error.message);
      throw error;
    }
  },

  // Désactiver un utilisateur
  async deactivateUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Erreur lors de la désactivation de l\'utilisateur:', error.message);
        throw new Error(error.message);
      }

      // Désactiver aussi dans auth.users
      await supabase.auth.admin.updateUserById(userId, {
        ban_duration: '876000h' // Bannir pour 100 ans (désactivation)
      });
    } catch (error: any) {
      console.error('Exception lors de la désactivation de l\'utilisateur:', error.message);
      throw error;
    }
  },

  // Réactiver un utilisateur
  async activateUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Erreur lors de la réactivation de l\'utilisateur:', error.message);
        throw new Error(error.message);
      }

      // Réactiver aussi dans auth.users
      await supabase.auth.admin.updateUserById(userId, {
        ban_duration: 'none'
      });
    } catch (error: any) {
      console.error('Exception lors de la réactivation de l\'utilisateur:', error.message);
      throw error;
    }
  },

  // Supprimer un utilisateur (soft delete)
  async deleteUser(userId: string): Promise<void> {
    try {
      // Soft delete dans public.users
      const { error: publicError } = await supabase
        .from('users')
        .update({ 
          is_active: false,
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (publicError) {
        console.error('Erreur lors de la suppression de l\'utilisateur public:', publicError.message);
        throw new Error(publicError.message);
      }

      // Supprimer de auth.users
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.error('Erreur lors de la suppression de l\'utilisateur auth:', authError.message);
        throw new Error(authError.message);
      }
    } catch (error: any) {
      console.error('Exception lors de la suppression de l\'utilisateur:', error.message);
      throw error;
    }
  },

  // Réinitialiser le mot de passe d'un utilisateur
  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
      });

      if (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error.message);
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Exception lors de la réinitialisation du mot de passe:', error.message);
      throw error;
    }
  },

  // Obtenir les statistiques des utilisateurs
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<Role, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, is_active');

      if (error) {
        console.error('Erreur lors de la récupération des statistiques:', error.message);
        throw new Error(error.message);
      }

      const stats = {
        total: data?.length || 0,
        active: data?.filter(u => u.is_active).length || 0,
        inactive: data?.filter(u => !u.is_active).length || 0,
        byRole: {} as Record<Role, number>
      };

      // Compter par rôle
      const roles: Role[] = ['super_administrator', 'administrator', 'teacher', 'student'];
      roles.forEach(role => {
        stats.byRole[role] = data?.filter(u => u.role === role).length || 0;
      });

      return stats;
    } catch (error: any) {
      console.error('Exception lors de la récupération des statistiques:', error.message);
      throw error;
    }
  }
};
