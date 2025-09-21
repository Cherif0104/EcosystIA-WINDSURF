"""
Administration pour les objectifs OKR
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import Goal, KeyResult, GoalUpdate, GoalTemplate, GoalMilestone, OKRCycle


class KeyResultInline(admin.TabularInline):
    model = KeyResult
    extra = 1
    fields = ['title', 'target_value', 'current_value', 'unit', 'status', 'assignee']
    readonly_fields = ['progress']


class GoalMilestoneInline(admin.TabularInline):
    model = GoalMilestone
    extra = 1
    fields = ['title', 'target_date', 'target_progress', 'status']


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'type_colored', 'status_colored', 'priority_colored',
        'progress_bar', 'target_date', 'overdue_indicator', 'owner'
    ]
    list_filter = ['type', 'status', 'priority', 'created_at', 'target_date']
    search_fields = ['title', 'description', 'owner__username', 'tags']
    readonly_fields = ['created_at', 'updated_at', 'completion_rate', 'days_remaining']
    filter_horizontal = ['assignees']
    inlines = [KeyResultInline, GoalMilestoneInline]
    date_hierarchy = 'target_date'
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('title', 'description', 'type', 'status', 'priority')
        }),
        ('Dates et progression', {
            'fields': ('start_date', 'target_date', 'completed_date', 'progress', 'completion_rate', 'days_remaining')
        }),
        ('Relations', {
            'fields': ('owner', 'assignees', 'parent_goal', 'project')
        }),
        ('Métadonnées', {
            'fields': ('tags', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_active', 'mark_as_completed', 'update_progress']
    
    def type_colored(self, obj):
        colors = {
            'Personal': '#17a2b8',
            'Team': '#28a745',
            'Company': '#6f42c1',
            'Project': '#fd7e14'
        }
        color = colors.get(obj.type, '#000000')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_type_display()
        )
    type_colored.short_description = 'Type'
    
    def status_colored(self, obj):
        colors = {
            'Draft': '#6c757d',
            'Active': '#007bff',
            'Completed': '#28a745',
            'Cancelled': '#dc3545',
            'On Hold': '#ffc107'
        }
        color = colors.get(obj.status, '#000000')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_colored.short_description = 'Statut'
    
    def priority_colored(self, obj):
        colors = {
            'Low': '#28a745',
            'Medium': '#ffc107',
            'High': '#fd7e14',
            'Critical': '#dc3545'
        }
        color = colors.get(obj.priority, '#000000')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_priority_display()
        )
    priority_colored.short_description = 'Priorité'
    
    def progress_bar(self, obj):
        progress = obj.completion_rate
        color = '#28a745' if progress >= 80 else '#ffc107' if progress >= 50 else '#dc3545'
        return format_html(
            '<div style="width: 100px; background-color: #e9ecef; border-radius: 4px;">'
            '<div style="width: {}%; background-color: {}; height: 20px; border-radius: 4px; '
            'display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">'
            '{:.0f}%</div></div>',
            progress, color, progress
        )
    progress_bar.short_description = 'Progression'
    
    def overdue_indicator(self, obj):
        if obj.is_overdue:
            return format_html(
                '<span style="color: #dc3545; font-weight: bold;">⚠️ {} jours</span>',
                (timezone.now().date() - obj.target_date).days
            )
        elif obj.days_remaining <= 7 and obj.status == 'Active':
            return format_html(
                '<span style="color: #ffc107; font-weight: bold;">⏰ {} jours</span>',
                obj.days_remaining
            )
        return '✅'
    overdue_indicator.short_description = 'Échéance'
    
    def mark_as_active(self, request, queryset):
        count = queryset.update(status='Active')
        self.message_user(request, f"{count} objectif(s) marqué(s) comme actif(s).")
    mark_as_active.short_description = "Marquer comme actifs"
    
    def mark_as_completed(self, request, queryset):
        count = 0
        for goal in queryset:
            if goal.status != 'Completed':
                goal.status = 'Completed'
                goal.completed_date = timezone.now().date()
                goal.progress = 100
                goal.save()
                count += 1
        self.message_user(request, f"{count} objectif(s) marqué(s) comme terminé(s).")
    mark_as_completed.short_description = "Marquer comme terminés"


@admin.register(KeyResult)
class KeyResultAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'goal', 'status_colored', 'progress_display',
        'target_value', 'current_value', 'unit', 'assignee'
    ]
    list_filter = ['status', 'goal__type', 'target_date', 'created_at']
    search_fields = ['title', 'description', 'goal__title']
    readonly_fields = ['created_at', 'updated_at', 'completion_percentage']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('goal', 'title', 'description', 'status')
        }),
        ('Métriques', {
            'fields': ('target_value', 'current_value', 'unit', 'progress', 'completion_percentage')
        }),
        ('Dates', {
            'fields': ('start_date', 'target_date', 'completed_date')
        }),
        ('Attribution', {
            'fields': ('created_by', 'assignee')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def status_colored(self, obj):
        colors = {
            'Not Started': '#6c757d',
            'In Progress': '#007bff',
            'Completed': '#28a745',
            'Failed': '#dc3545'
        }
        color = colors.get(obj.status, '#000000')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_colored.short_description = 'Statut'
    
    def progress_display(self, obj):
        percentage = obj.completion_percentage
        color = '#28a745' if percentage >= 100 else '#ffc107' if percentage >= 50 else '#dc3545'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
            color, percentage
        )
    progress_display.short_description = 'Progression'


@admin.register(OKRCycle)
class OKRCycleAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'cycle_type', 'status_colored', 'period_display',
        'overall_progress_display', 'goals_count', 'owner'
    ]
    list_filter = ['cycle_type', 'status', 'start_date', 'end_date']
    search_fields = ['name', 'description', 'owner__username']
    readonly_fields = ['created_at', 'updated_at', 'overall_progress', 'is_current']
    filter_horizontal = ['goals']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('name', 'cycle_type', 'status', 'description')
        }),
        ('Période', {
            'fields': ('start_date', 'end_date', 'is_current')
        }),
        ('Progression', {
            'fields': ('overall_progress',)
        }),
        ('Relations', {
            'fields': ('owner', 'goals')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def status_colored(self, obj):
        colors = {
            'Planning': '#6c757d',
            'Active': '#28a745',
            'Review': '#ffc107',
            'Closed': '#007bff'
        }
        color = colors.get(obj.status, '#000000')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_colored.short_description = 'Statut'
    
    def period_display(self, obj):
        return f"{obj.start_date} → {obj.end_date}"
    period_display.short_description = 'Période'
    
    def overall_progress_display(self, obj):
        progress = obj.overall_progress
        color = '#28a745' if progress >= 80 else '#ffc107' if progress >= 50 else '#dc3545'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
            color, progress
        )
    overall_progress_display.short_description = 'Progression Globale'
    
    def goals_count(self, obj):
        return obj.goals.count()
    goals_count.short_description = 'Nb Objectifs'


@admin.register(GoalTemplate)
class GoalTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_public', 'created_by', 'created_at']
    list_filter = ['category', 'is_public', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('name', 'category', 'description', 'is_public')
        }),
        ('Templates', {
            'fields': ('goal_template', 'key_results_template')
        }),
        ('Métadonnées', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(GoalUpdate)
class GoalUpdateAdmin(admin.ModelAdmin):
    list_display = ['goal', 'update_type', 'title', 'created_by', 'created_at']
    list_filter = ['update_type', 'created_at']
    search_fields = ['title', 'description', 'goal__title']
    readonly_fields = ['created_at']
    
    def has_add_permission(self, request):
        return False  # Les mises à jour sont créées automatiquement
    
    def has_change_permission(self, request, obj=None):
        return False  # Les mises à jour ne peuvent pas être modifiées


@admin.register(GoalMilestone)
class GoalMilestoneAdmin(admin.ModelAdmin):
    list_display = ['goal', 'title', 'status_colored', 'target_date', 'target_progress', 'overdue_indicator']
    list_filter = ['status', 'target_date', 'created_at']
    search_fields = ['title', 'description', 'goal__title']
    readonly_fields = ['created_at', 'updated_at']
    
    def status_colored(self, obj):
        colors = {
            'Pending': '#ffc107',
            'Completed': '#28a745',
            'Missed': '#dc3545'
        }
        color = colors.get(obj.status, '#000000')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_colored.short_description = 'Statut'
    
    def overdue_indicator(self, obj):
        if obj.is_overdue:
            return format_html('<span style="color: #dc3545;">⚠️ En retard</span>')
        return '✅'
    overdue_indicator.short_description = 'Échéance'
