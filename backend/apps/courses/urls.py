"""
URLs pour la gestion des cours
"""

from django.urls import path
from . import views

app_name = 'courses'

urlpatterns = [
    path('', views.CourseListView.as_view(), name='course-list'),
    path('<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('my-courses/', views.MyCoursesListView.as_view(), name='my-courses'),
    path('<int:course_id>/enroll/', views.CourseEnrollmentView.as_view(), name='enroll'),
    path('<int:course_id>/lessons/<int:lesson_id>/complete/', views.complete_lesson, name='complete-lesson'),
]