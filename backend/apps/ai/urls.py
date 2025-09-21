"""
URLs pour l'API IA
"""

from django.urls import path
from . import views

app_name = 'ai'

urlpatterns = [
    path('conversations/', views.AIConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:pk>/', views.AIConversationDetailView.as_view(), name='conversation-detail'),
    path('config/', views.AIConfigView.as_view(), name='ai-config'),
    path('chat/', views.chat_with_ai, name='chat'),
    path('stats/', views.ai_usage_stats, name='usage-stats'),
]