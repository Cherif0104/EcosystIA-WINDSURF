"""
URLs pour les notifications
"""

from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    # Notifications
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    
    # Préférences
    path('preferences/', views.NotificationPreferenceView.as_view(), name='notification-preferences'),
    
    # Statistiques
    path('stats/', views.NotificationStatsView.as_view(), name='notification-stats'),
    
    # Actions
    path('mark-all-read/', views.mark_all_read, name='mark-all-read'),
    path('<int:notification_id>/mark-read/', views.mark_read, name='mark-read'),
    path('delete-read/', views.delete_read_notifications, name='delete-read'),
    path('unread-count/', views.unread_count, name='unread-count'),
    path('recent/', views.recent_notifications, name='recent-notifications'),
]
