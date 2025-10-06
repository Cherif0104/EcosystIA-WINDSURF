// scripts/completeMissingCTAs.cjs - COMPLÉTION DES CTAs MANQUANTS
const fs = require('fs');

console.log('🔧 COMPLÉTION DES CTAs MANQUANTS ECOSYSTIA');
console.log('='.repeat(50));

// CTAs manquants à ajouter dans chaque rôle
const missingCTAsByRole = {
  'student': [
    'apply_job', 'complete_course', 'rate_course', 'export_courses',
    'start_timer', 'stop_timer', 'log_time', 'export_time',
    'request_leave', 'export_leave'
  ],
  'entrepreneur': [
    'edit_project', 'delete_project', 'add_time_log', 'export_project',
    'create_goal', 'update_progress', 'evaluate_goal', 'export_goals',
    'add_contact', 'update_contact', 'delete_contact', 'export_contacts',
    'complete_course', 'rate_course', 'export_courses',
    'apply_job', 'update_job', 'delete_job',
    'start_timer', 'stop_timer', 'log_time', 'export_time',
    'request_leave', 'approve_leave', 'reject_leave', 'export_leave',
    'add_invoice', 'add_expense', 'create_budget', 'export_finance',
    'add_document', 'update_document', 'delete_document', 'export_docs',
    'ask_question', 'get_recommendation', 'create_content', 'experiment_ai', 'save_experiment',
    'export_report', 'schedule_report', 'add_user', 'update_user', 'delete_user', 'assign_role',
    'update_profile', 'change_password', 'update_preferences'
  ],
  'trainer': [
    'edit_project', 'delete_project', 'add_time_log', 'export_project',
    'create_goal', 'update_progress', 'evaluate_goal', 'export_goals',
    'add_contact', 'update_contact', 'delete_contact', 'export_contacts',
    'complete_course', 'rate_course', 'export_courses',
    'apply_job', 'update_job', 'delete_job',
    'start_timer', 'stop_timer', 'log_time', 'export_time',
    'request_leave', 'approve_leave', 'reject_leave', 'export_leave',
    'add_invoice', 'add_expense', 'create_budget', 'export_finance',
    'add_document', 'update_document', 'delete_document', 'export_docs',
    'ask_question', 'get_recommendation', 'create_content', 'experiment_ai', 'save_experiment',
    'export_report', 'schedule_report', 'add_user', 'update_user', 'delete_user', 'assign_role',
    'update_profile', 'change_password', 'update_preferences'
  ],
  'manager': [
    'edit_project', 'delete_project', 'add_time_log', 'export_project',
    'create_goal', 'update_progress', 'evaluate_goal', 'export_goals',
    'add_contact', 'update_contact', 'delete_contact', 'export_contacts',
    'complete_course', 'rate_course', 'export_courses',
    'apply_job', 'update_job', 'delete_job',
    'start_timer', 'stop_timer', 'log_time', 'export_time',
    'request_leave', 'approve_leave', 'reject_leave', 'export_leave',
    'add_invoice', 'add_expense', 'create_budget', 'export_finance',
    'add_document', 'update_document', 'delete_document', 'export_docs',
    'ask_question', 'get_recommendation', 'create_content', 'experiment_ai', 'save_experiment',
    'export_report', 'schedule_report', 'add_user', 'update_user', 'delete_user', 'assign_role',
    'update_profile', 'change_password', 'update_preferences', 'manage_roles', 'view_logs'
  ],
  'supervisor': [
    'edit_project', 'delete_project', 'add_time_log', 'export_project',
    'create_goal', 'update_progress', 'evaluate_goal', 'export_goals',
    'add_contact', 'update_contact', 'delete_contact', 'export_contacts',
    'complete_course', 'rate_course', 'export_courses',
    'apply_job', 'update_job', 'delete_job',
    'start_timer', 'stop_timer', 'log_time', 'export_time',
    'request_leave', 'approve_leave', 'reject_leave', 'export_leave',
    'add_invoice', 'add_expense', 'create_budget', 'export_finance',
    'add_document', 'update_document', 'delete_document', 'export_docs',
    'ask_question', 'get_recommendation', 'create_content', 'experiment_ai', 'save_experiment',
    'export_report', 'schedule_report', 'add_user', 'update_user', 'delete_user', 'assign_role',
    'update_profile', 'change_password', 'update_preferences'
  ],
  'employer': [
    'edit_project', 'delete_project', 'add_time_log', 'export_project',
    'create_goal', 'update_progress', 'evaluate_goal', 'export_goals',
    'add_contact', 'update_contact', 'delete_contact', 'export_contacts',
    'complete_course', 'rate_course', 'export_courses',
    'apply_job', 'update_job', 'delete_job',
    'start_timer', 'stop_timer', 'log_time', 'export_time',
    'request_leave', 'approve_leave', 'reject_leave', 'export_leave',
    'add_invoice', 'add_expense', 'create_budget', 'export_finance',
    'add_document', 'update_document', 'delete_document', 'export_docs',
    'ask_question', 'get_recommendation', 'create_content', 'experiment_ai', 'save_experiment',
    'export_report', 'schedule_report', 'add_user', 'update_user', 'delete_user', 'assign_role',
    'update_profile', 'change_password', 'update_preferences'
  ],
  'funder': [
    'edit_project', 'delete_project', 'add_time_log', 'export_project',
    'create_goal', 'update_progress', 'evaluate_goal', 'export_goals',
    'add_contact', 'update_contact', 'delete_contact', 'export_contacts',
    'complete_course', 'rate_course', 'export_courses',
    'apply_job', 'update_job', 'delete_job',
    'start_timer', 'stop_timer', 'log_time', 'export_time',
    'request_leave', 'approve_leave', 'reject_leave', 'export_leave',
    'add_invoice', 'add_expense', 'create_budget', 'export_finance',
    'add_document', 'update_document', 'delete_document', 'export_docs',
    'ask_question', 'get_recommendation', 'create_content', 'experiment_ai', 'save_experiment',
    'export_report', 'schedule_report', 'add_user', 'update_user', 'delete_user', 'assign_role',
    'update_profile', 'change_password', 'update_preferences'
  ],
  'mentor': [
    'edit_project', 'delete_project', 'add_time_log', 'export_project',
    'create_goal', 'update_progress', 'evaluate_goal', 'export_goals',
    'add_contact', 'update_contact', 'delete_contact', 'export_contacts',
    'complete_course', 'rate_course', 'export_courses',
    'apply_job', 'update_job', 'delete_job',
    'start_timer', 'stop_timer', 'log_time', 'export_time',
    'request_leave', 'approve_leave', 'reject_leave', 'export_leave',
    'add_invoice', 'add_expense', 'create_budget', 'export_finance',
    'add_document', 'update_document', 'delete_document', 'export_docs',
    'ask_question', 'get_recommendation', 'create_content', 'experiment_ai', 'save_experiment',
    'export_report', 'schedule_report', 'add_user', 'update_user', 'delete_user', 'assign_role',
    'update_profile', 'change_password', 'update_preferences'
  ],
  'coach': [
    'edit_project', 'delete_project', 'add_time_log', 'export_project',
    'create_goal', 'update_progress', 'evaluate_goal', 'export_goals',
    'add_contact', 'update_contact', 'delete_contact', 'export_contacts',
    'complete_course', 'rate_course', 'export_courses',
    'apply_job', 'update_job', 'delete_job',
    'start_timer', 'stop_timer', 'log_time', 'export_time',
    'request_leave', 'approve_leave', 'reject_leave', 'export_leave',
    'add_invoice', 'add_expense', 'create_budget', 'export_finance',
    'add_document', 'update_document', 'delete_document', 'export_docs',
    'ask_question', 'get_recommendation', 'create_content', 'experiment_ai', 'save_experiment',
    'export_report', 'schedule_report', 'add_user', 'update_user', 'delete_user', 'assign_role',
    'update_profile', 'change_password', 'update_preferences'
  ],
  'super_administrator': [
    'edit_project', 'delete_project', 'add_time_log', 'export_project',
    'create_goal', 'update_progress', 'evaluate_goal', 'export_goals',
    'add_contact', 'update_contact', 'delete_contact', 'export_contacts',
    'complete_course', 'rate_course', 'export_courses',
    'apply_job', 'update_job', 'delete_job',
    'start_timer', 'stop_timer', 'log_time', 'export_time',
    'request_leave', 'approve_leave', 'reject_leave', 'export_leave',
    'add_invoice', 'add_expense', 'create_budget', 'export_finance',
    'add_document', 'update_document', 'delete_document', 'export_docs',
    'ask_question', 'get_recommendation', 'create_content', 'experiment_ai', 'save_experiment',
    'export_report', 'schedule_report', 'add_user', 'update_user', 'delete_user', 'assign_role',
    'update_profile', 'change_password', 'update_preferences', 'manage_roles', 'view_logs'
  ]
};

// Fonction pour ajouter les CTAs manquants
function completeMissingCTAs() {
  console.log('🔧 Complétion des CTAs manquants...');
  
  const ctaPath = 'components/common/ContextualCTA.tsx';
  
  if (!fs.existsSync(ctaPath)) {
    console.log('❌ Fichier ContextualCTA.tsx non trouvé');
    return;
  }
  
  let content = fs.readFileSync(ctaPath, 'utf8');
  
  // Supprimer la section précédente des CTAs manquants
  content = content.replace(/\/\/ CTAs manquants ajoutés automatiquement[\s\S]*?(?=default:|$)/, '');
  
  // Ajouter les CTAs manquants dans chaque rôle
  Object.entries(missingCTAsByRole).forEach(([role, ctas]) => {
    ctas.forEach(cta => {
      // Vérifier si le CTA existe déjà dans ce rôle
      const rolePattern = new RegExp(`case '${role}':[\\s\\S]*?return \\[[\\s\\S]*?\\];`, 'g');
      const roleMatch = content.match(rolePattern);
      
      if (roleMatch && !roleMatch[0].includes(`'${cta}'`)) {
        // Ajouter le CTA dans le rôle
        const ctaConfig = getCTAConfig(cta);
        const ctaToAdd = `          {
            title: '${ctaConfig.title}',
            description: '${ctaConfig.description}',
            icon: '${ctaConfig.icon}',
            action: '${cta}',
            color: '${ctaConfig.color}',
            priority: '${ctaConfig.priority}'
          },`;
        
        // Insérer le CTA dans le rôle
        content = content.replace(
          new RegExp(`(case '${role}':[\\s\\S]*?return \\[[\\s\\S]*?)(\\s*\\];)`, 'g'),
          `$1${ctaToAdd}\n$2`
        );
      }
    });
  });
  
  // Sauvegarder le fichier modifié
  fs.writeFileSync(ctaPath, content);
  console.log('✅ CTAs manquants complétés avec succès');
}

// Fonction pour obtenir la configuration d'un CTA
function getCTAConfig(cta) {
  const ctaConfigs = {
    'apply_job': {
      title: 'Postuler à l\'emploi',
      description: 'Candidater pour cet emploi',
      icon: 'fas fa-paper-plane',
      color: 'bg-blue-500',
      priority: 'high'
    },
    'complete_course': {
      title: 'Terminer le cours',
      description: 'Marquer le cours comme terminé',
      icon: 'fas fa-check-circle',
      color: 'bg-green-500',
      priority: 'medium'
    },
    'rate_course': {
      title: 'Évaluer le cours',
      description: 'Donner une note au cours',
      icon: 'fas fa-star',
      color: 'bg-yellow-500',
      priority: 'medium'
    },
    'export_courses': {
      title: 'Exporter les cours',
      description: 'Exporter la liste des cours',
      icon: 'fas fa-download',
      color: 'bg-green-500',
      priority: 'low'
    },
    'start_timer': {
      title: 'Démarrer le timer',
      description: 'Commencer le suivi du temps',
      icon: 'fas fa-play',
      color: 'bg-green-500',
      priority: 'high'
    },
    'stop_timer': {
      title: 'Arrêter le timer',
      description: 'Arrêter le suivi du temps',
      icon: 'fas fa-stop',
      color: 'bg-red-500',
      priority: 'high'
    },
    'log_time': {
      title: 'Enregistrer le temps',
      description: 'Ajouter une entrée de temps manuelle',
      icon: 'fas fa-clock',
      color: 'bg-blue-500',
      priority: 'medium'
    },
    'export_time': {
      title: 'Exporter le temps',
      description: 'Exporter les rapports de temps',
      icon: 'fas fa-download',
      color: 'bg-green-500',
      priority: 'low'
    },
    'request_leave': {
      title: 'Demander un congé',
      description: 'Soumettre une demande de congé',
      icon: 'fas fa-calendar-plus',
      color: 'bg-blue-500',
      priority: 'high'
    },
    'approve_leave': {
      title: 'Approuver le congé',
      description: 'Approuver la demande de congé',
      icon: 'fas fa-check',
      color: 'bg-green-500',
      priority: 'medium'
    },
    'reject_leave': {
      title: 'Rejeter le congé',
      description: 'Rejeter la demande de congé',
      icon: 'fas fa-times',
      color: 'bg-red-500',
      priority: 'medium'
    },
    'export_leave': {
      title: 'Exporter les congés',
      description: 'Exporter le rapport des congés',
      icon: 'fas fa-download',
      color: 'bg-green-500',
      priority: 'low'
    },
    'add_invoice': {
      title: 'Ajouter une facture',
      description: 'Créer une nouvelle facture',
      icon: 'fas fa-file-invoice',
      color: 'bg-blue-500',
      priority: 'high'
    },
    'add_expense': {
      title: 'Ajouter une dépense',
      description: 'Enregistrer une nouvelle dépense',
      icon: 'fas fa-receipt',
      color: 'bg-orange-500',
      priority: 'high'
    },
    'create_budget': {
      title: 'Créer un budget',
      description: 'Définir un nouveau budget',
      icon: 'fas fa-calculator',
      color: 'bg-purple-500',
      priority: 'medium'
    },
    'export_finance': {
      title: 'Exporter les finances',
      description: 'Exporter les rapports financiers',
      icon: 'fas fa-download',
      color: 'bg-green-500',
      priority: 'low'
    },
    'add_document': {
      title: 'Ajouter un document',
      description: 'Ajouter un document à la base de connaissances',
      icon: 'fas fa-file-plus',
      color: 'bg-blue-500',
      priority: 'high'
    },
    'update_document': {
      title: 'Modifier le document',
      description: 'Mettre à jour le document',
      icon: 'fas fa-file-edit',
      color: 'bg-yellow-500',
      priority: 'medium'
    },
    'delete_document': {
      title: 'Supprimer le document',
      description: 'Supprimer le document',
      icon: 'fas fa-file-times',
      color: 'bg-red-500',
      priority: 'low'
    },
    'export_docs': {
      title: 'Exporter les documents',
      description: 'Exporter la base de connaissances',
      icon: 'fas fa-download',
      color: 'bg-green-500',
      priority: 'low'
    },
    'ask_question': {
      title: 'Poser une question',
      description: 'Poser une question à l\'IA Coach',
      icon: 'fas fa-question-circle',
      color: 'bg-blue-500',
      priority: 'high'
    },
    'get_recommendation': {
      title: 'Obtenir des recommandations',
      description: 'Demander des conseils personnalisés',
      icon: 'fas fa-lightbulb',
      color: 'bg-yellow-500',
      priority: 'medium'
    },
    'create_content': {
      title: 'Créer du contenu',
      description: 'Générer du contenu avec l\'IA',
      icon: 'fas fa-magic',
      color: 'bg-purple-500',
      priority: 'high'
    },
    'experiment_ai': {
      title: 'Expérimenter avec l\'IA',
      description: 'Tester de nouvelles fonctionnalités IA',
      icon: 'fas fa-flask',
      color: 'bg-blue-500',
      priority: 'medium'
    },
    'save_experiment': {
      title: 'Sauvegarder l\'expérience',
      description: 'Sauvegarder le résultat de l\'expérience',
      icon: 'fas fa-save',
      color: 'bg-green-500',
      priority: 'low'
    },
    'export_report': {
      title: 'Exporter le rapport',
      description: 'Exporter le rapport d\'analytique',
      icon: 'fas fa-download',
      color: 'bg-green-500',
      priority: 'medium'
    },
    'schedule_report': {
      title: 'Programmer un rapport',
      description: 'Programmer l\'envoi automatique',
      icon: 'fas fa-calendar',
      color: 'bg-blue-500',
      priority: 'low'
    },
    'add_user': {
      title: 'Ajouter un utilisateur',
      description: 'Créer un nouveau compte utilisateur',
      icon: 'fas fa-user-plus',
      color: 'bg-blue-500',
      priority: 'high'
    },
    'update_user': {
      title: 'Modifier l\'utilisateur',
      description: 'Mettre à jour les informations utilisateur',
      icon: 'fas fa-user-edit',
      color: 'bg-yellow-500',
      priority: 'medium'
    },
    'delete_user': {
      title: 'Supprimer l\'utilisateur',
      description: 'Supprimer le compte utilisateur',
      icon: 'fas fa-user-times',
      color: 'bg-red-500',
      priority: 'low'
    },
    'assign_role': {
      title: 'Assigner un rôle',
      description: 'Modifier le rôle de l\'utilisateur',
      icon: 'fas fa-user-tag',
      color: 'bg-purple-500',
      priority: 'medium'
    },
    'update_profile': {
      title: 'Mettre à jour le profil',
      description: 'Modifier les informations du profil',
      icon: 'fas fa-user-edit',
      color: 'bg-blue-500',
      priority: 'medium'
    },
    'change_password': {
      title: 'Changer le mot de passe',
      description: 'Modifier le mot de passe',
      icon: 'fas fa-key',
      color: 'bg-yellow-500',
      priority: 'medium'
    },
    'update_preferences': {
      title: 'Mettre à jour les préférences',
      description: 'Modifier les préférences utilisateur',
      icon: 'fas fa-cog',
      color: 'bg-gray-500',
      priority: 'low'
    },
    'manage_roles': {
      title: 'Gérer les rôles',
      description: 'Administrer les rôles système',
      icon: 'fas fa-users-cog',
      color: 'bg-purple-500',
      priority: 'high'
    },
    'view_logs': {
      title: 'Voir les logs',
      description: 'Consulter les logs système',
      icon: 'fas fa-list-alt',
      color: 'bg-gray-500',
      priority: 'low'
    }
  };
  
  return ctaConfigs[cta] || {
    title: `Action ${cta}`,
    description: `Description pour ${cta}`,
    icon: 'fas fa-cog',
    color: 'bg-blue-500',
    priority: 'medium'
  };
}

// Exécution
completeMissingCTAs();

console.log('🎉 Complétion des CTAs manquants terminée !');
