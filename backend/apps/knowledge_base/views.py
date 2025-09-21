"""
Vues pour la base de connaissances
"""

from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, F
from django.utils import timezone

from .models import Category, Article, FAQ
from .serializers import (
    CategorySerializer,
    ArticleListSerializer,
    ArticleDetailSerializer,
    FAQSerializer
)


class CategoryListView(generics.ListAPIView):
    """
    Vue pour lister les catégories
    """
    queryset = Category.objects.filter(parent__isnull=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ArticleListView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des articles
    """
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'tags']
    ordering_fields = ['created_at', 'view_count', 'like_count']
    ordering = ['-created_at']
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        if self.request.method == 'GET':
            return Article.objects.filter(status='Published').select_related('author', 'category')
        return Article.objects.filter(author=self.request.user)
    
    def get_serializer_class(self):
        return ArticleListSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class ArticleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer un article
    """
    serializer_class = ArticleDetailSerializer
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        if self.request.method == 'GET':
            return Article.objects.filter(status='Published').select_related('author', 'category')
        return Article.objects.filter(author=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Incrémenter le compteur de vues
        instance.increment_view()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class FAQListView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des FAQs
    """
    serializer_class = FAQSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['question', 'answer']
    ordering_fields = ['order', 'helpful_count', 'created_at']
    ordering = ['order', '-helpful_count']
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        return FAQ.objects.all().select_related('category', 'created_by')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


@api_view(['POST'])
@permission_classes([AllowAny])
def search_knowledge(request):
    """
    Recherche dans la base de connaissances
    """
    query = request.data.get('query', '').strip()
    
    if not query:
        return Response(
            {'error': 'Terme de recherche requis.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Rechercher dans les articles
    articles = Article.objects.filter(
        Q(title__icontains=query) |
        Q(content__icontains=query) |
        Q(tags__icontains=query),
        status='Published'
    ).select_related('author', 'category')[:10]
    
    # Rechercher dans les FAQs
    faqs = FAQ.objects.filter(
        Q(question__icontains=query) |
        Q(answer__icontains=query)
    ).select_related('category')[:5]
    
    return Response({
        'query': query,
        'articles': ArticleListSerializer(articles, many=True).data,
        'faqs': FAQSerializer(faqs, many=True).data,
        'total_results': articles.count() + faqs.count()
    })
