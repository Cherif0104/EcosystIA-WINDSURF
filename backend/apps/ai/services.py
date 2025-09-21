"""
Services IA pour l'intégration avec Gemini et autres APIs
"""

import google.generativeai as genai
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from typing import List, Dict, Any, Optional
import json
import time
import logging

from .models import ChatSession, ChatMessage, AIUsage, AIConfig

logger = logging.getLogger(__name__)


class GeminiService:
    """
    Service pour l'intégration avec Google Gemini API
    """
    
    def __init__(self):
        self.api_key = settings.SENEGEL_WORKFLOW.get('GEMINI_API_KEY')
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            logger.warning("Clé API Gemini non configurée")
    
    def generate_response(self, prompt: str, context: Dict[str, Any] = None, 
                         user_config: AIConfig = None) -> Dict[str, Any]:
        """
        Génère une réponse à partir d'un prompt
        """
        if not self.api_key:
            return {
                'content': "Service IA non disponible. Veuillez contacter l'administrateur.",
                'tokens_used': 0,
                'processing_time': 0
            }
        
        start_time = time.time()
        
        try:
            # Construire le prompt avec le contexte
            full_prompt = self._build_contextual_prompt(prompt, context, user_config)
            
            # Générer la réponse
            response = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=user_config.temperature if user_config else 0.7,
                    max_output_tokens=user_config.max_tokens if user_config else 1000,
                )
            )
            
            processing_time = time.time() - start_time
            
            # Extraire les informations
            content = response.text if response.text else "Désolé, je n'ai pas pu générer de réponse."
            tokens_used = self._estimate_tokens(full_prompt + content)
            
            return {
                'content': content,
                'tokens_used': tokens_used,
                'processing_time': processing_time
            }
            
        except Exception as e:
            logger.error(f"Erreur lors de la génération IA: {str(e)}")
            return {
                'content': "Une erreur s'est produite lors de la génération de la réponse.",
                'tokens_used': 0,
                'processing_time': time.time() - start_time
            }
    
    def _build_contextual_prompt(self, prompt: str, context: Dict[str, Any] = None, 
                                user_config: AIConfig = None) -> str:
        """
        Construit un prompt contextuel basé sur le contexte de l'utilisateur
        """
        base_prompt = f"""
Tu es un assistant IA spécialisé pour la plateforme EcosystIA, 
une plateforme de gestion de projets, cours, emplois et plus au Sénégal.

Contexte de l'utilisateur:
- Plateforme: EcosystIA
- Localisation: Sénégal, Afrique de l'Ouest
- Langue préférée: Français
- Domaine: Gestion de projets, éducation, emploi, entrepreneuriat

Réponds de manière professionnelle, utile et adaptée au contexte sénégalais.
"""
        
        if context:
            if context.get('type') == 'project':
                base_prompt += f"""
Contexte du projet:
- Titre: {context.get('title', 'N/A')}
- Description: {context.get('description', 'N/A')}
- Statut: {context.get('status', 'N/A')}
"""
            elif context.get('type') == 'course':
                base_prompt += f"""
Contexte du cours:
- Titre: {context.get('title', 'N/A')}
- Instructeur: {context.get('instructor', 'N/A')}
- Durée: {context.get('duration', 'N/A')}
"""
        
        base_prompt += f"\nQuestion de l'utilisateur: {prompt}"
        
        return base_prompt
    
    def _estimate_tokens(self, text: str) -> int:
        """
        Estime le nombre de tokens (approximation)
        """
        # Approximation: 1 token ≈ 4 caractères pour l'anglais/français
        return len(text) // 4


class AIChatService:
    """
    Service principal pour la gestion des chats IA
    """
    
    def __init__(self):
        self.gemini_service = GeminiService()
    
    def create_session(self, user, context_type: str = 'general', context_id: int = None) -> ChatSession:
        """
        Crée une nouvelle session de chat
        """
        session = ChatSession.objects.create(
            user=user,
            context_type=context_type,
            context_id=context_id
        )
        return session
    
    def send_message(self, session: ChatSession, user_message: str, 
                    user_config: AIConfig = None) -> ChatMessage:
        """
        Envoie un message et génère une réponse IA
        """
        # Sauvegarder le message de l'utilisateur
        user_msg = ChatMessage.objects.create(
            session=session,
            role='user',
            content=user_message,
            token_count=self._estimate_tokens(user_message)
        )
        
        # Préparer le contexte
        context = self._get_session_context(session)
        
        # Générer la réponse IA
        response_data = self.gemini_service.generate_response(
            user_message, 
            context, 
            user_config
        )
        
        # Sauvegarder la réponse IA
        ai_msg = ChatMessage.objects.create(
            session=session,
            role='ai',
            content=response_data['content'],
            token_count=response_data['tokens_used'],
            processing_time=response_data['processing_time']
        )
        
        # Mettre à jour les statistiques de la session
        session.message_count += 2
        session.token_count += user_msg.token_count + ai_msg.token_count
        session.updated_at = timezone.now()
        session.save()
        
        # Enregistrer l'utilisation
        self._record_usage(session.user, response_data['tokens_used'], session)
        
        return ai_msg
    
    def get_session_history(self, session: ChatSession, limit: int = 50) -> List[ChatMessage]:
        """
        Récupère l'historique d'une session
        """
        return session.messages.order_by('-created_at')[:limit]
    
    def _get_session_context(self, session: ChatSession) -> Dict[str, Any]:
        """
        Récupère le contexte d'une session
        """
        context = {
            'type': session.context_type,
            'user_role': session.user.role,
            'user_name': session.user.get_full_name()
        }
        
        if session.context_id:
            # Récupérer les données contextuelles selon le type
            if session.context_type == 'project':
                from apps.projects.models import Project
                try:
                    project = Project.objects.get(id=session.context_id)
                    context.update({
                        'title': project.title,
                        'description': project.description,
                        'status': project.status
                    })
                except Project.DoesNotExist:
                    pass
            elif session.context_type == 'course':
                from apps.courses.models import Course
                try:
                    course = Course.objects.get(id=session.context_id)
                    context.update({
                        'title': course.title,
                        'instructor': course.instructor.get_full_name(),
                        'duration': course.duration
                    })
                except Course.DoesNotExist:
                    pass
        
        return context
    
    def _record_usage(self, user, tokens_used: int, session: ChatSession = None):
        """
        Enregistre l'utilisation de l'IA
        """
        today = timezone.now().date()
        
        usage, created = AIUsage.objects.get_or_create(
            user=user,
            date=today,
            defaults={'tokens_used': 0, 'api_calls': 0}
        )
        
        usage.tokens_used += tokens_used
        usage.api_calls += 1
        if session:
            usage.session = session
        usage.save()
    
    def _estimate_tokens(self, text: str) -> int:
        """
        Estime le nombre de tokens
        """
        return len(text) // 4
    
    def check_usage_limits(self, user) -> Dict[str, Any]:
        """
        Vérifie les limites d'utilisation de l'utilisateur
        """
        today = timezone.now().date()
        
        try:
            config = user.ai_config
            today_usage = AIUsage.objects.filter(user=user, date=today).aggregate(
                total_tokens=models.Sum('tokens_used'),
                total_calls=models.Sum('api_calls')
            )
            
            return {
                'daily_tokens_used': today_usage['total_tokens'] or 0,
                'daily_token_limit': config.daily_token_limit,
                'can_use': (today_usage['total_tokens'] or 0) < config.daily_token_limit,
                'remaining_tokens': max(0, config.daily_token_limit - (today_usage['total_tokens'] or 0))
            }
        except AIConfig.DoesNotExist:
            return {
                'daily_tokens_used': 0,
                'daily_token_limit': 0,
                'can_use': False,
                'remaining_tokens': 0
            }


# Instance globale du service
ai_chat_service = AIChatService()
