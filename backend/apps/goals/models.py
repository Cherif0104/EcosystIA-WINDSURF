"""
Modèles pour la gestion des objectifs OKR
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class Goal(models.Model):
    """
    Objectifs (Objectives dans OKR)
    """
    TYPE_CHOICES = [
        ('Personal', 'Personnel'),
        ('Team', 'Équipe'),
        ('Company', 'Entreprise'),
        ('Project', 'Projet'),
    ]
    
    STATUS_CHOICES = [
        ('Draft', 'Brouillon'),
        ('Active', 'Actif'),
        ('Completed', 'Terminé'),
        ('Cancelled', 'Annulé'),
        ('On Hold', 'En Pause'),
    ]
    
    PRIORITY_CHOICES = [
        ('Low', 'Faible'),
        ('Medium', 'Moyen'),
        ('High', 'Élevé'),
        ('Critical', 'Critique'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='Personal')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Medium')
    
    # Dates
    start_date = models.DateField()
    target_date = models.DateField()
    completed_date = models.DateField(blank=True, null=True)
    
    # Progression
    progress = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Progression en pourcentage"
    )
    
    # Relations
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_goals')
    assignees = models.ManyToManyField(User, related_name='assigned_goals', blank=True)
    parent_goal = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='sub_goals')
    project = models.ForeignKey('apps.projects.Project', on_delete=models.SET_NULL, blank=True, null=True)
    
    # Métadonnées
    tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'goals_goal'
        verbose_name = 'Objectif'
        verbose_name_plural = 'Objectifs'
        indexes = [
            models.Index(fields=['owner', 'status']),
            models.Index(fields=['type', 'priority']),
            models.Index(fields=['start_date', 'target_date']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"
    
    @property
    def is_overdue(self):
        """Vérifie si l'objectif est en retard"""
        return (
            self.target_date < timezone.now().date() and 
            self.status not in ['Completed', 'Cancelled']
        )
    
    @property
    def days_remaining(self):
        """Nombre de jours restants"""
        if self.status in ['Completed', 'Cancelled']:
            return 0
        
        delta = self.target_date - timezone.now().date()
        return max(0, delta.days)
    
    @property
    def completion_rate(self):
        """Taux de completion basé sur les key results"""
        key_results = self.key_results.all()
        if not key_results:
            return self.progress
        
        total_progress = sum(kr.progress for kr in key_results)
        return total_progress / len(key_results)
    
    def update_progress(self):
        """Met à jour la progression basée sur les key results"""
        self.progress = int(self.completion_rate)
        
        # Marquer comme terminé si 100%
        if self.progress >= 100 and self.status == 'Active':
            self.status = 'Completed'
            self.completed_date = timezone.now().date()
        
        self.save()
    
    def add_key_result(self, title, target_value, unit=''):
        """Ajoute un résultat clé"""
        return KeyResult.objects.create(
            goal=self,
            title=title,
            target_value=target_value,
            unit=unit,
            created_by=self.owner
        )


class KeyResult(models.Model):
    """
    Résultats clés (Key Results dans OKR)
    """
    STATUS_CHOICES = [
        ('Not Started', 'Non Commencé'),
        ('In Progress', 'En Cours'),
        ('Completed', 'Terminé'),
        ('Failed', 'Échoué'),
    ]
    
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='key_results')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Not Started')
    
    # Métriques
    target_value = models.DecimalField(max_digits=12, decimal_places=2)
    current_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    unit = models.CharField(max_length=50, blank=True, null=True, help_text="Unité de mesure")
    
    # Progression
    progress = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Dates
    start_date = models.DateField(blank=True, null=True)
    target_date = models.DateField(blank=True, null=True)
    completed_date = models.DateField(blank=True, null=True)
    
    # Relations
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_key_results')
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='assigned_key_results')
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'goals_keyresult'
        verbose_name = 'Résultat Clé'
        verbose_name_plural = 'Résultats Clés'
        indexes = [
            models.Index(fields=['goal', 'status']),
            models.Index(fields=['assignee']),
            models.Index(fields=['target_date']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.current_value}/{self.target_value}"
    
    @property
    def completion_percentage(self):
        """Calcule le pourcentage de completion"""
        if self.target_value > 0:
            return min(100, (self.current_value / self.target_value) * 100)
        return 0
    
    @property
    def is_overdue(self):
        """Vérifie si le résultat clé est en retard"""
        return (
            self.target_date and 
            self.target_date < timezone.now().date() and 
            self.status not in ['Completed', 'Failed']
        )
    
    def update_progress(self, new_value):
        """Met à jour la progression"""
        self.current_value = new_value
        self.progress = int(self.completion_percentage)
        
        # Marquer comme terminé si objectif atteint
        if self.current_value >= self.target_value:
            self.status = 'Completed'
            self.completed_date = timezone.now().date()
        elif self.current_value > 0 and self.status == 'Not Started':
            self.status = 'In Progress'
            self.start_date = timezone.now().date()
        
        self.save()
        
        # Mettre à jour l'objectif parent
        self.goal.update_progress()


class GoalUpdate(models.Model):
    """
    Mises à jour des objectifs
    """
    UPDATE_TYPE_CHOICES = [
        ('Progress', 'Progression'),
        ('Comment', 'Commentaire'),
        ('Status Change', 'Changement de Statut'),
        ('Key Result Update', 'Mise à jour Résultat Clé'),
    ]
    
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='updates')
    key_result = models.ForeignKey(KeyResult, on_delete=models.CASCADE, blank=True, null=True, related_name='updates')
    
    update_type = models.CharField(max_length=20, choices=UPDATE_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Données de progression
    old_value = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    new_value = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    
    # Métadonnées
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goal_updates')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'goals_goalupdate'
        verbose_name = 'Mise à jour Objectif'
        verbose_name_plural = 'Mises à jour Objectifs'
        indexes = [
            models.Index(fields=['goal', 'created_at']),
            models.Index(fields=['update_type']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.goal.title} - {self.title}"


class GoalTemplate(models.Model):
    """
    Templates d'objectifs pour faciliter la création
    """
    CATEGORY_CHOICES = [
        ('Sales', 'Ventes'),
        ('Marketing', 'Marketing'),
        ('Development', 'Développement'),
        ('HR', 'Ressources Humaines'),
        ('Finance', 'Finance'),
        ('Operations', 'Opérations'),
        ('Customer Success', 'Succès Client'),
        ('General', 'Général'),
    ]
    
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField()
    
    # Template data
    goal_template = models.JSONField(help_text="Structure JSON du template d'objectif")
    key_results_template = models.JSONField(help_text="Templates des résultats clés")
    
    # Métadonnées
    is_public = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_goal_templates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'goals_goaltemplate'
        verbose_name = 'Template Objectif'
        verbose_name_plural = 'Templates Objectifs'
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['is_public']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.get_category_display()}"
    
    def create_goal_from_template(self, user, **kwargs):
        """Crée un objectif basé sur ce template"""
        goal_data = self.goal_template.copy()
        goal_data.update(kwargs)
        
        goal = Goal.objects.create(
            owner=user,
            **goal_data
        )
        
        # Créer les key results
        for kr_template in self.key_results_template:
            KeyResult.objects.create(
                goal=goal,
                created_by=user,
                **kr_template
            )
        
        return goal


class GoalMilestone(models.Model):
    """
    Jalons des objectifs
    """
    STATUS_CHOICES = [
        ('Pending', 'En Attente'),
        ('Completed', 'Terminé'),
        ('Missed', 'Manqué'),
    ]
    
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    # Dates
    target_date = models.DateField()
    completed_date = models.DateField(blank=True, null=True)
    
    # Progression
    target_progress = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Progression cible à cette étape"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'goals_goalmilestone'
        verbose_name = 'Jalon Objectif'
        verbose_name_plural = 'Jalons Objectifs'
        indexes = [
            models.Index(fields=['goal', 'target_date']),
            models.Index(fields=['status']),
        ]
        ordering = ['target_date']
    
    def __str__(self):
        return f"{self.goal.title} - {self.title}"
    
    @property
    def is_overdue(self):
        """Vérifie si le jalon est en retard"""
        return (
            self.target_date < timezone.now().date() and 
            self.status == 'Pending'
        )
    
    def mark_completed(self):
        """Marque le jalon comme terminé"""
        self.status = 'Completed'
        self.completed_date = timezone.now().date()
        self.save()
    
    def check_auto_completion(self):
        """Vérifie si le jalon doit être marqué comme terminé automatiquement"""
        if self.goal.progress >= self.target_progress and self.status == 'Pending':
            self.mark_completed()


class OKRCycle(models.Model):
    """
    Cycles OKR (trimestriels, annuels)
    """
    CYCLE_TYPE_CHOICES = [
        ('Quarterly', 'Trimestriel'),
        ('Semi-Annual', 'Semestriel'),
        ('Annual', 'Annuel'),
    ]
    
    STATUS_CHOICES = [
        ('Planning', 'Planification'),
        ('Active', 'Actif'),
        ('Review', 'Révision'),
        ('Closed', 'Fermé'),
    ]
    
    name = models.CharField(max_length=200)
    cycle_type = models.CharField(max_length=20, choices=CYCLE_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Planning')
    
    # Dates
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Relations
    goals = models.ManyToManyField(Goal, related_name='okr_cycles', blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_okr_cycles')
    
    # Métadonnées
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'goals_okrcycle'
        verbose_name = 'Cycle OKR'
        verbose_name_plural = 'Cycles OKR'
        indexes = [
            models.Index(fields=['cycle_type', 'status']),
            models.Index(fields=['start_date', 'end_date']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.get_cycle_type_display()}"
    
    @property
    def overall_progress(self):
        """Progression globale du cycle"""
        cycle_goals = self.goals.all()
        if not cycle_goals:
            return 0
        
        total_progress = sum(goal.completion_rate for goal in cycle_goals)
        return total_progress / len(cycle_goals)
    
    @property
    def is_current(self):
        """Vérifie si le cycle est actuel"""
        today = timezone.now().date()
        return self.start_date <= today <= self.end_date
    
    def generate_review_report(self):
        """Génère un rapport de révision du cycle"""
        goals = self.goals.all()
        
        report_data = {
            'cycle_name': self.name,
            'period': f"{self.start_date} - {self.end_date}",
            'overall_progress': self.overall_progress,
            'goals_summary': [],
            'key_insights': [],
        }
        
        for goal in goals:
            goal_summary = {
                'title': goal.title,
                'status': goal.status,
                'progress': goal.completion_rate,
                'key_results_count': goal.key_results.count(),
                'completed_key_results': goal.key_results.filter(status='Completed').count(),
            }
            report_data['goals_summary'].append(goal_summary)
        
        return report_data
