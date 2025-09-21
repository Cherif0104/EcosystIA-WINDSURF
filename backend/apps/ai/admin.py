"""
Administration Django pour l'IA
"""

from django.contrib import admin
from .models import ChatSession, ChatMessage, AIConfig, AIUsage, AIPrompt


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ('created_at', 'token_count', 'processing_time')


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    """
    Administration des sessions de chat
    """
    list_display = ('id', 'user', 'context_type', 'context_id', 'title', 'is_active', 'message_count', 'created_at')
    list_filter = ('context_type', 'is_active', 'created_at')
    search_fields = ('user__email', 'title')
    readonly_fields = ('created_at', 'updated_at', 'message_count', 'token_count')
    inlines = [ChatMessageInline]
    
    fieldsets = (
        ('Session', {
            'fields': ('user', 'context_type', 'context_id', 'title', 'is_active')
        }),
        ('Statistiques', {
            'fields': ('message_count', 'token_count', 'created_at', 'updated_at')
        }),
    )


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    """
    Administration des messages de chat
    """
    list_display = ('id', 'session', 'role', 'content_preview', 'token_count', 'processing_time', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('content', 'session__user__email')
    readonly_fields = ('created_at', 'token_count', 'processing_time')
    
    def content_preview(self, obj):
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Aperçu du contenu'
    
    fieldsets = (
        ('Message', {
            'fields': ('session', 'role', 'content')
        }),
        ('Métadonnées', {
            'fields': ('token_count', 'processing_time', 'context_data', 'created_at')
        }),
    )


@admin.register(AIConfig)
class AIConfigAdmin(admin.ModelAdmin):
    """
    Administration des configurations IA
    """
    list_display = ('user', 'daily_token_limit', 'monthly_token_limit', 'preferred_model', 'temperature')
    search_fields = ('user__email',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Utilisateur', {
            'fields': ('user',)
        }),
        ('Limites', {
            'fields': ('daily_token_limit', 'monthly_token_limit')
        }),
        ('Configuration modèle', {
            'fields': ('preferred_model', 'temperature', 'max_tokens')
        }),
        ('Fonctionnalités', {
            'fields': ('context_awareness', 'auto_suggestions', 'content_generation')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(AIUsage)
class AIUsageAdmin(admin.ModelAdmin):
    """
    Administration de l'utilisation IA
    """
    list_display = ('user', 'date', 'service', 'tokens_used', 'api_calls', 'cost')
    list_filter = ('date', 'service')
    search_fields = ('user__email',)
    readonly_fields = ('date',)
    
    fieldsets = (
        ('Utilisation', {
            'fields': ('user', 'session', 'date', 'service')
        }),
        ('Métriques', {
            'fields': ('tokens_used', 'api_calls', 'cost')
        }),
    )


@admin.register(AIPrompt)
class AIPromptAdmin(admin.ModelAdmin):
    """
    Administration des templates de prompts
    """
    list_display = ('name', 'category', 'is_active', 'usage_count', 'created_by', 'created_at')
    list_filter = ('category', 'is_active', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at', 'usage_count')
    
    fieldsets = (
        ('Template', {
            'fields': ('name', 'category', 'prompt_template', 'description', 'is_active')
        }),
        ('Statistiques', {
            'fields': ('usage_count', 'created_by', 'created_at', 'updated_at')
        }),
    )
