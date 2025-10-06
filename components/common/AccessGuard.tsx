import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

interface AccessGuardProps {
  module: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPermission?: 'canView' | 'canCreate' | 'canUpdate' | 'canDelete' | 'canManage';
}

const AccessGuard: React.FC<AccessGuardProps> = ({ 
  module, 
  children, 
  fallback,
  requiredPermission = 'canView'
}) => {
  const permissions = usePermissions(module);

  if (!permissions[requiredPermission]) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-lock text-red-600 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Accès Refusé</h2>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à ce module.
          </p>
          <p className="text-sm text-gray-500">
            Contactez votre administrateur pour obtenir les droits d'accès.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AccessGuard;
