"""
Administration Django pour la finance
"""

from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum
from django.utils import timezone
from .models import (
    Invoice, Expense, Payment, Budget, BudgetLine, BudgetItem,
    RecurringInvoice, RecurringExpense, FinancialReport,
    TaxConfiguration, BankAccount, Transaction
)


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    """
    Administration des factures
    """
    list_display = [
        'invoice_number', 'client_name', 'colored_status', 'total_amount', 
        'remaining_amount_display', 'due_date', 'overdue_indicator', 'created_at'
    ]
    list_filter = ['status', 'currency', 'issue_date', 'due_date', 'created_at']
    search_fields = ['invoice_number', 'client_name', 'client_email', 'description']
    readonly_fields = ['created_at', 'updated_at', 'remaining_amount_display', 'payment_percentage_display']
    date_hierarchy = 'issue_date'
    
    actions = ['mark_as_sent', 'mark_as_paid', 'send_reminders']
    
    def colored_status(self, obj):
        colors = {
            'Draft': '#6c757d',
            'Sent': '#007bff',
            'Paid': '#28a745',
            'Overdue': '#dc3545',
            'Partially Paid': '#ffc107',
            'Cancelled': '#6c757d'
        }
        color = colors.get(obj.status, '#000000')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    colored_status.short_description = 'Statut'
    
    def remaining_amount_display(self, obj):
        return f"{obj.remaining_amount} {obj.currency}"
    remaining_amount_display.short_description = 'Montant Restant'
    
    def payment_percentage_display(self, obj):
        percentage = obj.payment_percentage
        color = '#28a745' if percentage == 100 else '#ffc107' if percentage > 0 else '#dc3545'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
            color, percentage
        )
    payment_percentage_display.short_description = '% Payé'
    
    def overdue_indicator(self, obj):
        if obj.is_overdue:
            return format_html(
                '<span style="color: #dc3545; font-weight: bold;">⚠️ {} jours</span>',
                obj.days_overdue
            )
        return '✅'
    overdue_indicator.short_description = 'Retard'
    
    def mark_as_sent(self, request, queryset):
        count = queryset.update(status='Sent')
        self.message_user(request, f"{count} facture(s) marquée(s) comme envoyée(s).")
    mark_as_sent.short_description = "Marquer comme envoyées"
    
    def mark_as_paid(self, request, queryset):
        count = 0
        for invoice in queryset:
            if invoice.status != 'Paid':
                invoice.mark_as_paid()
                count += 1
        self.message_user(request, f"{count} facture(s) marquée(s) comme payée(s).")
    mark_as_paid.short_description = "Marquer comme payées"
    
    fieldsets = (
        ('Facture', {
            'fields': ('invoice_number', 'status', 'created_by')
        }),
        ('Client', {
            'fields': ('client_name', 'client_email', 'client_address')
        }),
        ('Montants', {
            'fields': ('amount', 'tax_amount', 'total_amount', 'currency')
        }),
        ('Dates', {
            'fields': ('issue_date', 'due_date', 'paid_date', 'created_at', 'updated_at')
        }),
        ('Paiements', {
            'fields': ('paid_amount', 'receipt')
        }),
        ('Détails', {
            'fields': ('description', 'notes', 'terms_conditions', 'recurring_source')
        }),
    )


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    """
    Administration des dépenses
    """
    list_display = ('description', 'category', 'amount', 'status', 'date', 'vendor')
    list_filter = ('category', 'status', 'date', 'created_at')
    search_fields = ('description', 'vendor', 'reference_number')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Dépense', {
            'fields': ('category', 'description', 'amount', 'currency', 'status')
        }),
        ('Fournisseur', {
            'fields': ('vendor', 'reference_number')
        }),
        ('Dates', {
            'fields': ('date', 'due_date', 'paid_date', 'created_at', 'updated_at')
        }),
        ('Relations', {
            'fields': ('created_by', 'budget_item', 'recurring_source')
        }),
        ('Fichiers', {
            'fields': ('receipt',)
        }),
    )


@admin.register(RecurringInvoice)
class RecurringInvoiceAdmin(admin.ModelAdmin):
    """
    Administration des factures récurrentes
    """
    list_display = ('client_name', 'amount', 'frequency', 'is_active', 'next_generation_date')
    list_filter = ('frequency', 'is_active', 'start_date')
    search_fields = ('client_name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Facture récurrente', {
            'fields': ('client_name', 'amount', 'currency', 'frequency', 'is_active')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date', 'last_generated_date', 'next_generation_date')
        }),
        ('Métadonnées', {
            'fields': ('description', 'created_by', 'created_at', 'updated_at')
        }),
    )


@admin.register(RecurringExpense)
class RecurringExpenseAdmin(admin.ModelAdmin):
    """
    Administration des dépenses récurrentes
    """
    list_display = ('description', 'category', 'amount', 'frequency', 'is_active', 'next_generation_date')
    list_filter = ('category', 'frequency', 'is_active', 'start_date')
    search_fields = ('description', 'vendor')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Dépense récurrente', {
            'fields': ('category', 'description', 'amount', 'currency', 'frequency', 'is_active')
        }),
        ('Fournisseur', {
            'fields': ('vendor',)
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date', 'last_generated_date', 'next_generation_date')
        }),
        ('Métadonnées', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )


class BudgetItemInline(admin.TabularInline):
    model = BudgetItem
    extra = 1


class BudgetLineInline(admin.TabularInline):
    model = BudgetLine
    extra = 1
    inlines = [BudgetItemInline]


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    """
    Administration des budgets
    """
    list_display = ('title', 'type', 'amount', 'currency', 'start_date', 'end_date', 'created_by')
    list_filter = ('type', 'currency', 'start_date', 'end_date')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [BudgetLineInline]
    
    fieldsets = (
        ('Budget', {
            'fields': ('title', 'type', 'amount', 'currency')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date')
        }),
        ('Relations', {
            'fields': ('project', 'created_by')
        }),
        ('Métadonnées', {
            'fields': ('description', 'created_at', 'updated_at')
        }),
    )
