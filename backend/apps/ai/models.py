"""
Modèles pour l'intégration IA EcosystIA
Chatbot contextuel et génération de contenu
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class ChatSession(models.Model):
    """
    Session de chat avec l'IA
    Compatible avec l'interface AgentMessage du frontend
    """
    CONTEXT_CHOICES = [
        ('general', 'Général'),
        ('project', 'Projet'),
        ('course', 'Cours'),
        ('job', 'Emploi'),
        ('finance', 'Finance'),
        ('crm', 'CRM'),
        ('analytics', 'Analytics'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    context_type = models.CharField(max_length=20, choices=CONTEXT_CHOICES, default='general')
    context_id = models.PositiveIntegerField(blank=True, null=True, help_text="ID de l'entité contextuelle")
    title = models.CharField(max_length=200, blank=True, null=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    # Statistiques
    message_count = models.PositiveIntegerField(default=0)
    token_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'ai_chatsession'
        verbose_name = 'Session de Chat'
        verbose_name_plural = 'Sessions de Chat'
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['context_type', 'context_id']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Session {self.id} - {self.user.get_full_name()}"


class ChatMessage(models.Model):
    """
    Message dans une session de chat
    Compatible avec l'interface AgentMessage du frontend
    """
    ROLE_CHOICES = [
        ('user', 'Utilisateur'),
        ('ai', 'IA'),
        ('system', 'Système'),
    ]
    
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    token_count = models.PositiveIntegerField(default=0)
    processing_time = models.FloatField(default=0.0, help_text="Temps de traitement en secondes")
    
    # Contexte
    context_data = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'ai_chatmessage'
        verbose_name = 'Message de Chat'
        verbose_name_plural = 'Messages de Chat'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['session', 'created_at']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        return f"{self.get_role_display()} - {self.content[:50]}..."


class AIUsage(models.Model):
    """
    Suivi de l'utilisation de l'IA pour la facturation et les limites
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_usage')
    session = models.ForeignKey(ChatSession, on_delete=models.SET_NULL, blank=True, null=True)
    
    # Métriques
    tokens_used = models.PositiveIntegerField(default=0)
    api_calls = models.PositiveIntegerField(default=0)
    cost = models.DecimalField(max_digits=10, decimal_places=4, default=0.0)
    
    # Métadonnées
    date = models.DateField(default=timezone.now)
    service = models.CharField(max_length=50, default='gemini')
    
    class Meta:
        db_table = 'ai_aiusage'
        verbose_name = 'Utilisation IA'
        verbose_name_plural = 'Utilisations IA'
        unique_together = ['user', 'date', 'service']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.date} - {self.tokens_used} tokens"


class AIPrompt(models.Model):
    """
    Templates de prompts pour différents contextes
    """
    CATEGORY_CHOICES = [
        ('general', 'Général'),
        ('project_management', 'Gestion de Projet'),
        ('course_content', 'Contenu de Cours'),
        ('job_description', 'Description d\'Emploi'),
        ('financial_analysis', 'Analyse Financière'),
        ('crm_insights', 'Insights CRM'),
        ('analytics', 'Analytics'),
    ]
    
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    prompt_template = models.TextField()
    description = models.TextField(blank=True, null=True)
    
    # Métadonnées
    is_active = models.BooleanField(default=True)
    usage_count = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_prompts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ai_aiprompt'
        verbose_name = 'Template de Prompt'
        verbose_name_plural = 'Templates de Prompts'
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.get_category_display()}"


class AIConfig(models.Model):
    """
    Configuration de l'IA par utilisateur/organisation
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ai_config')
    
    # Limites
    daily_token_limit = models.PositiveIntegerField(default=10000)
    monthly_token_limit = models.PositiveIntegerField(default=300000)
    
    # Préférences
    preferred_model = models.CharField(max_length=50, default='gemini-pro')
    temperature = models.FloatField(default=0.7, validators=[models.MinValueValidator(0.0), models.MaxValueValidator(2.0)])
    max_tokens = models.PositiveIntegerField(default=1000)
    
    # Fonctionnalités
    context_awareness = models.BooleanField(default=True)
    auto_suggestions = models.BooleanField(default=True)
    content_generation = models.BooleanField(default=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ai_aiconfig'
        verbose_name = 'Configuration IA'
        verbose_name_plural = 'Configurations IA'
    
    def __str__(self):
        return f"Config IA - {self.user.get_full_name()}"
