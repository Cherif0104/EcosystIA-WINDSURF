"""
Filtres pour les cours
"""

import django_filters
from .models import Course, CourseEnrollment


class CourseFilter(django_filters.FilterSet):
    """
    Filtres pour les cours
    """
    difficulty = django_filters.ChoiceFilter(choices=Course.DIFFICULTY_CHOICES)
    status = django_filters.ChoiceFilter(choices=Course.STATUS_CHOICES)
    instructor = django_filters.NumberFilter(field_name='instructor__id')
    tags = django_filters.CharFilter(method='filter_tags')
    rating_min = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    rating_max = django_filters.NumberFilter(field_name='rating', lookup_expr='lte')
    enrollment_min = django_filters.NumberFilter(field_name='enrollment_count', lookup_expr='gte')
    enrollment_max = django_filters.NumberFilter(field_name='enrollment_count', lookup_expr='lte')
    created_from = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_to = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    published_from = django_filters.DateFilter(field_name='published_at', lookup_expr='gte')
    published_to = django_filters.DateFilter(field_name='published_at', lookup_expr='lte')
    has_modules = django_filters.BooleanFilter(method='filter_has_modules')
    
    class Meta:
        model = Course
        fields = [
            'difficulty', 'status', 'instructor', 'tags',
            'rating_min', 'rating_max', 'enrollment_min', 'enrollment_max',
            'created_from', 'created_to', 'published_from', 'published_to',
            'has_modules'
        ]
    
    def filter_tags(self, queryset, name, value):
        """Filtrer par tags (recherche dans la liste JSON)"""
        return queryset.filter(tags__icontains=value)
    
    def filter_has_modules(self, queryset, name, value):
        """Filtrer les cours qui ont des modules"""
        if value:
            return queryset.filter(module__isnull=False).distinct()
        return queryset.filter(module__isnull=True)


class CourseEnrollmentFilter(django_filters.FilterSet):
    """
    Filtres pour les inscriptions aux cours
    """
    status = django_filters.ChoiceFilter(choices=CourseEnrollment.STATUS_CHOICES)
    course = django_filters.NumberFilter(field_name='course__id')
    progress_min = django_filters.NumberFilter(field_name='progress', lookup_expr='gte')
    progress_max = django_filters.NumberFilter(field_name='progress', lookup_expr='lte')
    enrolled_from = django_filters.DateFilter(field_name='enrolled_at', lookup_expr='gte')
    enrolled_to = django_filters.DateFilter(field_name='enrolled_at', lookup_expr='lte')
    completed_from = django_filters.DateFilter(field_name='completed_at', lookup_expr='gte')
    completed_to = django_filters.DateFilter(field_name='completed_at', lookup_expr='lte')
    has_rating = django_filters.BooleanFilter(field_name='rating', lookup_expr='isnull', exclude=True)
    
    class Meta:
        model = CourseEnrollment
        fields = [
            'status', 'course', 'progress_min', 'progress_max',
            'enrolled_from', 'enrolled_to', 'completed_from', 'completed_to',
            'has_rating'
        ]
