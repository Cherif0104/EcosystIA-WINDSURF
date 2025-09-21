"""
URLs pour la base de connaissances
"""

from django.urls import path
from . import views

app_name = 'knowledge_base'

urlpatterns = [
    # Categories
    path('categories/', views.CategoryListView.as_view(), name='category_list'),
    
    # Articles
    path('articles/', views.ArticleListView.as_view(), name='article_list_create'),
    path('articles/<int:pk>/', views.ArticleDetailView.as_view(), name='article_detail'),
    
    # FAQs
    path('faqs/', views.FAQListView.as_view(), name='faq_list_create'),
    
    # Search
    path('search/', views.search_knowledge, name='search_knowledge'),
]
