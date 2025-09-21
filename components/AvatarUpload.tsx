/**
 * Composant spécialisé pour l'upload d'avatar utilisateur
 */

import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFileUpload } from '../hooks/useApi';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange?: (newAvatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarChange,
  size = 'md',
  className = ''
}) => {
  const { user, updateProfile } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload } = useFileUpload();

  // Tailles d'avatar
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const avatarUrl = preview || currentAvatar || user?.avatar;
  const displayName = user?.first_name || user?.username || 'Utilisateur';
  const initials = displayName.substring(0, 2).toUpperCase();

  const validateFile = (file: File): string | null => {
    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      return 'Seules les images sont acceptées';
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return 'L\'image est trop volumineuse (max: 5MB)';
    }

    // Vérifier les dimensions minimales
    return new Promise<string | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 50 || img.height < 50) {
          resolve('L\'image doit faire au minimum 50x50 pixels');
        } else if (Math.max(img.width, img.height) / Math.min(img.width, img.height) > 3) {
          resolve('L\'image doit avoir des proportions raisonnables');
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve('Image invalide');
      img.src = URL.createObjectURL(file);
    }) as any;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validation
    const validationError = await validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Créer une preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    await uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      // Utiliser l'endpoint spécialisé avatar
      const response = await fetch('/api/v1/core/avatar/upload/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }

      const data = await response.json();
      
      if (data.success) {
        // Mettre à jour le profil utilisateur
        await updateProfile({ avatar: data.avatar_url });
        
        // Callback
        onAvatarChange?.(data.avatar_url);
        
        // Réinitialiser la preview
        setPreview(null);
      } else {
        throw new Error(data.message || 'Erreur lors de l\'upload');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'upload de l\'avatar');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = async () => {
    try {
      await updateProfile({ avatar: null });
      setPreview(null);
      onAvatarChange?.('');
    } catch (error: any) {
      setError('Erreur lors de la suppression de l\'avatar');
    }
  };

  return (
    <div className={`avatar-upload ${className}`}>
      {/* Avatar avec overlay */}
      <div className="relative inline-block">
        <div
          className={`
            ${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer
            border-4 border-white shadow-lg relative group
            ${isUploading ? 'opacity-50' : ''}
          `}
          onClick={!isUploading ? openFileDialog : undefined}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {initials}
              </span>
            </div>
          )}

          {/* Overlay au hover */}
          {!isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-white text-center">
                <i className="fas fa-camera text-xl mb-1"></i>
                <p className="text-xs">Changer</p>
              </div>
            </div>
          )}

          {/* Indicateur de chargement */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <i className="fas fa-spinner fa-spin text-white text-xl"></i>
            </div>
          )}
        </div>

        {/* Bouton supprimer */}
        {avatarUrl && !isUploading && (
          <button
            onClick={removeAvatar}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            title="Supprimer l'avatar"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        )}
      </div>

      {/* Input caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Informations et erreurs */}
      <div className="mt-3 text-center">
        {error && (
          <p className="text-sm text-red-600 mb-2">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {error}
          </p>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>Formats acceptés: JPG, PNG, GIF, WebP</p>
          <p>Taille maximale: 5MB</p>
          <p>Dimensions minimales: 50x50px</p>
        </div>

        {!isUploading && (
          <button
            onClick={openFileDialog}
            className="mt-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-upload mr-2"></i>
            Changer l'avatar
          </button>
        )}
      </div>
    </div>
  );
};

export default AvatarUpload;
