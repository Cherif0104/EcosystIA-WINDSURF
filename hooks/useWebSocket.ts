/**
 * Hooks React pour les WebSocket et notifications temps réel
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { webSocketService, webSocketManager, NotificationData } from '../services/websocketService';
import { useAuth } from '../contexts/AuthContext';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  enablePing?: boolean;
  pingInterval?: number;
  onError?: (error: string) => void;
}

/**
 * Hook pour les notifications utilisateur
 */
export function useUserNotifications(options: UseWebSocketOptions = {}) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const connectionId = useRef<string | null>(null);

  const { autoConnect = true, enablePing = true, pingInterval = 30000, onError } = options;

  const connect = useCallback(() => {
    if (!user?.id || !isAuthenticated) return;

    const connId = `user_notifications_${user.id}`;
    connectionId.current = connId;

    webSocketService.connectToUserNotifications(user.id, {
      onNotification: (notification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Garder les 50 plus récentes
        setUnreadCount(prev => prev + 1);
        
        // Notification navigateur si autorisé
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: `notification-${notification.id}`
          });
        }
      },
      
      onUnreadNotifications: (unreadNotifications, count) => {
        setNotifications(unreadNotifications);
        setUnreadCount(count);
      },
      
      onConnectionChange: (status) => {
        setConnectionStatus(status);
      },
      
      onError: (error) => {
        console.error('Erreur WebSocket notifications:', error);
        onError?.(error);
      }
    });

    if (enablePing) {
      webSocketManager.startPinging(connId, pingInterval);
    }
  }, [user?.id, isAuthenticated, enablePing, pingInterval, onError]);

  const disconnect = useCallback(() => {
    if (connectionId.current) {
      webSocketManager.stopPinging(connectionId.current);
      webSocketService.disconnect(connectionId.current);
      connectionId.current = null;
      setConnectionStatus('disconnected');
    }
  }, []);

  const markAsRead = useCallback((notificationId: number) => {
    if (connectionId.current) {
      webSocketService.markNotificationAsRead(connectionId.current, notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    if (connectionId.current) {
      webSocketService.markAllNotificationsAsRead(connectionId.current);
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      setUnreadCount(0);
    }
  }, []);

  // Demander la permission pour les notifications navigateur
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  useEffect(() => {
    if (autoConnect && isAuthenticated) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, isAuthenticated, connect, disconnect]);

  return {
    notifications,
    unreadCount,
    connectionStatus,
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    requestNotificationPermission,
    isConnected: connectionStatus === 'connected'
  };
}

/**
 * Hook pour les notifications de projet
 */
export function useProjectNotifications(projectId: number, options: UseWebSocketOptions = {}) {
  const { isAuthenticated } = useAuth();
  const [updates, setUpdates] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const connectionId = useRef<string | null>(null);

  const { autoConnect = true, enablePing = true, pingInterval = 30000, onError } = options;

  const connect = useCallback(() => {
    if (!projectId || !isAuthenticated) return;

    const connId = `project_${projectId}`;
    connectionId.current = connId;

    webSocketService.connectToProjectNotifications(projectId, {
      onProjectUpdate: (data) => {
        setUpdates(prev => [{ type: 'project_update', data, timestamp: new Date() }, ...prev.slice(0, 99)]);
      },
      
      onTaskUpdate: (data) => {
        setUpdates(prev => [{ type: 'task_update', data, timestamp: new Date() }, ...prev.slice(0, 99)]);
      },
      
      onConnectionChange: (status) => {
        setConnectionStatus(status);
      },
      
      onError: (error) => {
        console.error('Erreur WebSocket projet:', error);
        onError?.(error);
      }
    });

    if (enablePing) {
      webSocketManager.startPinging(connId, pingInterval);
    }
  }, [projectId, isAuthenticated, enablePing, pingInterval, onError]);

  const disconnect = useCallback(() => {
    if (connectionId.current) {
      webSocketManager.stopPinging(connectionId.current);
      webSocketService.disconnect(connectionId.current);
      connectionId.current = null;
      setConnectionStatus('disconnected');
    }
  }, []);

  useEffect(() => {
    if (autoConnect && projectId && isAuthenticated) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, projectId, isAuthenticated, connect, disconnect]);

  return {
    updates,
    connectionStatus,
    connect,
    disconnect,
    isConnected: connectionStatus === 'connected'
  };
}

/**
 * Hook pour le chat de réunion
 */
export function useMeetingChat(meetingId: number, options: UseWebSocketOptions = {}) {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const connectionId = useRef<string | null>(null);

  const { autoConnect = true, enablePing = true, pingInterval = 30000, onError } = options;

  const connect = useCallback(() => {
    if (!meetingId || !isAuthenticated) return;

    const connId = `meeting_chat_${meetingId}`;
    connectionId.current = connId;

    webSocketService.connectToMeetingChat(meetingId, {
      onChatMessage: (message) => {
        setMessages(prev => [...prev, message]);
      },
      
      onUserJoined: (user) => {
        setParticipants(prev => {
          const exists = prev.some(p => p.user_id === user.user_id);
          return exists ? prev : [...prev, user];
        });
        setMessages(prev => [...prev, {
          type: 'system',
          message: user.message,
          timestamp: new Date().toISOString()
        }]);
      },
      
      onUserLeft: (user) => {
        setParticipants(prev => prev.filter(p => p.user_id !== user.user_id));
        setMessages(prev => [...prev, {
          type: 'system',
          message: user.message,
          timestamp: new Date().toISOString()
        }]);
      },
      
      onConnectionChange: (status) => {
        setConnectionStatus(status);
      },
      
      onError: (error) => {
        console.error('Erreur WebSocket chat:', error);
        onError?.(error);
      }
    });

    if (enablePing) {
      webSocketManager.startPinging(connId, pingInterval);
    }
  }, [meetingId, isAuthenticated, enablePing, pingInterval, onError]);

  const disconnect = useCallback(() => {
    if (connectionId.current) {
      webSocketManager.stopPinging(connectionId.current);
      webSocketService.disconnect(connectionId.current);
      connectionId.current = null;
      setConnectionStatus('disconnected');
    }
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (connectionId.current && message.trim()) {
      webSocketService.sendChatMessage(connectionId.current, message.trim());
    }
  }, []);

  useEffect(() => {
    if (autoConnect && meetingId && isAuthenticated) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, meetingId, isAuthenticated, connect, disconnect]);

  return {
    messages,
    participants,
    connectionStatus,
    connect,
    disconnect,
    sendMessage,
    isConnected: connectionStatus === 'connected'
  };
}

/**
 * Hook pour les notifications système (admin)
 */
export function useSystemNotifications(options: UseWebSocketOptions = {}) {
  const { user, isAuthenticated } = useAuth();
  const [systemMessages, setSystemMessages] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const connectionId = useRef<string | null>(null);

  const { autoConnect = true, enablePing = true, pingInterval = 30000, onError } = options;

  const connect = useCallback(() => {
    if (!user?.is_staff || !isAuthenticated) return;

    const connId = 'system_notifications';
    connectionId.current = connId;

    webSocketService.connectToSystemNotifications({
      onSystemMessage: (data) => {
        setSystemMessages(prev => [{ ...data, timestamp: new Date() }, ...prev.slice(0, 49)]);
      },
      
      onConnectionChange: (status) => {
        setConnectionStatus(status);
      },
      
      onError: (error) => {
        console.error('Erreur WebSocket système:', error);
        onError?.(error);
      }
    });

    if (enablePing) {
      webSocketManager.startPinging(connId, pingInterval);
    }
  }, [user?.is_staff, isAuthenticated, enablePing, pingInterval, onError]);

  const disconnect = useCallback(() => {
    if (connectionId.current) {
      webSocketManager.stopPinging(connectionId.current);
      webSocketService.disconnect(connectionId.current);
      connectionId.current = null;
      setConnectionStatus('disconnected');
    }
  }, []);

  useEffect(() => {
    if (autoConnect && user?.is_staff && isAuthenticated) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, user?.is_staff, isAuthenticated, connect, disconnect]);

  return {
    systemMessages,
    connectionStatus,
    connect,
    disconnect,
    isConnected: connectionStatus === 'connected'
  };
}
