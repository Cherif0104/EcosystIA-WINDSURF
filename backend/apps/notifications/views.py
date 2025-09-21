"""
Vues pour les notifications
"""

from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Notification, NotificationPreference, NotificationTemplate
from .serializers import (
    NotificationSerializer, NotificationPreferenceSerializer,
    NotificationTemplateSerializer, NotificationStatsSerializer
)
from apps.core.mixins import CacheResponseMixin


class NotificationListView(CacheResponseMixin, generics.ListAPIView):
    """
    Liste des notifications de l'utilisateur
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['type', 'category', 'is_read']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        ).select_related('sender')


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Détail d'une notification
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """Marquer comme lu lors de la lecture"""
        instance = self.get_object()
        if not instance.is_read:
            instance.mark_as_read()
        return super().retrieve(request, *args, **kwargs)


class NotificationPreferenceView(generics.RetrieveUpdateAPIView):
    """
    Préférences de notifications de l'utilisateur
    """
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        preference, created = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preference


class NotificationStatsView(APIView):
    """
    Statistiques des notifications
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        now = timezone.now()
        today = now.date()
        week_ago = now - timedelta(days=7)
        
        # Notifications de l'utilisateur
        user_notifications = Notification.objects.filter(recipient=user)
        
        # Statistiques de base
        stats = {
            'total_notifications': user_notifications.count(),
            'unread_notifications': user_notifications.filter(is_read=False).count(),
            'notifications_today': user_notifications.filter(
                created_at__date=today
            ).count(),
            'notifications_this_week': user_notifications.filter(
                created_at__gte=week_ago
            ).count(),
        }
        
        # Répartition par type
        notifications_by_type = user_notifications.values('type').annotate(
            count=Count('id')
        ).order_by('-count')
        stats['notifications_by_type'] = {
            item['type']: item['count'] for item in notifications_by_type
        }
        
        # Répartition par catégorie
        notifications_by_category = user_notifications.values('category').annotate(
            count=Count('id')
        ).order_by('-count')
        stats['notifications_by_category'] = {
            item['category']: item['count'] for item in notifications_by_category
        }
        
        serializer = NotificationStatsSerializer(stats)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """
    Marquer toutes les notifications comme lues
    """
    user = request.user
    unread_notifications = Notification.objects.filter(
        recipient=user,
        is_read=False
    )
    
    count = unread_notifications.count()
    unread_notifications.update(
        is_read=True,
        read_at=timezone.now()
    )
    
    return Response({
        'message': f'{count} notifications marquées comme lues'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_read(request, notification_id):
    """
    Marquer une notification comme lue
    """
    try:
        notification = Notification.objects.get(
            id=notification_id,
            recipient=request.user
        )
        notification.mark_as_read()
        return Response({'message': 'Notification marquée comme lue'})
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_read_notifications(request):
    """
    Supprimer toutes les notifications lues
    """
    user = request.user
    read_notifications = Notification.objects.filter(
        recipient=user,
        is_read=True
    )
    
    count = read_notifications.count()
    read_notifications.delete()
    
    return Response({
        'message': f'{count} notifications supprimées'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    """
    Nombre de notifications non lues
    """
    count = Notification.objects.filter(
        recipient=request.user,
        is_read=False
    ).count()
    
    return Response({'unread_count': count})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_notifications(request):
    """
    Notifications récentes (dernières 24h)
    """
    user = request.user
    yesterday = timezone.now() - timedelta(days=1)
    
    notifications = Notification.objects.filter(
        recipient=user,
        created_at__gte=yesterday
    ).select_related('sender').order_by('-created_at')[:20]
    
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


# Fonctions utilitaires pour créer des notifications
def create_notification(recipient, title, message, type='info', category='system', 
                       sender=None, related_object_id=None, related_object_type=None, 
                       action_url=None):
    """
    Créer une nouvelle notification
    """
    return Notification.objects.create(
        recipient=recipient,
        sender=sender,
        title=title,
        message=message,
        type=type,
        category=category,
        related_object_id=related_object_id,
        related_object_type=related_object_type,
        action_url=action_url
    )


def notify_users(users, title, message, **kwargs):
    """
    Notifier plusieurs utilisateurs
    """
    notifications = []
    for user in users:
        notification = create_notification(
            recipient=user,
            title=title,
            message=message,
            **kwargs
        )
        notifications.append(notification)
    return notifications
