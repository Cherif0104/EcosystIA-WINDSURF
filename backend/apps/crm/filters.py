"""
Filtres pour le CRM
"""

import django_filters
from .models import Contact, Deal, ContactInteraction


class ContactFilter(django_filters.FilterSet):
    """
    Filtres pour les contacts
    """
    status = django_filters.ChoiceFilter(choices=Contact.STATUS_CHOICES)
    source = django_filters.ChoiceFilter(choices=Contact.SOURCE_CHOICES)
    assigned_to = django_filters.NumberFilter(field_name='assigned_to__id')
    created_by = django_filters.NumberFilter(field_name='created_by__id')
    company = django_filters.CharFilter(lookup_expr='icontains')
    city = django_filters.CharFilter(lookup_expr='icontains')
    country = django_filters.CharFilter(lookup_expr='icontains')
    tags = django_filters.CharFilter(method='filter_tags')
    created_from = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_to = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    last_contact_from = django_filters.DateFilter(field_name='last_contact_date', lookup_expr='gte')
    last_contact_to = django_filters.DateFilter(field_name='last_contact_date', lookup_expr='lte')
    has_phone = django_filters.BooleanFilter(method='filter_has_phone')
    has_interactions = django_filters.BooleanFilter(method='filter_has_interactions')
    has_deals = django_filters.BooleanFilter(method='filter_has_deals')
    no_contact_days = django_filters.NumberFilter(method='filter_no_contact_days')
    
    class Meta:
        model = Contact
        fields = [
            'status', 'source', 'assigned_to', 'created_by', 'company',
            'city', 'country', 'tags', 'created_from', 'created_to',
            'last_contact_from', 'last_contact_to', 'has_phone',
            'has_interactions', 'has_deals', 'no_contact_days'
        ]
    
    def filter_tags(self, queryset, name, value):
        """Filtrer par tags (recherche dans la liste JSON)"""
        return queryset.filter(tags__icontains=value)
    
    def filter_has_phone(self, queryset, name, value):
        """Filtrer les contacts qui ont un numéro de téléphone"""
        from django.db import models
        if value:
            return queryset.filter(
                models.Q(office_phone__isnull=False, office_phone__gt='') |
                models.Q(mobile_phone__isnull=False, mobile_phone__gt='')
            )
        return queryset.filter(
            office_phone__isnull=True,
            mobile_phone__isnull=True
        )
    
    def filter_has_interactions(self, queryset, name, value):
        """Filtrer les contacts qui ont des interactions"""
        if value:
            return queryset.filter(interactions__isnull=False).distinct()
        return queryset.filter(interactions__isnull=True)
    
    def filter_has_deals(self, queryset, name, value):
        """Filtrer les contacts qui ont des opportunités"""
        if value:
            return queryset.filter(deals__isnull=False).distinct()
        return queryset.filter(deals__isnull=True)
    
    def filter_no_contact_days(self, queryset, name, value):
        """Filtrer les contacts sans contact depuis X jours"""
        from django.utils import timezone
        from datetime import timedelta
        
        cutoff_date = timezone.now() - timedelta(days=value)
        from django.db import models
        return queryset.filter(
            models.Q(last_contact_date__lt=cutoff_date) |
            models.Q(last_contact_date__isnull=True)
        )


class DealFilter(django_filters.FilterSet):
    """
    Filtres pour les opportunités
    """
    stage = django_filters.ChoiceFilter(choices=Deal.STAGE_CHOICES)
    contact = django_filters.NumberFilter(field_name='contact__id')
    user = django_filters.NumberFilter(field_name='user__id')
    value_min = django_filters.NumberFilter(field_name='value', lookup_expr='gte')
    value_max = django_filters.NumberFilter(field_name='value', lookup_expr='lte')
    probability_min = django_filters.NumberFilter(field_name='probability', lookup_expr='gte')
    probability_max = django_filters.NumberFilter(field_name='probability', lookup_expr='lte')
    expected_close_from = django_filters.DateFilter(field_name='expected_close_date', lookup_expr='gte')
    expected_close_to = django_filters.DateFilter(field_name='expected_close_date', lookup_expr='lte')
    created_from = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_to = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    is_overdue = django_filters.BooleanFilter(method='filter_overdue')
    is_won = django_filters.BooleanFilter(method='filter_won')
    is_lost = django_filters.BooleanFilter(method='filter_lost')
    
    class Meta:
        model = Deal
        fields = [
            'stage', 'contact', 'user', 'value_min', 'value_max',
            'probability_min', 'probability_max', 'expected_close_from',
            'expected_close_to', 'created_from', 'created_to',
            'is_overdue', 'is_won', 'is_lost'
        ]
    
    def filter_overdue(self, queryset, name, value):
        """Filtrer les opportunités en retard"""
        if value:
            from django.utils import timezone
            return queryset.filter(
                expected_close_date__lt=timezone.now().date(),
                stage__in=['Lead', 'Qualified', 'Proposal', 'Negotiation']
            )
        return queryset
    
    def filter_won(self, queryset, name, value):
        """Filtrer les opportunités gagnées"""
        if value:
            return queryset.filter(stage='Closed Won')
        return queryset.exclude(stage='Closed Won')
    
    def filter_lost(self, queryset, name, value):
        """Filtrer les opportunités perdues"""
        if value:
            return queryset.filter(stage='Closed Lost')
        return queryset.exclude(stage='Closed Lost')


class ContactInteractionFilter(django_filters.FilterSet):
    """
    Filtres pour les interactions
    """
    type = django_filters.ChoiceFilter(choices=ContactInteraction.TYPE_CHOICES)
    result = django_filters.ChoiceFilter(choices=ContactInteraction.RESULT_CHOICES)
    contact = django_filters.NumberFilter(field_name='contact__id')
    user = django_filters.NumberFilter(field_name='user__id')
    created_from = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_to = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    has_follow_up = django_filters.BooleanFilter(field_name='follow_up_date', lookup_expr='isnull', exclude=True)
    follow_up_due = django_filters.BooleanFilter(method='filter_follow_up_due')
    
    class Meta:
        model = ContactInteraction
        fields = [
            'type', 'result', 'contact', 'user', 'created_from',
            'created_to', 'has_follow_up', 'follow_up_due'
        ]
    
    def filter_follow_up_due(self, queryset, name, value):
        """Filtrer les interactions avec un suivi à faire"""
        if value:
            from django.utils import timezone
            return queryset.filter(
                follow_up_date__lte=timezone.now(),
                follow_up_date__isnull=False
            )
        return queryset
