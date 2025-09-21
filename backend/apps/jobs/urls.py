"""
URLs pour la gestion des emplois
"""

from django.urls import path
from . import views

app_name = 'jobs'

urlpatterns = [
    path('', views.JobListView.as_view(), name='job-list'),
    path('<int:pk>/', views.JobDetailView.as_view(), name='job-detail'),
    path('applications/', views.JobApplicationListView.as_view(), name='application-list'),
    path('my-applications/', views.MyJobApplicationsView.as_view(), name='my-applications'),
    path('<int:job_id>/apply/', views.apply_for_job, name='apply-job'),
]