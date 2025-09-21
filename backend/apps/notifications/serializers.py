"""
Serializers pour les notifications
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification, NotificationPreference, NotificationTemplate

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer basique pour les utilisateurs"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'avatar']
        read_only_fields = ['id', 'username', 'email', 'full_name', 'avatar']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer pour les notifications"""
    sender = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'type', 'category', 'sender',
            'is_read', 'read_at', 'created_at', 'related_object_id',
            'related_object_type', 'action_url'
        ]
        read_only_fields = [
            'id', 'sender', 'created_at', 'read_at'
        ]


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer pour les préférences de notifications"""
    
    class Meta:
        model = NotificationPreference
        fields = [
            'id', 'email_enabled', 'email_projects', 'email_courses',
            'email_meetings', 'email_finance', 'email_goals',
            'push_enabled', 'push_projects', 'push_courses',
            'push_meetings', 'push_finance', 'push_goals',
            'in_app_enabled', 'digest_frequency', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class NotificationTemplateSerializer(serializers.ModelSerializer):
    """Serializer pour les modèles de notifications"""
    
    class Meta:
        model = NotificationTemplate
        fields = [
            'id', 'name', 'description', 'title_template',
            'message_template', 'type', 'category', 'is_active',
            'send_email', 'send_push', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class NotificationStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques des notifications"""
    total_notifications = serializers.IntegerField()
    unread_notifications = serializers.IntegerField()
    notifications_today = serializers.IntegerField()
    notifications_this_week = serializers.IntegerField()
    notifications_by_type = serializers.DictField()
    notifications_by_category = serializers.DictField()
