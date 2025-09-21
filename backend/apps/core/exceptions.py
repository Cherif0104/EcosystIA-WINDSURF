"""
Gestionnaire d'exceptions personnalisé pour EcosystIA
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.http import Http404
from django.db import IntegrityError
import logging

logger = logging.getLogger('ecosystia')


def custom_exception_handler(exc, context):
    """
    Gestionnaire d'exceptions personnalisé pour une meilleure expérience utilisateur
    """
    # Appeler le gestionnaire par défaut de DRF
    response = exception_handler(exc, context)
    
    # Récupérer les informations de contexte
    request = context.get('request')
    view = context.get('view')
    
    # Logging de l'erreur
    if response is not None:
        logger.error(
            f"API Error: {exc.__class__.__name__} - {str(exc)} - "
            f"Path: {request.path if request else 'Unknown'} - "
            f"User: {request.user if request and request.user.is_authenticated else 'Anonymous'}"
        )
    
    # Personnaliser la réponse selon le type d'exception
    if response is not None:
        custom_response_data = {
            'error': True,
            'message': 'Une erreur est survenue',
            'details': None,
            'code': response.status_code,
            'timestamp': None
        }
        
        # Ajouter timestamp
        from django.utils import timezone
        custom_response_data['timestamp'] = timezone.now().isoformat()
        
        # Personnaliser selon le type d'erreur
        if response.status_code == 400:  # Bad Request
            custom_response_data['message'] = 'Données invalides'
            custom_response_data['details'] = response.data
            
        elif response.status_code == 401:  # Unauthorized
            custom_response_data['message'] = 'Authentification requise'
            custom_response_data['details'] = 'Veuillez vous connecter pour accéder à cette ressource'
            
        elif response.status_code == 403:  # Forbidden
            custom_response_data['message'] = 'Accès refusé'
            custom_response_data['details'] = 'Vous n\'avez pas les permissions nécessaires'
            
        elif response.status_code == 404:  # Not Found
            custom_response_data['message'] = 'Ressource introuvable'
            custom_response_data['details'] = 'La ressource demandée n\'existe pas'
            
        elif response.status_code == 405:  # Method Not Allowed
            custom_response_data['message'] = 'Méthode non autorisée'
            custom_response_data['details'] = f'La méthode {request.method} n\'est pas autorisée pour cette ressource'
            
        elif response.status_code == 429:  # Too Many Requests
            custom_response_data['message'] = 'Trop de requêtes'
            custom_response_data['details'] = 'Veuillez réessayer dans quelques instants'
            
        elif response.status_code >= 500:  # Server Error
            custom_response_data['message'] = 'Erreur interne du serveur'
            custom_response_data['details'] = 'Une erreur technique est survenue. Notre équipe a été notifiée.'
            
        response.data = custom_response_data
        
    # Gérer les exceptions Django non traitées par DRF
    elif isinstance(exc, ValidationError):
        custom_response_data = {
            'error': True,
            'message': 'Erreur de validation',
            'details': exc.message_dict if hasattr(exc, 'message_dict') else str(exc),
            'code': 400,
            'timestamp': timezone.now().isoformat()
        }
        response = Response(custom_response_data, status=status.HTTP_400_BAD_REQUEST)
        
    elif isinstance(exc, IntegrityError):
        from django.utils import timezone
        custom_response_data = {
            'error': True,
            'message': 'Erreur d\'intégrité des données',
            'details': 'Une contrainte de base de données a été violée',
            'code': 400,
            'timestamp': timezone.now().isoformat()
        }
        response = Response(custom_response_data, status=status.HTTP_400_BAD_REQUEST)
        
    elif isinstance(exc, Http404):
        from django.utils import timezone
        custom_response_data = {
            'error': True,
            'message': 'Page non trouvée',
            'details': 'La ressource demandée n\'existe pas',
            'code': 404,
            'timestamp': timezone.now().isoformat()
        }
        response = Response(custom_response_data, status=status.HTTP_404_NOT_FOUND)
    
    return response


class BusinessLogicError(Exception):
    """
    Exception personnalisée pour les erreurs de logique métier
    """
    def __init__(self, message, code=None, details=None):
        self.message = message
        self.code = code or 'BUSINESS_ERROR'
        self.details = details
        super().__init__(self.message)


class ValidationError(Exception):
    """
    Exception personnalisée pour les erreurs de validation
    """
    def __init__(self, message, field=None, code=None):
        self.message = message
        self.field = field
        self.code = code or 'VALIDATION_ERROR'
        super().__init__(self.message)


class PermissionError(Exception):
    """
    Exception personnalisée pour les erreurs de permissions
    """
    def __init__(self, message, required_permission=None):
        self.message = message
        self.required_permission = required_permission
        super().__init__(self.message)


class RateLimitError(Exception):
    """
    Exception personnalisée pour les erreurs de limite de taux
    """
    def __init__(self, message, retry_after=None):
        self.message = message
        self.retry_after = retry_after
        super().__init__(self.message)
