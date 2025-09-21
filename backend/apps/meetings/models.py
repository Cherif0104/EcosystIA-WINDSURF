"""
Modèles pour la gestion des réunions EcosystIA
Compatible avec les types TypeScript du frontend
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class Meeting(models.Model):
    """
    Modèle de réunion
    Compatible avec l'interface Meeting du frontend
    """
    TYPE_CHOICES = [
        ('Team Meeting', 'Réunion d\'équipe'),
        ('Project Review', 'Revue de projet'),
        ('One-on-One', 'Tête-à-tête'),
        ('Client Meeting', 'Réunion client'),
        ('Training', 'Formation'),
        ('Interview', 'Entretien'),
        ('Standup', 'Daily Standup'),
        ('Retrospective', 'Rétrospective'),
    ]
    
    STATUS_CHOICES = [
        ('Scheduled', 'Programmée'),
        ('In Progress', 'En cours'),
        ('Completed', 'Terminée'),
        ('Cancelled', 'Annulée'),
        ('Postponed', 'Reportée'),
    ]
    
    PRIORITY_CHOICES = [
        ('Low', 'Faible'),
        ('Medium', 'Moyen'),
        ('High', 'Élevé'),
        ('Urgent', 'Urgent'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='Team Meeting')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Medium')
    
    # Dates et heures
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    timezone = models.CharField(max_length=50, default='Africa/Dakar')
    
    # Participants
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_meetings')
    attendees = models.ManyToManyField(User, through='MeetingAttendee', related_name='meetings')
    
    # Lieu et informations de connexion
    location = models.CharField(max_length=200, blank=True, null=True)
    meeting_url = models.URLField(blank=True, null=True, help_text="Lien de visioconférence")
    meeting_id = models.CharField(max_length=50, blank=True, null=True)
    meeting_password = models.CharField(max_length=50, blank=True, null=True)
    
    # Documents et ressources
    agenda = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    recording_url = models.URLField(blank=True, null=True)
    
    # Récurrence
    is_recurring = models.BooleanField(default=False)
    recurrence_pattern = models.CharField(max_length=50, blank=True, null=True)
    recurrence_end_date = models.DateField(blank=True, null=True)
    parent_meeting = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='recurring_instances')
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Statistiques
    actual_start_time = models.DateTimeField(blank=True, null=True)
    actual_end_time = models.DateTimeField(blank=True, null=True)
    attendance_rate = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    
    class Meta:
        db_table = 'meetings_meeting'
        verbose_name = 'Réunion'
        verbose_name_plural = 'Réunions'
        indexes = [
            models.Index(fields=['start_datetime']),
            models.Index(fields=['status']),
            models.Index(fields=['organizer']),
            models.Index(fields=['type']),
        ]
        ordering = ['-start_datetime']
    
    def __str__(self):
        return f"{self.title} - {self.start_datetime.strftime('%d/%m/%Y %H:%M')}"
    
    @property
    def duration_minutes(self):
        """Durée de la réunion en minutes"""
        if self.start_datetime and self.end_datetime:
            duration = self.end_datetime - self.start_datetime
            return int(duration.total_seconds() / 60)
        return 0
    
    @property
    def is_past(self):
        """Vérifie si la réunion est passée"""
        return self.end_datetime < timezone.now()
    
    @property
    def is_today(self):
        """Vérifie si la réunion a lieu aujourd'hui"""
        return self.start_datetime.date() == timezone.now().date()
    
    @property
    def attendees_count(self):
        """Nombre de participants"""
        return self.attendees.count()


class MeetingAttendee(models.Model):
    """
    Table intermédiaire pour les participants aux réunions
    """
    STATUS_CHOICES = [
        ('Invited', 'Invité'),
        ('Accepted', 'Accepté'),
        ('Declined', 'Refusé'),
        ('Tentative', 'Peut-être'),
        ('No Response', 'Pas de réponse'),
    ]
    
    ROLE_CHOICES = [
        ('Attendee', 'Participant'),
        ('Presenter', 'Présentateur'),
        ('Moderator', 'Modérateur'),
        ('Observer', 'Observateur'),
    ]
    
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Invited')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Attendee')
    
    # Participation
    joined_at = models.DateTimeField(blank=True, null=True)
    left_at = models.DateTimeField(blank=True, null=True)
    is_present = models.BooleanField(default=False)
    
    # Notes personnelles
    notes = models.TextField(blank=True, null=True)
    
    # Métadonnées
    invited_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'meetings_meetingattendee'
        verbose_name = 'Participant à la réunion'
        verbose_name_plural = 'Participants aux réunions'
        unique_together = ['meeting', 'user']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.meeting.title}"
    
    @property
    def attendance_duration_minutes(self):
        """Durée de participation en minutes"""
        if self.joined_at and self.left_at:
            duration = self.left_at - self.joined_at
            return int(duration.total_seconds() / 60)
        return 0


class MeetingAction(models.Model):
    """
    Actions issues des réunions
    """
    STATUS_CHOICES = [
        ('Open', 'Ouverte'),
        ('In Progress', 'En cours'),
        ('Completed', 'Terminée'),
        ('Cancelled', 'Annulée'),
        ('On Hold', 'En pause'),
    ]
    
    PRIORITY_CHOICES = [
        ('Low', 'Faible'),
        ('Medium', 'Moyen'),
        ('High', 'Élevé'),
        ('Urgent', 'Urgent'),
    ]
    
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='actions')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Medium')
    
    # Assignation
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meeting_actions')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_meeting_actions')
    
    # Dates
    due_date = models.DateField(blank=True, null=True)
    completed_date = models.DateField(blank=True, null=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'meetings_meetingaction'
        verbose_name = 'Action de réunion'
        verbose_name_plural = 'Actions de réunions'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['due_date']),
            models.Index(fields=['assigned_to']),
        ]
        ordering = ['due_date', 'priority']
    
    def __str__(self):
        return f"{self.title} - {self.meeting.title}"
    
    @property
    def is_overdue(self):
        """Vérifie si l'action est en retard"""
        if self.due_date and self.status not in ['Completed', 'Cancelled']:
            return self.due_date < timezone.now().date()
        return False


class MeetingTemplate(models.Model):
    """
    Modèles de réunions pour réutilisation
    """
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=20, choices=Meeting.TYPE_CHOICES, default='Team Meeting')
    
    # Configuration par défaut
    default_duration_minutes = models.PositiveIntegerField(default=60)
    default_agenda = models.TextField(blank=True, null=True)
    default_location = models.CharField(max_length=200, blank=True, null=True)
    
    # Participants par défaut
    default_attendees = models.ManyToManyField(User, blank=True, related_name='meeting_templates')
    
    # Métadonnées
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meeting_templates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'meetings_meetingtemplate'
        verbose_name = 'Modèle de réunion'
        verbose_name_plural = 'Modèles de réunions'
        ordering = ['name']
    
    def __str__(self):
        return self.name
