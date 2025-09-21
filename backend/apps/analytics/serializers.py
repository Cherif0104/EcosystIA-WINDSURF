"""
Sérialiseurs pour l'analytics
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class AnalyticsSerializer(serializers.Serializer):
    """
    Sérialiseur pour les données d'analytics
    """
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    total_projects = serializers.IntegerField()
    total_courses = serializers.IntegerField()
    total_jobs = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    user_registrations_by_month = serializers.DictField()
    course_enrollments_by_month = serializers.DictField()
    project_completion_rates = serializers.DictField()
    popular_courses = serializers.ListField()
    top_skills = serializers.ListField()


class UserAnalyticsSerializer(serializers.Serializer):
    """
    Sérialiseur pour les analytics utilisateur
    """
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    full_name = serializers.CharField()
    role = serializers.CharField()
    projects_count = serializers.IntegerField()
    courses_enrolled = serializers.IntegerField()
    courses_completed = serializers.IntegerField()
    jobs_applied = serializers.IntegerField()
    last_activity = serializers.DateTimeField()
    login_count = serializers.IntegerField()