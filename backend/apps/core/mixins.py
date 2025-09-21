"""
Mixins pour optimiser les performances des vues
"""

from django.db import models
from django.core.cache import cache
from rest_framework import mixins
from rest_framework.response import Response
from .cache import CacheManager


class OptimizedQuerysetMixin:
    """
    Mixin pour optimiser automatiquement les querysets
    """
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Optimisations automatiques basées sur le serializer
        if hasattr(self, 'get_serializer_class'):
            serializer_class = self.get_serializer_class()
            
            # Auto select_related pour les ForeignKey
            if hasattr(serializer_class, 'Meta') and hasattr(serializer_class.Meta, 'model'):
                model = serializer_class.Meta.model
                select_related_fields = []
                prefetch_related_fields = []
                
                for field in model._meta.fields:
                    if isinstance(field, models.ForeignKey):
                        select_related_fields.append(field.name)
                
                for field in model._meta.many_to_many:
                    prefetch_related_fields.append(field.name)
                
                if select_related_fields:
                    queryset = queryset.select_related(*select_related_fields)
                
                if prefetch_related_fields:
                    queryset = queryset.prefetch_related(*prefetch_related_fields)
        
        return queryset


class CachedListMixin:
    """
    Mixin pour mettre en cache les listes
    """
    cache_timeout = 300  # 5 minutes par défaut
    
    def list(self, request, *args, **kwargs):
        # Générer une clé de cache basée sur les paramètres de requête
        cache_key = f"list:{self.__class__.__name__}:{hash(str(sorted(request.GET.items())))}"
        
        # Essayer de récupérer depuis le cache
        cached_response = cache.get(cache_key)
        if cached_response is not None:
            return Response(cached_response)
        
        # Exécuter la vue normale
        response = super().list(request, *args, **kwargs)
        
        # Mettre en cache la réponse
        if response.status_code == 200:
            cache.set(cache_key, response.data, self.cache_timeout)
        
        return response


class BulkOperationMixin:
    """
    Mixin pour les opérations en masse optimisées
    """
    
    def bulk_create_optimized(self, serializer_class, data_list):
        """
        Création en masse optimisée
        """
        objects_to_create = []
        
        for data in data_list:
            serializer = serializer_class(data=data)
            if serializer.is_valid():
                objects_to_create.append(serializer.Meta.model(**serializer.validated_data))
        
        # Création en une seule requête
        created_objects = serializer.Meta.model.objects.bulk_create(
            objects_to_create, 
            batch_size=1000
        )
        
        return created_objects
    
    def bulk_update_optimized(self, queryset, update_data):
        """
        Mise à jour en masse optimisée
        """
        return queryset.bulk_update(update_data, batch_size=1000)


class PaginationOptimizationMixin:
    """
    Mixin pour optimiser la pagination
    """
    
    def paginate_queryset(self, queryset):
        """
        Pagination optimisée qui évite le COUNT() sur de grandes tables
        """
        if not self.paginator:
            return None
        
        # Pour les grandes tables, éviter le count() coûteux
        if hasattr(self.paginator, 'get_paginated_response_with_count'):
            # Utiliser une pagination sans count pour de meilleures performances
            page = self.paginator.paginate_queryset(queryset, self.request, view=self)
            if page is not None:
                # Estimer le nombre total plutôt que de le calculer
                self.paginator.count = None
            return page
        
        return super().paginate_queryset(queryset)


class StatsCacheMixin:
    """
    Mixin pour mettre en cache les statistiques
    """
    stats_cache_timeout = 900  # 15 minutes
    
    def get_cached_stats(self, stats_key, stats_function):
        """
        Récupère ou calcule et met en cache des statistiques
        """
        cache_key = f"stats:{self.__class__.__name__}:{stats_key}"
        
        return CacheManager.get_or_set(
            cache_key, 
            stats_function, 
            self.stats_cache_timeout
        )


class SearchOptimizationMixin:
    """
    Mixin pour optimiser les recherches
    """
    
    def filter_queryset(self, queryset):
        """
        Optimise les filtres de recherche
        """
        queryset = super().filter_queryset(queryset)
        
        # Ajouter des indexes pour les recherches fréquentes
        search_param = self.request.query_params.get('search')
        if search_param:
            # Utiliser la recherche full-text si disponible
            if hasattr(queryset.model, 'search_vector'):
                queryset = queryset.filter(search_vector=search_param)
            else:
                # Limiter les résultats de recherche pour de meilleures performances
                queryset = queryset[:1000]  # Limite à 1000 résultats
        
        return queryset


class APIPerformanceMixin(
    OptimizedQuerysetMixin,
    PaginationOptimizationMixin,
    SearchOptimizationMixin
):
    """
    Mixin combiné pour les performances API
    """
    pass


class ReadOnlyOptimizedViewSet(
    APIPerformanceMixin,
    CachedListMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin
):
    """
    ViewSet optimisé pour les opérations de lecture seule
    """
    pass


class FullOptimizedViewSet(
    APIPerformanceMixin,
    BulkOperationMixin,
    StatsCacheMixin,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin
):
    """
    ViewSet complètement optimisé pour toutes les opérations
    """
    pass
