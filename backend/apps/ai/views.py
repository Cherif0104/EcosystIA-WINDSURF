"""
Vues API pour l'IA
"""

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import AIConversation, AIMessage, AIConfig
from .serializers import (
    AIConversationSerializer, AIMessageSerializer, 
    AIConfigSerializer, AIChatRequestSerializer
)
from .services import AIService


class AIConversationListView(generics.ListCreateAPIView):
    """
    Liste et création de conversations IA
    """
    serializer_class = AIConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return AIConversation.objects.filter(user=self.request.user).order_by('-updated_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AIConversationDetailView(generics.RetrieveDestroyAPIView):
    """
    Détails et suppression d'une conversation IA
    """
    serializer_class = AIConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return AIConversation.objects.filter(user=self.request.user)


class AIConfigView(generics.RetrieveUpdateAPIView):
    """
    Configuration IA de l'utilisateur
    """
    serializer_class = AIConfigSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        config, created = AIConfig.objects.get_or_create(
            user=self.request.user,
            defaults={
                'model_name': 'gemini-pro',
                'temperature': 0.7,
                'max_tokens': 1000,
                'language': 'fr'
            }
        )
        return config


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def chat_with_ai(request):
    """
    Chat avec l'IA
    """
    serializer = AIChatRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        ai_service = AIService()
        
        # Obtenir ou créer la conversation
        conversation_id = serializer.validated_data.get('conversation_id')
        if conversation_id:
            conversation = AIConversation.objects.get(
                id=conversation_id, user=request.user
            )
        else:
            conversation = AIConversation.objects.create(
                user=request.user,
                title=serializer.validated_data['message'][:50],
                context=serializer.validated_data.get('context', ''),
                model_used='gemini-pro'
            )
        
        # Créer le message utilisateur
        user_message = AIMessage.objects.create(
            conversation=conversation,
            role='user',
            content=serializer.validated_data['message']
        )
        
        # Obtenir la réponse de l'IA
        ai_response = ai_service.generate_response(
            user_query=serializer.validated_data['message'],
            context=serializer.validated_data.get('context', ''),
            conversation_history=conversation.messages.all()[:10]
        )
        
        # Créer le message IA
        ai_message = AIMessage.objects.create(
            conversation=conversation,
            role='assistant',
            content=ai_response['content'],
            tokens_used=ai_response.get('tokens_used', 0)
        )
        
        # Mettre à jour la conversation
        conversation.total_tokens += ai_message.tokens_used
        conversation.save()
        
        return Response({
            'conversation_id': conversation.id,
            'user_message': AIMessageSerializer(user_message).data,
            'ai_message': AIMessageSerializer(ai_message).data,
            'conversation': AIConversationSerializer(conversation).data
        })
        
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de la génération de la réponse: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def ai_usage_stats(request):
    """
    Statistiques d'utilisation de l'IA
    """
    user = request.user
    conversations = AIConversation.objects.filter(user=user)
    
    stats = {
        'total_conversations': conversations.count(),
        'total_messages': AIMessage.objects.filter(conversation__user=user).count(),
        'total_tokens_used': sum(c.total_tokens for c in conversations),
        'most_used_model': conversations.values('model_used').annotate(
            count=models.Count('model_used')
        ).order_by('-count').first()
    }
    
    return Response(stats)