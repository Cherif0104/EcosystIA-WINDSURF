"""
Configuration de l'app Core
"""

from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'
    verbose_name = 'Core Utilities'
    
    def ready(self):
        """
        Code à exécuter au démarrage de l'application
        """
        # Importer les signaux si nécessaire
        # import apps.core.signals
        pass
