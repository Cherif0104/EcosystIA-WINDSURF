"""
URLs pour la gestion des congés
"""

from django.urls import path
from . import views

app_name = 'leave_management'

urlpatterns = [
    path('types/', views.LeaveTypeListView.as_view(), name='leave_types'),
    path('balance/', views.LeaveBalanceListView.as_view(), name='leave_balance'),
    path('requests/', views.LeaveRequestListCreateView.as_view(), name='leave_requests'),
]
