"""
URLs pour la gestion des réunions
"""

from django.urls import path
from . import views

app_name = 'meetings'

urlpatterns = [
    # Réunions
    path('', views.MeetingListCreateView.as_view(), name='meeting-list'),
    path('<int:pk>/', views.MeetingDetailView.as_view(), name='meeting-detail'),
    
    # Participants
    path('<int:meeting_id>/attendees/', views.MeetingAttendeesView.as_view(), name='meeting-attendees'),
    path('<int:meeting_id>/attendees/<int:pk>/', views.MeetingAttendeeDetailView.as_view(), name='meeting-attendee-detail'),
    
    # Actions
    path('<int:meeting_id>/actions/', views.MeetingActionsView.as_view(), name='meeting-actions'),
    path('<int:meeting_id>/actions/<int:pk>/', views.MeetingActionDetailView.as_view(), name='meeting-action-detail'),
    
    # Modèles
    path('templates/', views.MeetingTemplatesView.as_view(), name='meeting-templates'),
    path('templates/<int:pk>/', views.MeetingTemplateDetailView.as_view(), name='meeting-template-detail'),
    
    # Statistiques et vues spéciales
    path('stats/', views.MeetingStatsView.as_view(), name='meeting-stats'),
    path('upcoming/', views.upcoming_meetings, name='upcoming-meetings'),
    path('today/', views.today_meetings, name='today-meetings'),
    
    # Actions sur les réunions
    path('<int:meeting_id>/join/', views.join_meeting, name='join-meeting'),
    path('<int:meeting_id>/leave/', views.leave_meeting, name='leave-meeting'),
    path('<int:meeting_id>/respond/', views.respond_to_invitation, name='respond-invitation'),
]
