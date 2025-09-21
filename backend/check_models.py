#!/usr/bin/env python
"""
Script pour vérifier les modèles Django et identifier les problèmes
"""

import os
import sys
import django
from django.conf import settings
from django.apps import apps
from django.core.management import call_command

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecosystia.settings.development')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

django.setup()

def check_models():
    """Vérifier tous les modèles Django"""
    
    print("🔍 Vérification des modèles EcosystIA...")
    print("=" * 60)
    
    # Lister toutes les apps locales
    local_apps = [
        'apps.core',
        'apps.authentication', 
        'apps.users',
        'apps.ai',
        'apps.analytics',
        'apps.courses',
        'apps.crm',
        'apps.finance',
        'apps.goals',
        'apps.jobs',
        'apps.knowledge_base',
        'apps.leave_management',
        'apps.meetings',
        'apps.projects',
        'apps.time_tracking',
    ]
    
    model_count = 0
    
    for app_name in local_apps:
        try:
            app_config = apps.get_app_config(app_name.split('.')[-1])
            models = app_config.get_models()
            
            if models:
                print(f"📦 {app_name}:")
                for model in models:
                    print(f"   ✅ {model.__name__}")
                    model_count += 1
            else:
                print(f"📦 {app_name}: Aucun modèle")
        except Exception as e:
            print(f"❌ Erreur pour {app_name}: {str(e)}")
    
    print("-" * 60)
    print(f"📊 Total: {model_count} modèles trouvés")
    
    # Vérifier les migrations
    print("\n🔍 Vérification des migrations...")
    try:
        call_command('showmigrations', verbosity=1)
    except Exception as e:
        print(f"❌ Erreur showmigrations: {str(e)}")
    
    # Check du système Django
    print("\n🔍 Vérification du système Django...")
    try:
        call_command('check', verbosity=1)
        print("✅ Système Django OK!")
    except Exception as e:
        print(f"❌ Erreur système: {str(e)}")

if __name__ == "__main__":
    check_models()
