"""
Configuration WSGI pour EcosystIA.

Ce module expose l'application WSGI comme une variable au niveau du module nommée
``application``.

Pour plus d'informations sur ce fichier, voir
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecosystia.settings.production')

application = get_wsgi_application()
