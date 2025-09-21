"""
URLs pour la gestion des projets
"""

from django.urls import path
from . import views

app_name = 'projects'

urlpatterns = [
    path('', views.ProjectListView.as_view(), name='project-list'),
    path('<int:pk>/', views.ProjectDetailView.as_view(), name='project-detail'),
    path('<int:project_id>/tasks/', views.TaskListView.as_view(), name='task-list'),
    path('<int:project_id>/risks/', views.RiskListView.as_view(), name='risk-list'),
    path('<int:project_id>/team/', views.ProjectTeamView.as_view(), name='team-list'),
    path('<int:project_id>/team/add/<int:user_id>/', views.add_team_member, name='add-team-member'),
    path('<int:project_id>/team/remove/<int:user_id>/', views.remove_team_member, name='remove-team-member'),
]