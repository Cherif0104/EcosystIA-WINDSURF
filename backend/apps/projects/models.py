"""
Modèles pour la gestion des projets EcosystIA
Compatible avec les types TypeScript du frontend
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Project(models.Model):
    """
    Modèle de projet principal
    Compatible avec l'interface Project du frontend
    """
    STATUS_CHOICES = [
        ('Not Started', 'Non Commencé'),
        ('In Progress', 'En Cours'),
        ('Completed', 'Terminé'),
        ('On Hold', 'En Pause'),
        ('Cancelled', 'Annulé'),
    ]
    
    PRIORITY_CHOICES = [
        ('Low', 'Faible'),
        ('Medium', 'Moyen'),
        ('High', 'Élevé'),
        ('Critical', 'Critique'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Not Started')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Medium')
    
    # Dates
    start_date = models.DateField(blank=True, null=True)
    due_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Équipe
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_projects')
    team_members = models.ManyToManyField(User, related_name='projects', through='ProjectMembership')
    
    # Métadonnées
    budget = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    progress = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    class Meta:
        db_table = 'projects_project'
        verbose_name = 'Projet'
        verbose_name_plural = 'Projets'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['due_date']),
            models.Index(fields=['created_by']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def team(self):
        """Retourne l'équipe du projet"""
        return self.team_members.all()
    
    @property
    def tasks(self):
        """Retourne les tâches du projet"""
        return self.task_set.all()
    
    @property
    def risks(self):
        """Retourne les risques du projet"""
        return self.risk_set.all()


class ProjectMembership(models.Model):
    """
    Modèle pour les membres d'équipe de projet
    """
    ROLE_CHOICES = [
        ('member', 'Membre'),
        ('lead', 'Chef de projet'),
        ('developer', 'Développeur'),
        ('designer', 'Designer'),
        ('tester', 'Testeur'),
        ('analyst', 'Analyste'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'projects_projectmembership'
        unique_together = ['project', 'user']
        verbose_name = 'Membre de Projet'
        verbose_name_plural = 'Membres de Projet'


class Task(models.Model):
    """
    Modèle de tâche
    Compatible avec l'interface Task du frontend
    """
    STATUS_CHOICES = [
        ('To Do', 'À Faire'),
        ('In Progress', 'En Cours'),
        ('Done', 'Terminé'),
        ('Blocked', 'Bloqué'),
    ]
    
    PRIORITY_CHOICES = [
        ('Low', 'Faible'),
        ('Medium', 'Moyen'),
        ('High', 'Élevé'),
        ('Critical', 'Critique'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='To Do')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Medium')
    
    # Relations
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='assigned_tasks')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    
    # Dates et temps
    due_date = models.DateTimeField(blank=True, null=True)
    estimated_time = models.PositiveIntegerField(blank=True, null=True, help_text="Temps estimé en minutes")
    logged_time = models.PositiveIntegerField(default=0, help_text="Temps enregistré en minutes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Métadonnées
    tags = models.JSONField(default=list, blank=True)
    dependencies = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='dependents')
    
    class Meta:
        db_table = 'projects_task'
        verbose_name = 'Tâche'
        verbose_name_plural = 'Tâches'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['assignee']),
            models.Index(fields=['due_date']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.project.title}"


class Risk(models.Model):
    """
    Modèle de risque de projet
    Compatible avec l'interface Risk du frontend
    """
    LIKELIHOOD_CHOICES = [
        ('Low', 'Faible'),
        ('Medium', 'Moyen'),
        ('High', 'Élevé'),
    ]
    
    IMPACT_CHOICES = [
        ('Low', 'Faible'),
        ('Medium', 'Moyen'),
        ('High', 'Élevé'),
    ]
    
    STATUS_CHOICES = [
        ('Identified', 'Identifié'),
        ('Assessed', 'Évalué'),
        ('Mitigated', 'Atténué'),
        ('Closed', 'Fermé'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    likelihood = models.CharField(max_length=10, choices=LIKELIHOOD_CHOICES)
    impact = models.CharField(max_length=10, choices=IMPACT_CHOICES)
    mitigation_strategy = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Identified')
    
    # Métadonnées
    identified_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='identified_risks')
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='owned_risks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'projects_risk'
        verbose_name = 'Risque'
        verbose_name_plural = 'Risques'
        indexes = [
            models.Index(fields=['likelihood']),
            models.Index(fields=['impact']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.project.title}"
    
    @property
    def risk_score(self):
        """Calcule le score de risque"""
        likelihood_scores = {'Low': 1, 'Medium': 2, 'High': 3}
        impact_scores = {'Low': 1, 'Medium': 2, 'High': 3}
        return likelihood_scores.get(self.likelihood, 1) * impact_scores.get(self.impact, 1)


class ProjectFile(models.Model):
    """
    Modèle pour les fichiers de projet
    """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='files')
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='projects/files/')
    description = models.TextField(blank=True, null=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_size = models.PositiveIntegerField()
    file_type = models.CharField(max_length=50)
    
    class Meta:
        db_table = 'projects_projectfile'
        verbose_name = 'Fichier de Projet'
        verbose_name_plural = 'Fichiers de Projet'
    
    def __str__(self):
        return f"{self.name} - {self.project.title}"
