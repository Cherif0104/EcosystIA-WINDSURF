"""
URLs pour la gestion des objectifs OKR
"""

from django.urls import path
from . import views

app_name = 'goals'

urlpatterns = [
    # Goals
    path('', views.GoalListCreateView.as_view(), name='goal_list_create'),
    path('<int:pk>/', views.GoalDetailView.as_view(), name='goal_detail'),
    path('<int:goal_id>/progress/', views.GoalProgressView.as_view(), name='goal_progress'),
    path('<int:goal_id>/comment/', views.add_goal_comment, name='goal_comment'),
    path('my/', views.MyGoalsView.as_view(), name='my_goals'),
    path('assigned/', views.AssignedGoalsView.as_view(), name='assigned_goals'),
    path('bulk-update/', views.bulk_update_goals, name='bulk_update_goals'),
    
    # Key Results
    path('<int:goal_id>/key-results/', views.KeyResultListCreateView.as_view(), name='key_result_list_create'),
    path('key-results/<int:pk>/', views.KeyResultDetailView.as_view(), name='key_result_detail'),
    path('key-results/<int:key_result_id>/progress/', views.KeyResultProgressView.as_view(), name='key_result_progress'),
    
    # OKR Cycles
    path('cycles/', views.OKRCycleListCreateView.as_view(), name='okr_cycle_list_create'),
    path('cycles/<int:pk>/', views.OKRCycleDetailView.as_view(), name='okr_cycle_detail'),
    
    # Templates
    path('templates/', views.GoalTemplateListView.as_view(), name='goal_templates'),
    path('templates/create-goal/', views.CreateGoalFromTemplateView.as_view(), name='create_from_template'),
    
    # Analytics & Reports
    path('stats/', views.GoalStatsView.as_view(), name='goal_stats'),
    path('dashboard/', views.OKRDashboardView.as_view(), name='okr_dashboard'),
    path('analytics/', views.goal_analytics, name='goal_analytics'),
]
