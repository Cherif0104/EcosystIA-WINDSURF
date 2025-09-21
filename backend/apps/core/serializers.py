"""
Serializers pour la gestion des fichiers et uploads
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import FileUpload, ImageFile, Comment, ActivityLog

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer basique pour les utilisateurs"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'avatar']
        read_only_fields = ['id', 'username', 'email', 'full_name', 'avatar']


class FileUploadSerializer(serializers.ModelSerializer):
    """Serializer pour les fichiers uploadés"""
    uploaded_by = UserBasicSerializer(read_only=True)
    file_size_human = serializers.ReadOnlyField()
    file_extension = serializers.ReadOnlyField()
    is_image = serializers.ReadOnlyField()
    download_url = serializers.ReadOnlyField()
    
    class Meta:
        model = FileUpload
        fields = [
            'id', 'file', 'original_name', 'file_type', 'mime_type', 'file_size',
            'file_size_human', 'file_extension', 'is_image', 'title', 'description',
            'uploaded_by', 'uploaded_at', 'updated_at', 'is_public', 'is_active',
            'download_url'
        ]
        read_only_fields = [
            'id', 'mime_type', 'file_size', 'file_size_human', 'file_extension',
            'is_image', 'uploaded_by', 'uploaded_at', 'updated_at', 'download_url'
        ]


class FileUploadCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de fichiers"""
    
    class Meta:
        model = FileUpload
        fields = [
            'file', 'file_type', 'title', 'description', 'is_public'
        ]
    
    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)


class ImageFileSerializer(serializers.ModelSerializer):
    """Serializer pour les images avec miniatures"""
    uploaded_by = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = ImageFile
        fields = [
            'id', 'image', 'thumbnail', 'medium_size', 'original_name',
            'width', 'height', 'title', 'alt_text', 'uploaded_by',
            'uploaded_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'thumbnail', 'medium_size', 'width', 'height',
            'uploaded_by', 'uploaded_at', 'updated_at'
        ]


class CommentSerializer(serializers.ModelSerializer):
    """Serializer pour les commentaires"""
    author = UserBasicSerializer(read_only=True)
    attachments = FileUploadSerializer(many=True, read_only=True)
    attachment_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    has_replies = serializers.ReadOnlyField()
    replies_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'content', 'author', 'parent', 'attachments', 'attachment_ids',
            'created_at', 'updated_at', 'is_edited', 'is_deleted',
            'has_replies', 'replies_count'
        ]
        read_only_fields = [
            'id', 'author', 'created_at', 'updated_at', 'is_edited',
            'has_replies', 'replies_count'
        ]
    
    def create(self, validated_data):
        attachment_ids = validated_data.pop('attachment_ids', [])
        validated_data['author'] = self.context['request'].user
        
        comment = Comment.objects.create(**validated_data)
        
        # Ajouter les pièces jointes
        if attachment_ids:
            attachments = FileUpload.objects.filter(
                id__in=attachment_ids,
                uploaded_by=self.context['request'].user
            )
            comment.attachments.set(attachments)
        
        return comment
    
    def update(self, instance, validated_data):
        attachment_ids = validated_data.pop('attachment_ids', None)
        
        # Marquer comme édité si le contenu change
        if 'content' in validated_data and validated_data['content'] != instance.content:
            validated_data['is_edited'] = True
        
        # Mettre à jour les champs
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Mettre à jour les pièces jointes si fourni
        if attachment_ids is not None:
            attachments = FileUpload.objects.filter(
                id__in=attachment_ids,
                uploaded_by=self.context['request'].user
            )
            instance.attachments.set(attachments)
        
        return instance


class ActivityLogSerializer(serializers.ModelSerializer):
    """Serializer pour les logs d'activité"""
    user = UserBasicSerializer(read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'action', 'action_display', 'description',
            'ip_address', 'user_agent', 'extra_data', 'timestamp'
        ]
        read_only_fields = ['id', 'user', 'timestamp']


class FileStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques de fichiers"""
    total_files = serializers.IntegerField()
    total_size = serializers.IntegerField()
    total_size_human = serializers.CharField()
    by_type = serializers.DictField()
    recent_uploads = FileUploadSerializer(many=True)


class BulkUploadSerializer(serializers.Serializer):
    """Serializer pour l'upload en lot"""
    files = serializers.ListField(
        child=serializers.FileField(),
        allow_empty=False
    )
    file_type = serializers.ChoiceField(
        choices=FileUpload.FILE_TYPES,
        default='document'
    )
    title_prefix = serializers.CharField(max_length=100, required=False)
    description = serializers.CharField(required=False)
    is_public = serializers.BooleanField(default=False)


class AvatarUploadSerializer(serializers.Serializer):
    """Serializer pour l'upload d'avatar"""
    avatar = serializers.ImageField()
    
    def validate_avatar(self, value):
        """Validation spécifique pour l'avatar"""
        from .storage import validate_avatar_file
        validate_avatar_file(value)
        return value
