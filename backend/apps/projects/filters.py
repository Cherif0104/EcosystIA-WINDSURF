"""
Filtres pour les projets et tâches
"""

import django_filters
from .models import Project, Task


class ProjectFilter(django_filters.FilterSet):
    """
    Filtres pour les projets
    """
    status = django_filters.ChoiceFilter(choices=Project.STATUS_CHOICES)
    priority = django_filters.ChoiceFilter(choices=Project.PRIORITY_CHOICES)
    created_by = django_filters.NumberFilter(field_name='created_by__id')
    team_member = django_filters.NumberFilter(field_name='team_members__id')
    due_date_from = django_filters.DateFilter(field_name='due_date', lookup_expr='gte')
    due_date_to = django_filters.DateFilter(field_name='due_date', lookup_expr='lte')
    created_from = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_to = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    budget_min = django_filters.NumberFilter(field_name='budget', lookup_expr='gte')
    budget_max = django_filters.NumberFilter(field_name='budget', lookup_expr='lte')
    progress_min = django_filters.NumberFilter(field_name='progress', lookup_expr='gte')
    progress_max = django_filters.NumberFilter(field_name='progress', lookup_expr='lte')
    
    class Meta:
        model = Project
        fields = [
            'status', 'priority', 'created_by', 'team_member',
            'due_date_from', 'due_date_to', 'created_from', 'created_to',
            'budget_min', 'budget_max', 'progress_min', 'progress_max'
        ]


class TaskFilter(django_filters.FilterSet):
    """
    Filtres pour les tâches
    """
    status = django_filters.ChoiceFilter(choices=Task.STATUS_CHOICES)
    priority = django_filters.ChoiceFilter(choices=Task.PRIORITY_CHOICES)
    assignee = django_filters.NumberFilter(field_name='assignee__id')
    created_by = django_filters.NumberFilter(field_name='created_by__id')
    project = django_filters.NumberFilter(field_name='project__id')
    due_date_from = django_filters.DateTimeFilter(field_name='due_date', lookup_expr='gte')
    due_date_to = django_filters.DateTimeFilter(field_name='due_date', lookup_expr='lte')
    created_from = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_to = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    has_assignee = django_filters.BooleanFilter(field_name='assignee', lookup_expr='isnull', exclude=True)
    overdue = django_filters.BooleanFilter(method='filter_overdue')
    
    class Meta:
        model = Task
        fields = [
            'status', 'priority', 'assignee', 'created_by', 'project',
            'due_date_from', 'due_date_to', 'created_from', 'created_to',
            'has_assignee', 'overdue'
        ]
    
    def filter_overdue(self, queryset, name, value):
        if value:
            from django.utils import timezone
            return queryset.filter(
                due_date__lt=timezone.now(),
                status__in=['To Do', 'In Progress']
            )
        return queryset
