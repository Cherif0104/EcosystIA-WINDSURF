/**
 * Provider React Query pour EcosystIA
 * Configuration optimisée pour les APIs Django
 */

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Configuration optimisée du QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Temps de cache par défaut
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Ne pas retry sur les erreurs d'authentification
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        // Retry jusqu'à 3 fois pour les autres erreurs
        return failureCount < 3;
      },
      
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch configuration
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry pour les mutations critiques
      retry: (failureCount, error: any) => {
        // Retry seulement sur les erreurs réseau
        if (error?.code === 'NETWORK_ERROR' && failureCount < 2) {
          return true;
        }
        return false;
      },
      
      onError: (error: any) => {
        console.error('Mutation error:', error);
        
        // Afficher notification d'erreur globale
        if (typeof window !== 'undefined' && window.showToast) {
          const message = error?.response?.data?.message || 'Une erreur est survenue';
          window.showToast(message, 'error');
        }
      },
    },
  },
});

// Gestion des erreurs globales
queryClient.setMutationDefaults(['auth', 'login'], {
  mutationFn: async (credentials: any) => {
    // Logique de login avec gestion d'erreur spécifique
    throw new Error('Implémentation dans authService');
  },
  onError: (error: any) => {
    if (error?.response?.status === 429) {
      // Rate limiting
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Trop de tentatives de connexion. Veuillez patienter.', 'warning');
      }
    }
  },
});

// Configuration spécifique pour les données temps réel
queryClient.setQueryDefaults(['time-tracking', 'timer'], {
  refetchInterval: 10000, // 10 secondes
  staleTime: 0,
});

queryClient.setQueryDefaults(['analytics', 'real-time'], {
  refetchInterval: 5000, // 5 secondes
  staleTime: 0,
});

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools seulement en développement */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
};

// Utilitaires pour invalidation de cache
export const invalidateQueries = {
  // Invalider toutes les données d'un module
  projects: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  courses: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  crm: () => queryClient.invalidateQueries({ queryKey: ['crm'] }),
  finance: () => queryClient.invalidateQueries({ queryKey: ['finance'] }),
  timeTracking: () => queryClient.invalidateQueries({ queryKey: ['time-tracking'] }),
  goals: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  analytics: () => queryClient.invalidateQueries({ queryKey: ['analytics'] }),
  
  // Invalider les dashboards
  allDashboards: () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
  },
  
  // Invalider les données utilisateur
  user: () => {
    queryClient.invalidateQueries({ queryKey: ['user'] });
    queryClient.invalidateQueries({ queryKey: ['auth'] });
  },
  
  // Invalider tout le cache
  all: () => queryClient.invalidateQueries(),
};

// Préchargement de données critiques
export const prefetchCriticalData = async (userId: number) => {
  // Note: Les services seront importés quand ils seront disponibles
  console.log('Préchargement de données pour utilisateur:', userId);
  
  try {
    // TODO: Implémenter le préchargement quand les services seront disponibles
    console.log('Données critiques préchargées avec succès');
  } catch (error) {
    console.error('Erreur préchargement:', error);
  }
};

export { queryClient };
export default QueryProvider;
