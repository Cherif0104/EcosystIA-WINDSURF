import { supabase } from '../src/lib/supabase.js';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Service de gestion du temps réel pour EcosystIA
 * Gère les abonnements, la synchronisation automatique et les notifications
 */

export interface RealtimeEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: any;
  old_record?: any;
  timestamp: string;
}

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
}

class RealtimeService {
  private static instance: RealtimeService;
  private channels: Map<string, RealtimeChannel> = new Map();
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private autoSaveIntervals: Map<string, NodeJS.Timeout> = new Map();
  private eventListeners: Map<string, ((event: RealtimeEvent) => void)[]> = new Map();

  public static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  // =====================================================
  // ABONNEMENTS TEMPS RÉEL
  // =====================================================

  /**
   * S'abonner aux changements d'une table spécifique
   */
  subscribeToTable(
    table: string, 
    callback: (event: RealtimeEvent) => void,
    filter?: { column: string; value: any }
  ): RealtimeSubscription {
    const channelName = `table_${table}_${Date.now()}`;
    
    let channel = supabase.channel(channelName);
    
    // Configurer l'abonnement selon le filtre
    if (filter) {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: `${filter.column}=eq.${filter.value}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const event: RealtimeEvent = {
            type: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            table: payload.table,
            record: payload.new || payload.old,
            old_record: payload.old,
            timestamp: new Date().toISOString()
          };
          callback(event);
        }
      );
    } else {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const event: RealtimeEvent = {
            type: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            table: payload.table,
            record: payload.new || payload.old,
            old_record: payload.old,
            timestamp: new Date().toISOString()
          };
          callback(event);
        }
      );
    }

    // S'abonner au canal
    channel.subscribe();

    // Stocker l'abonnement
    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.channels.delete(channelName);
        this.subscriptions.delete(channelName);
      }
    };

    this.channels.set(channelName, channel);
    this.subscriptions.set(channelName, subscription);

    return subscription;
  }

  /**
   * S'abonner aux changements de projets pour un utilisateur
   */
  subscribeToUserProjects(
    userId: string,
    callback: (event: RealtimeEvent) => void
  ): RealtimeSubscription {
    return this.subscribeToTable('projects', callback, { column: 'created_by', value: userId });
  }

  /**
   * S'abonner aux changements de tâches pour un projet
   */
  subscribeToProjectTasks(
    projectId: number,
    callback: (event: RealtimeEvent) => void
  ): RealtimeSubscription {
    return this.subscribeToTable('tasks', callback, { column: 'project_id', value: projectId });
  }

  /**
   * S'abonner aux notifications d'un utilisateur
   */
  subscribeToUserNotifications(
    userId: string,
    callback: (event: RealtimeEvent) => void
  ): RealtimeSubscription {
    return this.subscribeToTable('notifications', callback, { column: 'user_id', value: userId });
  }

  /**
   * S'abonner aux logs de temps d'un utilisateur
   */
  subscribeToUserTimeLogs(
    userId: string,
    callback: (event: RealtimeEvent) => void
  ): RealtimeSubscription {
    return this.subscribeToTable('time_logs', callback, { column: 'user_id', value: userId });
  }

  // =====================================================
  // SAUVEGARDE AUTOMATIQUE
  // =====================================================

  /**
   * Démarrer la sauvegarde automatique pour un formulaire
   */
  startAutoSave<T>(
    formId: string,
    saveFunction: (data: T) => Promise<boolean>,
    getFormData: () => T,
    intervalMs: number = 30000 // 30 secondes par défaut
  ): void {
    // Arrêter l'auto-save existant s'il y en a un
    this.stopAutoSave(formId);

    // Créer l'intervalle d'auto-save
    const interval = setInterval(async () => {
      try {
        const formData = getFormData();
        if (formData) {
          await saveFunction(formData);
          this.notifyAutoSaveListeners(formId, {
            isSaving: false,
            lastSaved: new Date(),
            hasUnsavedChanges: false,
            error: null
          });
        }
      } catch (error) {
        console.error(`Erreur auto-save pour ${formId}:`, error);
        this.notifyAutoSaveListeners(formId, {
          isSaving: false,
          lastSaved: null,
          hasUnsavedChanges: true,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }, intervalMs);

    this.autoSaveIntervals.set(formId, interval);
  }

  /**
   * Arrêter la sauvegarde automatique
   */
  stopAutoSave(formId: string): void {
    const interval = this.autoSaveIntervals.get(formId);
    if (interval) {
      clearInterval(interval);
      this.autoSaveIntervals.delete(formId);
    }
  }

  /**
   * Sauvegarder immédiatement
   */
  async saveNow<T>(
    formId: string,
    saveFunction: (data: T) => Promise<boolean>,
    getFormData: () => T
  ): Promise<boolean> {
    try {
      this.notifyAutoSaveListeners(formId, {
        isSaving: true,
        lastSaved: null,
        hasUnsavedChanges: false,
        error: null
      });

      const formData = getFormData();
      const success = await saveFunction(formData);

      this.notifyAutoSaveListeners(formId, {
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        error: success ? null : 'Erreur lors de la sauvegarde'
      });

      return success;
    } catch (error) {
      console.error(`Erreur sauvegarde immédiate pour ${formId}:`, error);
      this.notifyAutoSaveListeners(formId, {
        isSaving: false,
        lastSaved: null,
        hasUnsavedChanges: true,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
      return false;
    }
  }

  // =====================================================
  // GESTION DES ÉVÉNEMENTS
  // =====================================================

  /**
   * Ajouter un listener pour les événements temps réel
   */
  addEventListener(eventType: string, callback: (event: RealtimeEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  /**
   * Supprimer un listener
   */
  removeEventListener(eventType: string, callback: (event: RealtimeEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Émettre un événement personnalisé
   */
  emitEvent(eventType: string, event: RealtimeEvent): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  // =====================================================
  // NOTIFICATIONS TEMPS RÉEL
  // =====================================================

  /**
   * Créer une notification temps réel
   */
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    actionUrl?: string,
    data?: any
  ): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_title: title,
        p_message: message,
        p_type: type,
        p_action_url: actionUrl,
        p_data: data
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la création de notification:', error);
      return false;
    }
  }

  /**
   * Marquer les notifications comme lues
   */
  async markNotificationsAsRead(
    userId: string,
    notificationIds?: string[]
  ): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('mark_notifications_read', {
        p_user_id: userId,
        p_notification_ids: notificationIds
      });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
      return 0;
    }
  }

  /**
   * Récupérer les notifications non lues
   */
         async getUnreadNotifications(userId: string): Promise<any[]> {
           try {
             // Essayer d'abord avec la fonction RPC
             const { data, error } = await supabase.rpc('get_unread_notifications', {
               p_user_id: userId
             });

             if (error) {
               // Si la fonction RPC n'existe pas, utiliser une requête directe
               console.warn('Fonction get_unread_notifications non disponible, utilisation de la requête directe');
               
               // Essayer d'abord avec 'is_read', puis avec 'read' si ça échoue
               let directData, directError;
               
               try {
                 const result = await supabase
                   .from('notifications')
                   .select('*')
                   .eq('user_id', userId)
                   .eq('lire', false)
                   .order('created_at', { ascending: false });
                 
                 directData = result.data;
                 directError = result.error;
               } catch (firstError) {
                 // Si 'lire' n'existe pas, essayer avec 'is_read' puis 'read'
                 console.warn('Colonne lire non trouvée, tentative avec is_read');
                 try {
                   const result = await supabase
                     .from('notifications')
                     .select('*')
                     .eq('user_id', userId)
                     .eq('is_read', false)
                     .order('created_at', { ascending: false });
                   
                   directData = result.data;
                   directError = result.error;
                 } catch (secondError) {
                   console.warn('Colonne is_read non trouvée, tentative avec read');
                   const result = await supabase
                     .from('notifications')
                     .select('*')
                     .eq('user_id', userId)
                     .eq('read', false)
                     .order('created_at', { ascending: false });
                   
                   directData = result.data;
                   directError = result.error;
                 }
               }

               if (directError) throw directError;
               return directData || [];
             }

             return data || [];
           } catch (error) {
             console.warn('Notifications non disponibles:', error);
             return [];
           }
         }

  // =====================================================
  // DONNÉES TEMPS RÉEL
  // =====================================================

  /**
   * Récupérer les données temps réel d'un projet
   */
  async getProjectRealtimeData(projectId: number): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('get_project_realtime_data', {
        p_project_id: projectId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données projet:', error);
      return null;
    }
  }

  /**
   * Récupérer les statistiques temps réel d'un utilisateur
   */
  async getUserRealtimeStats(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('get_user_realtime_stats', {
        p_user_id: userId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return null;
    }
  }

  // =====================================================
  // GESTION DES ÉTATS AUTO-SAVE
  // =====================================================

  private autoSaveStates: Map<string, AutoSaveState> = new Map();
  private autoSaveListeners: Map<string, ((state: AutoSaveState) => void)[]> = new Map();

  /**
   * Ajouter un listener pour les états d'auto-save
   */
  addAutoSaveListener(formId: string, callback: (state: AutoSaveState) => void): void {
    if (!this.autoSaveListeners.has(formId)) {
      this.autoSaveListeners.set(formId, []);
    }
    this.autoSaveListeners.get(formId)!.push(callback);
  }

  /**
   * Supprimer un listener d'auto-save
   */
  removeAutoSaveListener(formId: string, callback: (state: AutoSaveState) => void): void {
    const listeners = this.autoSaveListeners.get(formId);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Notifier les listeners d'auto-save
   */
  private notifyAutoSaveListeners(formId: string, state: AutoSaveState): void {
    this.autoSaveStates.set(formId, state);
    const listeners = this.autoSaveListeners.get(formId);
    if (listeners) {
      listeners.forEach(callback => callback(state));
    }
  }

  /**
   * Obtenir l'état d'auto-save d'un formulaire
   */
  getAutoSaveState(formId: string): AutoSaveState {
    return this.autoSaveStates.get(formId) || {
      isSaving: false,
      lastSaved: null,
      hasUnsavedChanges: false,
      error: null
    };
  }

  // =====================================================
  // NETTOYAGE ET DÉCONNEXION
  // =====================================================

  /**
   * Se désabonner de tous les canaux
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    this.channels.clear();
  }

  /**
   * Arrêter tous les auto-saves
   */
  stopAllAutoSaves(): void {
    this.autoSaveIntervals.forEach((interval, formId) => {
      clearInterval(interval);
    });
    this.autoSaveIntervals.clear();
  }

  /**
   * Nettoyer toutes les ressources
   */
  cleanup(): void {
    this.unsubscribeAll();
    this.stopAllAutoSaves();
    this.eventListeners.clear();
    this.autoSaveListeners.clear();
    this.autoSaveStates.clear();
  }

  // =====================================================
  // MÉTHODES UTILITAIRES
  // =====================================================

  /**
   * Vérifier la connexion temps réel
   */
  isConnected(): boolean {
    return this.channels.size > 0;
  }

  /**
   * Obtenir le nombre d'abonnements actifs
   */
  getActiveSubscriptionsCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Obtenir la liste des canaux actifs
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }
}

export const realtimeService = RealtimeService.getInstance();
export default realtimeService;
