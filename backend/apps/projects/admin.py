"""
Configuration admin pour les projets
"""

from django.contrib import admin
from .models import Project, Task, Risk, ProjectTeam


class TaskInline(admin.TabularInline):
    model = Task
    extra = 0
    fields = ['text', 'status', 'priority', 'assignee', 'due_date']


class RiskInline(admin.TabularInline):
    model = Risk
    extra = 0
    fields = ['description', 'likelihood', 'impact', 'mitigation_strategy']


class ProjectTeamInline(admin.TabularInline):
    model = ProjectTeam
    extra = 0
    fields = ['user', 'role', 'joined_at']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'status', 'progress', 'due_date', 'created_at']
    list_filter = ['status', 'created_at', 'due_date']
    search_fields = ['title', 'description', 'owner__username']
    inlines = [TaskInline, RiskInline, ProjectTeamInline]
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['text', 'project', 'assignee', 'status', 'priority', 'due_date']
    list_filter = ['status', 'priority', 'created_at']
    search_fields = ['text', 'project__title', 'assignee__username']


@admin.register(Risk)
class RiskAdmin(admin.ModelAdmin):
    list_display = ['description', 'project', 'likelihood', 'impact', 'created_at']
    list_filter = ['likelihood', 'impact', 'created_at']
    search_fields = ['description', 'project__title']


@admin.register(ProjectTeam)
class ProjectTeamAdmin(admin.ModelAdmin):
    list_display = ['project', 'user', 'role', 'joined_at']
    list_filter = ['role', 'joined_at']
    search_fields = ['project__title', 'user__username']