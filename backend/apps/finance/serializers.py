"""
Serializers pour la gestion financière
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal, InvalidOperation
from datetime import datetime, timedelta
from .models import (
    Invoice, Expense, Payment, Budget, BudgetLine, BudgetItem,
    RecurringInvoice, RecurringExpense, FinancialReport,
    TaxConfiguration, BankAccount, Transaction
)

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """
    Serializer basique pour les utilisateurs
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'avatar']
        read_only_fields = ['id', 'username', 'email', 'full_name', 'avatar']


class TaxConfigurationSerializer(serializers.ModelSerializer):
    """
    Serializer pour les configurations de taxes
    """
    class Meta:
        model = TaxConfiguration
        fields = ['id', 'name', 'rate', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer pour les paiements
    """
    created_by = UserBasicSerializer(read_only=True)
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    method_display = serializers.CharField(source='get_method_display', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'payment_type', 'payment_type_display', 'method', 'method_display',
            'amount', 'currency', 'reference_number', 'description',
            'payment_date', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être positif.")
        if value > 1000000000:  # 1 milliard
            raise serializers.ValidationError("Le montant est trop élevé.")
        return value
    
    def validate_payment_date(self, value):
        if value > timezone.now().date():
            raise serializers.ValidationError("La date de paiement ne peut pas être dans le futur.")
        return value


class InvoiceListSerializer(serializers.ModelSerializer):
    """
    Serializer pour la liste des factures
    """
    created_by = UserBasicSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    remaining_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)
    payment_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'client_name', 'client_email',
            'amount', 'tax_amount', 'total_amount', 'currency',
            'status', 'status_display', 'issue_date', 'due_date',
            'paid_amount', 'remaining_amount', 'is_overdue', 'days_overdue',
            'payment_percentage', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_by', 'created_at', 'updated_at',
            'remaining_amount', 'is_overdue', 'days_overdue', 'payment_percentage'
        ]


class InvoiceDetailSerializer(serializers.ModelSerializer):
    """
    Serializer détaillé pour une facture
    """
    created_by = UserBasicSerializer(read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    remaining_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)
    payment_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'client_name', 'client_email', 'client_address',
            'amount', 'tax_amount', 'total_amount', 'currency',
            'status', 'status_display', 'issue_date', 'due_date', 'paid_date',
            'paid_amount', 'remaining_amount', 'is_overdue', 'days_overdue',
            'payment_percentage', 'description', 'notes', 'terms_conditions',
            'receipt', 'payments', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_by', 'created_at', 'updated_at',
            'remaining_amount', 'is_overdue', 'days_overdue', 'payment_percentage'
        ]


class InvoiceCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer/modifier des factures
    """
    class Meta:
        model = Invoice
        fields = [
            'invoice_number', 'client_name', 'client_email', 'client_address',
            'amount', 'tax_amount', 'total_amount', 'currency',
            'status', 'issue_date', 'due_date', 'description',
            'notes', 'terms_conditions'
        ]
    
    def validate_invoice_number(self, value):
        if self.instance and self.instance.invoice_number == value:
            return value
        
        if Invoice.objects.filter(invoice_number=value).exists():
            raise serializers.ValidationError("Ce numéro de facture existe déjà.")
        return value
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être positif.")
        return value
    
    def validate_tax_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Le montant de taxe ne peut pas être négatif.")
        return value
    
    def validate(self, attrs):
        issue_date = attrs.get('issue_date')
        due_date = attrs.get('due_date')
        
        if issue_date and due_date and issue_date > due_date:
            raise serializers.ValidationError(
                "La date d'émission ne peut pas être postérieure à la date d'échéance."
            )
        
        # Validation automatique du total
        amount = attrs.get('amount', 0)
        tax_amount = attrs.get('tax_amount', 0)
        total_amount = attrs.get('total_amount', 0)
        
        expected_total = amount + tax_amount
        if abs(float(total_amount) - float(expected_total)) > 0.01:  # Tolérance de 1 centime
            attrs['total_amount'] = expected_total
        
        return attrs
    
    def create(self, validated_data):
        # Générer automatiquement le numéro de facture si non fourni
        if not validated_data.get('invoice_number'):
            last_invoice = Invoice.objects.order_by('-id').first()
            if last_invoice:
                last_number = int(last_invoice.invoice_number.split('-')[-1]) if '-' in last_invoice.invoice_number else 0
                validated_data['invoice_number'] = f"INV-{last_number + 1:06d}"
            else:
                validated_data['invoice_number'] = "INV-000001"
        
        return super().create(validated_data)


class ExpenseListSerializer(serializers.ModelSerializer):
    """
    Serializer pour la liste des dépenses
    """
    created_by = UserBasicSerializer(read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    budget_impact = serializers.SerializerMethodField()
    
    class Meta:
        model = Expense
        fields = [
            'id', 'category', 'category_display', 'description', 'amount',
            'currency', 'status', 'status_display', 'date', 'due_date',
            'paid_date', 'vendor', 'reference_number', 'is_overdue',
            'budget_impact', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_by', 'created_at', 'updated_at',
            'is_overdue', 'budget_impact'
        ]
    
    def get_budget_impact(self, obj):
        return obj.get_budget_impact()


class ExpenseCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer/modifier des dépenses
    """
    budget_item_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Expense
        fields = [
            'category', 'description', 'amount', 'currency', 'status',
            'date', 'due_date', 'vendor', 'reference_number', 'budget_item_id'
        ]
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être positif.")
        return value
    
    def validate_date(self, value):
        if value > timezone.now().date():
            raise serializers.ValidationError("La date de dépense ne peut pas être dans le futur.")
        return value
    
    def validate_budget_item_id(self, value):
        if value is not None:
            try:
                BudgetItem.objects.get(id=value)
                return value
            except BudgetItem.DoesNotExist:
                raise serializers.ValidationError("Élément de budget introuvable.")
        return value
    
    def validate(self, attrs):
        date = attrs.get('date')
        due_date = attrs.get('due_date')
        
        if date and due_date and date > due_date:
            raise serializers.ValidationError(
                "La date de dépense ne peut pas être postérieure à la date d'échéance."
            )
        
        return attrs


class BudgetItemSerializer(serializers.ModelSerializer):
    """
    Serializer pour les éléments de budget
    """
    spent_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    remaining_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    utilization_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = BudgetItem
        fields = [
            'id', 'description', 'amount', 'order', 'spent_amount',
            'remaining_amount', 'utilization_percentage', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'spent_amount',
            'remaining_amount', 'utilization_percentage'
        ]


class BudgetLineSerializer(serializers.ModelSerializer):
    """
    Serializer pour les lignes de budget
    """
    items = BudgetItemSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    total_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = BudgetLine
        fields = [
            'id', 'title', 'order', 'items', 'total_amount',
            'total_spent', 'total_remaining', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'total_amount',
            'total_spent', 'total_remaining'
        ]
    
    def get_total_amount(self, obj):
        return sum(item.amount for item in obj.items.all())
    
    def get_total_spent(self, obj):
        return sum(item.spent_amount for item in obj.items.all())
    
    def get_total_remaining(self, obj):
        return sum(item.remaining_amount for item in obj.items.all())


class BudgetListSerializer(serializers.ModelSerializer):
    """
    Serializer pour la liste des budgets
    """
    created_by = UserBasicSerializer(read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    total_spent = serializers.SerializerMethodField()
    utilization_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Budget
        fields = [
            'id', 'title', 'type', 'type_display', 'amount', 'currency',
            'start_date', 'end_date', 'total_spent', 'utilization_percentage',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_by', 'created_at', 'updated_at',
            'total_spent', 'utilization_percentage'
        ]
    
    def get_total_spent(self, obj):
        total = 0
        for line in obj.budget_lines.all():
            for item in line.items.all():
                total += item.spent_amount
        return total
    
    def get_utilization_percentage(self, obj):
        if obj.amount > 0:
            return (self.get_total_spent(obj) / obj.amount) * 100
        return 0


class BudgetDetailSerializer(serializers.ModelSerializer):
    """
    Serializer détaillé pour un budget
    """
    created_by = UserBasicSerializer(read_only=True)
    budget_lines = BudgetLineSerializer(many=True, read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    total_spent = serializers.SerializerMethodField()
    utilization_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Budget
        fields = [
            'id', 'title', 'type', 'type_display', 'amount', 'currency',
            'start_date', 'end_date', 'description', 'project',
            'budget_lines', 'total_spent', 'utilization_percentage',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_by', 'created_at', 'updated_at',
            'total_spent', 'utilization_percentage'
        ]
    
    def get_total_spent(self, obj):
        total = 0
        for line in obj.budget_lines.all():
            for item in line.items.all():
                total += item.spent_amount
        return total
    
    def get_utilization_percentage(self, obj):
        if obj.amount > 0:
            return (self.get_total_spent(obj) / obj.amount) * 100
        return 0


class BudgetCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer/modifier des budgets
    """
    project_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Budget
        fields = [
            'title', 'type', 'amount', 'currency', 'start_date',
            'end_date', 'description', 'project_id'
        ]
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant du budget doit être positif.")
        return value
    
    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError(
                "La date de début ne peut pas être postérieure à la date de fin."
            )
        
        return attrs
    
    def validate_project_id(self, value):
        if value is not None:
            from apps.projects.models import Project
            try:
                Project.objects.get(id=value)
                return value
            except Project.DoesNotExist:
                raise serializers.ValidationError("Projet introuvable.")
        return value


class BankAccountSerializer(serializers.ModelSerializer):
    """
    Serializer pour les comptes bancaires
    """
    created_by = UserBasicSerializer(read_only=True)
    account_type_display = serializers.CharField(source='get_account_type_display', read_only=True)
    
    class Meta:
        model = BankAccount
        fields = [
            'id', 'name', 'account_type', 'account_type_display',
            'account_number', 'bank_name', 'currency', 'initial_balance',
            'current_balance', 'is_active', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializer pour les transactions
    """
    account = BankAccountSerializer(read_only=True)
    created_by = UserBasicSerializer(read_only=True)
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'account', 'transaction_type', 'transaction_type_display',
            'category', 'category_display', 'amount', 'description',
            'reference_number', 'transaction_date', 'created_by', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']


class FinancialStatsSerializer(serializers.Serializer):
    """
    Serializer pour les statistiques financières
    """
    # Revenus
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    paid_invoices_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    pending_invoices_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    overdue_invoices_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    
    # Dépenses
    total_expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
    paid_expenses_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    pending_expenses_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    
    # Profit/Perte
    net_profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    profit_margin = serializers.FloatField()
    
    # Budgets
    total_budgets = serializers.DecimalField(max_digits=15, decimal_places=2)
    budget_utilization = serializers.FloatField()
    
    # Comptes
    total_cash = serializers.DecimalField(max_digits=15, decimal_places=2)
    
    # Compteurs
    invoices_count = serializers.IntegerField()
    expenses_count = serializers.IntegerField()
    overdue_invoices_count = serializers.IntegerField()


class DashboardDataSerializer(serializers.Serializer):
    """
    Serializer pour les données du dashboard financier
    """
    recent_invoices = InvoiceListSerializer(many=True)
    recent_expenses = ExpenseListSerializer(many=True)
    overdue_invoices = InvoiceListSerializer(many=True)
    upcoming_expenses = ExpenseListSerializer(many=True)
    stats = FinancialStatsSerializer()
    monthly_revenue = serializers.ListField(child=serializers.DictField())
    monthly_expenses = serializers.ListField(child=serializers.DictField())
    expense_by_category = serializers.ListField(child=serializers.DictField())
