"""
Rate limiting personnalisé pour EcosystIA
"""

from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django.core.cache import cache
from django.conf import settings
import time


class LoginRateThrottle(AnonRateThrottle):
    """
    Rate limiting pour les tentatives de connexion
    """
    scope = 'login'
    rate = '5/min'  # 5 tentatives par minute
    
    def get_cache_key(self, request, view):
        # Utiliser l'IP pour les utilisateurs anonymes
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


class RegistrationRateThrottle(AnonRateThrottle):
    """
    Rate limiting pour les inscriptions
    """
    scope = 'registration'
    rate = '3/hour'  # 3 inscriptions par heure par IP
    
    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


class PasswordResetRateThrottle(AnonRateThrottle):
    """
    Rate limiting pour les réinitialisations de mot de passe
    """
    scope = 'password_reset'
    rate = '3/hour'  # 3 demandes par heure par IP
    
    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


class EmailVerificationRateThrottle(UserRateThrottle):
    """
    Rate limiting pour les demandes de vérification d'email
    """
    scope = 'email_verification'
    rate = '5/hour'  # 5 demandes par heure par utilisateur
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


class ContactImportRateThrottle(UserRateThrottle):
    """
    Rate limiting pour les imports de contacts
    """
    scope = 'contact_import'
    rate = '5/hour'  # 5 imports par heure par utilisateur
    
    def get_cache_key(self, request, view):
        ident = request.user.pk if request.user.is_authenticated else self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


class APICallRateThrottle(UserRateThrottle):
    """
    Rate limiting général pour les appels API
    """
    scope = 'api_calls'
    rate = '1000/hour'  # 1000 appels par heure par utilisateur
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


class BurstRateThrottle(UserRateThrottle):
    """
    Rate limiting pour les pics de trafic
    """
    scope = 'burst'
    rate = '60/min'  # 60 requêtes par minute (burst)
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


def check_rate_limit(key, limit, period):
    """
    Fonction utilitaire pour vérifier les limites de taux personnalisées
    
    Args:
        key: Clé unique pour identifier la ressource/utilisateur
        limit: Nombre maximum de requêtes autorisées
        period: Période en secondes
    
    Returns:
        tuple: (allowed: bool, remaining: int, reset_time: int)
    """
    current_time = int(time.time())
    window_start = current_time - (current_time % period)
    
    cache_key = f"rate_limit:{key}:{window_start}"
    
    try:
        current_count = cache.get(cache_key, 0)
        
        if current_count >= limit:
            return False, 0, window_start + period
        
        # Incrémenter le compteur
        cache.set(cache_key, current_count + 1, timeout=period)
        
        remaining = limit - (current_count + 1)
        return True, remaining, window_start + period
        
    except Exception:
        # En cas d'erreur de cache, autoriser la requête
        return True, limit - 1, window_start + period


class SmartRateThrottle(UserRateThrottle):
    """
    Rate limiting intelligent qui s'adapte selon le comportement utilisateur
    """
    def __init__(self):
        super().__init__()
        self.base_rate = '100/hour'
        self.premium_rate = '500/hour'
        self.admin_rate = '1000/hour'
    
    def get_rate(self):
        """
        Détermine le taux selon le type d'utilisateur
        """
        request = getattr(self, 'request', None)
        if not request or not request.user.is_authenticated:
            return self.base_rate
        
        user = request.user
        
        # Administrateurs : taux élevé
        if user.is_staff or user.role in ['super_administrator', 'administrator']:
            return self.admin_rate
        
        # Utilisateurs premium : taux moyen
        if user.role in ['entrepreneur', 'manager', 'trainer']:
            return self.premium_rate
        
        # Utilisateurs standard : taux de base
        return self.base_rate
    
    def allow_request(self, request, view):
        """
        Détermine si la requête est autorisée
        """
        self.request = request
        return super().allow_request(request, view)
