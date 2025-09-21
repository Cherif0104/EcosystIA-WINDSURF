"""
Filtres pour les objectifs OKR
"""

import django_filters
from .models import Goal, KeyResult, OKRCycle


class GoalFilter(django_filters.FilterSet):
    """
    Filtres pour les objectifs
    """
    type = django_filters.ChoiceFilter(choices=Goal.TYPE_CHOICES)
    status = django_filters.ChoiceFilter(choices=Goal.STATUS_CHOICES)
    priority = django_filters.ChoiceFilter(choices=Goal.PRIORITY_CHOICES)
    owner = django_filters.NumberFilter(field_name='owner__id')
    assignee = django_filters.NumberFilter(field_name='assignees__id')
    project = django_filters.NumberFilter(field_name='project__id')
    parent_goal = django_filters.NumberFilter(field_name='parent_goal__id')
    
    start_date_from = django_filters.DateFilter(field_name='start_date', lookup_expr='gte')
    start_date_to = django_filters.DateFilter(field_name='start_date', lookup_expr='lte')
    target_date_from = django_filters.DateFilter(field_name='target_date', lookup_expr='gte')
    target_date_to = django_filters.DateFilter(field_name='target_date', lookup_expr='lte')
    
    progress_min = django_filters.NumberFilter(field_name='progress', lookup_expr='gte')
    progress_max = django_filters.NumberFilter(field_name='progress', lookup_expr='lte')
    
    tags = django_filters.CharFilter(method='filter_tags')
    is_overdue = django_filters.BooleanFilter(method='filter_overdue')
    due_soon = django_filters.BooleanFilter(method='filter_due_soon')
    has_sub_goals = django_filters.BooleanFilter(method='filter_has_sub_goals')
    current_quarter = django_filters.BooleanFilter(method='filter_current_quarter')
    
    class Meta:
        model = Goal
        fields = [
            'type', 'status', 'priority', 'owner', 'assignee', 'project',
            'parent_goal', 'start_date_from', 'start_date_to',
            'target_date_from', 'target_date_to', 'progress_min', 'progress_max',
            'tags', 'is_overdue', 'due_soon', 'has_sub_goals', 'current_quarter'
        ]
    
    def filter_tags(self, queryset, name, value):
        """Filtrer par tags"""
        return queryset.filter(tags__icontains=value)
    
    def filter_overdue(self, queryset, name, value):
        """Filtrer les objectifs en retard"""
        from django.utils import timezone
        if value:
            return queryset.filter(
                target_date__lt=timezone.now().date(),
                status__in=['Active', 'Draft']
            )
        return queryset.exclude(
            target_date__lt=timezone.now().date(),
            status__in=['Active', 'Draft']
        )
    
    def filter_due_soon(self, queryset, name, value):
        """Filtrer les objectifs à échéance proche (7 jours)"""
        from django.utils import timezone
        from datetime import timedelta
        if value:
            return queryset.filter(
                target_date__lte=timezone.now().date() + timedelta(days=7),
                status='Active'
            )
        return queryset
    
    def filter_has_sub_goals(self, queryset, name, value):
        """Filtrer les objectifs qui ont des sous-objectifs"""
        if value:
            return queryset.filter(sub_goals__isnull=False).distinct()
        return queryset.filter(sub_goals__isnull=True)
    
    def filter_current_quarter(self, queryset, name, value):
        """Filtrer les objectifs du trimestre actuel"""
        if value:
            from django.utils import timezone
            today = timezone.now().date()
            
            # Calculer le trimestre actuel
            quarter = (today.month - 1) // 3 + 1
            quarter_start = timezone.datetime(today.year, (quarter - 1) * 3 + 1, 1).date()
            quarter_end = timezone.datetime(today.year, quarter * 3 + 1, 1).date() - timedelta(days=1)
            
            return queryset.filter(
                start_date__lte=quarter_end,
                target_date__gte=quarter_start
            )
        return queryset


class KeyResultFilter(django_filters.FilterSet):
    """
    Filtres pour les résultats clés
    """
    status = django_filters.ChoiceFilter(choices=KeyResult.STATUS_CHOICES)
    assignee = django_filters.NumberFilter(field_name='assignee__id')
    goal = django_filters.NumberFilter(field_name='goal__id')
    
    target_value_min = django_filters.NumberFilter(field_name='target_value', lookup_expr='gte')
    target_value_max = django_filters.NumberFilter(field_name='target_value', lookup_expr='lte')
    current_value_min = django_filters.NumberFilter(field_name='current_value', lookup_expr='gte')
    current_value_max = django_filters.NumberFilter(field_name='current_value', lookup_expr='lte')
    progress_min = django_filters.NumberFilter(field_name='progress', lookup_expr='gte')
    progress_max = django_filters.NumberFilter(field_name='progress', lookup_expr='lte')
    
    target_date_from = django_filters.DateFilter(field_name='target_date', lookup_expr='gte')
    target_date_to = django_filters.DateFilter(field_name='target_date', lookup_expr='lte')
    
    is_overdue = django_filters.BooleanFilter(method='filter_overdue')
    is_completed = django_filters.BooleanFilter(method='filter_completed')
    
    class Meta:
        model = KeyResult
        fields = [
            'status', 'assignee', 'goal', 'target_value_min', 'target_value_max',
            'current_value_min', 'current_value_max', 'progress_min', 'progress_max',
            'target_date_from', 'target_date_to', 'is_overdue', 'is_completed'
        ]
    
    def filter_overdue(self, queryset, name, value):
        """Filtrer les résultats clés en retard"""
        from django.utils import timezone
        if value:
            return queryset.filter(
                target_date__lt=timezone.now().date(),
                status__in=['Not Started', 'In Progress']
            )
        return queryset
    
    def filter_completed(self, queryset, name, value):
        """Filtrer les résultats clés terminés"""
        if value:
            return queryset.filter(status='Completed')
        return queryset.exclude(status='Completed')


class OKRCycleFilter(django_filters.FilterSet):
    """
    Filtres pour les cycles OKR
    """
    cycle_type = django_filters.ChoiceFilter(choices=OKRCycle.CYCLE_TYPE_CHOICES)
    status = django_filters.ChoiceFilter(choices=OKRCycle.STATUS_CHOICES)
    owner = django_filters.NumberFilter(field_name='owner__id')
    
    start_date_from = django_filters.DateFilter(field_name='start_date', lookup_expr='gte')
    start_date_to = django_filters.DateFilter(field_name='start_date', lookup_expr='lte')
    end_date_from = django_filters.DateFilter(field_name='end_date', lookup_expr='gte')
    end_date_to = django_filters.DateFilter(field_name='end_date', lookup_expr='lte')
    
    is_current = django_filters.BooleanFilter(method='filter_current')
    is_active = django_filters.BooleanFilter(method='filter_active')
    
    class Meta:
        model = OKRCycle
        fields = [
            'cycle_type', 'status', 'owner', 'start_date_from', 'start_date_to',
            'end_date_from', 'end_date_to', 'is_current', 'is_active'
        ]
    
    def filter_current(self, queryset, name, value):
        """Filtrer les cycles actuels"""
        from django.utils import timezone
        today = timezone.now().date()
        
        if value:
            return queryset.filter(
                start_date__lte=today,
                end_date__gte=today
            )
        return queryset.exclude(
            start_date__lte=today,
            end_date__gte=today
        )
    
    def filter_active(self, queryset, name, value):
        """Filtrer les cycles actifs"""
        if value:
            return queryset.filter(status='Active')
        return queryset.exclude(status='Active')
