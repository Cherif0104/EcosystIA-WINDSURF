"""
Modèles pour la gestion des congés
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class LeaveType(models.Model):
    """
    Types de congés
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    days_per_year = models.PositiveIntegerField(help_text="Jours alloués par an")
    is_paid = models.BooleanField(default=True)
    requires_approval = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'leave_leavetype'
        verbose_name = 'Type de Congé'
        verbose_name_plural = 'Types de Congés'
    
    def __str__(self):
        return self.name


class LeaveBalance(models.Model):
    """
    Solde de congés par utilisateur
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leave_balances')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    year = models.PositiveIntegerField()
    
    # Soldes
    allocated_days = models.PositiveIntegerField()
    used_days = models.PositiveIntegerField(default=0)
    pending_days = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'leave_leavebalance'
        verbose_name = 'Solde de Congé'
        verbose_name_plural = 'Soldes de Congés'
        unique_together = ['user', 'leave_type', 'year']
    
    @property
    def remaining_days(self):
        return self.allocated_days - self.used_days - self.pending_days


class LeaveRequest(models.Model):
    """
    Demandes de congé
    """
    STATUS_CHOICES = [
        ('Pending', 'En Attente'),
        ('Approved', 'Approuvé'),
        ('Rejected', 'Rejeté'),
        ('Cancelled', 'Annulé'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    # Dates
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Détails
    reason = models.TextField()
    notes = models.TextField(blank=True, null=True)
    
    # Approbation
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='approved_leaves')
    approved_at = models.DateTimeField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'leave_leaverequest'
        verbose_name = 'Demande de Congé'
        verbose_name_plural = 'Demandes de Congés'
    
    @property
    def duration_days(self):
        return (self.end_date - self.start_date).days + 1
    
    def approve(self, approved_by_user):
        self.status = 'Approved'
        self.approved_by = approved_by_user
        self.approved_at = timezone.now()
        self.save()
        
        # Mettre à jour le solde
        balance, created = LeaveBalance.objects.get_or_create(
            user=self.user,
            leave_type=self.leave_type,
            year=self.start_date.year,
            defaults={'allocated_days': self.leave_type.days_per_year}
        )
        balance.used_days += self.duration_days
        balance.pending_days = max(0, balance.pending_days - self.duration_days)
        balance.save()
