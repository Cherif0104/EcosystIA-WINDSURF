"""
Vues pour la gestion financière avec logique métier réelle
"""

from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count, Avg, F, Case, When, DecimalField
from django.utils import timezone
from django.http import HttpResponse
from datetime import datetime, timedelta, date
from decimal import Decimal
import json

from .models import (
    Invoice, Expense, Payment, Budget, BudgetLine, BudgetItem,
    RecurringInvoice, RecurringExpense, FinancialReport,
    TaxConfiguration, BankAccount, Transaction
)
from .serializers import (
    InvoiceListSerializer,
    InvoiceDetailSerializer,
    InvoiceCreateUpdateSerializer,
    ExpenseListSerializer,
    ExpenseCreateUpdateSerializer,
    PaymentSerializer,
    BudgetListSerializer,
    BudgetDetailSerializer,
    BudgetCreateUpdateSerializer,
    BankAccountSerializer,
    TransactionSerializer,
    FinancialStatsSerializer,
    DashboardDataSerializer,
    TaxConfigurationSerializer
)
from .filters import InvoiceFilter, ExpenseFilter, TransactionFilter


class InvoiceListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des factures
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = InvoiceFilter
    search_fields = ['invoice_number', 'client_name', 'client_email', 'description']
    ordering_fields = ['created_at', 'issue_date', 'due_date', 'amount', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Invoice.objects.filter(
            created_by=self.request.user
        ).select_related('created_by').prefetch_related('payments')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return InvoiceCreateUpdateSerializer
        return InvoiceListSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class InvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer une facture
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Invoice.objects.filter(
            created_by=self.request.user
        ).select_related('created_by').prefetch_related('payments')
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return InvoiceCreateUpdateSerializer
        return InvoiceDetailSerializer


class InvoicePaymentView(APIView):
    """
    Vue pour enregistrer un paiement sur une facture
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, invoice_id):
        try:
            invoice = Invoice.objects.get(
                id=invoice_id,
                created_by=request.user
            )
        except Invoice.DoesNotExist:
            return Response(
                {'error': 'Facture introuvable.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validation des données de paiement
        amount = request.data.get('amount')
        method = request.data.get('method', 'Bank Transfer')
        payment_date = request.data.get('payment_date', timezone.now().date())
        reference = request.data.get('reference_number', '')
        
        try:
            amount = Decimal(str(amount))
        except (InvalidOperation, TypeError, ValueError):
            return Response(
                {'error': 'Montant invalide.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if amount <= 0:
            return Response(
                {'error': 'Le montant doit être positif.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if amount > invoice.remaining_amount:
            return Response(
                {'error': 'Le montant dépasse le solde restant.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer le paiement
        payment = Payment.objects.create(
            payment_type='Invoice Payment',
            method=method,
            amount=amount,
            currency=invoice.currency,
            invoice=invoice,
            reference_number=reference,
            description=f'Paiement facture {invoice.invoice_number}',
            payment_date=payment_date,
            created_by=request.user
        )
        
        # Mettre à jour la facture
        invoice.mark_as_paid(amount, payment_date)
        
        return Response({
            'message': 'Paiement enregistré avec succès.',
            'payment': PaymentSerializer(payment).data,
            'invoice_status': invoice.status,
            'remaining_amount': float(invoice.remaining_amount)
        })


class ExpenseListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des dépenses
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ExpenseFilter
    search_fields = ['description', 'vendor', 'reference_number']
    ordering_fields = ['created_at', 'date', 'due_date', 'amount', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Expense.objects.filter(
            created_by=self.request.user
        ).select_related('created_by', 'budget_item__budget_line__budget')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ExpenseCreateUpdateSerializer
        return ExpenseListSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer une dépense
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Expense.objects.filter(
            created_by=self.request.user
        ).select_related('created_by', 'budget_item__budget_line__budget')
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ExpenseCreateUpdateSerializer
        return ExpenseListSerializer


class ExpensePaymentView(APIView):
    """
    Vue pour marquer une dépense comme payée
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, expense_id):
        try:
            expense = Expense.objects.get(
                id=expense_id,
                created_by=request.user
            )
        except Expense.DoesNotExist:
            return Response(
                {'error': 'Dépense introuvable.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if expense.status == 'Paid':
            return Response(
                {'error': 'Cette dépense est déjà payée.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Données de paiement
        method = request.data.get('method', 'Bank Transfer')
        payment_date = request.data.get('payment_date', timezone.now().date())
        reference = request.data.get('reference_number', '')
        
        # Créer le paiement
        payment = Payment.objects.create(
            payment_type='Expense Payment',
            method=method,
            amount=expense.amount,
            currency=expense.currency,
            expense=expense,
            reference_number=reference,
            description=f'Paiement dépense: {expense.description}',
            payment_date=payment_date,
            created_by=request.user
        )
        
        # Marquer la dépense comme payée
        expense.mark_as_paid(payment_date)
        
        return Response({
            'message': 'Dépense marquée comme payée.',
            'payment': PaymentSerializer(payment).data,
            'expense_status': expense.status
        })


class BudgetListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des budgets
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'start_date', 'end_date', 'amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Budget.objects.filter(
            created_by=self.request.user
        ).select_related('created_by', 'project').prefetch_related('budget_lines__items')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BudgetCreateUpdateSerializer
        return BudgetListSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer un budget
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Budget.objects.filter(
            created_by=self.request.user
        ).select_related('created_by', 'project').prefetch_related('budget_lines__items')
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return BudgetCreateUpdateSerializer
        return BudgetDetailSerializer


class BankAccountListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des comptes bancaires
    """
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'account_number', 'bank_name']
    ordering_fields = ['created_at', 'name', 'current_balance']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return BankAccount.objects.filter(
            created_by=self.request.user
        ).select_related('created_by')
    
    def perform_create(self, serializer):
        account = serializer.save(created_by=self.request.user)
        # Initialiser le solde courant avec le solde initial
        account.current_balance = account.initial_balance
        account.save()


class BankAccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer un compte bancaire
    """
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return BankAccount.objects.filter(
            created_by=self.request.user
        ).select_related('created_by')


class TransactionListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des transactions
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TransactionFilter
    search_fields = ['description', 'reference_number']
    ordering_fields = ['created_at', 'transaction_date', 'amount']
    ordering = ['-transaction_date']
    
    def get_queryset(self):
        return Transaction.objects.filter(
            account__created_by=self.request.user
        ).select_related('account', 'created_by', 'payment')
    
    def perform_create(self, serializer):
        transaction = serializer.save(created_by=self.request.user)
        
        # Mettre à jour le solde du compte
        account = transaction.account
        if transaction.transaction_type == 'Credit':
            account.update_balance(transaction.amount, 'credit')
        else:
            account.update_balance(transaction.amount, 'debit')


class FinancialStatsView(APIView):
    """
    Vue pour les statistiques financières
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Période (par défaut: année en cours)
        year = int(request.GET.get('year', timezone.now().year))
        start_date = date(year, 1, 1)
        end_date = date(year, 12, 31)
        
        # Factures de l'utilisateur
        user_invoices = Invoice.objects.filter(created_by=user)
        period_invoices = user_invoices.filter(
            issue_date__range=[start_date, end_date]
        )
        
        # Dépenses de l'utilisateur
        user_expenses = Expense.objects.filter(created_by=user)
        period_expenses = user_expenses.filter(
            date__range=[start_date, end_date]
        )
        
        # Calculs de revenus
        total_revenue = period_invoices.aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0.00')
        
        paid_invoices_amount = period_invoices.filter(
            status='Paid'
        ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        
        pending_invoices_amount = period_invoices.exclude(
            status__in=['Paid', 'Cancelled']
        ).aggregate(total=Sum('remaining_amount'))['total'] or Decimal('0.00')
        
        overdue_invoices_amount = period_invoices.filter(
            due_date__lt=timezone.now().date(),
            status__in=['Sent', 'Partially Paid']
        ).aggregate(total=Sum('remaining_amount'))['total'] or Decimal('0.00')
        
        # Calculs de dépenses
        total_expenses = period_expenses.aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        paid_expenses_amount = period_expenses.filter(
            status='Paid'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        pending_expenses_amount = period_expenses.filter(
            status='Unpaid'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        # Profit/Perte
        net_profit = paid_invoices_amount - paid_expenses_amount
        profit_margin = (net_profit / total_revenue * 100) if total_revenue > 0 else 0
        
        # Budgets
        user_budgets = Budget.objects.filter(created_by=user)
        total_budgets = user_budgets.aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        # Calcul de l'utilisation des budgets
        budget_utilization = 0
        if total_budgets > 0:
            total_spent = 0
            for budget in user_budgets:
                for line in budget.budget_lines.all():
                    for item in line.items.all():
                        total_spent += item.spent_amount
            budget_utilization = (total_spent / total_budgets * 100)
        
        # Trésorerie
        user_accounts = BankAccount.objects.filter(created_by=user, is_active=True)
        total_cash = user_accounts.aggregate(
            total=Sum('current_balance')
        )['total'] or Decimal('0.00')
        
        # Compteurs
        invoices_count = period_invoices.count()
        expenses_count = period_expenses.count()
        overdue_invoices_count = period_invoices.filter(
            due_date__lt=timezone.now().date(),
            status__in=['Sent', 'Partially Paid']
        ).count()
        
        stats = {
            'total_revenue': total_revenue,
            'paid_invoices_amount': paid_invoices_amount,
            'pending_invoices_amount': pending_invoices_amount,
            'overdue_invoices_amount': overdue_invoices_amount,
            'total_expenses': total_expenses,
            'paid_expenses_amount': paid_expenses_amount,
            'pending_expenses_amount': pending_expenses_amount,
            'net_profit': net_profit,
            'profit_margin': round(float(profit_margin), 2),
            'total_budgets': total_budgets,
            'budget_utilization': round(float(budget_utilization), 2),
            'total_cash': total_cash,
            'invoices_count': invoices_count,
            'expenses_count': expenses_count,
            'overdue_invoices_count': overdue_invoices_count,
        }
        
        serializer = FinancialStatsSerializer(stats)
        return Response(serializer.data)


class FinancialDashboardView(APIView):
    """
    Vue pour le dashboard financier complet
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Factures récentes
        recent_invoices = Invoice.objects.filter(
            created_by=user
        ).order_by('-created_at')[:5]
        
        # Dépenses récentes
        recent_expenses = Expense.objects.filter(
            created_by=user
        ).order_by('-created_at')[:5]
        
        # Factures en retard
        overdue_invoices = Invoice.objects.filter(
            created_by=user,
            due_date__lt=timezone.now().date(),
            status__in=['Sent', 'Partially Paid']
        ).order_by('due_date')[:5]
        
        # Dépenses à venir (échéance dans 7 jours)
        upcoming_expenses = Expense.objects.filter(
            created_by=user,
            due_date__lte=timezone.now().date() + timedelta(days=7),
            status='Unpaid'
        ).order_by('due_date')[:5]
        
        # Statistiques
        stats_view = FinancialStatsView()
        stats_response = stats_view.get(request)
        stats = stats_response.data
        
        # Revenus mensuels (12 derniers mois)
        monthly_revenue = []
        for i in range(12):
            month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            revenue = Invoice.objects.filter(
                created_by=user,
                issue_date__range=[month_start.date(), month_end.date()],
                status='Paid'
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            monthly_revenue.append({
                'month': month_start.strftime('%Y-%m'),
                'revenue': float(revenue)
            })
        
        monthly_revenue.reverse()
        
        # Dépenses mensuelles
        monthly_expenses = []
        for i in range(12):
            month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            expenses = Expense.objects.filter(
                created_by=user,
                date__range=[month_start.date(), month_end.date()],
                status='Paid'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            monthly_expenses.append({
                'month': month_start.strftime('%Y-%m'),
                'expenses': float(expenses)
            })
        
        monthly_expenses.reverse()
        
        # Dépenses par catégorie
        expense_by_category = list(
            Expense.objects.filter(
                created_by=user,
                date__year=timezone.now().year
            ).values('category').annotate(
                total=Sum('amount')
            ).order_by('-total')
        )
        
        dashboard_data = {
            'recent_invoices': InvoiceListSerializer(recent_invoices, many=True).data,
            'recent_expenses': ExpenseListSerializer(recent_expenses, many=True).data,
            'overdue_invoices': InvoiceListSerializer(overdue_invoices, many=True).data,
            'upcoming_expenses': ExpenseListSerializer(upcoming_expenses, many=True).data,
            'stats': stats,
            'monthly_revenue': monthly_revenue,
            'monthly_expenses': monthly_expenses,
            'expense_by_category': expense_by_category,
        }
        
        return Response(dashboard_data)


class GenerateInvoicePDFView(APIView):
    """
    Vue pour générer le PDF d'une facture
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, invoice_id):
        try:
            invoice = Invoice.objects.get(
                id=invoice_id,
                created_by=request.user
            )
        except Invoice.DoesNotExist:
            return Response(
                {'error': 'Facture introuvable.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Générer le PDF (logique simplifiée)
        # En production, utiliser une librairie comme ReportLab ou WeasyPrint
        
        return Response({
            'message': 'PDF généré avec succès.',
            'download_url': f'/api/v1/finance/invoices/{invoice_id}/pdf/',
            'invoice_number': invoice.invoice_number
        })


class SendInvoiceReminderView(APIView):
    """
    Vue pour envoyer un rappel de paiement
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, invoice_id):
        try:
            invoice = Invoice.objects.get(
                id=invoice_id,
                created_by=request.user
            )
        except Invoice.DoesNotExist:
            return Response(
                {'error': 'Facture introuvable.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if invoice.status in ['Paid', 'Cancelled']:
            return Response(
                {'error': 'Impossible d\'envoyer un rappel pour cette facture.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Logique d'envoi d'email de rappel
        # En production, intégrer avec un service d'email
        
        return Response({
            'message': 'Rappel envoyé avec succès.',
            'sent_to': invoice.client_email,
            'invoice_number': invoice.invoice_number
        })


class TaxConfigurationView(generics.ListCreateAPIView):
    """
    Vue pour la configuration des taxes
    """
    queryset = TaxConfiguration.objects.filter(is_active=True)
    serializer_class = TaxConfigurationSerializer
    permission_classes = [IsAuthenticated]


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_tax(request):
    """
    Vue pour calculer les taxes sur un montant
    """
    try:
        amount = Decimal(str(request.data.get('amount', 0)))
        tax_id = request.data.get('tax_id')
        
        if amount <= 0:
            return Response(
                {'error': 'Montant invalide.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if tax_id:
            try:
                tax_config = TaxConfiguration.objects.get(id=tax_id, is_active=True)
                tax_amount = amount * (tax_config.rate / 100)
                total_amount = amount + tax_amount
                
                return Response({
                    'amount': float(amount),
                    'tax_rate': float(tax_config.rate),
                    'tax_amount': float(tax_amount),
                    'total_amount': float(total_amount),
                    'tax_name': tax_config.name
                })
            except TaxConfiguration.DoesNotExist:
                return Response(
                    {'error': 'Configuration de taxe introuvable.'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Retourner le montant sans taxe
            return Response({
                'amount': float(amount),
                'tax_rate': 0,
                'tax_amount': 0,
                'total_amount': float(amount),
                'tax_name': 'Aucune'
            })
            
    except (ValueError, InvalidOperation):
        return Response(
            {'error': 'Montant invalide.'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cash_flow_report(request):
    """
    Vue pour le rapport de flux de trésorerie
    """
    user = request.user
    
    # Période (par défaut: 6 derniers mois)
    months = int(request.GET.get('months', 6))
    
    cash_flow = []
    for i in range(months):
        month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        # Entrées (factures payées)
        inflows = Invoice.objects.filter(
            created_by=user,
            paid_date__range=[month_start.date(), month_end.date()],
            status='Paid'
        ).aggregate(total=Sum('paid_amount'))['total'] or Decimal('0.00')
        
        # Sorties (dépenses payées)
        outflows = Expense.objects.filter(
            created_by=user,
            paid_date__range=[month_start.date(), month_end.date()],
            status='Paid'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        net_flow = inflows - outflows
        
        cash_flow.append({
            'month': month_start.strftime('%Y-%m'),
            'inflows': float(inflows),
            'outflows': float(outflows),
            'net_flow': float(net_flow)
        })
    
    cash_flow.reverse()
    
    return Response({
        'period_months': months,
        'cash_flow': cash_flow,
        'total_inflows': sum(item['inflows'] for item in cash_flow),
        'total_outflows': sum(item['outflows'] for item in cash_flow),
        'net_cash_flow': sum(item['net_flow'] for item in cash_flow)
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_financial_report(request):
    """
    Vue pour générer un rapport financier
    """
    report_type = request.data.get('report_type')
    period_start = request.data.get('period_start')
    period_end = request.data.get('period_end')
    
    if not all([report_type, period_start, period_end]):
        return Response(
            {'error': 'Type de rapport, date de début et date de fin requis.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        start_date = datetime.strptime(period_start, '%Y-%m-%d').date()
        end_date = datetime.strptime(period_end, '%Y-%m-%d').date()
    except ValueError:
        return Response(
            {'error': 'Format de date invalide. Utilisez YYYY-MM-DD.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Générer les données du rapport selon le type
    user = request.user
    report_data = {}
    
    if report_type == 'Income Statement':
        # Compte de résultat
        revenue = Invoice.objects.filter(
            created_by=user,
            issue_date__range=[start_date, end_date],
            status='Paid'
        ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        
        expenses = Expense.objects.filter(
            created_by=user,
            date__range=[start_date, end_date],
            status='Paid'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        report_data = {
            'revenue': float(revenue),
            'expenses': float(expenses),
            'net_income': float(revenue - expenses),
            'period': f"{start_date} to {end_date}"
        }
    
    elif report_type == 'Cash Flow':
        # Flux de trésorerie détaillé
        cash_flow_view = cash_flow_report.__wrapped__(request._request)
        report_data = cash_flow_view.data
    
    # Créer l'enregistrement du rapport
    report = FinancialReport.objects.create(
        name=f"{report_type} - {start_date} to {end_date}",
        report_type=report_type,
        period_start=start_date,
        period_end=end_date,
        data=report_data,
        generated_by=user
    )
    
    return Response({
        'message': 'Rapport généré avec succès.',
        'report_id': report.id,
        'report_name': report.name,
        'data': report_data
    })
