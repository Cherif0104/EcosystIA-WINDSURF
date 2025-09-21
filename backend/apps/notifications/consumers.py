"""
Consumers WebSocket pour les notifications temps réel
"""

import json
import asyncio
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()


class BaseNotificationConsumer(AsyncWebsocketConsumer):
    """Classe de base pour tous les consumers de notifications"""
    
    async def connect(self):
        """Connexion WebSocket"""
        # Vérifier l'authentification
        if not self.scope["user"] or not self.scope["user"].is_authenticated:
            await self.close(code=4001)  # Unauthorized
            return
        
        self.user = self.scope["user"]
        await self.accept()
        
        # Envoyer un message de bienvenue
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connexion WebSocket établie',
            'timestamp': datetime.now().isoformat(),
            'user_id': self.user.id
        }))
    
    async def disconnect(self, close_code):
        """Déconnexion WebSocket"""
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
    
    async def send_notification(self, notification_data):
        """Envoyer une notification via WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'data': notification_data,
            'timestamp': datetime.now().isoformat()
        }))


class NotificationConsumer(BaseNotificationConsumer):
    """Consumer pour les notifications personnelles d'un utilisateur"""
    
    async def connect(self):
        await super().connect()
        
        if hasattr(self, 'user'):
            self.user_id = self.scope['url_route']['kwargs']['user_id']
            
            # Vérifier que l'utilisateur peut accéder à ces notifications
            if self.user.id != self.user_id and not self.user.is_staff:
                await self.close(code=4003)  # Forbidden
                return
            
            # Rejoindre le groupe de notifications de l'utilisateur
            self.group_name = f'user_notifications_{self.user_id}'
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            
            # Envoyer les notifications non lues
            await self.send_unread_notifications()
    
    @database_sync_to_async
    def get_unread_notifications(self):
        """Récupérer les notifications non lues"""
        return list(
            Notification.objects.filter(
                recipient_id=self.user_id,
                is_read=False
            ).values(
                'id', 'title', 'message', 'type', 'category',
                'created_at', 'action_url'
            )[:20]
        )
    
    async def send_unread_notifications(self):
        """Envoyer les notifications non lues au client"""
        unread_notifications = await self.get_unread_notifications()
        
        if unread_notifications:
            await self.send(text_data=json.dumps({
                'type': 'unread_notifications',
                'data': unread_notifications,
                'count': len(unread_notifications),
                'timestamp': datetime.now().isoformat()
            }))
    
    async def receive(self, text_data):
        """Recevoir des messages du client"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'mark_as_read':
                notification_id = data.get('notification_id')
                await self.mark_notification_as_read(notification_id)
            
            elif message_type == 'mark_all_as_read':
                await self.mark_all_as_read()
                
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': datetime.now().isoformat()
                }))
        
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Format JSON invalide'
            }))
    
    @database_sync_to_async
    def mark_notification_as_read(self, notification_id):
        """Marquer une notification comme lue"""
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient_id=self.user_id
            )
            notification.mark_as_read()
            return True
        except Notification.DoesNotExist:
            return False
    
    @database_sync_to_async
    def mark_all_as_read(self):
        """Marquer toutes les notifications comme lues"""
        Notification.objects.filter(
            recipient_id=self.user_id,
            is_read=False
        ).update(is_read=True)
    
    # Handlers pour les messages du groupe
    async def notification_message(self, event):
        """Recevoir une notification du groupe"""
        await self.send_notification(event['data'])
    
    async def system_message(self, event):
        """Recevoir un message système"""
        await self.send(text_data=json.dumps({
            'type': 'system_message',
            'data': event['data'],
            'timestamp': datetime.now().isoformat()
        }))


class ProjectNotificationConsumer(BaseNotificationConsumer):
    """Consumer pour les notifications d'un projet spécifique"""
    
    async def connect(self):
        await super().connect()
        
        if hasattr(self, 'user'):
            self.project_id = self.scope['url_route']['kwargs']['project_id']
            
            # Vérifier l'accès au projet
            has_access = await self.check_project_access()
            if not has_access:
                await self.close(code=4003)  # Forbidden
                return
            
            # Rejoindre le groupe du projet
            self.group_name = f'project_{self.project_id}'
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
    
    @database_sync_to_async
    def check_project_access(self):
        """Vérifier l'accès de l'utilisateur au projet"""
        from apps.projects.models import Project
        try:
            project = Project.objects.get(id=self.project_id)
            return (
                project.owner == self.user or 
                project.team_members.filter(id=self.user.id).exists() or
                self.user.is_staff
            )
        except Project.DoesNotExist:
            return False
    
    async def project_update(self, event):
        """Mise à jour du projet"""
        await self.send(text_data=json.dumps({
            'type': 'project_update',
            'data': event['data'],
            'timestamp': datetime.now().isoformat()
        }))
    
    async def task_update(self, event):
        """Mise à jour de tâche"""
        await self.send(text_data=json.dumps({
            'type': 'task_update',
            'data': event['data'],
            'timestamp': datetime.now().isoformat()
        }))


class MeetingChatConsumer(BaseNotificationConsumer):
    """Consumer pour le chat en temps réel d'une réunion"""
    
    async def connect(self):
        await super().connect()
        
        if hasattr(self, 'user'):
            self.meeting_id = self.scope['url_route']['kwargs']['meeting_id']
            
            # Vérifier l'accès à la réunion
            has_access = await self.check_meeting_access()
            if not has_access:
                await self.close(code=4003)  # Forbidden
                return
            
            # Rejoindre le groupe de la réunion
            self.group_name = f'meeting_chat_{self.meeting_id}'
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            
            # Notifier les autres participants
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'user_joined',
                    'data': {
                        'user_id': self.user.id,
                        'username': self.user.username,
                        'message': f'{self.user.username} a rejoint la réunion'
                    }
                }
            )
    
    async def disconnect(self, close_code):
        """Notifier le départ de l'utilisateur"""
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'user_left',
                    'data': {
                        'user_id': self.user.id,
                        'username': self.user.username,
                        'message': f'{self.user.username} a quitté la réunion'
                    }
                }
            )
        
        await super().disconnect(close_code)
    
    @database_sync_to_async
    def check_meeting_access(self):
        """Vérifier l'accès de l'utilisateur à la réunion"""
        from apps.meetings.models import Meeting
        try:
            meeting = Meeting.objects.get(id=self.meeting_id)
            return (
                meeting.organizer == self.user or 
                meeting.attendees.filter(id=self.user.id).exists() or
                self.user.is_staff
            )
        except Meeting.DoesNotExist:
            return False
    
    async def receive(self, text_data):
        """Recevoir un message de chat"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'chat_message':
                message = data.get('message', '').strip()
                if message:
                    # Diffuser le message à tous les participants
                    await self.channel_layer.group_send(
                        self.group_name,
                        {
                            'type': 'chat_message',
                            'data': {
                                'user_id': self.user.id,
                                'username': self.user.username,
                                'message': message,
                                'timestamp': datetime.now().isoformat()
                            }
                        }
                    )
        
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Format JSON invalide'
            }))
    
    # Handlers pour les messages du groupe
    async def chat_message(self, event):
        """Diffuser un message de chat"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'data': event['data']
        }))
    
    async def user_joined(self, event):
        """Notifier qu'un utilisateur a rejoint"""
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'data': event['data']
        }))
    
    async def user_left(self, event):
        """Notifier qu'un utilisateur a quitté"""
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'data': event['data']
        }))


class SystemNotificationConsumer(BaseNotificationConsumer):
    """Consumer pour les notifications système globales"""
    
    async def connect(self):
        await super().connect()
        
        if hasattr(self, 'user'):
            # Seuls les staff peuvent recevoir les notifications système
            if not self.user.is_staff:
                await self.close(code=4003)  # Forbidden
                return
            
            # Rejoindre le groupe des notifications système
            self.group_name = 'system_notifications'
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
    
    async def system_notification(self, event):
        """Recevoir une notification système"""
        await self.send(text_data=json.dumps({
            'type': 'system_notification',
            'data': event['data'],
            'timestamp': datetime.now().isoformat()
        }))
