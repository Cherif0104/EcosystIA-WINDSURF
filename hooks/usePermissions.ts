import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { permissionService, ModulePermission } from '../services/permissionService';

export const usePermissions = (module?: string) => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user || !module) {
      return { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false };
    }

    return permissionService.getPermissions(user.role, module);
  }, [user, module]);

  const canAccess = (action: keyof ModulePermission): boolean => {
    if (!user || !module) return false;
    return permissionService.canAccess(user.role, module, action);
  };

  const hasAnyPermission = (): boolean => {
    return Object.values(permissions).some(Boolean);
  };

  const canView = canAccess('canView');
  const canCreate = canAccess('canCreate');
  const canUpdate = canAccess('canUpdate');
  const canDelete = canAccess('canDelete');
  const canManage = canAccess('canManage');

  return {
    permissions,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    canManage,
    hasAnyPermission,
    canAccess
  };
};