"""
Administration pour l'authentification
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from apps.users.models import User, UserProfile, UserSession, UserActivity


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'get_action_display', 'ip_address', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['user__username', 'user__email', 'description', 'ip_address']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    def has_add_permission(self, request):
        return False  # Les activités sont créées automatiquement
    
    def has_change_permission(self, request, obj=None):
        return False  # Les activités ne peuvent pas être modifiées


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'session_key_short', 'ip_address', 'is_active', 'created_at', 'last_activity']
    list_filter = ['is_active', 'created_at', 'last_activity']
    search_fields = ['user__username', 'user__email', 'ip_address', 'session_key']
    readonly_fields = ['session_key', 'created_at', 'last_activity']
    date_hierarchy = 'created_at'
    
    def session_key_short(self, obj):
        return f"{obj.session_key[:8]}..." if obj.session_key else ""
    session_key_short.short_description = "Session"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    actions = ['deactivate_sessions']
    
    def deactivate_sessions(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} session(s) désactivée(s).")
    deactivate_sessions.short_description = "Désactiver les sessions sélectionnées"
