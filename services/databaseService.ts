import { supabase } from '../src/lib/supabase.js';

/**
 * Service de gestion de la base de données EcosystIA
 * Centralise toutes les opérations CRUD et les requêtes complexes
 */

export interface DatabaseStats {
  totalUsers: number;
  totalProjects: number;
  totalCourses: number;
  totalJobs: number;
  totalTimeLogs: number;
  totalDocuments: number;
  lastActivity: string;
}

export interface UserPermissions {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManage: boolean;
}

export interface ProjectWithTeam {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  client_name: string;
  team_members: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
  }>;
  tasks_count: number;
  completed_tasks: number;
  progress: number;
}

export interface CourseWithStats {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration_hours: number;
  level: string;
  category: string;
  is_published: boolean;
  enrollments_count: number;
  completion_rate: number;
  average_rating: number;
}

export interface JobWithStats {
  id: number;
  title: string;
  company: string;
  job_type: string;
  status: string;
  location: string;
  salary_min: number;
  salary_max: number;
  applications_count: number;
  created_at: string;
}

class DatabaseService {
  private static instance: DatabaseService;

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // =====================================================
  // UTILISATEURS ET PERMISSIONS
  // =====================================================

  /**
   * Récupère les permissions d'un utilisateur pour un module
   */
  async getUserModulePermissions(userId: string, moduleId: string): Promise<UserPermissions | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_module_permissions', {
          user_id: userId,
          module_id: moduleId
        });

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération des permissions:', error);
      return null;
    }
  }

  /**
   * Récupère tous les modules accessibles par un utilisateur
   */
  async getUserAccessibleModules(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_accessible_modules', {
          user_id: userId
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des modules:', error);
      return [];
    }
  }

  /**
   * Met à jour le profil utilisateur
   */
  async updateUserProfile(userId: string, updates: Partial<any>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return false;
    }
  }

  /**
   * Récupère la liste des utilisateurs avec filtres
   */
  async getUsers(filters: {
    role?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<any[]> {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
  }

  // =====================================================
  // PROJETS
  // =====================================================

  /**
   * Récupère les projets avec informations d'équipe
   */
  async getProjectsWithTeam(filters: {
    status?: string;
    user_id?: string;
    is_public?: boolean;
    limit?: number;
  } = {}): Promise<ProjectWithTeam[]> {
    try {
      let query = supabase
        .from('projects')
        .select(`
          *,
          project_team_members!inner(
            user_id,
            role,
            is_active,
            users!inner(
              id,
              name,
              email,
              role,
              avatar
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transformer les données pour inclure les statistiques
      return (data || []).map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        priority: project.priority,
        due_date: project.due_date,
        client_name: project.client_name,
        team_members: project.project_team_members?.map(member => ({
          id: member.users.id,
          name: member.users.name,
          email: member.users.email,
          role: member.users.role,
          avatar: member.users.avatar
        })) || [],
        tasks_count: 0, // À calculer séparément
        completed_tasks: 0, // À calculer séparément
        progress: 0 // À calculer séparément
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      return [];
    }
  }

  /**
   * Crée un nouveau projet
   */
  async createProject(projectData: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: string;
    client_name?: string;
    budget?: number;
    team_members?: string[];
  }, creatorId: string): Promise<number | null> {
    try {
      // Créer le projet
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          created_by: creatorId
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Ajouter les membres d'équipe
      if (projectData.team_members && projectData.team_members.length > 0) {
        const teamData = projectData.team_members.map(memberId => ({
          project_id: project.id,
          user_id: memberId,
          role: 'member'
        }));

        const { error: teamError } = await supabase
          .from('project_team_members')
          .insert(teamData);

        if (teamError) throw teamError;
      }

      return project.id;
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      return null;
    }
  }

  /**
   * Met à jour un projet
   */
  async updateProject(projectId: number, updates: Partial<any>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      return false;
    }
  }

  /**
   * Supprime un projet
   */
  async deleteProject(projectId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      return false;
    }
  }

  // =====================================================
  // COURS
  // =====================================================

  /**
   * Récupère les cours avec statistiques
   */
  async getCoursesWithStats(filters: {
    level?: string;
    category?: string;
    is_published?: boolean;
    limit?: number;
  } = {}): Promise<CourseWithStats[]> {
    try {
      let query = supabase
        .from('courses')
        .select(`
          *,
          course_enrollments(count)
        `)
        .order('created_at', { ascending: false });

      if (filters.level) {
        query = query.eq('level', filters.level);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.is_published !== undefined) {
        query = query.eq('is_published', filters.is_published);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        duration_hours: course.duration_hours,
        level: course.level,
        category: course.category,
        is_published: course.is_published,
        enrollments_count: course.course_enrollments?.[0]?.count || 0,
        completion_rate: 0, // À calculer séparément
        average_rating: 0 // À calculer séparément
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des cours:', error);
      return [];
    }
  }

  /**
   * Inscrit un utilisateur à un cours
   */
  async enrollInCourse(courseId: number, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          user_id: userId,
          status: 'enrolled'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'inscription au cours:', error);
      return false;
    }
  }

  // =====================================================
  // EMPLOIS
  // =====================================================

  /**
   * Récupère les emplois avec statistiques
   */
  async getJobsWithStats(filters: {
    job_type?: string;
    status?: string;
    location?: string;
    limit?: number;
  } = {}): Promise<JobWithStats[]> {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          job_applications(count)
        `)
        .order('created_at', { ascending: false });

      if (filters.job_type) {
        query = query.eq('job_type', filters.job_type);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        job_type: job.job_type,
        status: job.status,
        location: job.location,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        applications_count: job.job_applications?.[0]?.count || 0,
        created_at: job.created_at
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des emplois:', error);
      return [];
    }
  }

  /**
   * Postule à un emploi
   */
  async applyToJob(jobId: number, userId: string, applicationData: {
    cover_letter?: string;
    resume_url?: string;
    portfolio_url?: string;
    expected_salary?: number;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          user_id: userId,
          status: 'Applied',
          ...applicationData
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la candidature:', error);
      return false;
    }
  }

  // =====================================================
  // SUIVI DU TEMPS
  // =====================================================

  /**
   * Récupère les logs de temps d'un utilisateur
   */
  async getTimeLogs(userId: string, filters: {
    start_date?: string;
    end_date?: string;
    project_id?: number;
    limit?: number;
  } = {}): Promise<any[]> {
    try {
      let query = supabase
        .from('time_logs')
        .select(`
          *,
          projects(title),
          tasks(title)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (filters.start_date) {
        query = query.gte('date', filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte('date', filters.end_date);
      }

      if (filters.project_id) {
        query = query.eq('project_id', filters.project_id);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des logs de temps:', error);
      return [];
    }
  }

  /**
   * Ajoute un log de temps
   */
  async addTimeLog(logData: {
    user_id: string;
    project_id?: number;
    task_id?: string;
    course_id?: number;
    date: string;
    duration: number;
    description?: string;
    billable?: boolean;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('time_logs')
        .insert(logData);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du log de temps:', error);
      return false;
    }
  }

  // =====================================================
  // STATISTIQUES GÉNÉRALES
  // =====================================================

  /**
   * Récupère les statistiques générales de la base de données
   */
  async getDatabaseStats(): Promise<DatabaseStats | null> {
    try {
      const [usersResult, projectsResult, coursesResult, jobsResult, timeLogsResult, documentsResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('time_logs').select('id', { count: 'exact', head: true }),
        supabase.from('documents').select('id', { count: 'exact', head: true })
      ]);

      const lastActivityResult = await supabase
        .from('system_logs')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        totalUsers: usersResult.count || 0,
        totalProjects: projectsResult.count || 0,
        totalCourses: coursesResult.count || 0,
        totalJobs: jobsResult.count || 0,
        totalTimeLogs: timeLogsResult.count || 0,
        totalDocuments: documentsResult.count || 0,
        lastActivity: lastActivityResult.data?.created_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return null;
    }
  }

  // =====================================================
  // LOGS SYSTÈME
  // =====================================================

  /**
   * Log une action système
   */
  async logSystemAction(
    userId: string | null,
    module: string,
    action: string,
    details?: string,
    severity: 'info' | 'warning' | 'error' | 'critical' = 'info'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('log_system_action', {
          p_user_id: userId,
          p_module: module,
          p_action: action,
          p_details: details,
          p_severity: severity
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors du log système:', error);
      return false;
    }
  }

  /**
   * Récupère les logs système
   */
  async getSystemLogs(filters: {
    module?: string;
    severity?: string;
    user_id?: string;
    limit?: number;
  } = {}): Promise<any[]> {
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.module) {
        query = query.eq('module', filters.module);
      }

      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des logs système:', error);
      return [];
    }
  }
}

export const databaseService = DatabaseService.getInstance();
export default databaseService;
