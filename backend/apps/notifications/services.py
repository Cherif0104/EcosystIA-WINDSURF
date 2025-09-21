"""
Services pour l'envoi de notifications temps réel
"""

import asyncio
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model
from .models import Notification, NotificationTemplate

User = get_user_model()


class NotificationService:
    """Service centralisé pour l'envoi de notifications"""
    
    def __init__(self):
        self.channel_layer = get_channel_layer()
    
    def send_to_user(self, user_id: int, notification_data: dict, save_to_db: bool = True):
        """
        Envoyer une notification à un utilisateur spécifique
        """
        # Sauvegarder en base de données si demandé
        if save_to_db:
            notification = self._create_notification(user_id, notification_data)
            notification_data['id'] = notification.id
        
        # Envoyer via WebSocket
        if self.channel_layer:
            async_to_sync(self.channel_layer.group_send)(
                f'user_notifications_{user_id}',
                {
                    'type': 'notification_message',
                    'data': notification_data
                }
            )
    
    def send_to_multiple_users(self, user_ids: list, notification_data: dict, save_to_db: bool = True):
        """
        Envoyer une notification à plusieurs utilisateurs
        """
        for user_id in user_ids:
            self.send_to_user(user_id, notification_data.copy(), save_to_db)
    
    def send_to_project_members(self, project_id: int, notification_data: dict, exclude_user_id: int = None):
        """
        Envoyer une notification à tous les membres d'un projet
        """
        from apps.projects.models import Project
        
        try:
            project = Project.objects.get(id=project_id)
            user_ids = list(project.team_members.values_list('id', flat=True))
            
            # Ajouter le propriétaire du projet
            if project.owner_id not in user_ids:
                user_ids.append(project.owner_id)
            
            # Exclure un utilisateur si spécifié (ex: celui qui a déclenché la notification)
            if exclude_user_id:
                user_ids = [uid for uid in user_ids if uid != exclude_user_id]
            
            # Envoyer les notifications
            self.send_to_multiple_users(user_ids, notification_data)
            
            # Envoyer également au groupe du projet pour les mises à jour temps réel
            if self.channel_layer:
                async_to_sync(self.channel_layer.group_send)(
                    f'project_{project_id}',
                    {
                        'type': 'project_update',
                        'data': notification_data
                    }
                )
        
        except Project.DoesNotExist:
            pass
    
    def send_to_meeting_participants(self, meeting_id: int, notification_data: dict, exclude_user_id: int = None):
        """
        Envoyer une notification à tous les participants d'une réunion
        """
        from apps.meetings.models import Meeting
        
        try:
            meeting = Meeting.objects.get(id=meeting_id)
            user_ids = list(meeting.attendees.values_list('id', flat=True))
            
            # Ajouter l'organisateur
            if meeting.organizer_id not in user_ids:
                user_ids.append(meeting.organizer_id)
            
            # Exclure un utilisateur si spécifié
            if exclude_user_id:
                user_ids = [uid for uid in user_ids if uid != exclude_user_id]
            
            self.send_to_multiple_users(user_ids, notification_data)
        
        except Meeting.DoesNotExist:
            pass
    
    def send_system_notification(self, notification_data: dict):
        """
        Envoyer une notification système à tous les administrateurs
        """
        if self.channel_layer:
            async_to_sync(self.channel_layer.group_send)(
                'system_notifications',
                {
                    'type': 'system_notification',
                    'data': notification_data
                }
            )
    
    def send_meeting_chat_message(self, meeting_id: int, user_id: int, message: str):
        """
        Envoyer un message de chat dans une réunion
        """
        if self.channel_layer:
            user = User.objects.get(id=user_id)
            async_to_sync(self.channel_layer.group_send)(
                f'meeting_chat_{meeting_id}',
                {
                    'type': 'chat_message',
                    'data': {
                        'user_id': user_id,
                        'username': user.username,
                        'message': message,
                        'timestamp': str(timezone.now())
                    }
                }
            )
    
    def _create_notification(self, user_id: int, notification_data: dict) -> Notification:
        """
        Créer une notification en base de données
        """
        return Notification.objects.create(
            recipient_id=user_id,
            sender_id=notification_data.get('sender_id'),
            title=notification_data.get('title', ''),
            message=notification_data.get('message', ''),
            type=notification_data.get('type', 'info'),
            category=notification_data.get('category', 'system'),
            related_object_id=notification_data.get('related_object_id'),
            related_object_type=notification_data.get('related_object_type'),
            action_url=notification_data.get('action_url')
        )
    
    def send_from_template(self, template_name: str, user_ids: list, context: dict = None):
        """
        Envoyer une notification basée sur un template
        """
        try:
            template = NotificationTemplate.objects.get(name=template_name, is_active=True)
            
            # Remplacer les variables dans le template
            title = template.title_template
            message = template.message_template
            
            if context:
                for key, value in context.items():
                    title = title.replace(f'{{{key}}}', str(value))
                    message = message.replace(f'{{{key}}}', str(value))
            
            notification_data = {
                'title': title,
                'message': message,
                'type': template.type,
                'category': template.category,
            }
            
            self.send_to_multiple_users(user_ids, notification_data)
            
        except NotificationTemplate.DoesNotExist:
            pass


# Instance globale du service
notification_service = NotificationService()


# Fonctions utilitaires pour les cas d'usage courants
def notify_task_assigned(task, assignee, assigner):
    """Notifier l'assignation d'une tâche"""
    notification_service.send_to_user(
        assignee.id,
        {
            'title': 'Nouvelle tâche assignée',
            'message': f'{assigner.username} vous a assigné la tâche "{task.title}"',
            'type': 'info',
            'category': 'project',
            'sender_id': assigner.id,
            'related_object_id': task.id,
            'related_object_type': 'task',
            'action_url': f'/projects/{task.project_id}/'
        }
    )


def notify_project_update(project, user, update_type):
    """Notifier une mise à jour de projet"""
    messages = {
        'created': f'{user.username} a créé le projet "{project.title}"',
        'updated': f'{user.username} a mis à jour le projet "{project.title}"',
        'completed': f'Le projet "{project.title}" a été marqué comme terminé',
        'archived': f'Le projet "{project.title}" a été archivé'
    }
    
    notification_service.send_to_project_members(
        project.id,
        {
            'title': 'Mise à jour de projet',
            'message': messages.get(update_type, f'Le projet "{project.title}" a été modifié'),
            'type': 'info',
            'category': 'project',
            'sender_id': user.id,
            'related_object_id': project.id,
            'related_object_type': 'project',
            'action_url': f'/projects/{project.id}/'
        },
        exclude_user_id=user.id
    )


def notify_meeting_reminder(meeting, minutes_before=15):
    """Notifier un rappel de réunion"""
    notification_service.send_to_meeting_participants(
        meeting.id,
        {
            'title': 'Rappel de réunion',
            'message': f'Votre réunion "{meeting.title}" commence dans {minutes_before} minutes',
            'type': 'reminder',
            'category': 'meeting',
            'related_object_id': meeting.id,
            'related_object_type': 'meeting',
            'action_url': f'/meetings/{meeting.id}/'
        }
    )


def notify_course_enrollment(course, student):
    """Notifier une inscription à un cours"""
    notification_service.send_to_user(
        student.id,
        {
            'title': 'Inscription confirmée',
            'message': f'Vous êtes maintenant inscrit au cours "{course.title}"',
            'type': 'success',
            'category': 'course',
            'related_object_id': course.id,
            'related_object_type': 'course',
            'action_url': f'/courses/{course.id}/'
        }
    )


def notify_invoice_payment(invoice, user):
    """Notifier le paiement d'une facture"""
    notification_service.send_to_user(
        user.id,
        {
            'title': 'Paiement reçu',
            'message': f'Le paiement de la facture #{invoice.invoice_number} a été confirmé',
            'type': 'success',
            'category': 'finance',
            'related_object_id': invoice.id,
            'related_object_type': 'invoice',
            'action_url': f'/finance/invoices/{invoice.id}/'
        }
    )


def notify_system_maintenance(message, start_time, end_time):
    """Notifier une maintenance système"""
    notification_service.send_system_notification({
        'title': 'Maintenance programmée',
        'message': f'{message}. Maintenance prévue de {start_time} à {end_time}',
        'type': 'warning',
        'category': 'system'
    })


# Import pour éviter les erreurs circulaires
from django.utils import timezone
