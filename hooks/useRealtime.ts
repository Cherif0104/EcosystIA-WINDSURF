import { useEffect, useState, useCallback, useRef } from 'react';
import { realtimeService, RealtimeEvent, AutoSaveState } from '../services/realtimeService';

/**
 * Hook pour gérer les abonnements temps réel
 */
export const useRealtime = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeChannels, setActiveChannels] = useState<string[]>([]);
  const subscriptionsRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    // Vérifier la connexion au montage
    setIsConnected(realtimeService.isConnected());
    setActiveChannels(realtimeService.getActiveChannels());

    // Nettoyer au démontage
    return () => {
      subscriptionsRef.current.forEach(subscription => {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      });
      subscriptionsRef.current.clear();
    };
  }, []);

  const subscribe = useCallback((
    table: string,
    callback: (event: RealtimeEvent) => void,
    filter?: { column: string; value: any }
  ) => {
    const subscription = realtimeService.subscribeToTable(table, callback, filter);
    const key = `${table}_${Date.now()}`;
    subscriptionsRef.current.set(key, subscription);
    
    setIsConnected(true);
    setActiveChannels(realtimeService.getActiveChannels());
    
    return () => {
      subscription.unsubscribe();
      subscriptionsRef.current.delete(key);
      setActiveChannels(realtimeService.getActiveChannels());
    };
  }, []);

  const unsubscribe = useCallback((key: string) => {
    const subscription = subscriptionsRef.current.get(key);
    if (subscription) {
      subscription.unsubscribe();
      subscriptionsRef.current.delete(key);
      setActiveChannels(realtimeService.getActiveChannels());
    }
  }, []);

  const unsubscribeAll = useCallback(() => {
    subscriptionsRef.current.forEach(subscription => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    });
    subscriptionsRef.current.clear();
    setActiveChannels([]);
  }, []);

  return {
    isConnected,
    activeChannels,
    subscribe,
    unsubscribe,
    unsubscribeAll,
    subscriptionCount: subscriptionsRef.current.size
  };
};

/**
 * Hook pour gérer l'auto-save d'un formulaire
 */
export const useAutoSave = <T>(
  formId: string,
  saveFunction: (data: T) => Promise<boolean>,
  getFormData: () => T,
  options: {
    intervalMs?: number;
    enabled?: boolean;
    onSave?: (success: boolean) => void;
    onError?: (error: string) => void;
  } = {}
) => {
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null
  });

  const {
    intervalMs = 30000,
    enabled = true,
    onSave,
    onError
  } = options;

  const saveNow = useCallback(async (): Promise<boolean> => {
    const success = await realtimeService.saveNow(formId, saveFunction, getFormData);
    if (onSave) onSave(success);
    return success;
  }, [formId, saveFunction, getFormData, onSave]);

  useEffect(() => {
    if (!enabled) return;

    // Démarrer l'auto-save
    realtimeService.startAutoSave(formId, saveFunction, getFormData, intervalMs);

    // Écouter les changements d'état
    const handleStateChange = (state: AutoSaveState) => {
      setAutoSaveState(state);
      if (state.error && onError) {
        onError(state.error);
      }
    };

    realtimeService.addAutoSaveListener(formId, handleStateChange);

    // Initialiser l'état
    setAutoSaveState(realtimeService.getAutoSaveState(formId));

    // Nettoyer
    return () => {
      realtimeService.removeAutoSaveListener(formId, handleStateChange);
      realtimeService.stopAutoSave(formId);
    };
  }, [formId, saveFunction, getFormData, intervalMs, enabled, onError]);

  return {
    autoSaveState,
    saveNow,
    isSaving: autoSaveState.isSaving,
    lastSaved: autoSaveState.lastSaved,
    hasUnsavedChanges: autoSaveState.hasUnsavedChanges,
    error: autoSaveState.error
  };
};

/**
 * Hook pour les notifications temps réel
 */
export const useRealtimeNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const unreadNotifs = await realtimeService.getUnreadNotifications(userId);
      setNotifications(unreadNotifs);
      setUnreadCount(unreadNotifs.length);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationIds?: string[]) => {
    if (!userId) return;
    
    try {
      await realtimeService.markNotificationsAsRead(userId, notificationIds);
      await loadNotifications(); // Recharger pour mettre à jour
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
    }
  }, [userId, loadNotifications]);

  const createNotification = useCallback(async (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    actionUrl?: string,
    data?: any
  ) => {
    if (!userId) return false;
    
    try {
      return await realtimeService.createNotification(userId, title, message, type, actionUrl, data);
    } catch (error) {
      console.error('Erreur lors de la création de notification:', error);
      return false;
    }
  }, [userId]);

  // S'abonner aux notifications temps réel
  useEffect(() => {
    if (!userId) return;

    loadNotifications();

    const unsubscribe = realtimeService.subscribeToUserNotifications(userId, (event) => {
      if (event.type === 'INSERT') {
        // Nouvelle notification
        setNotifications(prev => [event.record, ...prev]);
        setUnreadCount(prev => prev + 1);
      } else if (event.type === 'UPDATE') {
        // Notification mise à jour (marquée comme lue)
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === event.record.id ? event.record : notif
          )
        );
        if (event.record.status === 'read') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    });

    return () => {
      if (unsubscribe && typeof unsubscribe.unsubscribe === 'function') {
        unsubscribe.unsubscribe();
      }
    };
  }, [userId, loadNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    createNotification
  };
};

/**
 * Hook pour les données temps réel d'un projet
 */
export const useProjectRealtime = (projectId: number | null) => {
  const [projectData, setProjectData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjectData = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await realtimeService.getProjectRealtimeData(projectId);
      setProjectData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Charger les données initiales
  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  // S'abonner aux changements du projet
  useEffect(() => {
    if (!projectId) return;

    const unsubscribe = realtimeService.subscribeToTable('projects', (event) => {
      if (event.record.id === projectId) {
        loadProjectData(); // Recharger les données complètes
      }
    }, { column: 'id', value: projectId });

    return () => {
      if (unsubscribe && typeof unsubscribe.unsubscribe === 'function') {
        unsubscribe.unsubscribe();
      }
    };
  }, [projectId, loadProjectData]);

  // S'abonner aux changements des tâches du projet
  useEffect(() => {
    if (!projectId) return;

    const unsubscribe = realtimeService.subscribeToProjectTasks(projectId, () => {
      loadProjectData(); // Recharger pour inclure les nouvelles tâches
    });

    return () => {
      if (unsubscribe && typeof unsubscribe.unsubscribe === 'function') {
        unsubscribe.unsubscribe();
      }
    };
  }, [projectId, loadProjectData]);

  return {
    projectData,
    isLoading,
    error,
    refresh: loadProjectData
  };
};

/**
 * Hook pour les statistiques temps réel d'un utilisateur
 */
export const useUserRealtimeStats = (userId: string | null) => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const userStats = await realtimeService.getUserRealtimeStats(userId);
      setStats(userStats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadStats();

    // Recharger les stats toutes les 30 secondes
    const interval = setInterval(loadStats, 30000);

    return () => clearInterval(interval);
  }, [loadStats]);

  return {
    stats,
    isLoading,
    refresh: loadStats
  };
};

/**
 * Hook pour gérer les événements temps réel personnalisés
 */
export const useRealtimeEvents = (eventType: string) => {
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [eventHistory, setEventHistory] = useState<RealtimeEvent[]>([]);

  const handleEvent = useCallback((event: RealtimeEvent) => {
    setLastEvent(event);
    setEventHistory(prev => [event, ...prev.slice(0, 99)]); // Garder les 100 derniers événements
  }, []);

  useEffect(() => {
    realtimeService.addEventListener(eventType, handleEvent);

    return () => {
      realtimeService.removeEventListener(eventType, handleEvent);
    };
  }, [eventType, handleEvent]);

  const emitEvent = useCallback((event: RealtimeEvent) => {
    realtimeService.emitEvent(eventType, event);
  }, [eventType]);

  return {
    lastEvent,
    eventHistory,
    emitEvent
  };
};
