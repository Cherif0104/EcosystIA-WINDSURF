"""
Signaux pour la gestion des utilisateurs
"""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import User, UserProfile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Créer automatiquement un profil pour chaque nouvel utilisateur
    """
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    """
    Envoyer un email de bienvenue aux nouveaux utilisateurs
    """
    if created and settings.EMAIL_HOST_USER:
        send_mail(
            subject='Bienvenue sur EcosystIA',
            message=f'''
            Bonjour {instance.get_full_name()},
            
            Bienvenue sur la plateforme EcosystIA !
            
            Votre compte a été créé avec succès.
            Rôle: {instance.get_role_display_name()}
            
            Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme.
            
            Cordialement,
            L'équipe EcosystIA
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[instance.email],
            fail_silently=True,
        )
