import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalization } from '../../contexts/LocalizationContext';

interface ContextualCTAProps {
  currentModule: string;
  onAction?: (action: string) => void;
}

const ContextualCTA: React.FC<ContextualCTAProps> = ({ currentModule, onAction }) => {
  const { user } = useAuth();
  const { t } = useLocalization();

  if (!user) return null;

  // Configuration des rôles
  const roleConfigs = {
    'super_administrator': {
      name: 'Super Administrateur',
      icon: 'fas fa-crown',
      primaryLight: 'bg-red-100',
      textPrimary: 'text-red-600'
    },
    'administrator': {
      name: 'Administrateur',
      icon: 'fas fa-user-shield',
      primaryLight: 'bg-blue-100',
      textPrimary: 'text-blue-600'
    },
    'manager': {
      name: 'Manager',
      icon: 'fas fa-user-tie',
      primaryLight: 'bg-green-100',
      textPrimary: 'text-green-600'
    },
    'supervisor': {
      name: 'Superviseur',
      icon: 'fas fa-user-check',
      primaryLight: 'bg-purple-100',
      textPrimary: 'text-purple-600'
    },
    'student': {
      name: 'Étudiant',
      icon: 'fas fa-user-graduate',
      primaryLight: 'bg-indigo-100',
      textPrimary: 'text-indigo-600'
    },
    'trainer': {
      name: 'Formateur',
      icon: 'fas fa-chalkboard-teacher',
      primaryLight: 'bg-orange-100',
      textPrimary: 'text-orange-600'
    },
    'teacher': {
      name: 'Enseignant',
      icon: 'fas fa-graduation-cap',
      primaryLight: 'bg-teal-100',
      textPrimary: 'text-teal-600'
    },
    'entrepreneur': {
      name: 'Entrepreneur',
      icon: 'fas fa-rocket',
      primaryLight: 'bg-pink-100',
      textPrimary: 'text-pink-600'
    },
    'employer': {
      name: 'Employeur',
      icon: 'fas fa-building',
      primaryLight: 'bg-gray-100',
      textPrimary: 'text-gray-600'
    },
    'funder': {
      name: 'Financeur',
      icon: 'fas fa-hand-holding-usd',
      primaryLight: 'bg-yellow-100',
      textPrimary: 'text-yellow-600'
    },
    'mentor': {
      name: 'Mentor',
      icon: 'fas fa-user-friends',
      primaryLight: 'bg-cyan-100',
      textPrimary: 'text-cyan-600'
    },
    'coach': {
      name: 'Coach',
      icon: 'fas fa-running',
      primaryLight: 'bg-emerald-100',
      textPrimary: 'text-emerald-600'
    },
    'facilitator': {
      name: 'Facilitateur',
      icon: 'fas fa-users',
      primaryLight: 'bg-lime-100',
      textPrimary: 'text-lime-600'
    },
    'publisher': {
      name: 'Éditeur',
      icon: 'fas fa-book',
      primaryLight: 'bg-amber-100',
      textPrimary: 'text-amber-600'
    },
    'producer': {
      name: 'Producteur',
      icon: 'fas fa-video',
      primaryLight: 'bg-red-100',
      textPrimary: 'text-red-600'
    },
    'artist': {
      name: 'Artiste',
      icon: 'fas fa-palette',
      primaryLight: 'bg-purple-100',
      textPrimary: 'text-purple-600'
    },
    'editor': {
      name: 'Rédacteur',
      icon: 'fas fa-edit',
      primaryLight: 'bg-blue-100',
      textPrimary: 'text-blue-600'
    },
    'implementer': {
      name: 'Implémenteur',
      icon: 'fas fa-cogs',
      primaryLight: 'bg-green-100',
      textPrimary: 'text-green-600'
    },
    'intern': {
      name: 'Stagiaire',
      icon: 'fas fa-user-clock',
      primaryLight: 'bg-gray-100',
      textPrimary: 'text-gray-600'
    },
    'alumni': {
      name: 'Ancien',
      icon: 'fas fa-user-friends',
      primaryLight: 'bg-indigo-100',
      textPrimary: 'text-indigo-600'
    }
  };

  const roleConfig = roleConfigs[user.role as keyof typeof roleConfigs] || roleConfigs.student;

  const getRoleCTAs = (role: string) => {
    switch (role) {
      case 'super_administrator':
        return [
          {
            title: 'Gérer les rôles',
            description: 'Administrer les rôles et permissions',
            icon: 'fas fa-user-shield',
            action: 'manage_roles',
            color: 'bg-purple-500',
            priority: 'high',
            modules: ['super_admin']
          },
          {
            title: 'Voir les logs système',
            description: 'Consulter les journaux système',
            icon: 'fas fa-clipboard-list',
            action: 'view_logs',
            color: 'bg-gray-500',
            priority: 'medium',
            modules: ['super_admin']
          },
          {
            title: 'Configurer le système',
            description: 'Paramétrer les configurations globales',
            icon: 'fas fa-cog',
            action: 'system_config',
            color: 'bg-blue-500',
            priority: 'high',
            modules: ['super_admin']
          }
        ];

      case 'administrator':
        return [
          {
            title: 'Gérer les utilisateurs',
            description: 'Administrer les comptes utilisateurs',
            icon: 'fas fa-users-cog',
            action: 'manage_users',
            color: 'bg-blue-500',
            priority: 'high',
            modules: ['user_management']
          },
          {
            title: 'Voir les analyses',
            description: 'Consulter les tableaux de bord',
            icon: 'fas fa-chart-bar',
            action: 'view_analytics',
            color: 'bg-green-500',
            priority: 'medium',
            modules: ['analytics']
          }
        ];

      case 'manager':
        return [
          {
            title: 'Créer un projet',
            description: 'Lancer un nouveau projet',
            icon: 'fas fa-plus-circle',
            action: 'create_project',
            color: 'bg-blue-500',
            priority: 'high',
            modules: ['projects']
          },
          {
            title: 'Assigner des objectifs',
            description: 'Définir des objectifs OKR',
            icon: 'fas fa-bullseye',
            action: 'create_goal',
            color: 'bg-purple-500',
            priority: 'medium',
            modules: ['goals']
          }
        ];

      case 'student':
        return [
          {
            title: 'Rejoindre un projet',
            description: 'Participer à un projet existant',
            icon: 'fas fa-handshake',
            action: 'join_project',
            color: 'bg-green-500',
            priority: 'high',
            modules: ['dashboard']
          },
          {
            title: 'Suivre un cours',
            description: 'Améliorez vos compétences avec nos formations',
            icon: 'fas fa-graduation-cap',
            action: 'enroll_course',
            color: 'bg-purple-500',
            priority: 'medium',
            modules: ['dashboard']
          },
          {
            title: 'Postuler à un emploi',
            description: 'Candidater pour un poste',
            icon: 'fas fa-paper-plane',
            action: 'apply_job',
            color: 'bg-blue-500',
            priority: 'high'
          }
        ];

      case 'entrepreneur':
        return [
          {
            title: 'Créer un nouveau projet',
            description: 'Lancez votre idée et recrutez une équipe',
            icon: 'fas fa-rocket',
            action: 'create_project',
            color: 'bg-blue-500',
            priority: 'high',
            modules: ['projects']
          },
          {
            title: 'Recruter des talents',
            description: 'Publiez des offres d\'emploi',
            icon: 'fas fa-user-plus',
            action: 'post_job',
            color: 'bg-green-500',
            priority: 'medium',
            modules: ['jobs']
          }
        ];

      default:
        return [
          {
            title: 'Découvrir EcosystIA',
            description: 'Explorez les fonctionnalités disponibles',
            icon: 'fas fa-compass',
            action: 'explore',
            color: 'bg-blue-500',
            priority: 'medium',
            modules: ['dashboard']
          }
        ];
    }
  };

  const ctas = getRoleCTAs(user.role);

  // Filtrer les CTA selon le module actuel
  const relevantCTAs = ctas.filter(cta =>
    !cta.modules || cta.modules.includes(currentModule)
  ).slice(0, 3); // Limiter à 3 CTA maximum

  if (relevantCTAs.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className={`w-10 h-10 rounded-lg ${roleConfig.primaryLight} flex items-center justify-center mr-3`}>
          <i className={`${roleConfig.icon} ${roleConfig.textPrimary} text-lg`}></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Actions recommandées</h3>
          <p className="text-sm text-gray-600">Suggestions personnalisées pour {roleConfig.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relevantCTAs.map((cta, index) => (
          <div
            key={index}
            className={`relative p-4 rounded-lg border-l-4 ${cta.color} bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer`}
            onClick={() => onAction?.(cta.action)}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full ${cta.color} flex items-center justify-center`}>
                  <i className={`${cta.icon} text-white text-sm`}></i>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-gray-800">{cta.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{cta.description}</p>
              </div>
            </div>

            {/* Indicateur de priorité */}
            <div className="absolute top-2 right-2">
              {cta.priority === 'high' && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  Important
                </span>
              )}
              {cta.priority === 'medium' && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <i className="fas fa-info-circle mr-1"></i>
                  Recommandé
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          <i className="fas fa-lightbulb mr-1"></i>
          Ces suggestions s'adaptent à votre rôle et au contexte actuel
        </p>
      </div>
    </div>
  );
};

export default ContextualCTA;