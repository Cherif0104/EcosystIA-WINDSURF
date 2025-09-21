
"""
Modèles pour la gestion des emplois EcosystIA
Compatible avec les types TypeScript du frontend
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Job(models.Model):
    """
    Modèle d'emploi
    Compatible avec l'interface Job du frontend
    """
    TYPE_CHOICES = [
        ('Full-time', 'Temps Plein'),
        ('Part-time', 'Temps Partiel'),
        ('Contract', 'Contrat'),
        ('Internship', 'Stage'),
        ('Freelance', 'Freelance'),
    ]
    
    STATUS_CHOICES = [
        ('Draft', 'Brouillon'),
        ('Published', 'Publié'),
        ('Closed', 'Fermé'),
        ('Archived', 'Archivé'),
    ]
    
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='Full-time')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    
    # Description et exigences
    description = models.TextField()
    requirements = models.TextField(blank=True, null=True)
    benefits = models.TextField(blank=True, null=True)
    required_skills = models.JSONField(default=list, blank=True)
    
    # Informations financières
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    currency = models.CharField(max_length=3, default='XOF')
    
    # Métadonnées
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs')
    posted_date = models.DateTimeField(auto_now_add=True)
    application_deadline = models.DateTimeField(blank=True, null=True)
    
    # Statistiques
    view_count = models.PositiveIntegerField(default=0)
    application_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'jobs_job'
        verbose_name = 'Emploi'
        verbose_name_plural = 'Emplois'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['type']),
            models.Index(fields=['location']),
            models.Index(fields=['posted_date']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.company}"
    
    @property
    def applicants(self):
        """Retourne les candidats pour cet emploi"""
        return User.objects.filter(jobapplication__job=self)


class JobApplication(models.Model):
    """
    Modèle de candidature à un emploi
    """
    STATUS_CHOICES = [
        ('Applied', 'Candidaté'),
        ('Under Review', 'En Cours d\'Examen'),
        ('Interview Scheduled', 'Entretien Programmée'),
        ('Interviewed', 'Entretien Effectué'),
        ('Accepted', 'Accepté'),
        ('Rejected', 'Rejeté'),
        ('Withdrawn', 'Retiré'),
    ]
    
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Applied')
    
    # Documents de candidature
    cover_letter = models.TextField(blank=True, null=True)
    resume_url = models.URLField(blank=True, null=True)
    portfolio_url = models.URLField(blank=True, null=True)
    
    # Métadonnées
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, null=True)
    
    # Évaluation
    rating = models.PositiveIntegerField(blank=True, null=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    feedback = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'jobs_jobapplication'
        verbose_name = 'Candidature'
        verbose_name_plural = 'Candidatures'
        unique_together = ['job', 'applicant']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['applied_at']),
        ]
    
    def __str__(self):
        return f"{self.applicant.get_full_name()} - {self.job.title}"


class JobCategory(models.Model):
    """
    Catégorie d'emploi
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=100, default='fas fa-briefcase')
    is_active = models.BooleanField(default=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'jobs_jobcategory'
        verbose_name = 'Catégorie d\'Emploi'
        verbose_name_plural = 'Catégories d\'Emplois'
    
    def __str__(self):
        return self.name


class JobBookmark(models.Model):
    """
    Emplois sauvegardés par les utilisateurs
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarked_jobs')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'jobs_jobbookmark'
        verbose_name = 'Emploi Sauvegardé'
        verbose_name_plural = 'Emplois Sauvegardés'
        unique_together = ['user', 'job']
        indexes = [
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.job.title}"
 def __str__(self):
        return f"{self.user.get_full_name()} - {self.job.title}"
