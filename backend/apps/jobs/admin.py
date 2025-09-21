"""
Administration Django pour les emplois
"""

from django.contrib import admin
from .models import Job, JobApplication, JobCategory, JobBookmark


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    """
    Administration des emplois
    """
    list_display = ('title', 'company', 'location', 'type', 'status', 'posted_by', 'posted_date')
    list_filter = ('status', 'type', 'location', 'posted_date')
    search_fields = ('title', 'company', 'description')
    readonly_fields = ('posted_date', 'view_count', 'application_count')
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('title', 'company', 'location', 'type', 'status')
        }),
        ('Description', {
            'fields': ('description', 'requirements', 'benefits', 'required_skills')
        }),
        ('Informations financières', {
            'fields': ('salary_min', 'salary_max', 'currency')
        }),
        ('Dates', {
            'fields': ('posted_date', 'application_deadline')
        }),
        ('Métadonnées', {
            'fields': ('posted_by', 'view_count', 'application_count')
        }),
    )


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    """
    Administration des candidatures
    """
    list_display = ('applicant', 'job', 'status', 'applied_at')
    list_filter = ('status', 'applied_at')
    search_fields = ('applicant__email', 'job__title', 'cover_letter')
    readonly_fields = ('applied_at', 'updated_at')
    
    fieldsets = (
        ('Candidature', {
            'fields': ('job', 'applicant', 'status')
        }),
        ('Documents', {
            'fields': ('cover_letter', 'resume_url', 'portfolio_url')
        }),
        ('Évaluation', {
            'fields': ('rating', 'feedback', 'notes')
        }),
        ('Dates', {
            'fields': ('applied_at', 'updated_at')
        }),
    )


@admin.register(JobCategory)
class JobCategoryAdmin(admin.ModelAdmin):
    """
    Administration des catégories d'emplois
    """
    list_display = ('name', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')


@admin.register(JobBookmark)
class JobBookmarkAdmin(admin.ModelAdmin):
    """
    Administration des emplois sauvegardés
    """
    list_display = ('user', 'job', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'job__title')
    readonly_fields = ('created_at',)
