"""
Configuration de développement pour EcosystIA
"""

import sys

from .base import *

# Debug activé en développement
DEBUG = True

# Tous les hosts autorisés en développement
ALLOWED_HOSTS = ['*']

# Configuration de base de données SQLite pour le développement local
if os.environ.get('USE_SQLITE', 'False').lower() == 'true':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Cache en mémoire pour le développement
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# CORS autorisé pour tous les origines en développement
CORS_ALLOW_ALL_ORIGINS = True

# Logging simplifié pour le développement
LOGGING['handlers']['console']['level'] = 'DEBUG'
LOGGING['loggers']['ecosystia']['level'] = 'DEBUG'

# Email en console pour le développement
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Désactiver la sécurité HTTPS en développement
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False

# Configuration Django Debug Toolbar (optionnel)
if DEBUG:
    try:
        import debug_toolbar
        INSTALLED_APPS += ['debug_toolbar']
        MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
        INTERNAL_IPS = ['127.0.0.1', 'localhost']
    except ImportError:
        pass

# Configuration pour les tests
if 'test' in sys.argv:
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:'
    }
    PASSWORD_HASHERS = [
        'django.contrib.auth.hashers.MD5PasswordHasher',
    ]
