"""
Sérialiseurs pour la gestion des utilisateurs
"""

from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour les utilisateurs
    """
    role_display = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'role_display', 'phone', 'location', 'avatar',
            'is_active', 'is_staff', 'date_joined', 'last_login',
            'login_count', 'last_activity'
        ]
        read_only_fields = [
            'id', 'date_joined', 'last_login', 'login_count', 'last_activity'
        ]
    
    def get_role_display(self, obj):
        return obj.get_role_display_name()
    
    def get_full_name(self, obj):
        return obj.get_full_name()


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour le profil utilisateur (mise à jour)
    """
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'location', 'avatar'
        ]
    
    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.location = validated_data.get('location', instance.location)
        instance.avatar = validated_data.get('avatar', instance.avatar)
        instance.save()
        return instance


class UserStatsSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour les statistiques utilisateur
    """
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'login_count', 'last_activity', 'date_joined'
        ]
        read_only_fields = ['id', 'login_count', 'last_activity', 'date_joined']