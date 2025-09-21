"""
Modèles pour les analytics et métriques
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class DashboardWidget(models.Model):
    """
    Widgets personnalisables pour le dashboard
    """
    WIDGET_TYPE_CHOICES = [
        ('chart', 'Graphique'),
        ('metric', 'Métrique'),
        ('table', 'Tableau'),
        ('progress', 'Barre de Progression'),
        ('list', 'Liste'),
    ]
    
    CHART_TYPE_CHOICES = [
        ('line', 'Ligne'),
        ('bar', 'Barres'),
        ('pie', 'Camembert'),
        ('doughnut', 'Donut'),
        ('area', 'Aire'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dashboard_widgets')
    title = models.CharField(max_length=200)
    widget_type = models.CharField(max_length=20, choices=WIDGET_TYPE_CHOICES)
    chart_type = models.CharField(max_length=20, choices=CHART_TYPE_CHOICES, blank=True, null=True)
    
    # Configuration
    data_source = models.CharField(max_length=100, help_text="Source des données (ex: projects, courses, crm)")
    query_params = models.JSONField(default=dict, help_text="Paramètres de requête")
    refresh_interval = models.PositiveIntegerField(default=300, help_text="Intervalle de rafraîchissement en secondes")
    
    # Position et taille
    position_x = models.PositiveIntegerField(default=0)
    position_y = models.PositiveIntegerField(default=0)
    width = models.PositiveIntegerField(default=4)
    height = models.PositiveIntegerField(default=3)
    
    # État
    is_active = models.BooleanField(default=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'analytics_dashboardwidget'
        verbose_name = 'Widget Dashboard'
        verbose_name_plural = 'Widgets Dashboard'
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['data_source']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.title}"


class MetricSnapshot(models.Model):
    """
    Snapshots de métriques pour l'historique
    """
    METRIC_TYPE_CHOICES = [
        ('users', 'Utilisateurs'),
        ('projects', 'Projets'),
        ('courses', 'Cours'),
        ('revenue', 'Revenus'),
        ('expenses', 'Dépenses'),
        ('time_logged', 'Temps Enregistré'),
        ('goals_completion', 'Completion Objectifs'),
    ]
    
    metric_type = models.CharField(max_length=20, choices=METRIC_TYPE_CHOICES)
    metric_name = models.CharField(max_length=100)
    value = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Métadonnées
    date = models.DateField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='metric_snapshots', blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'analytics_metricsnapshot'
        verbose_name = 'Snapshot Métrique'
        verbose_name_plural = 'Snapshots Métriques'
        indexes = [
            models.Index(fields=['metric_type', 'date']),
            models.Index(fields=['user', 'date']),
            models.Index(fields=['date']),
        ]
        unique_together = ['metric_type', 'metric_name', 'date', 'user']
    
    def __str__(self):
        return f"{self.metric_name} - {self.value} - {self.date}"


class AnalyticsReport(models.Model):
    """
    Rapports d'analytics générés
    """
    REPORT_TYPE_CHOICES = [
        ('daily', 'Quotidien'),
        ('weekly', 'Hebdomadaire'),
        ('monthly', 'Mensuel'),
        ('quarterly', 'Trimestriel'),
        ('annual', 'Annuel'),
        ('custom', 'Personnalisé'),
    ]
    
    name = models.CharField(max_length=200)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    
    # Période
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Données
    data = models.JSONField(help_text="Données du rapport")
    
    # Métadonnées
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_analytics_reports')
    generated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'analytics_analyticsreport'
        verbose_name = 'Rapport Analytics'
        verbose_name_plural = 'Rapports Analytics'
        indexes = [
            models.Index(fields=['report_type']),
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['generated_by']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.report_type}"
