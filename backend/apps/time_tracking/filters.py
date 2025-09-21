"""
Filtres pour le suivi du temps
"""

import django_filters
from .models import TimeLog, Meeting, TimeOff


class TimeLogFilter(django_filters.FilterSet):
    """
    Filtres pour les logs de temps
    """
    entity_type = django_filters.ChoiceFilter(choices=TimeLog.ENTITY_TYPE_CHOICES)
    entity_id = django_filters.CharFilter()
    entity_title = django_filters.CharFilter(lookup_expr='icontains')
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    duration_min = django_filters.NumberFilter(field_name='duration', lookup_expr='gte')
    duration_max = django_filters.NumberFilter(field_name='duration', lookup_expr='lte')
    this_week = django_filters.BooleanFilter(method='filter_this_week')
    this_month = django_filters.BooleanFilter(method='filter_this_month')
    today = django_filters.BooleanFilter(method='filter_today')
    
    class Meta:
        model = TimeLog
        fields = [
            'entity_type', 'entity_id', 'entity_title', 'date_from', 'date_to',
            'duration_min', 'duration_max', 'this_week', 'this_month', 'today'
        ]
    
    def filter_this_week(self, queryset, name, value):
        """Filtrer les logs de cette semaine"""
        if value:
            from django.utils import timezone
            from datetime import timedelta
            today = timezone.now().date()
            start_week = today - timedelta(days=today.weekday())
            end_week = start_week + timedelta(days=6)
            return queryset.filter(date__range=[start_week, end_week])
        return queryset
    
    def filter_this_month(self, queryset, name, value):
        """Filtrer les logs de ce mois"""
        if value:
            from django.utils import timezone
            from datetime import timedelta
            today = timezone.now().date()
            start_month = today.replace(day=1)
            end_month = (start_month + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            return queryset.filter(date__range=[start_month, end_month])
        return queryset
    
    def filter_today(self, queryset, name, value):
        """Filtrer les logs d'aujourd'hui"""
        if value:
            from django.utils import timezone
            return queryset.filter(date=timezone.now().date())
        return queryset


class MeetingFilter(django_filters.FilterSet):
    """
    Filtres pour les réunions
    """
    organizer = django_filters.NumberFilter(field_name='organizer__id')
    attendee = django_filters.NumberFilter(field_name='attendees__id')
    project = django_filters.NumberFilter(field_name='project__id')
    start_time_from = django_filters.DateTimeFilter(field_name='start_time', lookup_expr='gte')
    start_time_to = django_filters.DateTimeFilter(field_name='start_time', lookup_expr='lte')
    duration_min = django_filters.NumberFilter(method='filter_duration_min')
    duration_max = django_filters.NumberFilter(method='filter_duration_max')
    today = django_filters.BooleanFilter(method='filter_today')
    this_week = django_filters.BooleanFilter(method='filter_this_week')
    upcoming = django_filters.BooleanFilter(method='filter_upcoming')
    
    class Meta:
        model = Meeting
        fields = [
            'organizer', 'attendee', 'project', 'start_time_from', 'start_time_to',
            'duration_min', 'duration_max', 'today', 'this_week', 'upcoming'
        ]
    
    def filter_duration_min(self, queryset, name, value):
        """Filtrer par durée minimale"""
        # Calculer la durée et filtrer
        from django.db.models import F
        return queryset.annotate(
            duration_calc=F('end_time') - F('start_time')
        ).filter(duration_calc__gte=timedelta(minutes=value))
    
    def filter_duration_max(self, queryset, name, value):
        """Filtrer par durée maximale"""
        from django.db.models import F
        return queryset.annotate(
            duration_calc=F('end_time') - F('start_time')
        ).filter(duration_calc__lte=timedelta(minutes=value))
    
    def filter_today(self, queryset, name, value):
        """Filtrer les réunions d'aujourd'hui"""
        if value:
            from django.utils import timezone
            return queryset.filter(start_time__date=timezone.now().date())
        return queryset
    
    def filter_this_week(self, queryset, name, value):
        """Filtrer les réunions de cette semaine"""
        if value:
            from django.utils import timezone
            from datetime import timedelta
            today = timezone.now().date()
            start_week = today - timedelta(days=today.weekday())
            end_week = start_week + timedelta(days=6)
            return queryset.filter(start_time__date__range=[start_week, end_week])
        return queryset
    
    def filter_upcoming(self, queryset, name, value):
        """Filtrer les réunions à venir"""
        if value:
            from django.utils import timezone
            return queryset.filter(start_time__gt=timezone.now())
        return queryset.filter(start_time__lte=timezone.now())


class TimeOffFilter(django_filters.FilterSet):
    """
    Filtres pour les congés
    """
    type = django_filters.ChoiceFilter(choices=TimeOff.TYPE_CHOICES)
    status = django_filters.ChoiceFilter(choices=TimeOff.STATUS_CHOICES)
    approved_by = django_filters.NumberFilter(field_name='approved_by__id')
    start_date_from = django_filters.DateFilter(field_name='start_date', lookup_expr='gte')
    start_date_to = django_filters.DateFilter(field_name='start_date', lookup_expr='lte')
    end_date_from = django_filters.DateFilter(field_name='end_date', lookup_expr='gte')
    end_date_to = django_filters.DateFilter(field_name='end_date', lookup_expr='lte')
    duration_min = django_filters.NumberFilter(method='filter_duration_min')
    duration_max = django_filters.NumberFilter(method='filter_duration_max')
    pending = django_filters.BooleanFilter(method='filter_pending')
    current_month = django_filters.BooleanFilter(method='filter_current_month')
    
    class Meta:
        model = TimeOff
        fields = [
            'type', 'status', 'approved_by', 'start_date_from', 'start_date_to',
            'end_date_from', 'end_date_to', 'duration_min', 'duration_max',
            'pending', 'current_month'
        ]
    
    def filter_duration_min(self, queryset, name, value):
        """Filtrer par durée minimale en jours"""
        from django.db.models import F
        return queryset.annotate(
            duration_calc=F('end_date') - F('start_date') + 1
        ).filter(duration_calc__gte=value)
    
    def filter_duration_max(self, queryset, name, value):
        """Filtrer par durée maximale en jours"""
        from django.db.models import F
        return queryset.annotate(
            duration_calc=F('end_date') - F('start_date') + 1
        ).filter(duration_calc__lte=value)
    
    def filter_pending(self, queryset, name, value):
        """Filtrer les congés en attente"""
        if value:
            return queryset.filter(status='Pending')
        return queryset.exclude(status='Pending')
    
    def filter_current_month(self, queryset, name, value):
        """Filtrer les congés du mois actuel"""
        if value:
            from django.utils import timezone
            from datetime import timedelta
            today = timezone.now().date()
            start_month = today.replace(day=1)
            end_month = (start_month + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            return queryset.filter(
                start_date__lte=end_month,
                end_date__gte=start_month
            )
        return queryset
