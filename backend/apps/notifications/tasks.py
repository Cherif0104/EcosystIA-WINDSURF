"""
Tâches Celery pour les notifications différées et récurrentes
"""

from celery import shared_task
from django.utils import timezone
from datetime import datetime, timedelta
from .services import notification_service, notify_meeting_reminder


@shared_task
def send_meeting_reminders():
    """
    Tâche récurrente pour envoyer les rappels de réunions
    À exécuter toutes les 5 minutes
    """
    from apps.meetings.models import Meeting
    
    # Réunions dans les 15 prochaines minutes
    now = timezone.now()
    reminder_time = now + timedelta(minutes=15)
    
    meetings = Meeting.objects.filter(
        start_datetime__range=(now, reminder_time),
        status='Scheduled'
    ).select_related('organizer')
    
    for meeting in meetings:
        # Vérifier si le rappel n'a pas déjà été envoyé
        cache_key = f'meeting_reminder_{meeting.id}'
        from django.core.cache import cache
        
        if not cache.get(cache_key):
            notify_meeting_reminder(meeting, 15)
            # Marquer comme envoyé pour 30 minutes
            cache.set(cache_key, True, 1800)


@shared_task
def send_daily_digest():
    """
    Tâche quotidienne pour envoyer un résumé des notifications
    À exécuter une fois par jour
    """
    from django.contrib.auth import get_user_model
    from .models import Notification, NotificationPreference
    
    User = get_user_model()
    
    # Utilisateurs qui ont activé le digest quotidien
    users_with_daily_digest = User.objects.filter(
        notification_preferences__digest_frequency='daily'
    )
    
    yesterday = timezone.now() - timedelta(days=1)
    
    for user in users_with_daily_digest:
        # Récupérer les notifications des dernières 24h
        notifications = Notification.objects.filter(
            recipient=user,
            created_at__gte=yesterday
        ).order_by('-created_at')[:10]
        
        if notifications.exists():
            # Créer le résumé
            unread_count = notifications.filter(is_read=False).count()
            
            message = f"Résumé quotidien : {notifications.count()} notifications dont {unread_count} non lues.\n\n"
            
            for notif in notifications[:5]:  # Top 5
                status = "🔵" if not notif.is_read else "✅"
                message += f"{status} {notif.title}\n"
            
            if notifications.count() > 5:
                message += f"\n... et {notifications.count() - 5} autres notifications."
            
            notification_service.send_to_user(
                user.id,
                {
                    'title': 'Résumé quotidien',
                    'message': message,
                    'type': 'info',
                    'category': 'system',
                    'action_url': '/notifications/'
                }
            )


@shared_task
def send_weekly_digest():
    """
    Tâche hebdomadaire pour envoyer un résumé des notifications
    À exécuter une fois par semaine (dimanche)
    """
    from django.contrib.auth import get_user_model
    from .models import Notification
    
    User = get_user_model()
    
    # Utilisateurs qui ont activé le digest hebdomadaire
    users_with_weekly_digest = User.objects.filter(
        notification_preferences__digest_frequency='weekly'
    )
    
    last_week = timezone.now() - timedelta(weeks=1)
    
    for user in users_with_weekly_digest:
        # Statistiques de la semaine
        notifications = Notification.objects.filter(
            recipient=user,
            created_at__gte=last_week
        )
        
        if notifications.exists():
            total_count = notifications.count()
            unread_count = notifications.filter(is_read=False).count()
            
            # Répartition par catégorie
            categories = notifications.values('category').distinct()
            category_stats = []
            
            for cat in categories:
                count = notifications.filter(category=cat['category']).count()
                category_stats.append(f"• {cat['category'].title()}: {count}")
            
            message = f"""Résumé hebdomadaire EcosystIA

📊 Cette semaine :
• {total_count} notifications reçues
• {unread_count} non lues

📂 Répartition :
{chr(10).join(category_stats)}

Consultez vos notifications pour rester à jour !"""
            
            notification_service.send_to_user(
                user.id,
                {
                    'title': 'Résumé hebdomadaire',
                    'message': message,
                    'type': 'info',
                    'category': 'system',
                    'action_url': '/notifications/'
                }
            )


@shared_task
def cleanup_old_notifications():
    """
    Nettoyer les anciennes notifications (> 3 mois)
    À exécuter une fois par semaine
    """
    from .models import Notification
    
    three_months_ago = timezone.now() - timedelta(days=90)
    
    # Supprimer les notifications lues de plus de 3 mois
    deleted_count = Notification.objects.filter(
        created_at__lt=three_months_ago,
        is_read=True
    ).delete()[0]
    
    # Log du nettoyage
    if deleted_count > 0:
        notification_service.send_system_notification({
            'title': 'Nettoyage des notifications',
            'message': f'{deleted_count} anciennes notifications ont été supprimées',
            'type': 'info',
            'category': 'system'
        })


@shared_task
def send_delayed_notification(user_id, notification_data, delay_minutes=0):
    """
    Envoyer une notification avec un délai
    """
    import time
    if delay_minutes > 0:
        time.sleep(delay_minutes * 60)
    
    notification_service.send_to_user(user_id, notification_data)


@shared_task
def send_bulk_notification(user_ids, notification_data):
    """
    Envoyer une notification en masse à plusieurs utilisateurs
    """
    notification_service.send_to_multiple_users(user_ids, notification_data)


@shared_task
def check_overdue_tasks():
    """
    Vérifier les tâches en retard et notifier les assignés
    À exécuter toutes les heures
    """
    from apps.projects.models import Task
    
    now = timezone.now()
    
    # Tâches en retard non terminées
    overdue_tasks = Task.objects.filter(
        due_date__lt=now,
        status__in=['To Do', 'In Progress'],
        assigned_to__isnull=False
    ).select_related('assigned_to', 'project')
    
    for task in overdue_tasks:
        # Vérifier si la notification n'a pas déjà été envoyée aujourd'hui
        cache_key = f'overdue_task_{task.id}_{now.date()}'
        from django.core.cache import cache
        
        if not cache.get(cache_key):
            notification_service.send_to_user(
                task.assigned_to.id,
                {
                    'title': 'Tâche en retard',
                    'message': f'La tâche "{task.title}" était due le {task.due_date.strftime("%d/%m/%Y")}',
                    'type': 'warning',
                    'category': 'project',
                    'related_object_id': task.id,
                    'related_object_type': 'task',
                    'action_url': f'/projects/{task.project.id}/'
                }
            )
            
            # Marquer comme envoyé pour aujourd'hui
            cache.set(cache_key, True, 86400)  # 24 heures


@shared_task
def send_course_deadline_reminders():
    """
    Rappels pour les échéances de cours
    À exécuter quotidiennement
    """
    from apps.courses.models import Enrollment, Assignment
    
    # Assignments dues dans les 3 prochains jours
    three_days_from_now = timezone.now() + timedelta(days=3)
    
    upcoming_assignments = Assignment.objects.filter(
        due_date__range=(timezone.now(), three_days_from_now)
    ).select_related('course')
    
    for assignment in upcoming_assignments:
        # Notifier tous les étudiants inscrits
        enrollments = Enrollment.objects.filter(
            course=assignment.course,
            status='Active'
        ).select_related('student')
        
        for enrollment in enrollments:
            cache_key = f'assignment_reminder_{assignment.id}_{enrollment.student.id}'
            from django.core.cache import cache
            
            if not cache.get(cache_key):
                notification_service.send_to_user(
                    enrollment.student.id,
                    {
                        'title': 'Échéance de devoir',
                        'message': f'Le devoir "{assignment.title}" est à rendre dans 3 jours',
                        'type': 'reminder',
                        'category': 'course',
                        'related_object_id': assignment.id,
                        'related_object_type': 'assignment',
                        'action_url': f'/courses/{assignment.course.id}/assignments/{assignment.id}/'
                    }
                )
                
                # Marquer comme envoyé pour 24h
                cache.set(cache_key, True, 86400)
