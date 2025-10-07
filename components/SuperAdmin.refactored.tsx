import React, { useState, useEffect } from 'react';
import { 
  usePermissionStore, 
  useRoles, 
  useModules, 
  usePermissions, 
  useUsers,
  usePermissionLoading,
  usePermissionError,
  usePermissionActions
} from '../stores/permissionStore';
import { Role, Module, PermissionUpdate } from '../services/refactoredRoleManagementService';

// =====================================================
// COMPOSANT SUPERADMIN REFACTORISÉ
// =====================================================

const SuperAdminRefactored: React.FC = () => {
  // =====================================================
  // HOOKS ET ÉTAT
  // =====================================================
  
  const roles = useRoles();
  const modules = useModules();
  const permissions = usePermissions();
  const users = useUsers();
  const loading = usePermissionLoading();
  const error = usePermissionError();
  const {
    fetchRoles,
    fetchModules,
    fetchPermissions,
    fetchUsers,
    updatePermission,
    updateMultiplePermissions,
    createRole,
    updateRole,
    deleteRole,
    createModule,
    updateModule,
    updateUserRole,
    resetToDefaultPermissions,
    exportPermissions,
    importPermissions,
    clearError
  } = usePermissionActions();

  // État local
  const [activeTab, setActiveTab] = useState<'roles' | 'modules' | 'users' | 'system'>('roles');
  const [saved, setSaved] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  // =====================================================
  // EFFETS
  // =====================================================

  useEffect(() => {
    // Charger toutes les données au montage du composant
    const loadData = async () => {
      try {
        await Promise.all([
          fetchRoles(),
          fetchModules(),
          fetchPermissions(),
          fetchUsers()
        ]);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
      }
    };

    loadData();
  }, [fetchRoles, fetchModules, fetchPermissions, fetchUsers]);

  // =====================================================
  // FONCTIONS DE GESTION DES PERMISSIONS
  // =====================================================

  const handlePermissionChange = async (
    roleId: string,
    moduleId: string,
    permission: string,
    value: boolean
  ) => {
    try {
      await updatePermission(roleId, moduleId, {
        [permission]: value
      });
      setSaved(false);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la permission:', err);
    }
  };

  const handleBulkPermissionChange = async (
    roleId: string,
    permission: string,
    value: boolean
  ) => {
    try {
      const updates = modules.map(module => ({
        roleId,
        moduleId: module.id,
        permissions: { [permission]: value }
      }));

      await updateMultiplePermissions(updates);
      setSaved(false);
    } catch (err) {
      console.error('Erreur lors de la mise à jour en masse:', err);
    }
  };

  const handleModuleBulkPermissionChange = async (
    moduleId: string,
    permission: string,
    value: boolean
  ) => {
    try {
      const updates = roles.map(role => ({
        roleId: role.id,
        moduleId,
        permissions: { [permission]: value }
      }));

      await updateMultiplePermissions(updates);
      setSaved(false);
    } catch (err) {
      console.error('Erreur lors de la mise à jour en masse:', err);
    }
  };

  // =====================================================
  // FONCTIONS DE GESTION DES RÔLES
  // =====================================================

  const handleCreateRole = async (roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createRole(roleData);
      setShowCreateRole(false);
    } catch (err) {
      console.error('Erreur lors de la création du rôle:', err);
    }
  };

  const handleUpdateRole = async (roleId: string, roleData: Partial<Role>) => {
    try {
      await updateRole(roleId, roleData);
      setEditingRole(null);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du rôle:', err);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      try {
        await deleteRole(roleId);
      } catch (err) {
        console.error('Erreur lors de la suppression du rôle:', err);
      }
    }
  };

  // =====================================================
  // FONCTIONS DE GESTION DES MODULES
  // =====================================================

  const handleCreateModule = async (moduleData: Omit<Module, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createModule(moduleData);
      setShowCreateModule(false);
    } catch (err) {
      console.error('Erreur lors de la création du module:', err);
    }
  };

  const handleUpdateModule = async (moduleId: string, moduleData: Partial<Module>) => {
    try {
      await updateModule(moduleId, moduleData);
      setEditingModule(null);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du module:', err);
    }
  };

  // =====================================================
  // FONCTIONS UTILITAIRES
  // =====================================================

  const handleResetPermissions = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les permissions ?')) {
      try {
        await resetToDefaultPermissions();
        setSaved(true);
      } catch (err) {
        console.error('Erreur lors de la réinitialisation:', err);
      }
    }
  };

  const handleExportPermissions = async () => {
    try {
      await exportPermissions();
    } catch (err) {
      console.error('Erreur lors de l\'export:', err);
    }
  };

  const handleImportPermissions = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          await importPermissions(config);
        } catch (err) {
          console.error('Erreur lors de l\'import:', err);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUpdateUserRole = async (userId: string, roleId: string) => {
    try {
      await updateUserRole(userId, roleId);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du rôle utilisateur:', err);
    }
  };

  // =====================================================
  // RENDU DES ERREURS
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-3">
            <button
              onClick={clearError}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recharger
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDU PRINCIPAL
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Administration</h1>
              <p className="mt-2 text-gray-600">
                Gestion des rôles, modules et permissions du système
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleExportPermissions}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <i className="fas fa-download mr-2"></i>
                Exporter
              </button>
              
              <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <i className="fas fa-upload mr-2"></i>
                Importer
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportPermissions}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={handleResetPermissions}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <i className="fas fa-undo mr-2"></i>
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'roles', label: 'Rôles', icon: 'fas fa-users-cog' },
              { id: 'modules', label: 'Modules', icon: 'fas fa-cubes' },
              { id: 'users', label: 'Utilisateurs', icon: 'fas fa-users' },
              { id: 'system', label: 'Système', icon: 'fas fa-cog' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des données...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Onglet Rôles */}
            {activeTab === 'roles' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Gestion des Rôles</h2>
                    <button
                      onClick={() => setShowCreateRole(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Nouveau Rôle
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rôle
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {roles.map((role) => (
                          <tr key={role.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {role.display_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {role.name}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {role.description || 'Aucune description'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                role.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {role.is_active ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => setEditingRole(role)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Modifier
                              </button>
                              {!role.is_system_role && (
                                <button
                                  onClick={() => handleDeleteRole(role.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Supprimer
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Modules */}
            {activeTab === 'modules' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Gestion des Modules</h2>
                    <button
                      onClick={() => setShowCreateModule(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Nouveau Module
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modules.map((module) => (
                      <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            {module.icon && (
                              <i className={`${module.icon} text-blue-600 mr-2`}></i>
                            )}
                            <h3 className="text-sm font-medium text-gray-900">
                              {module.display_name}
                            </h3>
                          </div>
                          <span className="text-xs text-gray-500">
                            #{module.order_index}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">
                          {module.description || 'Aucune description'}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingModule(module)}
                            className="text-xs text-blue-600 hover:text-blue-900"
                          >
                            Modifier
                          </button>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            module.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {module.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Utilisateurs */}
            {activeTab === 'users' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Gestion des Utilisateurs</h2>
                </div>
                
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Utilisateur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rôle
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-700">
                                      {user.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={user.role_id || ''}
                                onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                className="text-sm border-gray-300 rounded-md"
                              >
                                <option value="">Sélectionner un rôle</option>
                                {roles.map((role) => (
                                  <option key={role.id} value={role.id}>
                                    {role.display_name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900">
                                Voir profil
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Système */}
            {activeTab === 'system' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Informations Système</h2>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <i className="fas fa-users-cog text-blue-600 text-2xl"></i>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-blue-900">Rôles</p>
                          <p className="text-2xl font-bold text-blue-600">{roles.length}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <i className="fas fa-cubes text-green-600 text-2xl"></i>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-900">Modules</p>
                          <p className="text-2xl font-bold text-green-600">{modules.length}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <i className="fas fa-users text-purple-600 text-2xl"></i>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-purple-900">Utilisateurs</p>
                          <p className="text-2xl font-bold text-purple-600">{users.length}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <i className="fas fa-shield-alt text-orange-600 text-2xl"></i>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-orange-900">Permissions</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {Object.keys(permissions).length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SuperAdminRefactored;
