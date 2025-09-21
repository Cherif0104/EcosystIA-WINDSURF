"""
Modèles pour la base de connaissances
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Category(models.Model):
    """
    Catégories d'articles
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=100, default='fas fa-folder')
    color = models.CharField(max_length=7, default='#007bff')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='subcategories')
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'knowledge_category'
        verbose_name = 'Catégorie'
        verbose_name_plural = 'Catégories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Article(models.Model):
    """
    Articles de la base de connaissances
    """
    STATUS_CHOICES = [
        ('Draft', 'Brouillon'),
        ('Published', 'Publié'),
        ('Archived', 'Archivé'),
    ]
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    excerpt = models.TextField(max_length=500, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    
    # Relations
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='articles')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='authored_articles')
    
    # Métadonnées
    tags = models.JSONField(default=list, blank=True)
    view_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'knowledge_article'
        verbose_name = 'Article'
        verbose_name_plural = 'Articles'
        indexes = [
            models.Index(fields=['status', 'category']),
            models.Index(fields=['author']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return self.title
    
    def increment_view(self):
        """Incrémenter le compteur de vues"""
        self.view_count = F('view_count') + 1
        self.save(update_fields=['view_count'])


class FAQ(models.Model):
    """
    Questions fréquemment posées
    """
    question = models.CharField(max_length=300)
    answer = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='faqs')
    
    # Métadonnées
    order = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    view_count = models.PositiveIntegerField(default=0)
    helpful_count = models.PositiveIntegerField(default=0)
    
    # Relations
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_faqs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'knowledge_faq'
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'
        ordering = ['order', 'question']
    
    def __str__(self):
        return self.question
