"""
Modèles pour le suivi du temps EcosystIA
Compatible avec les types TypeScript du frontend
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class TimeLog(models.Model):
    """
    Modèle de journal de temps
    Compatible avec l'interface TimeLog du frontend
    """
    ENTITY_TYPE_CHOICES = [
        ('project', 'Projet'),
        ('course', 'Cours'),
        ('task', 'Tâche'),
        ('meeting', 'Réunion'),
        ('other', 'Autre'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='time_logs')
    entity_type = models.CharField(max_length=20, choices=ENTITY_TYPE_CHOICES)
    entity_id = models.CharField(max_length=50, help_text="ID de l'entité (peut être numérique ou string)")
    entity_title = models.CharField(max_length=200)
    
    # Temps
    date = models.DateField()
    duration = models.PositiveIntegerField(help_text="Durée en minutes")
    description = models.TextField()
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'time_tracking_timelog'
        verbose_name = 'Journal de Temps'
        verbose_name_plural = 'Journaux de Temps'
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.entity_title} - {self.duration}min"
    
    @property
    def hours_decimal(self):
        """Convertit la durée en heures décimales"""
        return round(self.duration / 60, 2)
    
    @property
    def billable_amount(self):
        """Calcule le montant facturable si applicable"""
        # Récupérer le taux horaire de l'utilisateur
        if hasattr(self.user, 'profile') and hasattr(self.user.profile, 'hourly_rate'):
            return self.hours_decimal * self.user.profile.hourly_rate
        return 0
    
    def is_today(self):
        """Vérifie si le log est d'aujourd'hui"""
        return self.date == timezone.now().date()
    
    def is_current_week(self):
        """Vérifie si le log est de cette semaine"""
        today = timezone.now().date()
        start_week = today - timezone.timedelta(days=today.weekday())
        end_week = start_week + timezone.timedelta(days=6)
        return start_week <= self.date <= end_week


class TimeSession(models.Model):
    """
    Sessions de travail en temps réel (timer actif)
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='active_sessions')
    entity_type = models.CharField(max_length=20, choices=TimeLog.ENTITY_TYPE_CHOICES)
    entity_id = models.CharField(max_length=50)
    entity_title = models.CharField(max_length=200)
    
    # Temps
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    # État
    is_active = models.BooleanField(default=True)
    is_billable = models.BooleanField(default=False)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'time_tracking_timesession'
        verbose_name = 'Session de Temps'
        verbose_name_plural = 'Sessions de Temps'
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['start_time']),
        ]
    
    def __str__(self):
        status = "Active" if self.is_active else "Terminée"
        return f"{self.user.get_full_name()} - {self.entity_title} - {status}"
    
    @property
    def duration_minutes(self):
        """Calcule la durée en minutes"""
        if self.end_time:
            delta = self.end_time - self.start_time
            return int(delta.total_seconds() / 60)
        else:
            # Session active
            delta = timezone.now() - self.start_time
            return int(delta.total_seconds() / 60)
    
    @property
    def duration_hours(self):
        """Calcule la durée en heures décimales"""
        return round(self.duration_minutes / 60, 2)
    
    def stop_session(self, description=None):
        """Arrête la session et crée un TimeLog"""
        if not self.is_active:
            return None
        
        self.end_time = timezone.now()
        self.is_active = False
        if description:
            self.description = description
        self.save()
        
        # Créer un TimeLog
        time_log = TimeLog.objects.create(
            user=self.user,
            entity_type=self.entity_type,
            entity_id=self.entity_id,
            entity_title=self.entity_title,
            date=self.start_time.date(),
            duration=self.duration_minutes,
            description=self.description or f"Session de travail sur {self.entity_title}"
        )
        
        return time_log


class WorkSchedule(models.Model):
    """
    Horaires de travail des utilisateurs
    """
    WEEKDAY_CHOICES = [
        (0, 'Lundi'),
        (1, 'Mardi'),
        (2, 'Mercredi'),
        (3, 'Jeudi'),
        (4, 'Vendredi'),
        (5, 'Samedi'),
        (6, 'Dimanche'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='work_schedules')
    weekday = models.IntegerField(choices=WEEKDAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_working_day = models.BooleanField(default=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'time_tracking_workschedule'
        verbose_name = 'Horaire de Travail'
        verbose_name_plural = 'Horaires de Travail'
        unique_together = ['user', 'weekday']
    
    def __str__(self):
        if self.is_working_day:
            return f"{self.user.get_full_name()} - {self.get_weekday_display()} : {self.start_time}-{self.end_time}"
        return f"{self.user.get_full_name()} - {self.get_weekday_display()} : Repos"
    
    @property
    def daily_hours(self):
        """Calcule les heures de travail quotidiennes"""
        if self.is_working_day and self.start_time and self.end_time:
            start_minutes = self.start_time.hour * 60 + self.start_time.minute
            end_minutes = self.end_time.hour * 60 + self.end_time.minute
            return (end_minutes - start_minutes) / 60
        return 0


class TimeOff(models.Model):
    """
    Congés et absences
    """
    TYPE_CHOICES = [
        ('Vacation', 'Congés Payés'),
        ('Sick Leave', 'Congé Maladie'),
        ('Personal', 'Congé Personnel'),
        ('Training', 'Formation'),
        ('Other', 'Autre'),
    ]
    
    STATUS_CHOICES = [
        ('Pending', 'En Attente'),
        ('Approved', 'Approuvé'),
        ('Rejected', 'Rejeté'),
        ('Cancelled', 'Annulé'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='time_offs')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    # Dates
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Détails
    reason = models.TextField()
    notes = models.TextField(blank=True, null=True)
    
    # Approbation
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='approved_time_offs')
    approved_at = models.DateTimeField(blank=True, null=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'time_tracking_timeoff'
        verbose_name = 'Congé'
        verbose_name_plural = 'Congés'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['type']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_type_display()} - {self.start_date}"
    
    @property
    def duration_days(self):
        """Calcule la durée en jours"""
        return (self.end_date - self.start_date).days + 1
    
    def approve(self, approved_by_user):
        """Approuve le congé"""
        self.status = 'Approved'
        self.approved_by = approved_by_user
        self.approved_at = timezone.now()
        self.save()
    
    def reject(self, approved_by_user):
        """Rejette le congé"""
        self.status = 'Rejected'
        self.approved_by = approved_by_user
        self.approved_at = timezone.now()
        self.save()


class Meeting(models.Model):
    """
    Modèle de réunion
    Compatible avec l'interface Meeting du frontend
    """
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    
    # Dates et heures
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    
    # Participants
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_meetings')
    attendees = models.ManyToManyField(User, related_name='attended_meetings')
    
    # Métadonnées
    location = models.CharField(max_length=200, blank=True, null=True)
    meeting_url = models.URLField(blank=True, null=True)
    agenda = models.TextField(blank=True, null=True)
    
    # Relations
    project = models.ForeignKey('apps.projects.Project', on_delete=models.SET_NULL, blank=True, null=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'time_tracking_meeting'
        verbose_name = 'Réunion'
        verbose_name_plural = 'Réunions'
        indexes = [
            models.Index(fields=['start_time']),
            models.Index(fields=['organizer']),
            models.Index(fields=['project']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.start_time.date()}"
    
    @property
    def duration(self):
        """Calcule la durée de la réunion en minutes"""
        if self.end_time and self.start_time:
            delta = self.end_time - self.start_time
            return int(delta.total_seconds() / 60)
        return 0
