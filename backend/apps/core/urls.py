"""
URLs pour la gestion des fichiers et uploads
"""

from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # Upload de fichiers
    path('files/upload/', views.FileUploadView.as_view(), name='file-upload'),
    path('files/bulk-upload/', views.bulk_upload, name='bulk-upload'),
    path('files/', views.FileListView.as_view(), name='file-list'),
    path('files/<int:pk>/', views.FileDetailView.as_view(), name='file-detail'),
    path('files/<int:file_id>/download/', views.download_file, name='file-download'),
    path('files/stats/', views.file_stats, name='file-stats'),
    
    # Upload spécialisés
    path('avatar/upload/', views.AvatarUploadView.as_view(), name='avatar-upload'),
    path('images/upload/', views.ImageUploadView.as_view(), name='image-upload'),
]
