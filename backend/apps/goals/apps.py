"""
Configuration de l'app Goals
"""

from django.apps import AppConfig


class GoalsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.goals'
    verbose_name = 'Gestion des Objectifs (OKR)'
