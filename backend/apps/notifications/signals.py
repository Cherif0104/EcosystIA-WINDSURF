"""
Signaux Django pour déclencher automatiquement les notifications
"""

from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .services import notification_service

User = get_user_model()


# Signaux pour les projets
@receiver(post_save, sender='projects.Project')
def project_created_or_updated(sender, instance, created, **kwargs):
    """Notifier la création ou mise à jour d'un projet"""
    from .services import notify_project_update
    
    if created:
        notify_project_update(instance, instance.owner, 'created')
    else:
        # Vérifier si le statut a changé
        if hasattr(instance, '_original_status'):
            if instance._original_status != instance.status:
                if instance.status == 'Completed':
                    notify_project_update(instance, instance.owner, 'completed')
                elif instance.status == 'Archived':
                    notify_project_update(instance, instance.owner, 'archived')
                else:
                    notify_project_update(instance, instance.owner, 'updated')


@receiver(pre_save, sender='projects.Project')
def store_original_project_status(sender, instance, **kwargs):
    """Stocker le statut original du projet pour détecter les changements"""
    if instance.pk:
        try:
            original = sender.objects.get(pk=instance.pk)
            instance._original_status = original.status
        except sender.DoesNotExist:
            pass


# Signaux pour les tâches
@receiver(post_save, sender='projects.Task')
def task_assigned_or_updated(sender, instance, created, **kwargs):
    """Notifier l'assignation ou mise à jour d'une tâche"""
    from .services import notify_task_assigned
    
    if created and instance.assigned_to:
        # Trouver qui a créé la tâche (approximation)
        creator = instance.project.owner if instance.project else None
        if creator and creator != instance.assigned_to:
            notify_task_assigned(instance, instance.assigned_to, creator)
    
    elif not created and instance.assigned_to:
        # Vérifier si l'assignation a changé
        if hasattr(instance, '_original_assigned_to'):
            if instance._original_assigned_to != instance.assigned_to:
                creator = instance.project.owner if instance.project else None
                if creator and creator != instance.assigned_to:
                    notify_task_assigned(instance, instance.assigned_to, creator)


@receiver(pre_save, sender='projects.Task')
def store_original_task_assignee(sender, instance, **kwargs):
    """Stocker l'assigné original de la tâche"""
    if instance.pk:
        try:
            original = sender.objects.get(pk=instance.pk)
            instance._original_assigned_to = original.assigned_to
        except sender.DoesNotExist:
            pass


# Signaux pour les réunions
@receiver(post_save, sender='meetings.Meeting')
def meeting_created_or_updated(sender, instance, created, **kwargs):
    """Notifier la création ou mise à jour d'une réunion"""
    if created:
        notification_service.send_to_meeting_participants(
            instance.id,
            {
                'title': 'Nouvelle réunion programmée',
                'message': f'{instance.organizer.username} vous a invité à la réunion "{instance.title}"',
                'type': 'info',
                'category': 'meeting',
                'sender_id': instance.organizer.id,
                'related_object_id': instance.id,
                'related_object_type': 'meeting',
                'action_url': f'/meetings/{instance.id}/'
            },
            exclude_user_id=instance.organizer.id
        )


# Signaux pour les cours
@receiver(post_save, sender='courses.Enrollment')
def course_enrollment_created(sender, instance, created, **kwargs):
    """Notifier une nouvelle inscription à un cours"""
    if created:
        from .services import notify_course_enrollment
        notify_course_enrollment(instance.course, instance.student)


# Signaux pour les factures
@receiver(post_save, sender='finance.Invoice')
def invoice_status_changed(sender, instance, created, **kwargs):
    """Notifier les changements de statut de facture"""
    if not created and hasattr(instance, '_original_status'):
        if instance._original_status != instance.status:
            if instance.status == 'Paid':
                from .services import notify_invoice_payment
                # Trouver l'utilisateur associé à la facture
                # (ceci dépend de votre modèle de facture)
                if hasattr(instance, 'client_user'):
                    notify_invoice_payment(instance, instance.client_user)


@receiver(pre_save, sender='finance.Invoice')
def store_original_invoice_status(sender, instance, **kwargs):
    """Stocker le statut original de la facture"""
    if instance.pk:
        try:
            original = sender.objects.get(pk=instance.pk)
            instance._original_status = original.status
        except sender.DoesNotExist:
            pass


# Signaux pour les utilisateurs
@receiver(post_save, sender=User)
def user_created(sender, instance, created, **kwargs):
    """Notifier la création d'un nouvel utilisateur"""
    if created:
        # Notification de bienvenue
        notification_service.send_to_user(
            instance.id,
            {
                'title': 'Bienvenue sur EcosystIA !',
                'message': 'Votre compte a été créé avec succès. Explorez toutes les fonctionnalités de la plateforme.',
                'type': 'success',
                'category': 'user',
                'action_url': '/dashboard/'
            }
        )
        
        # Notifier les administrateurs
        admin_users = User.objects.filter(is_staff=True)
        for admin in admin_users:
            notification_service.send_to_user(
                admin.id,
                {
                    'title': 'Nouvel utilisateur',
                    'message': f'Un nouvel utilisateur s\'est inscrit : {instance.username} ({instance.email})',
                    'type': 'info',
                    'category': 'system',
                    'related_object_id': instance.id,
                    'related_object_type': 'user',
                    'action_url': f'/admin/users/{instance.id}/'
                }
            )


# Signaux pour les commentaires (si vous avez un système de commentaires)
@receiver(post_save, sender='core.Comment')
def comment_created(sender, instance, created, **kwargs):
    """Notifier un nouveau commentaire"""
    if created and hasattr(instance, 'content_object'):
        # Notifier le propriétaire de l'objet commenté
        if hasattr(instance.content_object, 'owner'):
            owner = instance.content_object.owner
            if owner != instance.author:
                notification_service.send_to_user(
                    owner.id,
                    {
                        'title': 'Nouveau commentaire',
                        'message': f'{instance.author.username} a commenté votre {instance.content_type.model}',
                        'type': 'info',
                        'category': 'comment',
                        'sender_id': instance.author.id,
                        'related_object_id': instance.object_id,
                        'related_object_type': instance.content_type.model
                    }
                )
