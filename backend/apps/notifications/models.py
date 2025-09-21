"""
Modèles pour le système de notifications EcosystIA
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Notification(models.Model):
    """
    Modèle de notification
    """
    TYPE_CHOICES = [
        ('info', 'Information'),
        ('success', 'Succès'),
        ('warning', 'Avertissement'),
        ('error', 'Erreur'),
        ('message', 'Message'),
        ('reminder', 'Rappel'),
    ]
    
    CATEGORY_CHOICES = [
        ('system', 'Système'),
        ('project', 'Projet'),
        ('course', 'Cours'),
        ('meeting', 'Réunion'),
        ('finance', 'Finance'),
        ('crm', 'CRM'),
        ('goal', 'Objectif'),
        ('job', 'Emploi'),
        ('user', 'Utilisateur'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications', blank=True, null=True)
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='system')
    
    # État
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(blank=True, null=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Données contextuelles
    related_object_id = models.PositiveIntegerField(blank=True, null=True)
    related_object_type = models.CharField(max_length=50, blank=True, null=True)
    action_url = models.URLField(blank=True, null=True)
    
    class Meta:
        db_table = 'notifications_notification'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['created_at']),
            models.Index(fields=['category']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.recipient.username}"
    
    def mark_as_read(self):
        """Marquer comme lu"""
        self.is_read = True
        self.read_at = timezone.now()
        self.save()


class NotificationPreference(models.Model):
    """
    Préférences de notifications par utilisateur
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Notifications par email
    email_enabled = models.BooleanField(default=True)
    email_projects = models.BooleanField(default=True)
    email_courses = models.BooleanField(default=True)
    email_meetings = models.BooleanField(default=True)
    email_finance = models.BooleanField(default=False)
    email_goals = models.BooleanField(default=True)
    
    # Notifications push
    push_enabled = models.BooleanField(default=True)
    push_projects = models.BooleanField(default=True)
    push_courses = models.BooleanField(default=True)
    push_meetings = models.BooleanField(default=True)
    push_finance = models.BooleanField(default=False)
    push_goals = models.BooleanField(default=True)
    
    # Notifications dans l'app
    in_app_enabled = models.BooleanField(default=True)
    
    # Fréquence des résumés
    DIGEST_CHOICES = [
        ('never', 'Jamais'),
        ('daily', 'Quotidien'),
        ('weekly', 'Hebdomadaire'),
        ('monthly', 'Mensuel'),
    ]
    digest_frequency = models.CharField(max_length=20, choices=DIGEST_CHOICES, default='weekly')
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notifications_preference'
        verbose_name = 'Préférence de notification'
        verbose_name_plural = 'Préférences de notifications'
    
    def __str__(self):
        return f"Préférences de {self.user.username}"


class NotificationTemplate(models.Model):
    """
    Modèles de notifications
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    
    # Contenu
    title_template = models.CharField(max_length=200)
    message_template = models.TextField()
    type = models.CharField(max_length=20, choices=Notification.TYPE_CHOICES, default='info')
    category = models.CharField(max_length=20, choices=Notification.CATEGORY_CHOICES, default='system')
    
    # Configuration
    is_active = models.BooleanField(default=True)
    send_email = models.BooleanField(default=False)
    send_push = models.BooleanField(default=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notifications_template'
        verbose_name = 'Modèle de notification'
        verbose_name_plural = 'Modèles de notifications'
        ordering = ['name']
    
    def __str__(self):
        return self.name
