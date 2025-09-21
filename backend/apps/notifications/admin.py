"""
Administration pour les notifications
"""

from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count
from .models import Notification, NotificationPreference, NotificationTemplate


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'recipient', 'type', 'category', 'is_read_display',
        'sender', 'created_at'
    ]
    list_filter = ['type', 'category', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'recipient__username', 'sender__username']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Contenu', {
            'fields': ('title', 'message', 'type', 'category')
        }),
        ('Destinataire', {
            'fields': ('recipient', 'sender')
        }),
        ('État', {
            'fields': ('is_read', 'read_at')
        }),
        ('Métadonnées', {
            'fields': ('related_object_id', 'related_object_type', 'action_url'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ['created_at', 'read_at']
    
    def is_read_display(self, obj):
        """Affichage du statut de lecture"""
        if obj.is_read:
            return format_html(
                '<span style="color: green;">✓ Lu</span>'
            )
        return format_html(
            '<span style="color: red;">✗ Non lu</span>'
        )
    is_read_display.short_description = 'Statut'
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        """Marquer comme lu"""
        queryset.update(is_read=True)
        self.message_user(request, f'{queryset.count()} notifications marquées comme lues')
    mark_as_read.short_description = 'Marquer comme lu'
    
    def mark_as_unread(self, request, queryset):
        """Marquer comme non lu"""
        queryset.update(is_read=False, read_at=None)
        self.message_user(request, f'{queryset.count()} notifications marquées comme non lues')
    mark_as_unread.short_description = 'Marquer comme non lu'


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'email_enabled', 'push_enabled', 'in_app_enabled',
        'digest_frequency', 'updated_at'
    ]
    list_filter = ['email_enabled', 'push_enabled', 'in_app_enabled', 'digest_frequency']
    search_fields = ['user__username', 'user__email']
    
    fieldsets = (
        ('Utilisateur', {
            'fields': ('user',)
        }),
        ('Notifications par email', {
            'fields': ('email_enabled', 'email_projects', 'email_courses',
                      'email_meetings', 'email_finance', 'email_goals')
        }),
        ('Notifications push', {
            'fields': ('push_enabled', 'push_projects', 'push_courses',
                      'push_meetings', 'push_finance', 'push_goals')
        }),
        ('Autres préférences', {
            'fields': ('in_app_enabled', 'digest_frequency')
        })
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'type', 'category', 'is_active', 'send_email',
        'send_push', 'updated_at'
    ]
    list_filter = ['type', 'category', 'is_active', 'send_email', 'send_push']
    search_fields = ['name', 'description', 'title_template']
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('name', 'description', 'is_active')
        }),
        ('Contenu', {
            'fields': ('title_template', 'message_template', 'type', 'category')
        }),
        ('Configuration', {
            'fields': ('send_email', 'send_push')
        })
    )
    
    readonly_fields = ['created_at', 'updated_at']


# Configuration de l'admin
admin.site.site_header = "EcosystIA - Administration des Notifications"
