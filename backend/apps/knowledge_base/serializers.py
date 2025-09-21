"""
Serializers pour la base de connaissances
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Category, Article, FAQ

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer pour les catégories
    """
    articles_count = serializers.SerializerMethodField()
    subcategories = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'description', 'icon', 'color', 'parent',
            'articles_count', 'subcategories', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'articles_count', 'subcategories']
    
    def get_articles_count(self, obj):
        return obj.articles.filter(status='Published').count()
    
    def get_subcategories(self, obj):
        subcategories = obj.subcategories.all()
        return CategorySerializer(subcategories, many=True).data


class ArticleListSerializer(serializers.ModelSerializer):
    """
    Serializer pour la liste des articles
    """
    author = serializers.StringRelatedField(read_only=True)
    category = CategorySerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'excerpt', 'status', 'status_display',
            'category', 'author', 'tags', 'view_count', 'like_count',
            'created_at', 'updated_at', 'published_at'
        ]
        read_only_fields = [
            'id', 'author', 'view_count', 'like_count',
            'created_at', 'updated_at', 'published_at'
        ]


class ArticleDetailSerializer(serializers.ModelSerializer):
    """
    Serializer détaillé pour un article
    """
    author = serializers.StringRelatedField(read_only=True)
    category = CategorySerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'content', 'excerpt', 'status', 'status_display',
            'category', 'author', 'tags', 'view_count', 'like_count',
            'created_at', 'updated_at', 'published_at'
        ]
        read_only_fields = [
            'id', 'author', 'view_count', 'like_count',
            'created_at', 'updated_at', 'published_at'
        ]


class FAQSerializer(serializers.ModelSerializer):
    """
    Serializer pour les FAQs
    """
    category = CategorySerializer(read_only=True)
    created_by = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = FAQ
        fields = [
            'id', 'question', 'answer', 'category', 'order',
            'is_featured', 'view_count', 'helpful_count',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_by', 'view_count', 'helpful_count',
            'created_at', 'updated_at'
        ]
