import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/databaseService';
import { geminiService } from '../services/geminiService';

import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { User, Role } from '../types';
import { ROLE_COLORS, getRoleConfig } from '../constants/roleColors';
import { permissionService, RoleModulePermissions } from '../services/permissionService';

// Interface déjà définie dans permissionService

const SuperAdmin: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<'roles' | 'modules' | 'users' | 'system'>('roles');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Modules disponibles dans EcosystIA
  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', description: 'Vue d\'ensemble et KPIs' },
    { id: 'projects', name: 'Projets', icon: 'fas fa-project-diagram', description: 'Gestion de projets' },
    { id: 'goals', name: 'Objectifs (OKRs)', icon: 'fas fa-bullseye', description: 'Objectifs et résultats clés' },
    { id: 'courses', name: 'Cours', icon: 'fas fa-graduation-cap', description: 'Formation et certification' },
    { id: 'jobs', name: 'Emplois', icon: 'fas fa-briefcase', description: 'Gestion des emplois' },
    { id: 'time_tracking', name: 'Suivi Temps', icon: 'fas fa-clock', description: 'Suivi du temps de travail' },
    { id: 'leave_management', name: 'Congés', icon: 'fas fa-calendar-times', description: 'Gestion des congés' },
    { id: 'finance', name: 'Finance', icon: 'fas fa-chart-line', description: 'Gestion financière' },
    { id: 'crm_sales', name: 'CRM & Ventes', icon: 'fas fa-handshake', description: 'Relation client et ventes' },
    { id: 'knowledge_base', name: 'Base de Connaissances', icon: 'fas fa-book', description: 'Base de connaissances' },
    { id: 'development', name: 'Développement', icon: 'fas fa-code', description: 'Développement et API' },
    { id: 'tools', name: 'Outils', icon: 'fas fa-tools', description: 'Outils intégrés' },
    { id: 'ai_coach', name: 'Coach IA', icon: 'fas fa-robot', description: 'Assistant IA personnel' },
    { id: 'gen_ai_lab', name: 'Laboratoire IA', icon: 'fas fa-flask', description: 'Expérimentation IA' },
    { id: 'analytics', name: 'Analytique', icon: 'fas fa-chart-bar', description: 'Analyses et rapports' },
    { id: 'user_management', name: 'Gestion Utilisateurs', icon: 'fas fa-users-cog', description: 'Administration des utilisateurs' },
    { id: 'settings', name: 'Paramètres', icon: 'fas fa-cog', description: 'Configuration système' }
  ];

  // Rôles disponibles
  const allRoles: Role[] = [
    'super_administrator', 'administrator', 'manager', 'supervisor',
    'student', 'trainer', 'teacher', 'entrepreneur', 'employer',
    'funder', 'mentor', 'coach', 'facilitator', 'publisher',
    'producer', 'artist', 'editor', 'implementer', 'intern', 'alumni'
  ];

  // État des permissions par rôle et module
  const [permissions, setPermissions] = useState<RoleModulePermissions>(permissionService.getAllPermissions());
  const [saved, setSaved] = useState(false);

  // Charger les utilisateurs (simulation)
  useEffect(() => {
    // Simuler le chargement des utilisateurs
    const mockUsers: User[] = [
      { id: 1, name: 'Pape Samb', email: 'pape@senegel.org', avatar: 'https://picsum.photos/100/100?random=1', role: 'super_administrator', skills: [] },
      { id: 2, name: 'Amadou Dia LY', email: 'amadou@senegel.org', avatar: 'https://picsum.photos/100/100?random=2', role: 'administrator', skills: [] },
      { id: 3, name: 'Mariame GUINDO', email: 'mariame@senegel.org', avatar: 'https://picsum.photos/100/100?random=3', role: 'manager', skills: [] },
      { id: 4, name: 'Adama Mandaw SENE', email: 'adama@senegel.org', avatar: 'https://picsum.photos/100/100?random=4', role: 'trainer', skills: [] },
    ];
    setUsers(mockUsers);
  }, []);

  const updatePermission = (role: Role, module: string, permission: string, value: boolean) => {
    permissionService.setPermission(role, module, permission as any, value);
    setPermissions(permissionService.getAllPermissions());
    setSaved(false);
  };

  const updateAllPermissionsForRole = (role: Role, module: string, value: boolean) => {
    permissionService.setAllPermissions(role, module, value);
    setPermissions(permissionService.getAllPermissions());
    setSaved(false);
  };

  const savePermissions = () => {
    // Les permissions sont déjà sauvegardées automatiquement
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetPermissions = () => {
    permissionService.resetToDefaults();
    setPermissions(permissionService.getAllPermissions());
    setSaved(false);
  };

  const exportPermissions = () => {
    const data = permissionService.exportPermissions();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ecosystia-permissions.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderRolesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Gestion des Rôles et Permissions</h3>
          <div className="flex space-x-2">
            <button
              onClick={savePermissions}
              className={`px-4 py-2 rounded-lg flex items-center ${
                saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <i className="fas fa-save mr-2"></i>
              {saved ? 'Sauvegardé !' : 'Sauvegarder'}
            </button>
            <button
              onClick={exportPermissions}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
            >
              <i className="fas fa-download mr-2"></i>
              Exporter
            </button>
            <button
              onClick={resetPermissions}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
            >
              <i className="fas fa-undo mr-2"></i>
              Reset
            </button>
          </div>
        </div>
        
        {/* Tableau des permissions par rôle */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                {modules.map(module => (
                  <th key={module.id} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex flex-col items-center">
                      <i className={`${module.icon} mb-1`}></i>
                      <span className="text-xs">{module.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allRoles.map(role => {
                const roleConfig = getRoleConfig(role);
                
  // Gestionnaires d'événements pour les boutons
  const handleButtonClick = (action: string) => {
    console.log('Action:', action);
    // Logique spécifique selon l'action
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulaire soumis');
    // Logique de soumission
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('Changement:', name, value);
    // Logique de changement
  };

  
  // Gestionnaires d'événements complets
  const handleCreate = async (data: any) => {
    try {
      const result = await databaseService.create('superadmin', data);
      console.log('Creation reussie:', result);
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur creation:', error);
    }
  };
  
  const handleEdit = async (id: number, data: any) => {
    try {
      const result = await databaseService.update('superadmin', id, data);
      console.log('Modification reussie:', result);
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur modification:', error);
    }
  };
  
  const handleDelete = async (id: number) => {
    try {
      const result = await databaseService.delete('superadmin', id);
      console.log('Suppression reussie:', result);
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };
  
  const handleExport = async () => {
    try {
      const data = await databaseService.getAll('superadmin');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'superadmin_export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export:', error);
    }
  };
  
  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await databaseService.bulkCreate('superadmin', data);
      console.log('Import reussi');
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur import:', error);
    }
  };
  
  const handleApprove = async (id: number) => {
    try {
      const result = await databaseService.update('superadmin', id, { status: 'approved' });
      console.log('Approbation reussie:', result);
    } catch (error) {
      console.error('Erreur approbation:', error);
    }
  };
  
  const handleReject = async (id: number) => {
    try {
      const result = await databaseService.update('superadmin', id, { status: 'rejected' });
      console.log('Rejet reussi:', result);
    } catch (error) {
      console.error('Erreur rejet:', error);
    }
  };
  
  const handleCancel = () => {
    console.log('Action annulée');
    // Fermer les modals ou réinitialiser
  };
  
  const handleSave = async (data: any) => {
    try {
      const result = await databaseService.createOrUpdate('superadmin', data);
      console.log('Sauvegarde reussie:', result);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };
  
  const handleAdd = async (data: any) => {
    try {
      const result = await databaseService.create('superadmin', data);
      console.log('Ajout reussi:', result);
    } catch (error) {
      console.error('Erreur ajout:', error);
    }
  };
  
  const handleRemove = async (id: number) => {
    try {
      const result = await databaseService.delete('superadmin', id);
      console.log('Suppression reussie:', result);
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  return (
                  <tr key={role} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${roleConfig.primary.replace('bg-', 'bg-')} mr-3`}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{roleConfig.name}</div>
                          <div className="text-sm text-gray-500">{role}</div>
                        </div>
                      </div>
                    </td>
                    {modules.map(module => {
                      const modulePermissions = permissions[role]?.[module.id];
                      return (
                        <td key={module.id} className="px-2 py-4 text-center">
                          <div className="flex flex-col space-y-1">
                            <div className="flex justify-center space-x-1">
                              <input
                                type="checkbox"
                                checked={modulePermissions?.canView || false}
                                onChange={(e) => updatePermission(role, module.id, 'canView', e.target.checked)}
                                className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                                title="Voir"
                              />
                              <input
                                type="checkbox"
                                checked={modulePermissions?.canCreate || false}
                                onChange={(e) => updatePermission(role, module.id, 'canCreate', e.target.checked)}
                                className="w-3 h-3 text-green-600 rounded focus:ring-green-500"
                                title="Créer"
                              />
                              <input
                                type="checkbox"
                                checked={modulePermissions?.canUpdate || false}
                                onChange={(e) => updatePermission(role, module.id, 'canUpdate', e.target.checked)}
                                className="w-3 h-3 text-yellow-600 rounded focus:ring-yellow-500"
                                title="Modifier"
                              />
                              <input
                                type="checkbox"
                                checked={modulePermissions?.canDelete || false}
                                onChange={(e) => updatePermission(role, module.id, 'canDelete', e.target.checked)}
                                className="w-3 h-3 text-red-600 rounded focus:ring-red-500"
                                title="Supprimer"
                              />
                            </div>
                            <button
                              onClick={() => updateAllPermissionsForRole(role, module.id, !modulePermissions?.canView)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              {modulePermissions?.canView ? 'Tout' : 'Rien'}
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderModulesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuration des Modules</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(module => (
            <div key={module.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3`}>
                  <i className={`${module.icon} text-blue-600`}></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{module.name}</h4>
                  <p className="text-sm text-gray-500">{module.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Actif</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Public</span>
                  <input type="checkbox" className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Maintenance</span>
                  <input type="checkbox" className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Gestion des Utilisateurs</h3>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center">
            <i className="fas fa-plus mr-2"></i>
            Nouvel Utilisateur
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière Connexion</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => {
                const roleConfig = getRoleConfig(user.role);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleConfig.badge}`}>
                        <i className={`${roleConfig.icon} mr-1`}></i>
                        {roleConfig.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <i className="fas fa-circle text-green-400 mr-1"></i>
                        Actif
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      Il y a 2 heures
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuration Système</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Paramètres Généraux</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Maintenance Mode</span>
                <input type="checkbox" className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Debug Mode</span>
                <input type="checkbox" className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Notifications Email</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Sécurité</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">2FA Obligatoire</span>
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sessions Multiples</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Audit Logs</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex space-x-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <i className="fas fa-save mr-2"></i>
            Sauvegarder Configuration
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center">
            <i className="fas fa-power-off mr-2"></i>
            Redémarrer Système
          </button>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center">
            <i className="fas fa-download mr-2"></i>
            Exporter Logs
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Super Administration</h1>
          <p className="mt-2 text-gray-600">
            Gestion granulaire des rôles, modules et utilisateurs d'EcosystIA
          </p>
        </div>

        {/* Navigation des onglets */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'roles', name: 'Rôles & Permissions', icon: 'fas fa-users-cog' },
                { id: 'modules', name: 'Modules', icon: 'fas fa-puzzle-piece' },
                { id: 'users', name: 'Utilisateurs', icon: 'fas fa-users' },
                { id: 'system', name: 'Système', icon: 'fas fa-cogs' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className={`${tab.icon} mr-2`}></i>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'roles' && renderRolesTab()}
        {activeTab === 'modules' && renderModulesTab()}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'system' && renderSystemTab()}
      </div>
    </div>
  );
};

export default SuperAdmin;
