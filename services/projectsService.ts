import { supabase } from './supabaseClient';
import { Project } from '../types/Project';

export interface ProjectData {
  id?: string;
  title: string;
  description: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  budget?: number;
  currency?: string;
  client_name?: string;
  team: Array<{id: number; name: string; role: string}>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

class ProjectsService {
  private tableName = 'projects';

  // Récupérer tous les projets
  async getAllProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getAllProjects:', error);
      throw error;
    }
  }

  // Récupérer un projet par ID
  async getProjectById(id: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du projet:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur dans getProjectById:', error);
      return null;
    }
  }

  // Créer un nouveau projet
  async createProject(projectData: Omit<ProjectData, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    try {
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      const projectToCreate = {
        ...projectData,
        created_by: user?.id,
        updated_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([projectToCreate])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du projet:', error);
        throw error;
      }

      console.log('✅ Projet créé avec succès:', data);
      return data;
    } catch (error) {
      console.error('Erreur dans createProject:', error);
      throw error;
    }
  }

  // Mettre à jour un projet
  async updateProject(id: string, projectData: Partial<ProjectData>): Promise<Project> {
    try {
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      const projectToUpdate = {
        ...projectData,
        updated_by: user?.id,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(projectToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du projet:', error);
        throw error;
      }

      console.log('✅ Projet mis à jour avec succès:', data);
      return data;
    } catch (error) {
      console.error('Erreur dans updateProject:', error);
      throw error;
    }
  }

  // Supprimer un projet
  async deleteProject(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du projet:', error);
        throw error;
      }

      console.log('✅ Projet supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur dans deleteProject:', error);
      throw error;
    }
  }

  // Rechercher des projets
  async searchProjects(query: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,client_name.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la recherche des projets:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans searchProjects:', error);
      throw error;
    }
  }

  // Filtrer les projets par statut
  async getProjectsByStatus(status: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du filtrage par statut:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getProjectsByStatus:', error);
      throw error;
    }
  }

  // Filtrer les projets par priorité
  async getProjectsByPriority(priority: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('priority', priority)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du filtrage par priorité:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getProjectsByPriority:', error);
      throw error;
    }
  }

  // Obtenir les statistiques des projets
  async getProjectStats(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('project_stats')
        .select('*');

      if (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getProjectStats:', error);
      throw error;
    }
  }

  // Exporter les projets en JSON
  async exportProjects(format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const projects = await this.getAllProjects();
      
      if (format === 'json') {
        return JSON.stringify(projects, null, 2);
      } else {
        // Conversion CSV
        const headers = ['ID', 'Titre', 'Description', 'Statut', 'Priorité', 'Date d\'échéance', 'Budget', 'Client', 'Équipe'];
        const csvRows = [headers.join(',')];
        
        projects.forEach(project => {
          const row = [
            project.id,
            `"${project.title}"`,
            `"${project.description}"`,
            project.status,
            project.priority,
            project.due_date || '',
            project.budget || '',
            `"${project.client_name || ''}"`,
            `"${project.team?.map(member => member.name).join('; ') || ''}"`
          ];
          csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
      }
    } catch (error) {
      console.error('Erreur dans exportProjects:', error);
      throw error;
    }
  }

  // S'abonner aux changements en temps réel
  subscribeToProjects(callback: (projects: Project[]) => void) {
    return supabase
      .channel('projects_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: this.tableName 
        }, 
        async () => {
          try {
            const projects = await this.getAllProjects();
            callback(projects);
          } catch (error) {
            console.error('Erreur lors de la synchronisation:', error);
          }
        }
      )
      .subscribe();
  }
}

export const projectsService = new ProjectsService();
