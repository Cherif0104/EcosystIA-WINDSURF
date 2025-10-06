import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement de votre session...</p>
        <p className="text-sm text-gray-500 mt-2">Veuillez patienter</p>
      </div>
    </div>
  )
}) => {
  const { isLoading, isAuthenticated } = useAuth();

  // Affichage du loading pendant la vérification de la session
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Si pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  // Si authentifié, afficher le contenu protégé
  return <>{children}</>;
};

export default ProtectedRoute;
