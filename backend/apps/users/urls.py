"""
URLs pour la gestion des utilisateurs
"""

from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('', views.UserListView.as_view(), name='user-list'),
    path('current/', views.CurrentUserView.as_view(), name='current-user'),
    path('profile/', views.UserProfileUpdateView.as_view(), name='user-profile'),
    path('stats/', views.user_stats, name='user-stats'),
    path('search/', views.search_users, name='search-users'),
    path('<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
]