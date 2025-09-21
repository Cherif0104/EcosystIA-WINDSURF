"""
Modèles centraux pour EcosystIA incluant la gestion de fichiers
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils import timezone
from .storage import (
    document_upload_path, 
    validate_document_file,
    validate_image_file,
    FileUtils
)

User = get_user_model()


class FileUpload(models.Model):
    """
    Modèle générique pour tous les uploads de fichiers
    """
    FILE_TYPES = [
        ('avatar', 'Avatar'),
        ('document', 'Document'),
        ('image', 'Image'),
        ('project_file', 'Fichier de projet'),
        ('course_material', 'Matériel de cours'),
        ('invoice_attachment', 'Pièce jointe facture'),
        ('other', 'Autre'),
    ]
    
    # Fichier
    file = models.FileField(upload_to=document_upload_path, validators=[validate_document_file])
    original_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=20, choices=FILE_TYPES, default='document')
    mime_type = models.CharField(max_length=100)
    file_size = models.PositiveIntegerField()
    
    # Métadonnées
    title = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    # Relations génériques
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, blank=True, null=True)
    object_id = models.PositiveIntegerField(blank=True, null=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Utilisateur qui a uploadé
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_files')
    
    # Dates
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Statut
    is_public = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Hash pour détecter les doublons
    file_hash = models.CharField(max_length=64, blank=True, null=True)
    
    class Meta:
        db_table = 'core_fileupload'
        verbose_name = 'Fichier uploadé'
        verbose_name_plural = 'Fichiers uploadés'
        indexes = [
            models.Index(fields=['file_type']),
            models.Index(fields=['uploaded_by']),
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['file_hash']),
        ]
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.original_name} ({self.get_file_type_display()})"
    
    def save(self, *args, **kwargs):
        if self.file:
            # Stocker le nom original
            if not self.original_name:
                self.original_name = self.file.name
            
            # Détecter le type MIME
            if not self.mime_type:
                from .storage import file_upload_handler
                self.mime_type = file_upload_handler.get_mime_type(self.file)
            
            # Stocker la taille
            if not self.file_size:
                self.file_size = self.file.size
            
            # Générer un hash du fichier
            if not self.file_hash:
                import hashlib
                self.file.seek(0)
                file_hash = hashlib.sha256()
                for chunk in iter(lambda: self.file.read(4096), b""):
                    file_hash.update(chunk)
                self.file_hash = file_hash.hexdigest()
                self.file.seek(0)
        
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        # Supprimer le fichier physique
        if self.file:
            FileUtils.delete_file(self.file.name)
        super().delete(*args, **kwargs)
    
    @property
    def file_size_human(self):
        """Taille du fichier en format lisible"""
        return FileUtils.format_file_size(self.file_size)
    
    @property
    def file_extension(self):
        """Extension du fichier"""
        return FileUtils.get_file_extension(self.original_name)
    
    @property
    def is_image(self):
        """Vérifier si le fichier est une image"""
        return FileUtils.is_image_file(self.original_name)
    
    @property
    def download_url(self):
        """URL de téléchargement du fichier"""
        if self.file:
            return self.file.url
        return None


class ImageFile(models.Model):
    """
    Modèle spécialisé pour les images avec gestion des miniatures
    """
    # Fichier original
    image = models.ImageField(upload_to='images/', validators=[validate_image_file])
    original_name = models.CharField(max_length=255)
    
    # Miniatures générées
    thumbnail = models.ImageField(upload_to='images/thumbnails/', blank=True, null=True)
    medium_size = models.ImageField(upload_to='images/medium/', blank=True, null=True)
    
    # Métadonnées image
    width = models.PositiveIntegerField(blank=True, null=True)
    height = models.PositiveIntegerField(blank=True, null=True)
    
    # Relations génériques
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, blank=True, null=True)
    object_id = models.PositiveIntegerField(blank=True, null=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Utilisateur
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_images')
    
    # Métadonnées
    title = models.CharField(max_length=200, blank=True, null=True)
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    
    # Dates
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'core_imagefile'
        verbose_name = 'Image'
        verbose_name_plural = 'Images'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.original_name or 'Image'} ({self.width}x{self.height})"
    
    def save(self, *args, **kwargs):
        if self.image:
            # Stocker le nom original
            if not self.original_name:
                self.original_name = self.image.name
            
            # Obtenir les dimensions
            if not self.width or not self.height:
                from PIL import Image
                with Image.open(self.image) as img:
                    self.width, self.height = img.size
            
            # Générer les miniatures après sauvegarde
            is_new = self.pk is None
            super().save(*args, **kwargs)
            
            if is_new:
                self.generate_thumbnails()
        else:
            super().save(*args, **kwargs)
    
    def generate_thumbnails(self):
        """Générer les miniatures de l'image"""
        if not self.image:
            return
        
        from .storage import file_upload_handler
        from PIL import Image
        import os
        
        try:
            # Thumbnail 150x150
            if not self.thumbnail:
                thumbnail = file_upload_handler.optimize_image(self.image, (150, 150), quality=85)
                thumbnail_name = f"thumb_{os.path.basename(self.image.name)}"
                self.thumbnail.save(thumbnail_name, thumbnail, save=False)
            
            # Medium 600x600
            if not self.medium_size:
                medium = file_upload_handler.optimize_image(self.image, (600, 600), quality=90)
                medium_name = f"medium_{os.path.basename(self.image.name)}"
                self.medium_size.save(medium_name, medium, save=False)
            
            # Sauvegarder sans déclencher save() à nouveau
            super().save(update_fields=['thumbnail', 'medium_size'])
        
        except Exception as e:
            print(f"Erreur génération miniatures: {e}")
    
    def delete(self, *args, **kwargs):
        # Supprimer tous les fichiers
        for field in [self.image, self.thumbnail, self.medium_size]:
            if field:
                FileUtils.delete_file(field.name)
        super().delete(*args, **kwargs)


class Comment(models.Model):
    """
    Système de commentaires générique avec support de fichiers
    """
    # Contenu du commentaire
    content = models.TextField()
    
    # Relations génériques
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Utilisateur
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    
    # Hiérarchie (commentaires de réponse)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='replies')
    
    # Fichiers attachés
    attachments = models.ManyToManyField(FileUpload, blank=True, related_name='comments')
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # État
    is_edited = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'core_comment'
        verbose_name = 'Commentaire'
        verbose_name_plural = 'Commentaires'
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['author']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['created_at']
    
    def __str__(self):
        return f"Commentaire de {self.author.username} - {self.created_at}"
    
    @property
    def has_replies(self):
        return self.replies.exists()
    
    @property
    def replies_count(self):
        return self.replies.count()


class ActivityLog(models.Model):
    """
    Log d'activité générique pour tracer les actions utilisateur
    """
    ACTION_TYPES = [
        ('create', 'Création'),
        ('update', 'Modification'),
        ('delete', 'Suppression'),
        ('upload', 'Upload de fichier'),
        ('download', 'Téléchargement'),
        ('view', 'Consultation'),
        ('login', 'Connexion'),
        ('logout', 'Déconnexion'),
        ('other', 'Autre'),
    ]
    
    # Utilisateur qui a effectué l'action
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    
    # Action effectuée
    action = models.CharField(max_length=20, choices=ACTION_TYPES)
    description = models.TextField()
    
    # Objet concerné (optionnel)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, blank=True, null=True)
    object_id = models.PositiveIntegerField(blank=True, null=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Métadonnées
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    extra_data = models.JSONField(default=dict, blank=True)
    
    # Date
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'core_activitylog'
        verbose_name = 'Log d\'activité'
        verbose_name_plural = 'Logs d\'activité'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['action']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['content_type', 'object_id']),
        ]
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.username} - {self.get_action_display()} - {self.timestamp}"


# Signaux pour logging automatique
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver(post_save, sender=FileUpload)
def log_file_upload(sender, instance, created, **kwargs):
    """Logger les uploads de fichiers"""
    if created:
        ActivityLog.objects.create(
            user=instance.uploaded_by,
            action='upload',
            description=f'Upload du fichier: {instance.original_name}',
            content_object=instance,
            extra_data={
                'file_type': instance.file_type,
                'file_size': instance.file_size,
                'mime_type': instance.mime_type
            }
        )
