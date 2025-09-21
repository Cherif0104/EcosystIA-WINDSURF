"""
Administration personnalisée pour EcosystIA
"""

from django.contrib import admin
from django.contrib.admin import AdminSite
from django.utils.html import format_html
from django.urls import path
from django.shortcuts import render
from django.http import JsonResponse
from django.core.cache import cache
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta


class EcosystiaAdminSite(AdminSite):
    """
    Site d'administration personnalisé pour EcosystIA
    """
    site_header = '🚀 EcosystIA Administration'
    site_title = 'EcosystIA Admin'
    index_title = 'Tableau de bord administrateur'
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('dashboard/', self.admin_view(self.dashboard_view), name='dashboard'),
            path('maintenance/', self.admin_view(self.maintenance_view), name='maintenance'),
            path('api/stats/', self.admin_view(self.api_stats), name='api_stats'),
        ]
        return custom_urls + urls
    
    def dashboard_view(self, request):
        """Vue du dashboard administrateur"""
        from apps.users.models import User, UserActivity
        from apps.projects.models import Project
        from apps.courses.models import Course
        from apps.crm.models import Contact
        
        # Statistiques générales
        stats = {
            'users_count': User.objects.count(),
            'active_users': User.objects.filter(
                last_activity__gte=timezone.now() - timedelta(days=7)
            ).count(),
            'projects_count': Project.objects.count(),
            'courses_count': Course.objects.count(),
            'contacts_count': Contact.objects.count(),
        }
        
        # Activités récentes
        recent_activities = UserActivity.objects.select_related('user').order_by('-created_at')[:10]
        
        # Utilisateurs par rôle
        users_by_role = User.objects.values('role').annotate(count=Count('id')).order_by('-count')
        
        context = {
            'title': 'Dashboard EcosystIA',
            'stats': stats,
            'recent_activities': recent_activities,
            'users_by_role': users_by_role,
        }
        
        return render(request, 'admin/dashboard.html', context)
    
    def maintenance_view(self, request):
        """Vue de gestion de la maintenance"""
        if request.method == 'POST':
            action = request.POST.get('action')
            
            if action == 'enable':
                duration = int(request.POST.get('duration', 3600))
                message = request.POST.get('message', 'Maintenance en cours')
                
                cache.set('maintenance_mode', True, timeout=duration)
                cache.set('maintenance_message', message, timeout=duration)
                cache.set('maintenance_start', timezone.now().isoformat(), timeout=duration)
                
                self.message_user(request, 'Mode maintenance activé.')
                
            elif action == 'disable':
                cache.delete('maintenance_mode')
                cache.delete('maintenance_message')
                cache.delete('maintenance_start')
                
                self.message_user(request, 'Mode maintenance désactivé.')
        
        # Status actuel
        is_maintenance = cache.get('maintenance_mode', False)
        maintenance_message = cache.get('maintenance_message', '')
        maintenance_start = cache.get('maintenance_start', '')
        
        context = {
            'title': 'Gestion de la maintenance',
            'is_maintenance': is_maintenance,
            'maintenance_message': maintenance_message,
            'maintenance_start': maintenance_start,
        }
        
        return render(request, 'admin/maintenance.html', context)
    
    def api_stats(self, request):
        """API pour les statistiques en temps réel"""
        from apps.users.models import User
        
        # Statistiques en temps réel
        now = timezone.now()
        stats = {
            'users_online': User.objects.filter(
                last_activity__gte=now - timedelta(minutes=5)
            ).count(),
            'users_today': User.objects.filter(
                last_activity__date=now.date()
            ).count(),
            'registrations_today': User.objects.filter(
                date_joined__date=now.date()
            ).count(),
        }
        
        return JsonResponse(stats)


# Créer l'instance du site d'administration personnalisé
ecosystia_admin_site = EcosystiaAdminSite(name='ecosystia_admin')


class BaseEcosystiaAdmin(admin.ModelAdmin):
    """
    Classe de base pour tous les admins EcosystIA
    """
    list_per_page = 25
    show_full_result_count = False
    
    def get_readonly_fields(self, request, obj=None):
        """Rendre certains champs readonly automatiquement"""
        readonly = list(super().get_readonly_fields(request, obj))
        
        # Ajouter automatiquement les champs de métadonnées
        meta_fields = ['created_at', 'updated_at', 'id']
        for field in meta_fields:
            if hasattr(self.model, field) and field not in readonly:
                readonly.append(field)
        
        return readonly
    
    def get_list_display(self, request):
        """Ajouter automatiquement les actions dans list_display"""
        list_display = list(super().get_list_display(request))
        
        if 'action_buttons' not in list_display and hasattr(self, 'action_buttons'):
            list_display.append('action_buttons')
        
        return list_display
    
    def action_buttons(self, obj):
        """Boutons d'action personnalisés"""
        buttons = []
        
        if hasattr(obj, 'get_absolute_url'):
            buttons.append(
                f'<a href="{obj.get_absolute_url()}" target="_blank" '
                f'class="button">👁️ Voir</a>'
            )
        
        return format_html(' '.join(buttons))
    action_buttons.short_description = 'Actions'


class ColoredStatusMixin:
    """
    Mixin pour colorer les statuts dans l'admin
    """
    def colored_status(self, obj):
        colors = {
            'active': 'green',
            'inactive': 'red',
            'pending': 'orange',
            'completed': 'blue',
            'draft': 'gray',
            'published': 'green',
        }
        
        status = getattr(obj, 'status', '').lower()
        color = colors.get(status, 'black')
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display() if hasattr(obj, 'get_status_display') else status
        )
    colored_status.short_description = 'Statut'


class ExportMixin:
    """
    Mixin pour ajouter des fonctionnalités d'export
    """
    actions = ['export_csv', 'export_json']
    
    def export_csv(self, request, queryset):
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{self.model._meta.verbose_name_plural}.csv"'
        
        writer = csv.writer(response)
        
        # Headers
        fields = [field.name for field in self.model._meta.fields]
        writer.writerow(fields)
        
        # Data
        for obj in queryset:
            row = []
            for field in fields:
                value = getattr(obj, field, '')
                if value is None:
                    value = ''
                row.append(str(value))
            writer.writerow(row)
        
        return response
    export_csv.short_description = "Exporter en CSV"
    
    def export_json(self, request, queryset):
        import json
        from django.http import HttpResponse
        from django.core.serializers import serialize
        
        response = HttpResponse(content_type='application/json')
        response['Content-Disposition'] = f'attachment; filename="{self.model._meta.verbose_name_plural}.json"'
        
        serialized = serialize('json', queryset)
        response.write(serialized)
        
        return response
    export_json.short_description = "Exporter en JSON"
