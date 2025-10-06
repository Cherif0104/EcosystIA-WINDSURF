import { supabase } from '../src/lib/supabase.js';
import { User, Role } from '../types';

// Service d'optimisation Supabase pour SENEGEL
class SupabaseOptimizationService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  // Cache intelligent avec TTL
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCachedData(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Optimisation des requêtes utilisateur
  async getOptimizedUserProfile(userId: string): Promise<User | null> {
    const cacheKey = `user_profile_${userId}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user profile:', error.message);
      return null;
    }

    if (data) {
      const user: User = {
        id: data.id,
        name: data.full_name || data.email,
        email: data.email,
        avatar: data.avatar_url || '',
        role: data.role as Role,
        skills: data.skills || [],
        phone: data.phone || '',
        location: data.location || '',
      };
      
      this.setCachedData(cacheKey, user, 10 * 60 * 1000); // 10 minutes pour les profils
      return user;
    }
    return null;
  }

  // Optimisation des requêtes de logs système
  async getSystemLogsOptimized(filters: {
    userId?: string;
    module?: string;
    severity?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<any[]> {
    const cacheKey = `system_logs_${JSON.stringify(filters)}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    let query = supabase
      .from('system_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.module) {
      query = query.eq('module', filters.module);
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching system logs:', error.message);
      return [];
    }

    this.setCachedData(cacheKey, data || [], 2 * 60 * 1000); // 2 minutes pour les logs
    return data || [];
  }

  // Optimisation des requêtes de projets
  async getProjectsOptimized(userId?: string): Promise<any[]> {
    const cacheKey = `projects_${userId || 'all'}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    let query = supabase
      .from('projects')
      .select(`
        *,
        project_members!inner(
          user_id,
          users!inner(id, full_name, email, avatar_url)
        )
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('project_members.user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error.message);
      return [];
    }

    this.setCachedData(cacheKey, data || [], 5 * 60 * 1000); // 5 minutes pour les projets
    return data || [];
  }

  // Optimisation des requêtes de cours
  async getCoursesOptimized(userId?: string): Promise<any[]> {
    const cacheKey = `courses_${userId || 'all'}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    let query = supabase
      .from('courses')
      .select(`
        *,
        course_enrollments!inner(
          user_id,
          progress,
          enrolled_at
        )
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('course_enrollments.user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching courses:', error.message);
      return [];
    }

    this.setCachedData(cacheKey, data || [], 10 * 60 * 1000); // 10 minutes pour les cours
    return data || [];
  }

  // Optimisation des requêtes de contacts CRM
  async getContactsOptimized(userId?: string): Promise<any[]> {
    const cacheKey = `contacts_${userId || 'all'}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    let query = supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('created_by', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contacts:', error.message);
      return [];
    }

    this.setCachedData(cacheKey, data || [], 3 * 60 * 1000); // 3 minutes pour les contacts
    return data || [];
  }

  // Optimisation des requêtes de factures
  async getInvoicesOptimized(userId?: string): Promise<any[]> {
    const cacheKey = `invoices_${userId || 'all'}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    let query = supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('created_by', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching invoices:', error.message);
      return [];
    }

    this.setCachedData(cacheKey, data || [], 2 * 60 * 1000); // 2 minutes pour les factures
    return data || [];
  }

  // Nettoyage du cache
  clearCache(): void {
    this.cache.clear();
  }

  // Nettoyage sélectif du cache
  clearCacheByPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Statistiques du cache
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Optimisation des requêtes batch
  async batchQuery(queries: Array<{
    table: string;
    select: string;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending: boolean };
  }>): Promise<any[]> {
    const results = await Promise.all(
      queries.map(async (query) => {
        let supabaseQuery = supabase
          .from(query.table)
          .select(query.select);

        if (query.filters) {
          Object.entries(query.filters).forEach(([key, value]) => {
            supabaseQuery = supabaseQuery.eq(key, value);
          });
        }

        if (query.orderBy) {
          supabaseQuery = supabaseQuery.order(query.orderBy.column, { 
            ascending: query.orderBy.ascending 
          });
        }

        const { data, error } = await supabaseQuery;
        if (error) {
          console.error(`Error in batch query for ${query.table}:`, error.message);
          return [];
        }
        return data || [];
      })
    );

    return results;
  }

  // Optimisation des requêtes de recherche
  async searchOptimized(
    table: string,
    searchTerm: string,
    searchColumns: string[],
    filters?: Record<string, any>
  ): Promise<any[]> {
    const cacheKey = `search_${table}_${searchTerm}_${JSON.stringify(filters)}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    let query = supabase
      .from(table)
      .select('*')
      .or(searchColumns.map(col => `${col}.ilike.%${searchTerm}%`).join(','));

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error searching ${table}:`, error.message);
      return [];
    }

    this.setCachedData(cacheKey, data || [], 1 * 60 * 1000); // 1 minute pour les recherches
    return data || [];
  }

  // Optimisation des requêtes de pagination
  async paginatedQuery(
    table: string,
    page: number = 1,
    pageSize: number = 20,
    filters?: Record<string, any>,
    orderBy?: { column: string; ascending: boolean }
  ): Promise<{ data: any[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const offset = (page - 1) * pageSize;
    const cacheKey = `paginated_${table}_${page}_${pageSize}_${JSON.stringify(filters)}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Compter le total
    let countQuery = supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        countQuery = countQuery.eq(key, value);
      });
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error(`Error counting ${table}:`, countError.message);
      return { data: [], total: 0, page, pageSize, totalPages: 0 };
    }

    // Récupérer les données
    let dataQuery = supabase
      .from(table)
      .select('*')
      .range(offset, offset + pageSize - 1);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        dataQuery = dataQuery.eq(key, value);
      });
    }

    if (orderBy) {
      dataQuery = dataQuery.order(orderBy.column, { ascending: orderBy.ascending });
    }

    const { data, error } = await dataQuery;

    if (error) {
      console.error(`Error fetching ${table}:`, error.message);
      return { data: [], total: 0, page, pageSize, totalPages: 0 };
    }

    const totalPages = Math.ceil((count || 0) / pageSize);
    const result = {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages
    };

    this.setCachedData(cacheKey, result, 2 * 60 * 1000); // 2 minutes pour la pagination
    return result;
  }
}

export default new SupabaseOptimizationService();
