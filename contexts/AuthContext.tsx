/**
 * Context d'authentification pour EcosystIA
 * Intégration complète avec l'API Authentication Django
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User, LoginCredentials, RegisterData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Vérifier d'abord le cache local
        const cachedUser = authService.getCurrentUserFromCache();
        if (cachedUser && authService.isAuthenticated()) {
          setUser(cachedUser);
          
          // Vérifier la validité du token en arrière-plan
          try {
            const tokenCheck = await authService.verifyToken();
            if (!tokenCheck.valid) {
              throw new Error('Token invalide');
            }
            
            // Rafraîchir les données utilisateur
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            // Token invalide, déconnecter
            await logout();
          }
        }
      } catch (error) {
        console.error('Erreur initialisation auth:', error);
        setError('Erreur de connexion');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const authResponse = await authService.login(credentials);
      setUser(authResponse.user);
      
      // Notification de succès
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(`Bienvenue ${authResponse.user.full_name} !`, 'success');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      // Notification de succès
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(
          'Inscription réussie ! Vérifiez votre email pour activer votre compte.',
          'success'
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'inscription';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      
      // Notification de déconnexion
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Déconnexion réussie', 'info');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Forcer la déconnexion même en cas d'erreur
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      
      // Notification de succès
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Profil mis à jour avec succès', 'success');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de mise à jour';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Erreur refresh user:', error);
      // En cas d'erreur, déconnecter
      await logout();
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user && authService.isAuthenticated(),
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;