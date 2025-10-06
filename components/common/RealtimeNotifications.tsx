import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtimeNotifications } from '../../hooks/useRealtime';

interface RealtimeNotificationsProps {
  className?: string;
  showCount?: boolean;
  maxNotifications?: number;
}

const RealtimeNotifications: React.FC<RealtimeNotificationsProps> = ({
  className = '',
  showCount = true,
  maxNotifications = 5
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead
  } = useRealtimeNotifications(user?.id || null);

  const handleNotificationClick = async (notification: any) => {
    // Marquer comme lue
    await markAsRead([notification.id]);
    
    // Naviguer si une URL d'action est fournie
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
    
    // Fermer le dropdown
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications
      .filter(n => n.status === 'unread')
      .map(n => n.id);
    
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return 'fas fa-check-circle text-green-500';
      case 'warning': return 'fas fa-exclamation-triangle text-yellow-500';
      case 'error': return 'fas fa-times-circle text-red-500';
      default: return 'fas fa-info-circle text-blue-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}m`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
      >
        <i className="fas fa-bell text-xl"></i>
        
        {/* Badge de notification */}
        {showCount && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown des notifications */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>

            {/* Liste des notifications */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Chargement...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <i className="fas fa-bell-slash text-2xl mb-2"></i>
                  <p>Aucune notification</p>
                </div>
              ) : (
                notifications.slice(0, maxNotifications).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      notification.status === 'unread' ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <i className={`${getNotificationIcon(notification.type)}`}></i>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>

                      {notification.status === 'unread' && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > maxNotifications && (
              <div className="px-4 py-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    // Naviguer vers la page des notifications
                    window.location.href = '/notifications';
                  }}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
                >
                  Voir toutes les notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RealtimeNotifications;
