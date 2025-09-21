/**
 * Centre de notifications avec support WebSocket temps réel
 */

import React, { useState, useEffect } from 'react';
import { useUserNotifications } from '../hooks/useWebSocket';
import { useAuth } from '../contexts/AuthContext';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  
  const {
    notifications,
    unreadCount,
    connectionStatus,
    markAsRead,
    markAllAsRead,
    requestNotificationPermission,
    isConnected
  } = useUserNotifications({
    autoConnect: true,
    enablePing: true,
    onError: (error) => {
      console.error('Erreur notifications:', error);
    }
  });

  // Demander la permission pour les notifications navigateur
  useEffect(() => {
    if (user && 'Notification' in window) {
      requestNotificationPermission();
    }
  }, [user, requestNotificationPermission]);

  // Filtrer les notifications
  const filteredNotifications = showUnreadOnly 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return 'fas fa-check-circle text-green-500';
      case 'warning': return 'fas fa-exclamation-triangle text-yellow-500';
      case 'error': return 'fas fa-times-circle text-red-500';
      case 'reminder': return 'fas fa-bell text-blue-500';
      default: return 'fas fa-info-circle text-blue-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'project': return 'fas fa-project-diagram';
      case 'course': return 'fas fa-graduation-cap';
      case 'meeting': return 'fas fa-calendar-alt';
      case 'finance': return 'fas fa-dollar-sign';
      case 'crm': return 'fas fa-users';
      case 'goal': return 'fas fa-target';
      case 'system': return 'fas fa-cog';
      default: return 'fas fa-bell';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}j`;
  };

  const handleNotificationClick = (notification: any) => {
    // Marquer comme lu
    if (!notification.is_read && notification.id) {
      markAsRead(notification.id);
    }

    // Rediriger si URL d'action
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return (
    <div className={`notification-center ${className}`}>
      {/* Bouton de notifications */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative p-2 rounded-full transition-colors
            ${isOpen 
              ? 'bg-blue-100 text-blue-600' 
              : 'text-gray-600 hover:bg-gray-100'
            }
          `}
          title="Notifications"
        >
          <i className="fas fa-bell text-xl"></i>
          
          {/* Badge nombre de notifications */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}

          {/* Indicateur de connexion */}
          <div className={`
            absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white
            ${isConnected ? 'bg-green-500' : 'bg-red-500'}
          `} title={isConnected ? 'Connecté' : 'Déconnecté'}></div>
        </button>

        {/* Panel des notifications */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({unreadCount} non lues)
                    </span>
                  )}
                </h3>
                
                <div className="flex items-center space-x-2">
                  {/* Filtre non lues */}
                  <button
                    onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                    className={`
                      text-xs px-2 py-1 rounded transition-colors
                      ${showUnreadOnly 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    Non lues
                  </button>

                  {/* Marquer tout comme lu */}
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800"
                      title="Marquer tout comme lu"
                    >
                      <i className="fas fa-check-double"></i>
                    </button>
                  )}

                  {/* Fermer */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>

              {/* Statut de connexion */}
              <div className="mt-2 flex items-center text-xs">
                <div className={`
                  w-2 h-2 rounded-full mr-2
                  ${connectionStatus === 'connected' ? 'bg-green-500' : 
                    connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}
                `}></div>
                <span className="text-gray-500">
                  {connectionStatus === 'connected' ? 'Temps réel actif' :
                   connectionStatus === 'connecting' ? 'Connexion...' : 'Hors ligne'}
                </span>
              </div>
            </div>

            {/* Liste des notifications */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <i className="fas fa-bell-slash text-4xl mb-4 opacity-50"></i>
                  <p>
                    {showUnreadOnly 
                      ? 'Aucune notification non lue' 
                      : 'Aucune notification'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification, index) => (
                    <div
                      key={notification.id || index}
                      className={`
                        p-4 hover:bg-gray-50 cursor-pointer transition-colors
                        ${!notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
                      `}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icône de type */}
                        <div className="flex-shrink-0 mt-1">
                          <i className={getNotificationIcon(notification.type)}></i>
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={`
                              text-sm font-medium truncate
                              ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}
                            `}>
                              {notification.title}
                            </h4>
                            
                            <div className="flex items-center space-x-2 ml-2">
                              {/* Icône de catégorie */}
                              <i className={`${getCategoryIcon(notification.category)} text-xs text-gray-400`}></i>
                              
                              {/* Temps */}
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatTimeAgo(notification.created_at || new Date().toISOString())}
                              </span>
                            </div>
                          </div>

                          <p className={`
                            text-sm mt-1 line-clamp-2
                            ${!notification.is_read ? 'text-gray-800' : 'text-gray-600'}
                          `}>
                            {notification.message}
                          </p>

                          {/* Actions */}
                          {notification.action_url && (
                            <div className="mt-2">
                              <span className="inline-flex items-center text-xs text-blue-600">
                                <i className="fas fa-external-link-alt mr-1"></i>
                                Voir détails
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Indicateur non lu */}
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Rediriger vers la page complète des notifications
                    window.location.href = '/notifications';
                  }}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
                >
                  Voir toutes les notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlay pour fermer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default NotificationCenter;
