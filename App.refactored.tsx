import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useLocalization } from './contexts/LocalizationContext';

// Import du nouveau routeur
import AppRouter from './components/routes/AppRouter';
import AppLayout from './components/layout/AppLayout';
import Login from './components/Login';
import Signup from './components/Signup';

// =====================================================
// APP.TSX REFACTORISÉ - AVEC ROUTEUR ET LAZY LOADING
// =====================================================

const App: React.FC = () => {
  const { user, login, isLoading, isAuthenticated } = useAuth();
  const { t } = useLocalization();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  // Afficher le spinner de chargement pendant l'authentification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">EcosystIA</h2>
          <p className="text-gray-600">Chargement de l'application...</p>
        </div>
      </div>
    );
  }

  // Afficher l'interface de connexion si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {authView === 'login' ? t('login.title') : t('signup.title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {authView === 'login' 
                ? t('login.subtitle') 
                : t('signup.subtitle')
              }
            </p>
          </div>
          
          {authView === 'login' ? (
            <Login 
              onSwitchToSignup={() => setAuthView('signup')} 
              onLogin={login}
            />
          ) : (
            <Signup 
              onSwitchToLogin={() => setAuthView('login')}
              onSignup={login} // Pour l'instant, utiliser la même fonction
            />
          )}
        </div>
      </div>
    );
  }

  // Afficher l'application avec le routeur si l'utilisateur est authentifié
  return (
    <AppLayout>
      <AppRouter />
    </AppLayout>
  );
};

export default App;
