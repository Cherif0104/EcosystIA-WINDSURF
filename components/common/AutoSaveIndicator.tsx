import React from 'react';
import { AutoSaveState } from '../../services/realtimeService';

interface AutoSaveIndicatorProps {
  state: AutoSaveState;
  className?: string;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ state, className = '' }) => {
  const { isSaving, lastSaved, hasUnsavedChanges, error } = state;

  const getStatusColor = () => {
    if (error) return 'text-red-600';
    if (isSaving) return 'text-blue-600';
    if (hasUnsavedChanges) return 'text-yellow-600';
    if (lastSaved) return 'text-green-600';
    return 'text-gray-400';
  };

  const getStatusIcon = () => {
    if (error) return 'fas fa-exclamation-triangle';
    if (isSaving) return 'fas fa-spinner fa-spin';
    if (hasUnsavedChanges) return 'fas fa-circle';
    if (lastSaved) return 'fas fa-check-circle';
    return 'fas fa-circle';
  };

  const getStatusText = () => {
    if (error) return `Erreur: ${error}`;
    if (isSaving) return 'Sauvegarde en cours...';
    if (hasUnsavedChanges) return 'Modifications non sauvegardées';
    if (lastSaved) return `Sauvegardé à ${formatTime(lastSaved)}`;
    return 'En attente';
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'à l\'instant';
    if (minutes < 60) return `il y a ${minutes}m`;
    if (hours < 24) return `il y a ${hours}h`;
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <i className={`${getStatusIcon()} ${getStatusColor()}`}></i>
      <span className={`${getStatusColor()} font-medium`}>
        {getStatusText()}
      </span>
      
      {error && (
        <button
          onClick={() => window.location.reload()}
          className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Recharger
        </button>
      )}
    </div>
  );
};

export default AutoSaveIndicator;
