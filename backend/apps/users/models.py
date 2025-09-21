"""
Modèles utilisateurs pour EcosystIA
Support de 15 rôles utilisateurs avec permissions granulaires
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone as tz


class User(AbstractUser):
    """
    Modèle utilisateur personnalisé avec 15 rôles
    Compatible avec les types TypeScript du frontend
    """
    
    # Rôles disponibles (correspondent aux types TypeScript)
    ROLE_CHOICES = [
        ('student', 'Étudiant'),
        ('employer', 'Employeur'),
        ('super_administrator', 'Super Administrateur'),
        ('administrator', 'Administrateur'),
        ('manager', 'Manager'),
        ('supervisor', 'Superviseur'),
        ('editor', 'Éditeur'),
        ('entrepreneur', 'Entrepreneur'),
        ('funder', 'Financeur'),
        ('mentor', 'Mentor'),
        ('intern', 'Stagiaire'),
        ('trainer', 'Formateur'),
        ('implementer', 'Implémenteur'),
        ('coach', 'Coach'),
        ('facilitator', 'Facilitateur'),
        ('publisher', 'Éditeur de contenu'),
        ('producer', 'Producteur'),
        ('artist', 'Artiste'),
        ('alumni', 'Ancien élève'),
    ]
    
    # Champs de base
    email = models.EmailField(unique=True)
    avatar = models.URLField(blank=True, null=True, help_text="URL de l'avatar")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    skills = models.JSONField(default=list, help_text="Liste des compétences")
    phone = models.CharField(
        max_length=20, 
        blank=True, 
        null=True,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Format de téléphone invalide")]
    )
    location = models.CharField(max_length=100, blank=True, null=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=100, blank=True, null=True)
    
    # Préférences
    language = models.CharField(max_length=5, default='fr', choices=[('fr', 'Français'), ('en', 'English')])
    timezone = models.CharField(max_length=50, default='Africa/Dakar')
    notifications_enabled = models.BooleanField(default=True)
    
    # Statistiques
    login_count = models.PositiveIntegerField(default=0)
    last_activity = models.DateTimeField(default=tz.now)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users_user'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['created_at']),
            models.Index(fields=['last_activity']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"
    
    def get_full_name(self):
        """Retourne le nom complet de l'utilisateur"""
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    def get_role_display_name(self):
        """Retourne le nom d'affichage du rôle"""
        return dict(self.ROLE_CHOICES).get(self.role, self.role)
    
    def has_role(self, role):
        """Vérifie si l'utilisateur a un rôle spécifique"""
        return self.role == role
    
    def has_any_role(self, roles):
        """Vérifie si l'utilisateur a l'un des rôles spécifiés"""
        return self.role in roles
    
    def is_admin(self):
        """Vérifie si l'utilisateur est un administrateur"""
        return self.role in ['super_administrator', 'administrator']
    
    def is_staff_member(self):
        """Vérifie si l'utilisateur fait partie du staff"""
        return self.role in ['super_administrator', 'administrator', 'manager', 'supervisor']
    
    def update_last_activity(self):
        """Met à jour la dernière activité"""
        self.last_activity = tz.now()
        self.save(update_fields=['last_activity'])
    
    def increment_login_count(self):
        """Incrémente le compteur de connexions"""
        self.login_count += 1
        self.save(update_fields=['login_count'])


class UserProfile(models.Model):
    """
    Profil étendu pour les utilisateurs
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Informations personnelles
    bio = models.TextField(blank=True, null=True, max_length=500)
    birth_date = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, choices=[('M', 'Masculin'), ('F', 'Féminin'), ('O', 'Autre')], blank=True)
    
    # Informations professionnelles
    company = models.CharField(max_length=100, blank=True, null=True)
    job_title = models.CharField(max_length=100, blank=True, null=True)
    experience_years = models.PositiveIntegerField(default=0)
    education_level = models.CharField(max_length=50, blank=True, null=True)
    
    # Réseaux sociaux
    linkedin_url = models.URLField(blank=True, null=True)
    twitter_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    website_url = models.URLField(blank=True, null=True)
    
    # Préférences de notification
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    push_notifications = models.BooleanField(default=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users_userprofile'
        verbose_name = 'Profil Utilisateur'
        verbose_name_plural = 'Profils Utilisateurs'
    
    def __str__(self):
        return f"Profil de {self.user.get_full_name()}"


class UserSession(models.Model):
    """
    Gestion des sessions utilisateurs pour la sécurité
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=40, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'users_usersession'
        verbose_name = 'Session Utilisateur'
        verbose_name_plural = 'Sessions Utilisateurs'
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Session {self.session_key[:8]}... - {self.user.get_full_name()}"


class UserActivity(models.Model):
    """
    Journal des activités utilisateurs pour l'analytics
    """
    ACTION_CHOICES = [
        ('login', 'Connexion'),
        ('logout', 'Déconnexion'),
        ('profile_update', 'Mise à jour profil'),
        ('course_enroll', 'Inscription cours'),
        ('project_create', 'Création projet'),
        ('job_apply', 'Candidature emploi'),
        ('file_upload', 'Upload fichier'),
        ('api_call', 'Appel API'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    description = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'users_useractivity'
        verbose_name = 'Activité Utilisateur'
        verbose_name_plural = 'Activités Utilisateurs'
        indexes = [
            models.Index(fields=['user', 'action']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_action_display()} - {self.created_at}"
