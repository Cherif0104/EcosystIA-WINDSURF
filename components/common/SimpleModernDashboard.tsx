import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleConfig } from '../../constants/roleColors';

interface SimpleModernDashboardProps {
  setView: (view: string) => void;
  stats: any;
}

const SimpleModernDashboard: React.FC<SimpleModernDashboardProps> = ({ setView, stats }) => {
  const { user } = useAuth();
  const userRole = user?.role || 'student';
  const roleConfig = getRoleConfig(userRole);
  
  // Debug: Afficher les informations de l'utilisateur
  useEffect(() => {
    console.log('🎯 Dashboard - Utilisateur actuel:', user);
    console.log('🎯 Dashboard - Rôle détecté:', userRole);
    console.log('🎯 Dashboard - Configuration du rôle:', roleConfig);
    console.log('🎯 Dashboard - Nom du rôle affiché:', roleConfig.name);
    console.log('🎯 Dashboard - Badge du rôle:', roleConfig.badge);
  }, [user, userRole, roleConfig]);
  
  // S'assurer que nous avons les données utilisateur
  const userName = user?.name || user?.email?.split('@')[0] || 'Utilisateur';
  const userDisplayName = userName.charAt(0).toUpperCase() + userName.slice(1);
  const isConnected = !!user;
  const userEmail = user?.email || 'Non connecté';

  // Configuration des modules selon le rôle - TOUS LES RÔLES SUPPORTÉS
  const getRoleModules = (role: string) => {
    const allModules = [
      { id: 'projects', name: 'Projets', icon: 'fas fa-project-diagram', view: 'projects', count: stats.activeProjects },
      { id: 'courses', name: 'Formations', icon: 'fas fa-graduation-cap', view: 'courses', count: stats.completedCourses },
      { id: 'jobs', name: 'Emplois', icon: 'fas fa-briefcase', view: 'jobs', count: stats.totalJobs },
      { id: 'crm', name: 'CRM', icon: 'fas fa-users', view: 'crm_sales', count: 0 },
      { id: 'finance', name: 'Finance', icon: 'fas fa-chart-line', view: 'finance', count: stats.totalInvoices },
      { id: 'goals', name: 'Objectifs', icon: 'fas fa-target', view: 'goals_okrs', count: 0 },
      { id: 'analytics', name: 'Analytics', icon: 'fas fa-chart-bar', view: 'analytics', count: 0 },
      { id: 'settings', name: 'Paramètres', icon: 'fas fa-cog', view: 'settings', count: 0 }
    ];

    // Tous les modules sont visibles pour tous les rôles
    return allModules;
  };

  // Actions rapides selon le rôle - PERSONNALISÉES POUR CHAQUE RÔLE
  const getQuickActions = (role: string) => {
    const actions = {
      super_administrator: [
        { label: 'Gestion Utilisateurs', icon: 'fas fa-users-cog', view: 'user_management', color: 'red' },
        { label: 'Analytics Système', icon: 'fas fa-chart-bar', view: 'analytics', color: 'blue' },
        { label: 'Paramètres', icon: 'fas fa-cog', view: 'settings', color: 'gray' },
        { label: 'Projets', icon: 'fas fa-project-diagram', view: 'projects', color: 'emerald' }
      ],
      administrator: [
        { label: 'Gestion Utilisateurs', icon: 'fas fa-users-cog', view: 'user_management', color: 'blue' },
        { label: 'Analytics', icon: 'fas fa-chart-bar', view: 'analytics', color: 'purple' },
        { label: 'Projets', icon: 'fas fa-project-diagram', view: 'projects', color: 'emerald' },
        { label: 'Finance', icon: 'fas fa-chart-line', view: 'finance', color: 'green' }
      ],
      manager: [
        { label: 'Direction Stratégique', icon: 'fas fa-chart-line', view: 'analytics', color: 'orange' },
        { label: 'Gestion Équipe', icon: 'fas fa-users', view: 'crm_sales', color: 'blue' },
        { label: 'Projets', icon: 'fas fa-project-diagram', view: 'projects', color: 'emerald' },
        { label: 'Finance', icon: 'fas fa-chart-line', view: 'finance', color: 'green' }
      ],
      teacher: [
        { label: 'Mes Cours', icon: 'fas fa-chalkboard-teacher', view: 'courses', color: 'green' },
        { label: 'Projets Étudiants', icon: 'fas fa-users', view: 'projects', color: 'blue' },
        { label: 'Analytics', icon: 'fas fa-chart-bar', view: 'analytics', color: 'purple' },
        { label: 'Objectifs Pédagogiques', icon: 'fas fa-target', view: 'goals_okrs', color: 'orange' }
      ],
      student: [
        { label: 'Mes Projets', icon: 'fas fa-project-diagram', view: 'projects', color: 'emerald' },
        { label: 'Formations', icon: 'fas fa-graduation-cap', view: 'courses', color: 'blue' },
        { label: 'Emplois', icon: 'fas fa-briefcase', view: 'jobs', color: 'purple' },
        { label: 'Objectifs', icon: 'fas fa-target', view: 'goals_okrs', color: 'orange' }
      ],
      employer: [
        { label: 'Publier Emploi', icon: 'fas fa-plus', view: 'jobs', color: 'purple' },
        { label: 'Candidats', icon: 'fas fa-users', view: 'crm_sales', color: 'blue' },
        { label: 'Analytics', icon: 'fas fa-chart-bar', view: 'analytics', color: 'green' },
        { label: 'Finance', icon: 'fas fa-chart-line', view: 'finance', color: 'emerald' }
      ],
      supervisor: [
        { label: 'Superviser Projets', icon: 'fas fa-eye', view: 'projects', color: 'indigo' },
        { label: 'Équipe', icon: 'fas fa-users', view: 'crm_sales', color: 'blue' },
        { label: 'Rapports', icon: 'fas fa-chart-bar', view: 'analytics', color: 'purple' },
        { label: 'Objectifs', icon: 'fas fa-target', view: 'goals_okrs', color: 'orange' }
      ],
      editor: [
        { label: 'Contenus', icon: 'fas fa-edit', view: 'knowledge_base', color: 'teal' },
        { label: 'Formations', icon: 'fas fa-graduation-cap', view: 'courses', color: 'blue' },
        { label: 'Projets', icon: 'fas fa-project-diagram', view: 'projects', color: 'emerald' },
        { label: 'Analytics', icon: 'fas fa-chart-bar', view: 'analytics', color: 'purple' }
      ],
      entrepreneur: [
        { label: 'Mes Projets', icon: 'fas fa-project-diagram', view: 'projects', color: 'yellow' },
        { label: 'Finance', icon: 'fas fa-chart-line', view: 'finance', color: 'green' },
        { label: 'Objectifs', icon: 'fas fa-target', view: 'goals_okrs', color: 'orange' },
        { label: 'Analytics', icon: 'fas fa-chart-bar', view: 'analytics', color: 'purple' }
      ],
      funder: [
        { label: 'Projets Financés', icon: 'fas fa-coins', view: 'projects', color: 'emerald' },
        { label: 'Finance', icon: 'fas fa-chart-line', view: 'finance', color: 'green' },
        { label: 'Analytics', icon: 'fas fa-chart-bar', view: 'analytics', color: 'purple' },
        { label: 'Rapports', icon: 'fas fa-file-alt', view: 'analytics', color: 'blue' }
      ],
      mentor: [
        { label: 'Mentorat', icon: 'fas fa-user-graduate', view: 'projects', color: 'cyan' },
        { label: 'Formations', icon: 'fas fa-graduation-cap', view: 'courses', color: 'blue' },
        { label: 'Objectifs', icon: 'fas fa-target', view: 'goals_okrs', color: 'orange' },
        { label: 'Analytics', icon: 'fas fa-chart-bar', view: 'analytics', color: 'purple' }
      ],
      intern: [
        { label: 'Projets Stage', icon: 'fas fa-user-clock', view: 'projects', color: 'pink' },
        { label: 'Formations', icon: 'fas fa-graduation-cap', view: 'courses', color: 'blue' },
        { label: 'Objectifs', icon: 'fas fa-target', view: 'goals_okrs', color: 'orange' },
        { label: 'Emplois', icon: 'fas fa-briefcase', view: 'jobs', color: 'purple' }
      ],
      trainer: [
        { label: 'Mes Formations', icon: 'fas fa-chalkboard-teacher', view: 'courses', color: 'green' },
        { label: 'Projets', icon: 'fas fa-project-diagram', view: 'projects', color: 'emerald' },
        { label: 'Analytics', icon: 'fas fa-chart-bar', view: 'analytics', color: 'purple' },
        { label: 'Objectifs', icon: 'fas fa-target', view: 'goals_okrs', color: 'orange' }
      ],
      implementer: [
        { label: 'Implémentation', icon: 'fas fa-cogs', view: 'projects', color: 'gray' },
        { label: 'Projets', icon: 'fas fa-project-diagram', view: 'projects', color: 'emerald' },
        { label: 'Analytics', icon: 'fas fa-chart-bar', view: 'analytics', color: 'purple' },
        { label: 'Paramètres', icon: 'fas fa-cog', view: 'settings', color: 'blue' }
      ],
      coach: [
        { label: 'Coaching', icon: 'fas fa-running', view: 'projects', color: 'lime' },
        { label: 'Objectifs', icon: 'fas fa-target', view: 'goals_okrs', color: 'orange' },
        { label: 'Formations', icon: 'fas fa-graduation-cap', view: 'courses', color: 'blue' },
        { label: 'Analytics', icon: 'fas fa-chart-bar', view: 'analytics', color: 'purple' }
      ],
      facilitator: [
        { label: 'Facilitation', icon: 'fas fa-hands-helping', view: 'projects', color: 'amber' },
        { label: 'Projets', icon: 'fas fa-project-diagram', view: 'projects', color: 'emerald' },
        { label: 'Formations', icon: 'fas fa-graduation-cap', view: 'courses', color: 'blue' },
        { label: 'Analytics', icon: 'fas fa-chart-bar', view: 'analytics', color: 'purple' }
      ],
      publisher: [
        { label: 'Publication', icon: 'fas fa-newspaper', view: 'knowledge_base', color: 'violet' },
        { label: 'Contenus', icon: 'fas fa-edit', view: 'knowledge_base', color: 'teal' },
        { label: 'Formations', icon: 'fas fa-graduation-cap', view: 'courses', color: 'blue' },
        { label: 'Analytics', icon: 'fas fa-chart-bar', view: 'analytics', color: 'purple' }
      ],
      producer: [
        { label: 'Production', icon: 'fas fa-video', view: 'projects', color: 'rose' },
        { label: 'Projets', icon: 'fas fa-project-diagram', view: 'projects', color: 'emerald' },
        { label: 'Formations', icon: 'fas fa-graduation-cap', view: 'courses', color: 'blue' },
        { label: 'Analytics', icon: 'fas fa-chart-bar', view: 'analytics', color: 'purple' }
      ],
      artist: [
        { label: 'Créations', icon: 'fas fa-palette', view: 'projects', color: 'fuchsia' },
        { label: 'Projets', icon: 'fas fa-project-diagram', view: 'projects', color: 'emerald' },
        { label: 'Formations', icon: 'fas fa-graduation-cap', view: 'courses', color: 'blue' },
        { label: 'Portfolio', icon: 'fas fa-images', view: 'projects', color: 'purple' }
      ],
      alumni: [
        { label: 'Réseau Alumni', icon: 'fas fa-user-graduate', view: 'crm_sales', color: 'slate' },
        { label: 'Projets', icon: 'fas fa-project-diagram', view: 'projects', color: 'emerald' },
        { label: 'Formations', icon: 'fas fa-graduation-cap', view: 'courses', color: 'blue' },
        { label: 'Mentorat', icon: 'fas fa-hands-helping', view: 'projects', color: 'amber' }
      ]
    };

    return actions[role as keyof typeof actions] || actions.student;
  };

  const modules = getRoleModules(userRole);
  const quickActions = getQuickActions(userRole);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête moderne avec configuration du rôle */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className={`w-20 h-20 bg-gradient-to-br ${roleConfig.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                <i className={`${roleConfig.icon} text-white text-3xl`}></i>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Bonjour, {userDisplayName} !
                </h1>
                <p className="text-gray-600 text-lg mb-2">
                  {roleConfig.description}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Connecté en tant que :</span>
                  <span className={`px-3 py-1 ${roleConfig.badge} rounded-full text-sm font-medium`}>
                    {roleConfig.name}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end space-x-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-500">
                  {isConnected ? 'Connecté' : 'Non connecté'}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-1">Utilisateur</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {userDisplayName}
              </div>
              <div className="text-xs text-gray-400 mb-2">
                {userEmail}
              </div>
              <div className="text-sm text-gray-500 mb-1">Rôle</div>
              <div className={`px-4 py-2 ${roleConfig.badge} rounded-full text-sm font-semibold`}>
                {roleConfig.name}
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Projets Actifs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-project-diagram text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Cours Complétés</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedCourses}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-graduation-cap text-emerald-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Temps Aujourd'hui</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.floor(stats.todayTimeLogged / 60)}h {stats.todayTimeLogged % 60}m
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-clock text-orange-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Factures</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalInvoices}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-file-invoice text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Modules principaux */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setView(module.view)}
                className="group p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 text-left"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-200">
                    <i className={`${module.icon} text-gray-600 group-hover:text-blue-600 text-xl`}></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-gray-800 text-lg">
                      {module.name}
                    </h3>
                    {module.count > 0 && (
                      <span className="text-2xl font-bold text-blue-600">
                        {module.count}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Accéder</span>
                  <i className="fas fa-arrow-right text-gray-400 group-hover:text-gray-600 transition-colors"></i>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions rapides personnalisées par rôle */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setView(action.view)}
                className={`
                  flex items-center space-x-3 px-6 py-4 rounded-xl text-sm font-medium transition-all duration-200
                  ${index === 0 
                    ? `${roleConfig.primary} text-white ${roleConfig.primaryHover} shadow-lg` 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <i className={`${action.icon} text-lg`}></i>
                <span className="text-base">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleModernDashboard;
