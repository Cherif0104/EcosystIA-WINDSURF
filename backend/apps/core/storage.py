"""
Système de stockage et upload de fichiers pour EcosystIA
"""

import os
import hashlib
import mimetypes
from datetime import datetime
from PIL import Image
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible
from django.utils import timezone
import magic


@deconstructible
class FileUploadHandler:
    """Gestionnaire d'upload de fichiers avec validation et optimisation"""
    
    def __init__(self):
        self.allowed_image_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        self.allowed_document_types = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/csv'
        ]
        self.max_image_size = 5 * 1024 * 1024  # 5MB
        self.max_document_size = 10 * 1024 * 1024  # 10MB
        self.image_max_dimensions = (2048, 2048)
        self.avatar_dimensions = (300, 300)
    
    def validate_file(self, file, file_type='document'):
        """Valider un fichier uploadé"""
        errors = []
        
        # Vérifier la taille
        max_size = self.max_image_size if file_type == 'image' else self.max_document_size
        if file.size > max_size:
            errors.append(f'Le fichier est trop volumineux. Taille maximale: {max_size // (1024*1024)}MB')
        
        # Vérifier le type MIME
        file_mime_type = self.get_mime_type(file)
        allowed_types = self.allowed_image_types if file_type == 'image' else self.allowed_document_types
        
        if file_mime_type not in allowed_types:
            errors.append(f'Type de fichier non autorisé: {file_mime_type}')
        
        # Validations spécifiques aux images
        if file_type == 'image' and file_mime_type in self.allowed_image_types:
            try:
                with Image.open(file) as img:
                    width, height = img.size
                    max_width, max_height = self.image_max_dimensions
                    
                    if width > max_width or height > max_height:
                        errors.append(f'Image trop grande. Dimensions maximales: {max_width}x{max_height}px')
                    
                    # Vérifier que l'image n'est pas corrompue
                    img.verify()
            except Exception as e:
                errors.append('Fichier image corrompu ou invalide')
        
        if errors:
            raise ValidationError(errors)
        
        return True
    
    def get_mime_type(self, file):
        """Obtenir le type MIME d'un fichier"""
        try:
            # Utiliser python-magic pour une détection plus précise
            file.seek(0)
            mime_type = magic.from_buffer(file.read(1024), mime=True)
            file.seek(0)
            return mime_type
        except:
            # Fallback vers mimetypes
            return mimetypes.guess_type(file.name)[0] or 'application/octet-stream'
    
    def generate_filename(self, original_filename, user_id=None, prefix=''):
        """Générer un nom de fichier unique et sécurisé"""
        # Extraire l'extension
        name, ext = os.path.splitext(original_filename)
        ext = ext.lower()
        
        # Créer un hash unique basé sur le contenu et l'heure
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        hash_input = f"{original_filename}_{timestamp}_{user_id or ''}"
        file_hash = hashlib.md5(hash_input.encode()).hexdigest()[:8]
        
        # Construire le nom final
        safe_name = f"{prefix}{timestamp}_{file_hash}{ext}" if prefix else f"{timestamp}_{file_hash}{ext}"
        
        return safe_name
    
    def get_upload_path(self, instance, filename, folder='uploads'):
        """Générer le chemin d'upload"""
        year = timezone.now().year
        month = timezone.now().month
        
        # Organiser par année/mois
        path = f"{folder}/{year}/{month:02d}/"
        
        # Sous-dossier par type d'objet si applicable
        if hasattr(instance, '__class__'):
            model_name = instance.__class__.__name__.lower()
            path += f"{model_name}/"
        
        return path + filename
    
    def optimize_image(self, image_file, max_dimensions=None, quality=85):
        """Optimiser une image (redimensionnement et compression)"""
        max_dimensions = max_dimensions or self.image_max_dimensions
        
        try:
            with Image.open(image_file) as img:
                # Convertir en RGB si nécessaire
                if img.mode in ('RGBA', 'LA', 'P'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                
                # Redimensionner si nécessaire
                if img.size[0] > max_dimensions[0] or img.size[1] > max_dimensions[1]:
                    img.thumbnail(max_dimensions, Image.Resampling.LANCZOS)
                
                # Sauvegarder avec compression
                from io import BytesIO
                output = BytesIO()
                img.save(output, format='JPEG', quality=quality, optimize=True)
                output.seek(0)
                
                return ContentFile(output.getvalue())
        
        except Exception as e:
            raise ValidationError(f'Erreur lors de l\'optimisation de l\'image: {str(e)}')
    
    def create_avatar_thumbnail(self, image_file):
        """Créer un avatar optimisé"""
        return self.optimize_image(image_file, self.avatar_dimensions, quality=90)


# Instance globale
file_upload_handler = FileUploadHandler()


def avatar_upload_path(instance, filename):
    """Chemin d'upload pour les avatars"""
    safe_filename = file_upload_handler.generate_filename(filename, instance.id, 'avatar_')
    return file_upload_handler.get_upload_path(instance, safe_filename, 'avatars')


def document_upload_path(instance, filename):
    """Chemin d'upload pour les documents"""
    safe_filename = file_upload_handler.generate_filename(filename, getattr(instance, 'user_id', None), 'doc_')
    return file_upload_handler.get_upload_path(instance, safe_filename, 'documents')


def project_file_upload_path(instance, filename):
    """Chemin d'upload pour les fichiers de projet"""
    safe_filename = file_upload_handler.generate_filename(filename, instance.project.id, 'project_')
    return file_upload_handler.get_upload_path(instance, safe_filename, 'projects')


def course_material_upload_path(instance, filename):
    """Chemin d'upload pour les matériaux de cours"""
    safe_filename = file_upload_handler.generate_filename(filename, instance.course.id, 'course_')
    return file_upload_handler.get_upload_path(instance, safe_filename, 'courses')


# Validateurs de fichiers
def validate_image_file(file):
    """Validateur pour les fichiers image"""
    return file_upload_handler.validate_file(file, 'image')


def validate_document_file(file):
    """Validateur pour les documents"""
    return file_upload_handler.validate_file(file, 'document')


def validate_avatar_file(file):
    """Validateur spécifique pour les avatars"""
    file_upload_handler.validate_file(file, 'image')
    
    # Vérifications supplémentaires pour les avatars
    try:
        with Image.open(file) as img:
            width, height = img.size
            
            # Ratio acceptable pour un avatar
            ratio = max(width, height) / min(width, height)
            if ratio > 2.0:
                raise ValidationError('L\'avatar doit avoir un ratio largeur/hauteur raisonnable (max 2:1)')
            
            # Taille minimale
            if width < 50 or height < 50:
                raise ValidationError('L\'avatar doit faire au minimum 50x50 pixels')
    
    except Exception as e:
        if isinstance(e, ValidationError):
            raise
        raise ValidationError('Fichier avatar invalide')


# Utilitaires de manipulation de fichiers
class FileUtils:
    """Utilitaires pour la manipulation de fichiers"""
    
    @staticmethod
    def get_file_info(file_path):
        """Obtenir les informations d'un fichier"""
        if not default_storage.exists(file_path):
            return None
        
        try:
            size = default_storage.size(file_path)
            modified_time = default_storage.get_modified_time(file_path)
            
            return {
                'name': os.path.basename(file_path),
                'size': size,
                'size_human': FileUtils.format_file_size(size),
                'modified_time': modified_time,
                'url': default_storage.url(file_path) if hasattr(default_storage, 'url') else None
            }
        except:
            return None
    
    @staticmethod
    def format_file_size(size_bytes):
        """Formater la taille d'un fichier en format lisible"""
        if size_bytes == 0:
            return "0 B"
        
        size_names = ["B", "KB", "MB", "GB", "TB"]
        i = 0
        while size_bytes >= 1024 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
        
        return f"{size_bytes:.1f} {size_names[i]}"
    
    @staticmethod
    def delete_file(file_path):
        """Supprimer un fichier de façon sécurisée"""
        try:
            if default_storage.exists(file_path):
                default_storage.delete(file_path)
                return True
        except:
            pass
        return False
    
    @staticmethod
    def get_file_extension(filename):
        """Obtenir l'extension d'un fichier"""
        return os.path.splitext(filename)[1].lower()
    
    @staticmethod
    def is_image_file(filename):
        """Vérifier si un fichier est une image"""
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
        return FileUtils.get_file_extension(filename) in image_extensions
    
    @staticmethod
    def generate_thumbnail_path(original_path):
        """Générer le chemin pour une miniature"""
        dir_name = os.path.dirname(original_path)
        base_name = os.path.basename(original_path)
        name, ext = os.path.splitext(base_name)
        return os.path.join(dir_name, 'thumbnails', f"{name}_thumb{ext}")


# Configuration des paramètres de stockage
UPLOAD_SETTINGS = {
    'AVATAR_MAX_SIZE': 2 * 1024 * 1024,  # 2MB
    'DOCUMENT_MAX_SIZE': 10 * 1024 * 1024,  # 10MB
    'IMAGE_MAX_SIZE': 5 * 1024 * 1024,  # 5MB
    'AVATAR_DIMENSIONS': (300, 300),
    'IMAGE_MAX_DIMENSIONS': (2048, 2048),
    'ALLOWED_AVATAR_TYPES': ['image/jpeg', 'image/png'],
    'ALLOWED_IMAGE_TYPES': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'ALLOWED_DOCUMENT_TYPES': [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ]
}
