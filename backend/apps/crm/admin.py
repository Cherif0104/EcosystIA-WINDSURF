"""
Administration Django pour le CRM
"""

from django.contrib import admin
from .models import Contact, ContactInteraction, Deal, ContactTag


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    """
    Administration des contacts
    """
    list_display = ('name', 'company', 'status', 'source', 'assigned_to', 'created_at')
    list_filter = ('status', 'source', 'country', 'created_at')
    search_fields = ('name', 'company', 'work_email', 'mobile_phone')
    readonly_fields = ('created_at', 'updated_at', 'contact_count')
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('name', 'company', 'job_title', 'status', 'source')
        }),
        ('Coordonnées', {
            'fields': ('work_email', 'personal_email', 'office_phone', 'mobile_phone', 'whatsapp_number')
        }),
        ('Adresse', {
            'fields': ('address', 'city', 'country')
        }),
        ('Gestion', {
            'fields': ('assigned_to', 'created_by', 'avatar', 'notes', 'tags')
        }),
        ('Statistiques', {
            'fields': ('contact_count', 'last_contact_date', 'created_at', 'updated_at')
        }),
    )


@admin.register(ContactInteraction)
class ContactInteractionAdmin(admin.ModelAdmin):
    """
    Administration des interactions
    """
    list_display = ('contact', 'type', 'result', 'user', 'created_at')
    list_filter = ('type', 'result', 'created_at')
    search_fields = ('contact__name', 'description')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Interaction', {
            'fields': ('contact', 'user', 'type', 'result')
        }),
        ('Détails', {
            'fields': ('subject', 'description', 'duration')
        }),
        ('Suivi', {
            'fields': ('follow_up_date', 'follow_up_notes')
        }),
        ('Métadonnées', {
            'fields': ('created_at',)
        }),
    )


@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    """
    Administration des opportunités
    """
    list_display = ('name', 'contact', 'stage', 'value', 'probability', 'user', 'expected_close_date')
    list_filter = ('stage', 'expected_close_date', 'created_at')
    search_fields = ('name', 'contact__name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Opportunité', {
            'fields': ('contact', 'user', 'name', 'description', 'stage')
        }),
        ('Valeur financière', {
            'fields': ('value', 'currency', 'probability')
        }),
        ('Dates', {
            'fields': ('expected_close_date', 'actual_close_date', 'created_at', 'updated_at')
        }),
    )


@admin.register(ContactTag)
class ContactTagAdmin(admin.ModelAdmin):
    """
    Administration des tags de contacts
    """
    list_display = ('name', 'color', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description')
