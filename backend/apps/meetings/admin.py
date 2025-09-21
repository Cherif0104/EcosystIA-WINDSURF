"""
Administration pour la gestion des réunions
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Meeting, MeetingAttendee, MeetingAction, MeetingTemplate


class MeetingAttendeeInline(admin.TabularInline):
    model = MeetingAttendee
    extra = 0
    fields = ['user', 'status', 'role', 'is_present', 'joined_at', 'left_at']
    readonly_fields = ['joined_at', 'left_at']


class MeetingActionInline(admin.TabularInline):
    model = MeetingAction
    extra = 0
    fields = ['title', 'assigned_to', 'status', 'priority', 'due_date']


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'type', 'status', 'organizer', 'start_datetime', 
        'duration_display', 'attendees_count_display', 'actions_count'
    ]
    list_filter = ['type', 'status', 'priority', 'start_datetime', 'is_recurring']
    search_fields = ['title', 'description', 'organizer__username', 'organizer__email']
    date_hierarchy = 'start_datetime'
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('title', 'description', 'type', 'status', 'priority')
        }),
        ('Planification', {
            'fields': ('start_datetime', 'end_datetime', 'timezone', 'organizer')
        }),
        ('Lieu et connexion', {
            'fields': ('location', 'meeting_url', 'meeting_id', 'meeting_password')
        }),
        ('Contenu', {
            'fields': ('agenda', 'notes', 'recording_url')
        }),
        ('Récurrence', {
            'fields': ('is_recurring', 'recurrence_pattern', 'recurrence_end_date', 'parent_meeting'),
            'classes': ('collapse',)
        }),
        ('Suivi', {
            'fields': ('actual_start_time', 'actual_end_time', 'attendance_rate'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ['created_at', 'updated_at']
    inlines = [MeetingAttendeeInline, MeetingActionInline]
    
    def duration_display(self, obj):
        """Affichage de la durée"""
        return f"{obj.duration_minutes} min"
    duration_display.short_description = 'Durée'
    
    def attendees_count_display(self, obj):
        """Nombre de participants"""
        count = obj.attendees_count
        if count > 0:
            return format_html(
                '<span style="color: green;">{} participants</span>',
                count
            )
        return "Aucun participant"
    attendees_count_display.short_description = 'Participants'
    
    def actions_count(self, obj):
        """Nombre d'actions"""
        count = obj.actions.count()
        if count > 0:
            return format_html(
                '<span style="color: blue;">{} actions</span>',
                count
            )
        return "Aucune action"
    actions_count.short_description = 'Actions'


@admin.register(MeetingAttendee)
class MeetingAttendeeAdmin(admin.ModelAdmin):
    list_display = [
        'meeting', 'user', 'status', 'role', 'is_present', 
        'joined_at', 'attendance_duration'
    ]
    list_filter = ['status', 'role', 'is_present', 'invited_at']
    search_fields = ['meeting__title', 'user__username', 'user__email']
    date_hierarchy = 'invited_at'
    
    def attendance_duration(self, obj):
        """Durée de participation"""
        duration = obj.attendance_duration_minutes
        if duration > 0:
            return f"{duration} min"
        return "N/A"
    attendance_duration.short_description = 'Durée participation'


@admin.register(MeetingAction)
class MeetingActionAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'meeting', 'assigned_to', 'status', 'priority', 
        'due_date', 'is_overdue_display'
    ]
    list_filter = ['status', 'priority', 'due_date', 'created_at']
    search_fields = ['title', 'description', 'meeting__title', 'assigned_to__username']
    date_hierarchy = 'due_date'
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('meeting', 'title', 'description')
        }),
        ('Assignation', {
            'fields': ('assigned_to', 'created_by', 'status', 'priority')
        }),
        ('Dates', {
            'fields': ('due_date', 'completed_date')
        })
    )
    
    readonly_fields = ['created_by', 'created_at', 'updated_at']
    
    def is_overdue_display(self, obj):
        """Affichage du retard"""
        if obj.is_overdue:
            return format_html(
                '<span style="color: red; font-weight: bold;">En retard</span>'
            )
        return "À jour"
    is_overdue_display.short_description = 'Statut'


@admin.register(MeetingTemplate)
class MeetingTemplateAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'type', 'default_duration_minutes', 'created_by', 
        'is_active', 'created_at'
    ]
    list_filter = ['type', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'created_by__username']
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('name', 'description', 'type', 'is_active')
        }),
        ('Configuration par défaut', {
            'fields': ('default_duration_minutes', 'default_agenda', 'default_location')
        }),
        ('Participants par défaut', {
            'fields': ('default_attendees',)
        })
    )
    
    readonly_fields = ['created_by', 'created_at', 'updated_at']
    filter_horizontal = ['default_attendees']
    
    def save_model(self, request, obj, form, change):
        if not change:  # Nouveau modèle
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


# Configuration de l'admin
admin.site.site_header = "EcosystIA - Administration des Réunions"
admin.site.site_title = "EcosystIA Admin"
admin.site.index_title = "Gestion des Réunions"
