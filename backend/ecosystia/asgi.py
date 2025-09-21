"""
Configuration ASGI pour EcosystIA avec support WebSocket
"""

import os
import django
from django.core.asgi import get_asgi_application

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecosystia.settings.development')
django.setup()

# Import après setup Django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from apps.notifications.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    # Protocole HTTP classique
    "http": get_asgi_application(),
    
    # Protocole WebSocket
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})