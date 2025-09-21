"""
Filtres pour la gestion financière
"""

import django_filters
from django.db.models import Q
from .models import Invoice, Expense, Transaction, Budget


class InvoiceFilter(django_filters.FilterSet):
    """
    Filtres pour les factures
    """
    status = django_filters.ChoiceFilter(choices=Invoice.STATUS_CHOICES)
    client_name = django_filters.CharFilter(lookup_expr='icontains')
    client_email = django_filters.CharFilter(lookup_expr='icontains')
    amount_min = django_filters.NumberFilter(field_name='total_amount', lookup_expr='gte')
    amount_max = django_filters.NumberFilter(field_name='total_amount', lookup_expr='lte')
    issue_date_from = django_filters.DateFilter(field_name='issue_date', lookup_expr='gte')
    issue_date_to = django_filters.DateFilter(field_name='issue_date', lookup_expr='lte')
    due_date_from = django_filters.DateFilter(field_name='due_date', lookup_expr='gte')
    due_date_to = django_filters.DateFilter(field_name='due_date', lookup_expr='lte')
    paid_date_from = django_filters.DateFilter(field_name='paid_date', lookup_expr='gte')
    paid_date_to = django_filters.DateFilter(field_name='paid_date', lookup_expr='lte')
    currency = django_filters.CharFilter()
    is_overdue = django_filters.BooleanFilter(method='filter_overdue')
    is_paid = django_filters.BooleanFilter(method='filter_paid')
    has_partial_payment = django_filters.BooleanFilter(method='filter_partial_payment')
    
    class Meta:
        model = Invoice
        fields = [
            'status', 'client_name', 'client_email', 'amount_min', 'amount_max',
            'issue_date_from', 'issue_date_to', 'due_date_from', 'due_date_to',
            'paid_date_from', 'paid_date_to', 'currency', 'is_overdue',
            'is_paid', 'has_partial_payment'
        ]
    
    def filter_overdue(self, queryset, name, value):
        """Filtrer les factures en retard"""
        from django.utils import timezone
        if value:
            return queryset.filter(
                due_date__lt=timezone.now().date(),
                status__in=['Sent', 'Partially Paid']
            )
        return queryset.exclude(
            due_date__lt=timezone.now().date(),
            status__in=['Sent', 'Partially Paid']
        )
    
    def filter_paid(self, queryset, name, value):
        """Filtrer les factures payées"""
        if value:
            return queryset.filter(status='Paid')
        return queryset.exclude(status='Paid')
    
    def filter_partial_payment(self, queryset, name, value):
        """Filtrer les factures partiellement payées"""
        if value:
            return queryset.filter(status='Partially Paid')
        return queryset.exclude(status='Partially Paid')


class ExpenseFilter(django_filters.FilterSet):
    """
    Filtres pour les dépenses
    """
    category = django_filters.ChoiceFilter(choices=Expense.CATEGORY_CHOICES)
    status = django_filters.ChoiceFilter(choices=Expense.STATUS_CHOICES)
    vendor = django_filters.CharFilter(lookup_expr='icontains')
    description = django_filters.CharFilter(lookup_expr='icontains')
    amount_min = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount_max = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    due_date_from = django_filters.DateFilter(field_name='due_date', lookup_expr='gte')
    due_date_to = django_filters.DateFilter(field_name='due_date', lookup_expr='lte')
    paid_date_from = django_filters.DateFilter(field_name='paid_date', lookup_expr='gte')
    paid_date_to = django_filters.DateFilter(field_name='paid_date', lookup_expr='lte')
    currency = django_filters.CharFilter()
    is_overdue = django_filters.BooleanFilter(method='filter_overdue')
    has_budget = django_filters.BooleanFilter(method='filter_has_budget')
    
    class Meta:
        model = Expense
        fields = [
            'category', 'status', 'vendor', 'description', 'amount_min', 'amount_max',
            'date_from', 'date_to', 'due_date_from', 'due_date_to',
            'paid_date_from', 'paid_date_to', 'currency', 'is_overdue', 'has_budget'
        ]
    
    def filter_overdue(self, queryset, name, value):
        """Filtrer les dépenses en retard"""
        from django.utils import timezone
        if value:
            return queryset.filter(
                due_date__lt=timezone.now().date(),
                status='Unpaid'
            )
        return queryset.exclude(
            due_date__lt=timezone.now().date(),
            status='Unpaid'
        )
    
    def filter_has_budget(self, queryset, name, value):
        """Filtrer les dépenses avec/sans budget associé"""
        if value:
            return queryset.filter(budget_item__isnull=False)
        return queryset.filter(budget_item__isnull=True)


class TransactionFilter(django_filters.FilterSet):
    """
    Filtres pour les transactions
    """
    transaction_type = django_filters.ChoiceFilter(choices=Transaction.TYPE_CHOICES)
    category = django_filters.ChoiceFilter(choices=Transaction.CATEGORY_CHOICES)
    account = django_filters.NumberFilter(field_name='account__id')
    amount_min = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount_max = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    date_from = django_filters.DateFilter(field_name='transaction_date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='transaction_date', lookup_expr='lte')
    reference_number = django_filters.CharFilter(lookup_expr='icontains')
    description = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = Transaction
        fields = [
            'transaction_type', 'category', 'account', 'amount_min', 'amount_max',
            'date_from', 'date_to', 'reference_number', 'description'
        ]


class BudgetFilter(django_filters.FilterSet):
    """
    Filtres pour les budgets
    """
    type = django_filters.ChoiceFilter(choices=Budget.TYPE_CHOICES)
    project = django_filters.NumberFilter(field_name='project__id')
    amount_min = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount_max = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    start_date_from = django_filters.DateFilter(field_name='start_date', lookup_expr='gte')
    start_date_to = django_filters.DateFilter(field_name='start_date', lookup_expr='lte')
    end_date_from = django_filters.DateFilter(field_name='end_date', lookup_expr='gte')
    end_date_to = django_filters.DateFilter(field_name='end_date', lookup_expr='lte')
    currency = django_filters.CharFilter()
    is_active = django_filters.BooleanFilter(method='filter_active')
    
    class Meta:
        model = Budget
        fields = [
            'type', 'project', 'amount_min', 'amount_max',
            'start_date_from', 'start_date_to', 'end_date_from', 'end_date_to',
            'currency', 'is_active'
        ]
    
    def filter_active(self, queryset, name, value):
        """Filtrer les budgets actifs (dans la période actuelle)"""
        from django.utils import timezone
        current_date = timezone.now().date()
        
        if value:
            return queryset.filter(
                start_date__lte=current_date,
                end_date__gte=current_date
            )
        return queryset.exclude(
            start_date__lte=current_date,
            end_date__gte=current_date
        )
