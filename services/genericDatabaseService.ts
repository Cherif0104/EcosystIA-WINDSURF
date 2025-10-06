import { supabase } from '../src/lib/supabase.js';

/**
 * Service générique pour les opérations CRUD
 * Complète le databaseService principal
 */

export class GenericDatabaseService {
  private static instance: GenericDatabaseService;

  public static getInstance(): GenericDatabaseService {
    if (!GenericDatabaseService.instance) {
      GenericDatabaseService.instance = new GenericDatabaseService();
    }
    return GenericDatabaseService.instance;
  }

  /**
   * Crée un nouvel enregistrement dans une table
   */
  async create(table: string, data: any): Promise<any> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error(`Erreur lors de la création dans ${table}:`, error);
      throw error;
    }
  }

  /**
   * Met à jour un enregistrement dans une table
   */
  async update(table: string, id: number | string, data: any): Promise<any> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour dans ${table}:`, error);
      throw error;
    }
  }

  /**
   * Supprime un enregistrement d'une table
   */
  async delete(table: string, id: number | string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression dans ${table}:`, error);
      throw error;
    }
  }

  /**
   * Récupère tous les enregistrements d'une table
   */
  async getAll(table: string, filters: any = {}): Promise<any[]> {
    try {
      let query = supabase.from(table).select('*');

      // Appliquer les filtres
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          query = query.eq(key, filters[key]);
        }
      });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Erreur lors de la récupération de ${table}:`, error);
      return [];
    }
  }

  /**
   * Récupère un enregistrement par ID
   */
  async getById(table: string, id: number | string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de ${table} par ID:`, error);
      return null;
    }
  }

  /**
   * Crée ou met à jour un enregistrement (upsert)
   */
  async createOrUpdate(table: string, data: any): Promise<any> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .upsert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error(`Erreur lors de l'upsert dans ${table}:`, error);
      throw error;
    }
  }

  /**
   * Création en lot (bulk create)
   */
  async bulkCreate(table: string, dataArray: any[]): Promise<any[]> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(dataArray)
        .select();

      if (error) throw error;
      return result || [];
    } catch (error) {
      console.error(`Erreur lors de la création en lot dans ${table}:`, error);
      throw error;
    }
  }
}

export const genericDatabaseService = GenericDatabaseService.getInstance();
export default genericDatabaseService;
