"""
Modèles pour la gestion CRM
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Contact(models.Model):
    """
    Modèle pour les contacts CRM
    """
    CONTACT_TYPES = [
        ('lead', 'Lead'),
        ('prospect', 'Prospect'),
        ('customer', 'Client'),
        ('partner', 'Partenaire'),
        ('vendor', 'Fournisseur'),
    ]
    
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    company = models.CharField(max_length=200, blank=True)
    position = models.CharField(max_length=100, blank=True)
    contact_type = models.CharField(max_length=20, choices=CONTACT_TYPES, default='lead')
    source = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contacts_created')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.company})"


class SalesOpportunity(models.Model):
    """
    Modèle pour les opportunités de vente
    """
    STAGES = [
        ('prospecting', 'Prospection'),
        ('qualification', 'Qualification'),
        ('proposal', 'Proposition'),
        ('negotiation', 'Négociation'),
        ('closed_won', 'Gagné'),
        ('closed_lost', 'Perdu'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE)
    stage = models.CharField(max_length=20, choices=STAGES, default='prospecting')
    value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    probability = models.IntegerField(default=0, help_text="Probabilité en pourcentage")
    expected_close_date = models.DateField(null=True, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Opportunities"
    
    def __str__(self):
        return self.title


class Activity(models.Model):
    """
    Modèle pour les activités CRM
    """
    ACTIVITY_TYPES = [
        ('call', 'Appel'),
        ('email', 'Email'),
        ('meeting', 'Réunion'),
        ('task', 'Tâche'),
        ('note', 'Note'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, null=True, blank=True)
    opportunity = models.ForeignKey(SalesOpportunity, on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    due_date = models.DateTimeField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Activities"
    
    def __str__(self):
        return self.title