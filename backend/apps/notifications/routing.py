"""
Routing WebSocket pour les notifications temps réel
"""

from django.urls import path
from . import consumers

websocket_urlpatterns = [
    # Notifications globales pour un utilisateur
    path('ws/notifications/<int:user_id>/', consumers.NotificationConsumer.as_asgi()),
    
    # Notifications pour un projet spécifique
    path('ws/projects/<int:project_id>/notifications/', consumers.ProjectNotificationConsumer.as_asgi()),
    
    # Chat en temps réel pour une réunion
    path('ws/meetings/<int:meeting_id>/chat/', consumers.MeetingChatConsumer.as_asgi()),
    
    # Notifications système globales
    path('ws/system/', consumers.SystemNotificationConsumer.as_asgi()),
]
