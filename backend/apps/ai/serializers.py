"""
Sérialiseurs pour l'API AI
"""

from rest_framework import serializers
from .models import AIConversation, AIMessage, AIConfig


class AIConfigSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour la configuration IA
    """
    class Meta:
        model = AIConfig
        fields = [
            'id', 'user', 'model_name', 'temperature', 'max_tokens',
            'context_length', 'language', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AIMessageSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour les messages IA
    """
    class Meta:
        model = AIMessage
        fields = [
            'id', 'conversation', 'role', 'content', 'tokens_used',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AIConversationSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour les conversations IA
    """
    messages = AIMessageSerializer(many=True, read_only=True)
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AIConversation
        fields = [
            'id', 'user', 'user_name', 'title', 'context', 'model_used',
            'total_tokens', 'created_at', 'updated_at', 'messages'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_user_name(self, obj):
        return obj.user.get_full_name()


class AIChatRequestSerializer(serializers.Serializer):
    """
    Sérialiseur pour les requêtes de chat IA
    """
    message = serializers.CharField(max_length=4000)
    context = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    conversation_id = serializers.IntegerField(required=False)
    model_name = serializers.CharField(max_length=50, required=False)
    temperature = serializers.FloatField(min_value=0.0, max_value=2.0, required=False)
    max_tokens = serializers.IntegerField(min_value=1, max_value=4000, required=False)