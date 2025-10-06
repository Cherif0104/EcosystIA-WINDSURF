import { genericDatabaseService } from './genericDatabaseService';

/**
 * Service de synchronisation centralisé pour EcosystIA
 * Gère le rafraîchissement des données après les opérations CRUD
 */

export interface DataSyncConfig {
  table: string;
  refreshCallback: (data: any[]) => void;
  filters?: any;
}

class DataSyncService {
  private static instance: DataSyncService;
  private syncConfigs: Map<string, DataSyncConfig> = new Map();
  private refreshTimeouts: Map<string, NodeJS.Timeout> = new Map();

  public static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  /**
   * Enregistre une configuration de synchronisation pour une table
   */
  registerSync(config: DataSyncConfig): void {
    this.syncConfigs.set(config.table, config);
    console.log(`✅ Synchronisation enregistrée pour la table: ${config.table}`);
  }

  /**
   * Désenregistre une configuration de synchronisation
   */
  unregisterSync(table: string): void {
    this.syncConfigs.delete(table);
    if (this.refreshTimeouts.has(table)) {
      clearTimeout(this.refreshTimeouts.get(table)!);
      this.refreshTimeouts.delete(table);
    }
    console.log(`❌ Synchronisation désenregistrée pour la table: ${table}`);
  }

  /**
   * Rafraîchit les données d'une table spécifique
   */
  async refreshTable(table: string): Promise<void> {
    const config = this.syncConfigs.get(table);
    if (!config) {
      console.warn(`⚠️ Aucune configuration de synchronisation trouvée pour la table: ${table}`);
      return;
    }

    try {
      console.log(`🔄 Rafraîchissement des données pour la table: ${table}`);
      const data = await genericDatabaseService.getAll(table, config.filters || {});
      config.refreshCallback(data);
      console.log(`✅ Données rafraîchies pour la table: ${table} (${data.length} éléments)`);
    } catch (error) {
      console.error(`❌ Erreur lors du rafraîchissement de la table ${table}:`, error);
    }
  }

  /**
   * Rafraîchit toutes les tables enregistrées
   */
  async refreshAllTables(): Promise<void> {
    console.log('🔄 Rafraîchissement de toutes les tables...');
    const promises = Array.from(this.syncConfigs.keys()).map(table => this.refreshTable(table));
    await Promise.all(promises);
    console.log('✅ Toutes les tables ont été rafraîchies');
  }

  /**
   * Rafraîchit une table avec un délai (debounce)
   */
  refreshTableWithDelay(table: string, delay: number = 500): void {
    // Annuler le timeout précédent s'il existe
    if (this.refreshTimeouts.has(table)) {
      clearTimeout(this.refreshTimeouts.get(table)!);
    }

    // Programmer un nouveau rafraîchissement
    const timeout = setTimeout(() => {
      this.refreshTable(table);
      this.refreshTimeouts.delete(table);
    }, delay);

    this.refreshTimeouts.set(table, timeout);
  }

  /**
   * Exécute une opération CRUD et rafraîchit automatiquement les données
   */
  async executeWithRefresh<T>(
    operation: () => Promise<T>,
    table: string,
    delay: number = 500
  ): Promise<T> {
    try {
      const result = await operation();
      console.log(`✅ Opération réussie sur la table: ${table}`);
      
      // Rafraîchir les données avec délai
      this.refreshTableWithDelay(table, delay);
      
      return result;
    } catch (error) {
      console.error(`❌ Erreur lors de l'opération sur la table ${table}:`, error);
      throw error;
    }
  }

  /**
   * Crée un enregistrement et rafraîchit les données
   */
  async createWithRefresh(table: string, data: any, delay: number = 500): Promise<any> {
    return this.executeWithRefresh(
      () => genericDatabaseService.create(table, data),
      table,
      delay
    );
  }

  /**
   * Met à jour un enregistrement et rafraîchit les données
   */
  async updateWithRefresh(table: string, id: number | string, data: any, delay: number = 500): Promise<any> {
    return this.executeWithRefresh(
      () => genericDatabaseService.update(table, id, data),
      table,
      delay
    );
  }

  /**
   * Supprime un enregistrement et rafraîchit les données
   */
  async deleteWithRefresh(table: string, id: number | string, delay: number = 500): Promise<boolean> {
    return this.executeWithRefresh(
      () => genericDatabaseService.delete(table, id),
      table,
      delay
    );
  }

  /**
   * Crée ou met à jour un enregistrement et rafraîchit les données
   */
  async createOrUpdateWithRefresh(table: string, data: any, delay: number = 500): Promise<any> {
    return this.executeWithRefresh(
      () => genericDatabaseService.createOrUpdate(table, data),
      table,
      delay
    );
  }

  /**
   * Création en lot et rafraîchissement des données
   */
  async bulkCreateWithRefresh(table: string, dataArray: any[], delay: number = 500): Promise<any[]> {
    return this.executeWithRefresh(
      () => genericDatabaseService.bulkCreate(table, dataArray),
      table,
      delay
    );
  }

  /**
   * Obtient les statistiques de synchronisation
   */
  getSyncStats(): { registeredTables: string[]; activeTimeouts: string[] } {
    return {
      registeredTables: Array.from(this.syncConfigs.keys()),
      activeTimeouts: Array.from(this.refreshTimeouts.keys())
    };
  }

  /**
   * Nettoie tous les timeouts actifs
   */
  clearAllTimeouts(): void {
    this.refreshTimeouts.forEach(timeout => clearTimeout(timeout));
    this.refreshTimeouts.clear();
    console.log('🧹 Tous les timeouts de rafraîchissement ont été nettoyés');
  }
}

export const dataSyncService = DataSyncService.getInstance();
export default dataSyncService;
