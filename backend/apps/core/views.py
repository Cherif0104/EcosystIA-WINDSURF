"""
Vues pour la gestion des fichiers et uploads
"""

import os
import mimetypes
from django.http import HttpResponse, Http404, JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.core.files.storage import default_storage
from django.conf import settings
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import FileUpload, ImageFile, Comment, ActivityLog
from .serializers import (
    FileUploadSerializer, ImageFileSerializer, CommentSerializer,
    ActivityLogSerializer, FileUploadCreateSerializer
)
from .storage import file_upload_handler, FileUtils


class FileUploadView(APIView):
    """
    Vue pour l'upload de fichiers
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, *args, **kwargs):
        """Upload d'un fichier"""
        try:
            file = request.FILES.get('file')
            if not file:
                return Response(
                    {'error': 'Aucun fichier fourni'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Paramètres optionnels
            file_type = request.data.get('file_type', 'document')
            title = request.data.get('title', '')
            description = request.data.get('description', '')
            is_public = request.data.get('is_public', False)
            
            # Validation du type de fichier
            try:
                if file_type == 'image':
                    file_upload_handler.validate_file(file, 'image')
                else:
                    file_upload_handler.validate_file(file, 'document')
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Optimiser les images si nécessaire
            if file_type == 'image':
                try:
                    optimized_file = file_upload_handler.optimize_image(file)
                    file = optimized_file
                except:
                    pass  # Utiliser le fichier original si l'optimisation échoue
            
            # Créer l'objet FileUpload
            file_upload = FileUpload.objects.create(
                file=file,
                original_name=file.name,
                file_type=file_type,
                title=title,
                description=description,
                uploaded_by=request.user,
                is_public=is_public
            )
            
            # Sérialiser la réponse
            serializer = FileUploadSerializer(file_upload)
            
            return Response({
                'success': True,
                'message': 'Fichier uploadé avec succès',
                'file': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de l\'upload: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AvatarUploadView(APIView):
    """
    Vue spécialisée pour l'upload d'avatars
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, *args, **kwargs):
        """Upload d'un avatar utilisateur"""
        try:
            file = request.FILES.get('avatar')
            if not file:
                return Response(
                    {'error': 'Aucun fichier avatar fourni'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validation spécifique avatar
            try:
                from .storage import validate_avatar_file
                validate_avatar_file(file)
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Optimiser pour avatar
            try:
                avatar_file = file_upload_handler.create_avatar_thumbnail(file)
            except Exception as e:
                return Response(
                    {'error': f'Erreur optimisation avatar: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Supprimer l'ancien avatar s'il existe
            old_avatar_uploads = FileUpload.objects.filter(
                uploaded_by=request.user,
                file_type='avatar'
            )
            for old_avatar in old_avatar_uploads:
                old_avatar.delete()
            
            # Créer le nouvel avatar
            avatar_upload = FileUpload.objects.create(
                file=avatar_file,
                original_name=file.name,
                file_type='avatar',
                title='Avatar utilisateur',
                uploaded_by=request.user,
                is_public=True  # Les avatars sont généralement publics
            )
            
            # Mettre à jour le profil utilisateur
            request.user.avatar = avatar_upload.file.url
            request.user.save(update_fields=['avatar'])
            
            serializer = FileUploadSerializer(avatar_upload)
            
            return Response({
                'success': True,
                'message': 'Avatar mis à jour avec succès',
                'avatar': serializer.data,
                'avatar_url': avatar_upload.file.url
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de l\'upload d\'avatar: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FileListView(generics.ListAPIView):
    """
    Liste des fichiers de l'utilisateur
    """
    serializer_class = FileUploadSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = FileUpload.objects.filter(uploaded_by=self.request.user)
        
        # Filtres
        file_type = self.request.query_params.get('file_type')
        if file_type:
            queryset = queryset.filter(file_type=file_type)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(original_name__icontains=search) |
                models.Q(title__icontains=search) |
                models.Q(description__icontains=search)
            )
        
        return queryset.order_by('-uploaded_at')


class FileDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Détail, modification et suppression d'un fichier
    """
    serializer_class = FileUploadSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return FileUpload.objects.filter(uploaded_by=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def download_file(request, file_id):
    """
    Télécharger un fichier
    """
    try:
        file_upload = get_object_or_404(FileUpload, id=file_id)
        
        # Vérifier les permissions
        if not file_upload.is_public and file_upload.uploaded_by != request.user:
            return Response(
                {'error': 'Vous n\'avez pas l\'autorisation de télécharger ce fichier'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Vérifier que le fichier existe
        if not default_storage.exists(file_upload.file.name):
            return Response(
                {'error': 'Fichier non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Logger le téléchargement
        ActivityLog.objects.create(
            user=request.user,
            action='download',
            description=f'Téléchargement du fichier: {file_upload.original_name}',
            content_object=file_upload
        )
        
        # Préparer la réponse
        file_content = default_storage.open(file_upload.file.name, 'rb').read()
        content_type = file_upload.mime_type or 'application/octet-stream'
        
        response = HttpResponse(file_content, content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{file_upload.original_name}"'
        response['Content-Length'] = len(file_content)
        
        return response
    
    except Exception as e:
        return Response(
            {'error': f'Erreur lors du téléchargement: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_upload(request):
    """
    Upload multiple files at once
    """
    try:
        files = request.FILES.getlist('files')
        if not files:
            return Response(
                {'error': 'Aucun fichier fourni'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file_type = request.data.get('file_type', 'document')
        results = []
        errors = []
        
        for file in files:
            try:
                # Validation
                if file_type == 'image':
                    file_upload_handler.validate_file(file, 'image')
                else:
                    file_upload_handler.validate_file(file, 'document')
                
                # Créer l'upload
                file_upload = FileUpload.objects.create(
                    file=file,
                    original_name=file.name,
                    file_type=file_type,
                    uploaded_by=request.user
                )
                
                serializer = FileUploadSerializer(file_upload)
                results.append(serializer.data)
            
            except Exception as e:
                errors.append({
                    'filename': file.name,
                    'error': str(e)
                })
        
        return Response({
            'success': True,
            'message': f'{len(results)} fichiers uploadés avec succès',
            'files': results,
            'errors': errors
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de l\'upload en lot: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def file_stats(request):
    """
    Statistiques des fichiers de l'utilisateur
    """
    try:
        user_files = FileUpload.objects.filter(uploaded_by=request.user)
        
        stats = {
            'total_files': user_files.count(),
            'total_size': user_files.aggregate(
                total=models.Sum('file_size')
            )['total'] or 0,
            'by_type': {},
            'recent_uploads': []
        }
        
        # Statistiques par type
        for file_type, label in FileUpload.FILE_TYPES:
            count = user_files.filter(file_type=file_type).count()
            size = user_files.filter(file_type=file_type).aggregate(
                total=models.Sum('file_size')
            )['total'] or 0
            
            if count > 0:
                stats['by_type'][file_type] = {
                    'count': count,
                    'size': size,
                    'size_human': FileUtils.format_file_size(size)
                }
        
        # Uploads récents
        recent_files = user_files.order_by('-uploaded_at')[:5]
        stats['recent_uploads'] = FileUploadSerializer(recent_files, many=True).data
        
        # Formater la taille totale
        stats['total_size_human'] = FileUtils.format_file_size(stats['total_size'])
        
        return Response(stats)
    
    except Exception as e:
        return Response(
            {'error': f'Erreur lors du calcul des statistiques: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class ImageUploadView(APIView):
    """
    Vue spécialisée pour l'upload d'images avec génération de miniatures
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, *args, **kwargs):
        """Upload d'une image avec génération automatique de miniatures"""
        try:
            image_file = request.FILES.get('image')
            if not image_file:
                return Response(
                    {'error': 'Aucune image fournie'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validation
            try:
                file_upload_handler.validate_file(image_file, 'image')
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Créer l'objet ImageFile
            image_obj = ImageFile.objects.create(
                image=image_file,
                original_name=image_file.name,
                uploaded_by=request.user,
                title=request.data.get('title', ''),
                alt_text=request.data.get('alt_text', '')
            )
            
            serializer = ImageFileSerializer(image_obj)
            
            return Response({
                'success': True,
                'message': 'Image uploadée avec succès',
                'image': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de l\'upload d\'image: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Import nécessaire pour les requêtes
from django.db import models
