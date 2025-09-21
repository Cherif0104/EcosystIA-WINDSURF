/**
 * Configuration d'environnement pour EcosystIA
 * Gestion centralisée des variables d'environnement
 */

interface EnvironmentConfig {
  // API Configuration
  apiBaseUrl: string;
  backendUrl: string;
  websocketUrl: string;
  
  // App Configuration
  appName: string;
  appVersion: string;
  nodeEnv: string;
  
  // Authentication
  jwtSecret: string;
  tokenRefreshInterval: number;
  sessionTimeout: number;
  
  // Features
  enableDevtools: boolean;
  enableAnalytics: boolean;
  enableNotifications: boolean;
  enableOfflineMode: boolean;
  
  // External Services
  googleAnalyticsId?: string;
  sentryDsn?: string;
  crispWebsiteId?: string;
  
  // File Upload
  maxFileSize: number;
  allowedFileTypes: string[];
  
  // Cache
  cacheDuration: number;
  offlineCacheSize: number;
  
  // Pagination
  defaultPageSize: number;
  maxPageSize: number;
  
  // Notifications
  notificationTimeout: number;
  maxNotifications: number;
  
  // AI Configuration
  geminiApiKey?: string;
  geminiModel: string;
  aiMaxTokens: number;
  
  // Development
  mockApi: boolean;
  debugMode: boolean;
  logLevel: string;
  
  // Production
  enablePwa: boolean;
  enableServiceWorker: boolean;
  preloadCriticalData: boolean;
}

// Fonction pour parser les booléens depuis les variables d'environnement
const parseBoolean = (value: string | undefined, defaultValue: boolean = false): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};

// Fonction pour parser les nombres
const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Configuration de l'environnement
export const env: EnvironmentConfig = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
  websocketUrl: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000/ws',
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'EcosystIA',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  nodeEnv: import.meta.env.VITE_NODE_ENV || 'development',
  
  // Authentication
  jwtSecret: import.meta.env.VITE_JWT_SECRET || 'default-secret-key',
  tokenRefreshInterval: parseNumber(import.meta.env.VITE_TOKEN_REFRESH_INTERVAL, 300000), // 5 minutes
  sessionTimeout: parseNumber(import.meta.env.VITE_SESSION_TIMEOUT, 3600000), // 1 heure
  
  // Features
  enableDevtools: parseBoolean(import.meta.env.VITE_ENABLE_DEVTOOLS, true),
  enableAnalytics: parseBoolean(import.meta.env.VITE_ENABLE_ANALYTICS, true),
  enableNotifications: parseBoolean(import.meta.env.VITE_ENABLE_NOTIFICATIONS, true),
  enableOfflineMode: parseBoolean(import.meta.env.VITE_ENABLE_OFFLINE_MODE, false),
  
  // External Services
  googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  crispWebsiteId: import.meta.env.VITE_CRISP_WEBSITE_ID,
  
  // File Upload
  maxFileSize: parseNumber(import.meta.env.VITE_MAX_FILE_SIZE, 10485760), // 10MB
  allowedFileTypes: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,jpeg,png,gif,mp4,mov').split(','),
  
  // Cache
  cacheDuration: parseNumber(import.meta.env.VITE_CACHE_DURATION, 300000), // 5 minutes
  offlineCacheSize: parseNumber(import.meta.env.VITE_OFFLINE_CACHE_SIZE, 50),
  
  // Pagination
  defaultPageSize: parseNumber(import.meta.env.VITE_DEFAULT_PAGE_SIZE, 20),
  maxPageSize: parseNumber(import.meta.env.VITE_MAX_PAGE_SIZE, 100),
  
  // Notifications
  notificationTimeout: parseNumber(import.meta.env.VITE_NOTIFICATION_TIMEOUT, 5000), // 5 secondes
  maxNotifications: parseNumber(import.meta.env.VITE_MAX_NOTIFICATIONS, 5),
  
  // AI Configuration
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
  geminiModel: import.meta.env.VITE_GEMINI_MODEL || 'gemini-pro',
  aiMaxTokens: parseNumber(import.meta.env.VITE_AI_MAX_TOKENS, 1000),
  
  // Development
  mockApi: parseBoolean(import.meta.env.VITE_MOCK_API, false),
  debugMode: parseBoolean(import.meta.env.VITE_DEBUG_MODE, true),
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'debug',
  
  // Production
  enablePwa: parseBoolean(import.meta.env.VITE_ENABLE_PWA, true),
  enableServiceWorker: parseBoolean(import.meta.env.VITE_ENABLE_SERVICE_WORKER, true),
  preloadCriticalData: parseBoolean(import.meta.env.VITE_PRELOAD_CRITICAL_DATA, true),
};

// Validation de la configuration
export const validateEnvironment = (): string[] => {
  const errors: string[] = [];
  
  // Vérifications critiques
  if (!env.apiBaseUrl) {
    errors.push('VITE_API_BASE_URL is required');
  }
  
  if (!env.backendUrl) {
    errors.push('VITE_BACKEND_URL is required');
  }
  
  if (env.nodeEnv === 'production') {
    if (!env.sentryDsn) {
      console.warn('VITE_SENTRY_DSN not configured for production');
    }
    
    if (!env.googleAnalyticsId) {
      console.warn('VITE_GOOGLE_ANALYTICS_ID not configured for production');
    }
  }
  
  // Validation des tailles de fichier
  if (env.maxFileSize < 1024) {
    errors.push('VITE_MAX_FILE_SIZE must be at least 1024 bytes');
  }
  
  // Validation pagination
  if (env.defaultPageSize > env.maxPageSize) {
    errors.push('VITE_DEFAULT_PAGE_SIZE cannot be greater than VITE_MAX_PAGE_SIZE');
  }
  
  return errors;
};

// Utilitaires de configuration
export const configUtils = {
  isDevelopment: () => env.nodeEnv === 'development',
  isProduction: () => env.nodeEnv === 'production',
  isTesting: () => env.nodeEnv === 'test',
  
  // Formatage des URLs
  getApiUrl: (endpoint: string) => `${env.apiBaseUrl}${endpoint}`,
  getBackendUrl: (path: string) => `${env.backendUrl}${path}`,
  getWebsocketUrl: (path: string) => `${env.websocketUrl}${path}`,
  
  // Validation des fichiers
  isFileTypeAllowed: (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? env.allowedFileTypes.includes(extension) : false;
  },
  
  isFileSizeAllowed: (size: number) => size <= env.maxFileSize,
  
  // Formatage des tailles
  formatFileSize: (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  getMaxFileSizeFormatted: () => configUtils.formatFileSize(env.maxFileSize),
  
  // Debug helpers
  logConfig: () => {
    if (env.debugMode) {
      console.group('🔧 EcosystIA Configuration');
      console.log('Environment:', env.nodeEnv);
      console.log('API Base URL:', env.apiBaseUrl);
      console.log('Backend URL:', env.backendUrl);
      console.log('Features:', {
        devtools: env.enableDevtools,
        analytics: env.enableAnalytics,
        notifications: env.enableNotifications,
        offline: env.enableOfflineMode,
      });
      console.groupEnd();
    }
  },
};

// Initialisation et validation au chargement
const initErrors = validateEnvironment();
if (initErrors.length > 0) {
  console.error('❌ Configuration errors:', initErrors);
  if (env.nodeEnv === 'production') {
    throw new Error(`Configuration errors: ${initErrors.join(', ')}`);
  }
}

// Log de la configuration en développement
if (configUtils.isDevelopment()) {
  configUtils.logConfig();
}

export default env;
