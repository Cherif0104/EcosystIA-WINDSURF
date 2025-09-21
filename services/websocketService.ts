/**
 * Service WebSocket pour les notifications temps réel
 * Intégration complète avec Django Channels
 */

export interface NotificationData {
  id?: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder';
  category: string;
  sender_id?: number;
  created_at?: string;
  action_url?: string;
  related_object_id?: number;
  related_object_type?: string;
}

export interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  timestamp?: string;
  count?: number;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WebSocketCallbacks {
  onNotification?: (notification: NotificationData) => void;
  onUnreadNotifications?: (notifications: NotificationData[], count: number) => void;
  onChatMessage?: (message: any) => void;
  onUserJoined?: (user: any) => void;
  onUserLeft?: (user: any) => void;
  onProjectUpdate?: (data: any) => void;
  onTaskUpdate?: (data: any) => void;
  onSystemMessage?: (data: any) => void;
  onConnectionChange?: (status: ConnectionStatus) => void;
  onError?: (error: string) => void;
}

class WebSocketService {
  private connections: Map<string, WebSocket> = new Map();
  private callbacks: Map<string, WebSocketCallbacks> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 seconde, puis exponentiel

  /**
   * Obtenir l'URL WebSocket de base
   */
  private getWebSocketBaseUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_HOST || window.location.host.replace(':5173', ':8000');
    return `${protocol}//${host}/ws`;
  }

  /**
   * Connecter aux notifications personnelles
   */
  public connectToUserNotifications(userId: number, callbacks: WebSocketCallbacks = {}): void {
    const connectionId = `user_notifications_${userId}`;
    const url = `${this.getWebSocketBaseUrl()}/notifications/${userId}/`;
    
    this.connect(connectionId, url, callbacks);
  }

  /**
   * Connecter aux notifications d'un projet
   */
  public connectToProjectNotifications(projectId: number, callbacks: WebSocketCallbacks = {}): void {
    const connectionId = `project_${projectId}`;
    const url = `${this.getWebSocketBaseUrl()}/projects/${projectId}/notifications/`;
    
    this.connect(connectionId, url, callbacks);
  }

  /**
   * Connecter au chat d'une réunion
   */
  public connectToMeetingChat(meetingId: number, callbacks: WebSocketCallbacks = {}): void {
    const connectionId = `meeting_chat_${meetingId}`;
    const url = `${this.getWebSocketBaseUrl()}/meetings/${meetingId}/chat/`;
    
    this.connect(connectionId, url, callbacks);
  }

  /**
   * Connecter aux notifications système (admin uniquement)
   */
  public connectToSystemNotifications(callbacks: WebSocketCallbacks = {}): void {
    const connectionId = 'system_notifications';
    const url = `${this.getWebSocketBaseUrl()}/system/`;
    
    this.connect(connectionId, url, callbacks);
  }

  /**
   * Connexion WebSocket générique
   */
  private connect(connectionId: string, url: string, callbacks: WebSocketCallbacks): void {
    // Fermer la connexion existante si elle existe
    this.disconnect(connectionId);

    try {
      const token = localStorage.getItem('access_token');
      const wsUrl = token ? `${url}?token=${token}` : url;
      
      const ws = new WebSocket(wsUrl);
      this.connections.set(connectionId, ws);
      this.callbacks.set(connectionId, callbacks);
      
      ws.onopen = () => {
        console.log(`WebSocket connecté: ${connectionId}`);
        this.reconnectAttempts.set(connectionId, 0);
        callbacks.onConnectionChange?.('connected');
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(connectionId, message, callbacks);
        } catch (error) {
          console.error('Erreur parsing WebSocket message:', error);
          callbacks.onError?.('Erreur de format de message');
        }
      };

      ws.onclose = (event) => {
        console.log(`WebSocket fermé: ${connectionId}`, event.code, event.reason);
        this.connections.delete(connectionId);
        callbacks.onConnectionChange?.('disconnected');
        
        // Tentative de reconnexion automatique
        if (event.code !== 1000 && event.code !== 1001) { // Pas une fermeture normale
          this.attemptReconnect(connectionId, url, callbacks);
        }
      };

      ws.onerror = (error) => {
        console.error(`WebSocket erreur: ${connectionId}`, error);
        callbacks.onConnectionChange?.('error');
        callbacks.onError?.('Erreur de connexion WebSocket');
      };

    } catch (error) {
      console.error(`Erreur création WebSocket: ${connectionId}`, error);
      callbacks.onConnectionChange?.('error');
      callbacks.onError?.('Impossible de créer la connexion WebSocket');
    }
  }

  /**
   * Tentative de reconnexion automatique
   */
  private attemptReconnect(connectionId: string, url: string, callbacks: WebSocketCallbacks): void {
    const attempts = this.reconnectAttempts.get(connectionId) || 0;
    
    if (attempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, attempts); // Délai exponentiel
      
      console.log(`Reconnexion WebSocket dans ${delay}ms (tentative ${attempts + 1}/${this.maxReconnectAttempts})`);
      callbacks.onConnectionChange?.('connecting');
      
      setTimeout(() => {
        this.reconnectAttempts.set(connectionId, attempts + 1);
        this.connect(connectionId, url, callbacks);
      }, delay);
    } else {
      console.error(`Échec reconnexion WebSocket après ${this.maxReconnectAttempts} tentatives: ${connectionId}`);
      callbacks.onError?.('Impossible de reconnecter au serveur');
    }
  }

  /**
   * Gérer les messages WebSocket reçus
   */
  private handleMessage(connectionId: string, message: WebSocketMessage, callbacks: WebSocketCallbacks): void {
    switch (message.type) {
      case 'connection_established':
        console.log('Connexion WebSocket établie:', message);
        break;

      case 'notification':
        if (message.data && callbacks.onNotification) {
          callbacks.onNotification(message.data);
        }
        break;

      case 'unread_notifications':
        if (message.data && callbacks.onUnreadNotifications) {
          callbacks.onUnreadNotifications(message.data, message.count || 0);
        }
        break;

      case 'chat_message':
        if (message.data && callbacks.onChatMessage) {
          callbacks.onChatMessage(message.data);
        }
        break;

      case 'user_joined':
        if (message.data && callbacks.onUserJoined) {
          callbacks.onUserJoined(message.data);
        }
        break;

      case 'user_left':
        if (message.data && callbacks.onUserLeft) {
          callbacks.onUserLeft(message.data);
        }
        break;

      case 'project_update':
        if (message.data && callbacks.onProjectUpdate) {
          callbacks.onProjectUpdate(message.data);
        }
        break;

      case 'task_update':
        if (message.data && callbacks.onTaskUpdate) {
          callbacks.onTaskUpdate(message.data);
        }
        break;

      case 'system_message':
      case 'system_notification':
        if (message.data && callbacks.onSystemMessage) {
          callbacks.onSystemMessage(message.data);
        }
        break;

      case 'error':
        callbacks.onError?.(message.message || 'Erreur WebSocket');
        break;

      case 'pong':
        // Réponse au ping, rien à faire
        break;

      default:
        console.log('Message WebSocket non géré:', message);
    }
  }

  /**
   * Envoyer un message via WebSocket
   */
  public sendMessage(connectionId: string, message: any): void {
    const ws = this.connections.get(connectionId);
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.error(`WebSocket non connecté: ${connectionId}`);
    }
  }

  /**
   * Marquer une notification comme lue
   */
  public markNotificationAsRead(connectionId: string, notificationId: number): void {
    this.sendMessage(connectionId, {
      type: 'mark_as_read',
      notification_id: notificationId
    });
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  public markAllNotificationsAsRead(connectionId: string): void {
    this.sendMessage(connectionId, {
      type: 'mark_all_as_read'
    });
  }

  /**
   * Envoyer un message de chat
   */
  public sendChatMessage(connectionId: string, message: string): void {
    this.sendMessage(connectionId, {
      type: 'chat_message',
      message: message
    });
  }

  /**
   * Envoyer un ping pour maintenir la connexion
   */
  public ping(connectionId: string): void {
    this.sendMessage(connectionId, {
      type: 'ping'
    });
  }

  /**
   * Déconnecter une connexion WebSocket spécifique
   */
  public disconnect(connectionId: string): void {
    const ws = this.connections.get(connectionId);
    
    if (ws) {
      ws.close(1000, 'Fermeture normale');
      this.connections.delete(connectionId);
      this.callbacks.delete(connectionId);
      this.reconnectAttempts.delete(connectionId);
    }
  }

  /**
   * Déconnecter toutes les connexions WebSocket
   */
  public disconnectAll(): void {
    for (const [connectionId] of this.connections) {
      this.disconnect(connectionId);
    }
  }

  /**
   * Obtenir le statut d'une connexion
   */
  public getConnectionStatus(connectionId: string): ConnectionStatus {
    const ws = this.connections.get(connectionId);
    
    if (!ws) return 'disconnected';
    
    switch (ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'error';
    }
  }

  /**
   * Obtenir la liste des connexions actives
   */
  public getActiveConnections(): string[] {
    return Array.from(this.connections.keys());
  }

  /**
   * Vérifier si une connexion est active
   */
  public isConnected(connectionId: string): boolean {
    return this.getConnectionStatus(connectionId) === 'connected';
  }
}

// Instance singleton du service WebSocket
export const webSocketService = new WebSocketService();

// Utilitaires pour maintenir les connexions
export class WebSocketManager {
  private pingIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Démarrer le ping automatique pour maintenir la connexion
   */
  public startPinging(connectionId: string, intervalMs: number = 30000): void {
    this.stopPinging(connectionId);
    
    const interval = setInterval(() => {
      if (webSocketService.isConnected(connectionId)) {
        webSocketService.ping(connectionId);
      } else {
        this.stopPinging(connectionId);
      }
    }, intervalMs);
    
    this.pingIntervals.set(connectionId, interval);
  }

  /**
   * Arrêter le ping automatique
   */
  public stopPinging(connectionId: string): void {
    const interval = this.pingIntervals.get(connectionId);
    if (interval) {
      clearInterval(interval);
      this.pingIntervals.delete(connectionId);
    }
  }

  /**
   * Nettoyer tous les pings
   */
  public cleanup(): void {
    for (const [connectionId] of this.pingIntervals) {
      this.stopPinging(connectionId);
    }
  }
}

export const webSocketManager = new WebSocketManager();

// Nettoyage automatique lors du déchargement de la page
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    webSocketManager.cleanup();
    webSocketService.disconnectAll();
  });
}
