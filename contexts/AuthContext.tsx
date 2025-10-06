
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Clés pour le localStorage
const AUTH_STORAGE_KEY = 'ecosystia_auth_user';
const AUTH_SESSION_KEY = 'ecosystia_session';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier la session au chargement
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Vérifier d'abord sessionStorage (plus sécurisé)
        const sessionData = sessionStorage.getItem(AUTH_SESSION_KEY);
        if (sessionData) {
          const parsedUser = JSON.parse(sessionData);
          setUser(parsedUser);
          console.log('✅ Session restaurée depuis sessionStorage');
        } else {
          // Fallback vers localStorage
          const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            console.log('✅ Session restaurée depuis localStorage');
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de la restauration de la session:', error);
        // Nettoyer les données corrompues
        localStorage.removeItem(AUTH_STORAGE_KEY);
        sessionStorage.removeItem(AUTH_SESSION_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (user: User) => {
    try {
      setUser(user);
      
      // Sauvegarder dans sessionStorage (priorité)
      sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
      
      // Sauvegarder aussi dans localStorage (backup)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      
      console.log('✅ Utilisateur connecté et session sauvegardée:', user.name, user.role);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la session:', error);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      
      // Nettoyer sessionStorage et localStorage
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      
      console.log('✅ Utilisateur déconnecté et session nettoyée');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    }
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};