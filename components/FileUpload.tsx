/**
 * Composant d'upload de fichiers avec drag & drop et preview
 */

import React, { useState, useRef, useCallback } from 'react';
import { useFileUpload } from '../hooks/useApi';

interface FileUploadProps {
  fileType?: 'document' | 'image' | 'avatar' | 'project_file' | 'course_material' | 'other';
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // en MB
  onUploadComplete?: (files: any[]) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

interface UploadedFile {
  file: File;
  id?: string;
  preview?: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  result?: any;
}

const FileUpload: React.FC<FileUploadProps> = ({
  fileType = 'document',
  multiple = false,
  accept,
  maxSize = 10, // 10MB par défaut
  onUploadComplete,
  onUploadError,
  className = '',
  disabled = false
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, error } = useFileUpload();

  // Configuration par type de fichier
  const getAcceptedTypes = () => {
    if (accept) return accept;
    
    switch (fileType) {
      case 'image':
      case 'avatar':
        return 'image/jpeg,image/png,image/gif,image/webp';
      case 'document':
        return '.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx';
      default:
        return '*/*';
    }
  };

  // Validation des fichiers
  const validateFile = (file: File): string | null => {
    // Vérifier la taille
    if (file.size > maxSize * 1024 * 1024) {
      return `Le fichier est trop volumineux (max: ${maxSize}MB)`;
    }

    // Vérifier le type pour les images
    if (fileType === 'image' || fileType === 'avatar') {
      if (!file.type.startsWith('image/')) {
        return 'Seules les images sont acceptées';
      }
    }

    return null;
  };

  // Créer une preview pour les images
  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve('');
      }
    });
  };

  // Traiter les fichiers sélectionnés
  const processFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validationError = validateFile(file);
      
      if (validationError) {
        onUploadError?.(validationError);
        continue;
      }

      const preview = await createPreview(file);
      
      newFiles.push({
        file,
        id: `${Date.now()}-${i}`,
        preview,
        status: 'pending',
        progress: 0
      });
    }

    if (!multiple) {
      setFiles(newFiles.slice(0, 1));
    } else {
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, [multiple, maxSize, fileType, onUploadError]);

  // Upload d'un fichier
  const uploadFile = async (uploadedFile: UploadedFile) => {
    setFiles(prev => prev.map(f => 
      f.id === uploadedFile.id 
        ? { ...f, status: 'uploading', progress: 0 }
        : f
    ));

    try {
      const endpoint = fileType === 'avatar' ? '/core/avatar/upload/' : '/core/files/upload/';
      
      const formData = new FormData();
      if (fileType === 'avatar') {
        formData.append('avatar', uploadedFile.file);
      } else {
        formData.append('file', uploadedFile.file);
        formData.append('file_type', fileType);
      }

      const result = await upload(uploadedFile.file, endpoint, { file_type: fileType });

      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'completed', progress: 100, result }
          : f
      ));

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de l\'upload';
      
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'error', error: errorMessage }
          : f
      ));

      onUploadError?.(errorMessage);
      throw error;
    }
  };

  // Upload de tous les fichiers
  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    const results = [];

    for (const file of pendingFiles) {
      try {
        const result = await uploadFile(file);
        results.push(result);
      } catch (error) {
        // L'erreur est déjà gérée dans uploadFile
      }
    }

    if (results.length > 0) {
      onUploadComplete?.(results);
    }
  };

  // Gestionnaires d'événements
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Calculer les statistiques
  const completedFiles = files.filter(f => f.status === 'completed');
  const errorFiles = files.filter(f => f.status === 'error');
  const pendingFiles = files.filter(f => f.status === 'pending');

  return (
    <div className={`file-upload-container ${className}`}>
      {/* Zone de drop */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!disabled ? openFileDialog : undefined}
      >
        <div className="space-y-4">
          <div className="text-6xl text-gray-400">
            {fileType === 'image' || fileType === 'avatar' ? '🖼️' : '📁'}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragOver 
                ? 'Déposez vos fichiers ici' 
                : `Cliquez ou déposez ${multiple ? 'vos fichiers' : 'votre fichier'} ici`
              }
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Types acceptés: {getAcceptedTypes().split(',').join(', ')}
            </p>
            <p className="text-sm text-gray-500">
              Taille maximale: {maxSize}MB {multiple ? 'par fichier' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Input caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptedTypes()}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              Fichiers sélectionnés ({files.length})
            </h3>
            
            {pendingFiles.length > 0 && (
              <button
                onClick={uploadAllFiles}
                disabled={uploading || disabled}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload mr-2"></i>
                    Uploader {pendingFiles.length} fichier{pendingFiles.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Fichiers individuels */}
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
            >
              {/* Preview */}
              <div className="flex-shrink-0">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <i className="fas fa-file text-gray-500"></i>
                  </div>
                )}
              </div>

              {/* Infos fichier */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.file.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                
                {/* Barre de progression */}
                {file.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Message d'erreur */}
                {file.status === 'error' && file.error && (
                  <p className="text-sm text-red-600 mt-1">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {file.error}
                  </p>
                )}
              </div>

              {/* Statut et actions */}
              <div className="flex-shrink-0 flex items-center space-x-2">
                {file.status === 'pending' && (
                  <span className="text-sm text-gray-500">En attente</span>
                )}
                
                {file.status === 'uploading' && (
                  <span className="text-sm text-blue-600">
                    <i className="fas fa-spinner fa-spin mr-1"></i>
                    Upload...
                  </span>
                )}
                
                {file.status === 'completed' && (
                  <span className="text-sm text-green-600">
                    <i className="fas fa-check-circle mr-1"></i>
                    Terminé
                  </span>
                )}
                
                {file.status === 'error' && (
                  <span className="text-sm text-red-600">
                    <i className="fas fa-times-circle mr-1"></i>
                    Erreur
                  </span>
                )}

                {/* Bouton supprimer */}
                <button
                  onClick={() => removeFile(file.id!)}
                  className="text-gray-400 hover:text-red-600"
                  disabled={file.status === 'uploading'}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Résumé */}
      {files.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Terminés: <strong className="text-green-600">{completedFiles.length}</strong></span>
            <span>En attente: <strong className="text-yellow-600">{pendingFiles.length}</strong></span>
            <span>Erreurs: <strong className="text-red-600">{errorFiles.length}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
