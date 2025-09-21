"""
Vues API pour l'analytics
"""

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from .serializers import AnalyticsSerializer, UserAnalyticsSerializer

User = get_user_model()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_analytics(request):
    """
    Analytics du tableau de bord
    """
    if not request.user.is_staff:
        return Response(
            {'error': 'Accès non autorisé'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Statistiques générales
    total_users = User.objects.count()
    active_users = User.objects.filter(
        last_activity__gte=timezone.now() - timedelta(days=30)
    ).count()
    
    # Imports conditionnels pour éviter les erreurs de circular import
    try:
        from apps.projects.models import Project
        from apps.courses.models import Course, CourseEnrollment
        from apps.jobs.models import Job
        
        total_projects = Project.objects.count()
        total_courses = Course.objects.count()
        total_jobs = Job.objects.count()
    except ImportError:
        total_projects = 0
        total_courses = 0
        total_jobs = 0
    
    # Données mensuelles
    now = timezone.now()
    user_registrations_by_month = {}
    course_enrollments_by_month = {}
    
    for i in range(12):
        month_start = now.replace(day=1) - timedelta(days=i*30)
        month_end = month_start + timedelta(days=30)
        
        month_key = month_start.strftime('%Y-%m')
        
        # Inscriptions utilisateurs
        users_count = User.objects.filter(
            date_joined__gte=month_start,
            date_joined__lt=month_end
        ).count()
        user_registrations_by_month[month_key] = users_count
        
        # Inscriptions aux cours
        try:
            enrollments_count = CourseEnrollment.objects.filter(
                enrolled_at__gte=month_start,
                enrolled_at__lt=month_end
            ).count()
            course_enrollments_by_month[month_key] = enrollments_count
        except:
            course_enrollments_by_month[month_key] = 0
    
    analytics_data = {
        'total_users': total_users,
        'active_users': active_users,
        'total_projects': total_projects,
        'total_courses': total_courses,
        'total_jobs': total_jobs,
        'total_revenue': 0,  # À implémenter avec les paiements
        'user_registrations_by_month': user_registrations_by_month,
        'course_enrollments_by_month': course_enrollments_by_month,
        'project_completion_rates': {},  # À implémenter
        'popular_courses': [],  # À implémenter
        'top_skills': []  # À implémenter
    }
    
    serializer = AnalyticsSerializer(analytics_data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_analytics(request):
    """
    Analytics des utilisateurs
    """
    if not request.user.is_staff:
        return Response(
            {'error': 'Accès non autorisé'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    users = User.objects.all()[:100]  # Limiter à 100 utilisateurs
    
    analytics_data = []
    for user in users:
        try:
            from apps.projects.models import Project
            from apps.courses.models import CourseEnrollment
            from apps.jobs.models import JobApplication
            
            projects_count = Project.objects.filter(owner=user).count()
            courses_enrolled = CourseEnrollment.objects.filter(user=user).count()
            courses_completed = CourseEnrollment.objects.filter(
                user=user, status='completed'
            ).count()
            jobs_applied = JobApplication.objects.filter(applicant=user).count()
        except ImportError:
            projects_count = 0
            courses_enrolled = 0
            courses_completed = 0
            jobs_applied = 0
        
        user_data = {
            'user_id': user.id,
            'username': user.username,
            'full_name': user.get_full_name(),
            'role': user.role,
            'projects_count': projects_count,
            'courses_enrolled': courses_enrolled,
            'courses_completed': courses_completed,
            'jobs_applied': jobs_applied,
            'last_activity': user.last_activity,
            'login_count': user.login_count
        }
        analytics_data.append(user_data)
    
    serializer = UserAnalyticsSerializer(analytics_data, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_analytics(request):
    """
    Analytics personnelles de l'utilisateur
    """
    user = request.user
    
    try:
        from apps.projects.models import Project
        from apps.courses.models import CourseEnrollment
        from apps.jobs.models import JobApplication
        
        my_projects = Project.objects.filter(owner=user).count()
        courses_enrolled = CourseEnrollment.objects.filter(user=user).count()
        courses_completed = CourseEnrollment.objects.filter(
            user=user, status='completed'
        ).count()
        jobs_applied = JobApplication.objects.filter(applicant=user).count()
    except ImportError:
        my_projects = 0
        courses_enrolled = 0
        courses_completed = 0
        jobs_applied = 0
    
    analytics_data = {
        'user': {
            'id': user.id,
            'username': user.username,
            'full_name': user.get_full_name(),
            'role': user.role,
            'member_since': user.date_joined,
            'last_login': user.last_login,
            'login_count': user.login_count
        },
        'stats': {
            'projects_created': my_projects,
            'courses_enrolled': courses_enrolled,
            'courses_completed': courses_completed,
            'jobs_applied': jobs_applied,
            'completion_rate': int((courses_completed / courses_enrolled * 100)) if courses_enrolled > 0 else 0
        }
    }
    
    return Response(analytics_data)