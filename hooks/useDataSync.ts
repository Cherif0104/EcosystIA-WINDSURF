import { useEffect, useCallback, useRef } from 'react';
import { dataSyncService, DataSyncConfig } from '../services/dataSyncService';

/**
 * Hook personnalisé pour la synchronisation des données
 * Simplifie l'utilisation du service de synchronisation dans les composants
 */

export interface UseDataSyncOptions {
  table: string;
  filters?: any;
  autoRefresh?: boolean;
  refreshDelay?: number;
}

export const useDataSync = <T>(
  options: UseDataSyncOptions,
  data: T[],
  setData: (data: T[]) => void
) => {
  const { table, filters = {}, autoRefresh = true, refreshDelay = 500 } = options;
  const isRegistered = useRef(false);

  // Callback de rafraîchissement
  const refreshCallback = useCallback((newData: T[]) => {
    setData(newData);
  }, [setData]);

  // Enregistrer la synchronisation
  useEffect(() => {
    if (!isRegistered.current) {
      const config: DataSyncConfig = {
        table,
        refreshCallback,
        filters
      };
      
      dataSyncService.registerSync(config);
      isRegistered.current = true;
      
      // Rafraîchir immédiatement si autoRefresh est activé
      if (autoRefresh) {
        dataSyncService.refreshTable(table);
      }
    }

    // Cleanup
    return () => {
      if (isRegistered.current) {
        dataSyncService.unregisterSync(table);
        isRegistered.current = false;
      }
    };
  }, [table, refreshCallback, filters, autoRefresh]);

  // Fonctions de synchronisation
  const createWithSync = useCallback(async (data: any) => {
    return dataSyncService.createWithRefresh(table, data, refreshDelay);
  }, [table, refreshDelay]);

  const updateWithSync = useCallback(async (id: number | string, data: any) => {
    return dataSyncService.updateWithRefresh(table, id, data, refreshDelay);
  }, [table, refreshDelay]);

  const deleteWithSync = useCallback(async (id: number | string) => {
    return dataSyncService.deleteWithRefresh(table, id, refreshDelay);
  }, [table, refreshDelay]);

  const createOrUpdateWithSync = useCallback(async (data: any) => {
    return dataSyncService.createOrUpdateWithRefresh(table, data, refreshDelay);
  }, [table, refreshDelay]);

  const bulkCreateWithSync = useCallback(async (dataArray: any[]) => {
    return dataSyncService.bulkCreateWithRefresh(table, dataArray, refreshDelay);
  }, [table, refreshDelay]);

  const refreshData = useCallback(async () => {
    await dataSyncService.refreshTable(table);
  }, [table]);

  const refreshDataWithDelay = useCallback((delay?: number) => {
    dataSyncService.refreshTableWithDelay(table, delay || refreshDelay);
  }, [table, refreshDelay]);

  return {
    // Données
    data,
    setData,
    
    // Fonctions de synchronisation
    createWithSync,
    updateWithSync,
    deleteWithSync,
    createOrUpdateWithSync,
    bulkCreateWithSync,
    
    // Fonctions de rafraîchissement
    refreshData,
    refreshDataWithDelay,
    
    // Statistiques
    getSyncStats: () => dataSyncService.getSyncStats()
  };
};

export default useDataSync;
