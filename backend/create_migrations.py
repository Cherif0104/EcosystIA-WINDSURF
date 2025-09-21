#!/usr/bin/env python
"""
Script pour créer toutes les migrations manquantes
"""

import os
import sys
import django
from django.core.management import call_command
from django.conf import settings

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecosystia.settings.development')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

django.setup()

def create_all_migrations():
    """Créer toutes les migrations manquantes"""
    
    # Apps avec modèles qui nécessitent des migrations
    apps_to_migrate = [
        'core',
        'ai', 
        'analytics',
        'courses',
        'crm',
        'finance',
        'goals',
        'jobs',
        'knowledge_base',
        'leave_management',
        'meetings',
        'projects',
        'time_tracking',
    ]
    
    print("🚀 Création des migrations pour EcosystIA...")
    print("=" * 60)
    
    for app in apps_to_migrate:
        try:
            print(f"📦 Création des migrations pour {app}...")
            call_command('makemigrations', app, verbosity=1)
            print(f"✅ Migrations créées pour {app}")
        except Exception as e:
            print(f"❌ Erreur pour {app}: {str(e)}")
        print("-" * 40)
    
    print("\n🎯 Tentative d'application des migrations...")
    try:
        call_command('migrate', verbosity=1)
        print("✅ Toutes les migrations appliquées avec succès!")
    except Exception as e:
        print(f"❌ Erreur lors de l'application des migrations: {str(e)}")
        print("💡 Vous devrez peut-être configurer la base de données d'abord")
    
    print("\n🏁 Script terminé!")

if __name__ == "__main__":
    create_all_migrations()
