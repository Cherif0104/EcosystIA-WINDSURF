"""
Utilitaires de cache pour EcosystIA
"""

from django.core.cache import cache
from django.conf import settings
from functools import wraps
import hashlib
import json


def cache_key_generator(prefix, *args, **kwargs):
    """
    Génère une clé de cache unique basée sur les arguments
    """
    # Créer une chaîne unique à partir des arguments
    key_data = {
        'args': args,
        'kwargs': sorted(kwargs.items())
    }
    
    key_string = json.dumps(key_data, sort_keys=True, default=str)
    key_hash = hashlib.md5(key_string.encode()).hexdigest()
    
    return f"{prefix}:{key_hash}"


def cached_view(timeout=300, key_prefix='view'):
    """
    Décorateur pour mettre en cache les résultats de vue
    
    Args:
        timeout: Durée de cache en secondes (défaut: 5 minutes)
        key_prefix: Préfixe pour la clé de cache
    """
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            # Générer la clé de cache
            cache_key = cache_key_generator(
                f"{key_prefix}:{func.__name__}",
                request.path,
                request.GET.dict(),
                *args,
                **kwargs
            )
            
            # Essayer de récupérer depuis le cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Exécuter la fonction et mettre en cache
            result = func(request, *args, **kwargs)
            cache.set(cache_key, result, timeout)
            
            return result
        
        return wrapper
    return decorator


def cached_method(timeout=300, key_prefix='method'):
    """
    Décorateur pour mettre en cache les résultats de méthode
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            # Générer la clé de cache incluant l'ID de l'instance
            instance_id = getattr(self, 'id', 'no_id')
            cache_key = cache_key_generator(
                f"{key_prefix}:{self.__class__.__name__}:{instance_id}:{func.__name__}",
                *args,
                **kwargs
            )
            
            # Essayer de récupérer depuis le cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Exécuter la fonction et mettre en cache
            result = func(self, *args, **kwargs)
            cache.set(cache_key, result, timeout)
            
            return result
        
        return wrapper
    return decorator


class CacheManager:
    """
    Gestionnaire de cache pour les opérations communes
    """
    
    @staticmethod
    def get_or_set(key, callable_func, timeout=300):
        """
        Récupère une valeur du cache ou l'exécute et la stocke
        """
        result = cache.get(key)
        if result is None:
            result = callable_func()
            cache.set(key, result, timeout)
        return result
    
    @staticmethod
    def invalidate_pattern(pattern):
        """
        Invalide toutes les clés correspondant à un pattern
        Note: Nécessite Redis comme backend de cache
        """
        try:
            from django_redis import get_redis_connection
            redis_conn = get_redis_connection("default")
            
            keys = redis_conn.keys(f"{settings.CACHES['default']['KEY_PREFIX']}:{pattern}*")
            if keys:
                redis_conn.delete(*keys)
                
        except ImportError:
            # Fallback si django-redis n'est pas disponible
            pass
    
    @staticmethod
    def warm_cache():
        """
        Pré-remplit le cache avec des données fréquemment utilisées
        """
        from apps.users.models import User
        from apps.courses.models import Course
        
        # Cache des statistiques générales
        cache.set('stats:total_users', User.objects.count(), timeout=3600)
        cache.set('stats:published_courses', Course.objects.filter(status='Published').count(), timeout=3600)
        
        # Cache des données de navigation
        popular_courses = Course.objects.filter(status='Published').order_by('-enrollment_count')[:10]
        cache.set('popular_courses', list(popular_courses.values()), timeout=1800)


def cache_user_stats(user_id, timeout=900):
    """
    Met en cache les statistiques d'un utilisateur
    """
    def get_stats():
        from apps.users.models import User
        from apps.projects.models import Project
        from apps.courses.models import CourseEnrollment
        
        try:
            user = User.objects.get(id=user_id)
            return {
                'projects_count': Project.objects.filter(created_by=user).count(),
                'enrollments_count': CourseEnrollment.objects.filter(user=user).count(),
                'last_activity': user.last_activity.isoformat() if user.last_activity else None,
            }
        except User.DoesNotExist:
            return {}
    
    cache_key = f"user_stats:{user_id}"
    return CacheManager.get_or_set(cache_key, get_stats, timeout)


def cache_course_data(course_id, timeout=1800):
    """
    Met en cache les données d'un cours
    """
    def get_course_data():
        from apps.courses.models import Course
        
        try:
            course = Course.objects.select_related('instructor').prefetch_related(
                'module_set__lesson_set'
            ).get(id=course_id)
            
            return {
                'title': course.title,
                'instructor': course.instructor.get_full_name(),
                'modules_count': course.module_set.count(),
                'lessons_count': sum(module.lesson_set.count() for module in course.module_set.all()),
                'enrollment_count': course.enrollment_count,
                'rating': course.rating,
            }
        except Course.DoesNotExist:
            return {}
    
    cache_key = f"course_data:{course_id}"
    return CacheManager.get_or_set(cache_key, get_course_data, timeout)


def invalidate_user_cache(user_id):
    """
    Invalide le cache d'un utilisateur
    """
    cache_keys = [
        f"user_stats:{user_id}",
        f"user_projects:{user_id}",
        f"user_enrollments:{user_id}",
    ]
    
    cache.delete_many(cache_keys)


def invalidate_course_cache(course_id):
    """
    Invalide le cache d'un cours
    """
    cache_keys = [
        f"course_data:{course_id}",
        f"course_modules:{course_id}",
        f"course_stats:{course_id}",
    ]
    
    cache.delete_many(cache_keys)


# Décorateurs prêts à l'emploi
cache_5min = cached_view(timeout=300, key_prefix='5min')
cache_15min = cached_view(timeout=900, key_prefix='15min')
cache_1hour = cached_view(timeout=3600, key_prefix='1hour')

cache_method_5min = cached_method(timeout=300, key_prefix='method_5min')
cache_method_15min = cached_method(timeout=900, key_prefix='method_15min')
cache_method_1hour = cached_method(timeout=3600, key_prefix='method_1hour')
