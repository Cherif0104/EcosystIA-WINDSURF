"""
URLs pour la gestion financière
"""

from django.urls import path
from . import views

app_name = 'finance'

urlpatterns = [
    # Factures
    path('invoices/', views.InvoiceListCreateView.as_view(), name='invoice_list_create'),
    path('invoices/<int:pk>/', views.InvoiceDetailView.as_view(), name='invoice_detail'),
    path('invoices/<int:invoice_id>/payment/', views.InvoicePaymentView.as_view(), name='invoice_payment'),
    path('invoices/<int:invoice_id>/pdf/', views.GenerateInvoicePDFView.as_view(), name='invoice_pdf'),
    path('invoices/<int:invoice_id>/reminder/', views.SendInvoiceReminderView.as_view(), name='invoice_reminder'),
    
    # Dépenses
    path('expenses/', views.ExpenseListCreateView.as_view(), name='expense_list_create'),
    path('expenses/<int:pk>/', views.ExpenseDetailView.as_view(), name='expense_detail'),
    path('expenses/<int:expense_id>/payment/', views.ExpensePaymentView.as_view(), name='expense_payment'),
    
    # Budgets
    path('budgets/', views.BudgetListCreateView.as_view(), name='budget_list_create'),
    path('budgets/<int:pk>/', views.BudgetDetailView.as_view(), name='budget_detail'),
    
    # Comptes bancaires
    path('accounts/', views.BankAccountListCreateView.as_view(), name='account_list_create'),
    path('accounts/<int:pk>/', views.BankAccountDetailView.as_view(), name='account_detail'),
    
    # Transactions
    path('transactions/', views.TransactionListCreateView.as_view(), name='transaction_list_create'),
    
    # Configuration
    path('taxes/', views.TaxConfigurationView.as_view(), name='tax_configuration'),
    path('calculate-tax/', views.calculate_tax, name='calculate_tax'),
    
    # Rapports et analytics
    path('stats/', views.FinancialStatsView.as_view(), name='financial_stats'),
    path('dashboard/', views.FinancialDashboardView.as_view(), name='financial_dashboard'),
    path('cash-flow/', views.cash_flow_report, name='cash_flow_report'),
    path('reports/generate/', views.generate_financial_report, name='generate_report'),
]
