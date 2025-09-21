"""
URLs pour l'analytics
"""

from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    path('dashboard/', views.dashboard_analytics, name='dashboard-analytics'),
    path('users/', views.user_analytics, name='user-analytics'),
    path('my-stats/', views.my_analytics, name='my-analytics'),
]