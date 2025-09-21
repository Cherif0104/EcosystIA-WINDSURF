/**
 * Gestionnaire d'erreurs pour EcosystIA
 * Gestion centralisée des erreurs API et notifications
 */

import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  error: boolean;
  message: string;
  details?: any;
  code: number;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class EcosystiaError extends Error {
  public code: number;
  public details?: any;
  public timestamp: string;
  
  constructor(message: string, code: number = 500, details?: any) {
    super(message);
    this.name = 'EcosystiaError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export const errorHandler = {
  /**
   * Traite les erreurs Axios et les convertit en erreurs standardisées
   */
  handleAxiosError: (error: AxiosError): EcosystiaError => {
    if (error.response?.data) {
      const apiError = error.response.data as ApiErrorResponse;
      return new EcosystiaError(
        apiError.message || 'Erreur API',
        apiError.code || error.response.status,
        apiError.details
      );
    }
    
    if (error.request) {
      // Erreur réseau
      return new EcosystiaError(
        'Erreur de connexion. Vérifiez votre connexion internet.',
        0,
        { type: 'NETWORK_ERROR' }
      );
    }
    
    return new EcosystiaError(
      error.message || 'Une erreur inattendue est survenue',
      500
    );
  },

  /**
   * Extrait les erreurs de validation des réponses API
   */
  extractValidationErrors: (error: EcosystiaError): ValidationError[] => {
    const validationErrors: ValidationError[] = [];
    
    if (error.details && typeof error.details === 'object') {
      Object.entries(error.details).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach((message: string) => {
            validationErrors.push({ field, message });
          });
        } else if (typeof messages === 'string') {
          validationErrors.push({ field, message: messages });
        }
      });
    }
    
    return validationErrors;
  },

  /**
   * Formate les erreurs pour l'affichage utilisateur
   */
  formatErrorForUser: (error: any): string => {
    if (error instanceof EcosystiaError) {
      return error.message;
    }
    
    if (error instanceof AxiosError) {
      const ecosystiaError = errorHandler.handleAxiosError(error);
      return ecosystiaError.message;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'Une erreur inattendue est survenue';
  },

  /**
   * Détermine le type de notification selon l'erreur
   */
  getNotificationType: (error: EcosystiaError): 'error' | 'warning' | 'info' => {
    switch (error.code) {
      case 400:
      case 422:
        return 'warning'; // Erreurs de validation
      case 401:
      case 403:
        return 'error'; // Erreurs d'authentification
      case 404:
        return 'info'; // Ressource non trouvée
      case 429:
        return 'warning'; // Rate limiting
      case 500:
      case 502:
      case 503:
        return 'error'; // Erreurs serveur
      default:
        return 'error';
    }
  },

  /**
   * Log les erreurs pour le monitoring
   */
  logError: (error: EcosystiaError, context?: string) => {
    const logData = {
      message: error.message,
      code: error.code,
      details: error.details,
      timestamp: error.timestamp,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!)?.id : null,
    };
    
    console.error('EcosystIA Error:', logData);
    
    // En production, envoyer à un service de monitoring (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Exemple avec Sentry
      // Sentry.captureException(error, { extra: logData });
    }
  },
};

// Hook pour la gestion d'erreurs dans les composants
export const useErrorHandler = () => {
  const showNotification = (message: string, type: 'error' | 'warning' | 'info' | 'success') => {
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(message, type);
    }
  };

  const handleError = (error: any, context?: string) => {
    let ecosystiaError: EcosystiaError;
    
    if (error instanceof AxiosError) {
      ecosystiaError = errorHandler.handleAxiosError(error);
    } else if (error instanceof EcosystiaError) {
      ecosystiaError = error;
    } else {
      ecosystiaError = new EcosystiaError(
        error?.message || 'Une erreur inattendue est survenue'
      );
    }
    
    // Log l'erreur
    errorHandler.logError(ecosystiaError, context);
    
    // Afficher la notification
    const notificationType = errorHandler.getNotificationType(ecosystiaError);
    const userMessage = errorHandler.formatErrorForUser(ecosystiaError);
    showNotification(userMessage, notificationType);
    
    return ecosystiaError;
  };

  const handleValidationErrors = (error: EcosystiaError): Record<string, string> => {
    const validationErrors = errorHandler.extractValidationErrors(error);
    const fieldErrors: Record<string, string> = {};
    
    validationErrors.forEach(({ field, message }) => {
      fieldErrors[field] = message;
    });
    
    return fieldErrors;
  };

  return {
    handleError,
    handleValidationErrors,
    showNotification,
  };
};

// Types d'erreurs spécifiques à EcosystIA
export const ErrorTypes = {
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR: 'SERVER_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
} as const;

export default errorHandler;