"""
Commande de gestion du mode maintenance
"""

from django.core.management.base import BaseCommand
from django.core.cache import cache
from django.utils import timezone


class Command(BaseCommand):
    help = 'Gère le mode maintenance de la plateforme'
    
    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            type=str,
            choices=['on', 'off', 'status'],
            help='Action à effectuer: on (activer), off (désactiver), status (vérifier)'
        )
        
        parser.add_argument(
            '--message',
            type=str,
            default='Maintenance en cours. Veuillez réessayer dans quelques instants.',
            help='Message de maintenance personnalisé'
        )
        
        parser.add_argument(
            '--duration',
            type=int,
            default=3600,
            help='Durée de la maintenance en secondes (par défaut: 1 heure)'
        )
    
    def handle(self, *args, **options):
        action = options['action']
        
        if action == 'on':
            self.enable_maintenance(options['message'], options['duration'])
        elif action == 'off':
            self.disable_maintenance()
        elif action == 'status':
            self.check_status()
    
    def enable_maintenance(self, message, duration):
        """Active le mode maintenance"""
        cache.set('maintenance_mode', True, timeout=duration)
        cache.set('maintenance_message', message, timeout=duration)
        cache.set('maintenance_start', timezone.now().isoformat(), timeout=duration)
        
        self.stdout.write(
            self.style.WARNING(
                f'🔧 Mode maintenance ACTIVÉ pour {duration} secondes'
            )
        )
        self.stdout.write(f'📝 Message: {message}')
    
    def disable_maintenance(self):
        """Désactive le mode maintenance"""
        cache.delete('maintenance_mode')
        cache.delete('maintenance_message')
        cache.delete('maintenance_start')
        
        self.stdout.write(
            self.style.SUCCESS('✅ Mode maintenance DÉSACTIVÉ')
        )
    
    def check_status(self):
        """Vérifie le statut du mode maintenance"""
        is_maintenance = cache.get('maintenance_mode', False)
        
        if is_maintenance:
            message = cache.get('maintenance_message', 'Aucun message')
            start_time = cache.get('maintenance_start', 'Inconnu')
            
            self.stdout.write(
                self.style.WARNING('🔧 Mode maintenance: ACTIF')
            )
            self.stdout.write(f'📝 Message: {message}')
            self.stdout.write(f'⏰ Début: {start_time}')
        else:
            self.stdout.write(
                self.style.SUCCESS('✅ Mode maintenance: INACTIF')
            )
