"""
Middleware personnalisés pour EcosystIA
"""

import time
import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone
from apps.users.models import UserActivity

logger = logging.getLogger('ecosystia')


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware pour logger les requêtes API
    """
    
    def process_request(self, request):
        request.start_time = time.time()
        return None
    
    def process_response(self, request, response):
        # Calculer le temps de traitement
        if hasattr(request, 'start_time'):
            processing_time = time.time() - request.start_time
        else:
            processing_time = 0
        
        # Logger seulement les requêtes API
        if request.path.startswith('/api/'):
            logger.info(
                f"API Request: {request.method} {request.path} - "
                f"Status: {response.status_code} - "
                f"User: {request.user if request.user.is_authenticated else 'Anonymous'} - "
                f"IP: {self.get_client_ip(request)} - "
                f"Time: {processing_time:.3f}s"
            )
            
            # Ajouter les headers de performance
            response['X-Processing-Time'] = f"{processing_time:.3f}s"
            response['X-Timestamp'] = timezone.now().isoformat()
        
        return response
    
    def get_client_ip(self, request):
        """Récupère l'IP réelle du client"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware pour ajouter des headers de sécurité
    """
    
    def process_response(self, request, response):
        # Headers de sécurité
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Content Security Policy pour les APIs
        if request.path.startswith('/api/'):
            response['Content-Security-Policy'] = "default-src 'none'"
        
        # Headers CORS personnalisés
        if settings.DEBUG:
            response['Access-Control-Allow-Origin'] = '*'
        
        return response


class UserActivityMiddleware(MiddlewareMixin):
    """
    Middleware pour tracker l'activité des utilisateurs
    """
    
    def process_request(self, request):
        # Mettre à jour la dernière activité pour les utilisateurs connectés
        if request.user.is_authenticated and request.path.startswith('/api/'):
            # Éviter de mettre à jour à chaque requête (cache de 5 minutes)
            cache_key = f"last_activity_{request.user.id}"
            if not cache.get(cache_key):
                request.user.update_last_activity()
                cache.set(cache_key, True, timeout=300)  # 5 minutes
        
        return None


class APIVersionMiddleware(MiddlewareMixin):
    """
    Middleware pour gérer les versions d'API
    """
    
    def process_request(self, request):
        # Ajouter la version d'API dans le contexte
        if request.path.startswith('/api/'):
            # Extraire la version de l'URL (ex: /api/v1/...)
            path_parts = request.path.split('/')
            if len(path_parts) >= 3 and path_parts[2].startswith('v'):
                request.api_version = path_parts[2]
            else:
                request.api_version = 'v1'  # Version par défaut
        
        return None
    
    def process_response(self, request, response):
        # Ajouter la version dans les headers
        if hasattr(request, 'api_version'):
            response['X-API-Version'] = request.api_version
        
        return response


class MaintenanceMiddleware(MiddlewareMixin):
    """
    Middleware pour gérer le mode maintenance
    """
    
    def process_request(self, request):
        # Vérifier si le mode maintenance est activé
        maintenance_mode = cache.get('maintenance_mode', False)
        
        if maintenance_mode:
            # Autoriser les administrateurs
            if request.user.is_authenticated and request.user.is_staff:
                return None
            
            # Autoriser certaines URLs (health check, admin)
            allowed_paths = ['/health/', '/admin/']
            if any(request.path.startswith(path) for path in allowed_paths):
                return None
            
            # Retourner une réponse de maintenance pour les APIs
            if request.path.startswith('/api/'):
                return JsonResponse({
                    'error': True,
                    'message': 'Maintenance en cours',
                    'details': 'La plateforme est temporairement indisponible pour maintenance. Veuillez réessayer dans quelques instants.',
                    'code': 503,
                    'timestamp': timezone.now().isoformat()
                }, status=503)
        
        return None


class RateLimitMiddleware(MiddlewareMixin):
    """
    Middleware pour implémenter un rate limiting global
    """
    
    def process_request(self, request):
        # Appliquer le rate limiting seulement aux APIs
        if not request.path.startswith('/api/'):
            return None
        
        # Obtenir l'identifiant (IP ou user ID)
        if request.user.is_authenticated:
            identifier = f"user_{request.user.id}"
        else:
            identifier = f"ip_{self.get_client_ip(request)}"
        
        # Vérifier la limite globale (par exemple 1000 requêtes/heure)
        cache_key = f"global_rate_limit_{identifier}"
        current_hour = int(time.time() // 3600)
        rate_key = f"{cache_key}_{current_hour}"
        
        current_count = cache.get(rate_key, 0)
        limit = 1000  # 1000 requêtes par heure
        
        if current_count >= limit:
            return JsonResponse({
                'error': True,
                'message': 'Limite de requêtes dépassée',
                'details': f'Vous avez dépassé la limite de {limit} requêtes par heure.',
                'code': 429,
                'timestamp': timezone.now().isoformat()
            }, status=429)
        
        # Incrémenter le compteur
        cache.set(rate_key, current_count + 1, timeout=3600)
        
        return None
    
    def get_client_ip(self, request):
        """Récupère l'IP réelle du client"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class CacheControlMiddleware(MiddlewareMixin):
    """
    Middleware pour gérer le cache des réponses API
    """
    
    def process_response(self, request, response):
        if request.path.startswith('/api/'):
            # Pas de cache pour les APIs par défaut (données dynamiques)
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            
            # Exception pour certaines ressources statiques
            static_endpoints = ['/api/v1/courses/', '/api/v1/jobs/']
            if any(request.path.startswith(endpoint) for endpoint in static_endpoints) and request.method == 'GET':
                response['Cache-Control'] = 'public, max-age=300'  # 5 minutes
        
        return response
