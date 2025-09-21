"""
URLs pour le suivi du temps
"""

from django.urls import path
from . import views

app_name = 'time_tracking'

urlpatterns = [
    # Time logs
    path('logs/', views.TimeLogListCreateView.as_view(), name='timelog_list_create'),
    path('logs/<int:pk>/', views.TimeLogDetailView.as_view(), name='timelog_detail'),
    path('logs/bulk/', views.BulkTimeLogView.as_view(), name='bulk_timelog'),
    
    # Timer/Sessions
    path('timer/', views.TimeSessionView.as_view(), name='timer_session'),
    path('timer/action/', views.TimerActionView.as_view(), name='timer_action'),
    
    # Meetings
    path('meetings/', views.MeetingListCreateView.as_view(), name='meeting_list_create'),
    path('meetings/<int:pk>/', views.MeetingDetailView.as_view(), name='meeting_detail'),
    
    # Work Schedule
    path('schedule/', views.WorkScheduleView.as_view(), name='work_schedule'),
    path('schedule/<int:pk>/', views.WorkScheduleDetailView.as_view(), name='work_schedule_detail'),
    
    # Time Off
    path('time-off/', views.TimeOffListCreateView.as_view(), name='time_off_list_create'),
    path('time-off/<int:pk>/', views.TimeOffDetailView.as_view(), name='time_off_detail'),
    path('time-off/<int:time_off_id>/approval/', views.TimeOffApprovalView.as_view(), name='time_off_approval'),
    
    # Reports & Analytics
    path('stats/', views.TimeStatsView.as_view(), name='time_stats'),
    path('reports/weekly/', views.WeeklyReportView.as_view(), name='weekly_report'),
    path('reports/monthly/', views.MonthlyReportView.as_view(), name='monthly_report'),
    path('dashboard/', views.dashboard_data, name='dashboard_data'),
    path('team-overview/', views.team_time_overview, name='team_overview'),
]
