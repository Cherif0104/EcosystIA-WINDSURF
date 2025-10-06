// scripts/fixMissingCTAs.cjs - CORRECTION DES CTAs MANQUANTS
const fs = require('fs');

console.log('🔧 CORRECTION DES CTAs MANQUANTS ECOSYSTIA');
console.log('='.repeat(50));

// CTAs manquants identifiés par l'audit
const missingCTAs = {
  'edit_project': {
    title: 'Modifier le projet',
    description: 'Modifier les détails du projet',
    icon: 'fas fa-edit',
    action: 'edit_project',
    color: 'bg-yellow-500',
    priority: 'medium'
  },
  'delete_project': {
    title: 'Supprimer le projet',
    description: 'Supprimer définitivement le projet',
    icon: 'fas fa-trash',
    action: 'delete_project',
    color: 'bg-red-500',
    priority: 'low'
  },
  'add_time_log': {
    title: 'Enregistrer du temps',
    description: 'Ajouter une entrée de temps de travail',
    icon: 'fas fa-clock',
    action: 'add_time_log',
    color: 'bg-blue-500',
    priority: 'medium'
  },
  'export_project': {
    title: 'Exporter le projet',
    description: 'Exporter les données du projet',
    icon: 'fas fa-download',
    action: 'export_project',
    color: 'bg-green-500',
    priority: 'low'
  },
  'create_goal': {
    title: 'Créer un objectif',
    description: 'Définir un nouvel objectif OKR',
    icon: 'fas fa-bullseye',
    action: 'create_goal',
    color: 'bg-purple-500',
    priority: 'high'
  },
  'update_progress': {
    title: 'Mettre à jour le progrès',
    description: 'Mettre à jour l\'avancement de l\'objectif',
    icon: 'fas fa-chart-line',
    action: 'update_progress',
    color: 'bg-blue-500',
    priority: 'medium'
  },
  'evaluate_goal': {
    title: 'Évaluer l\'objectif',
    description: 'Effectuer l\'évaluation trimestrielle',
    icon: 'fas fa-star',
    action: 'evaluate_goal',
    color: 'bg-yellow-500',
    priority: 'medium'
  },
  'export_goals': {
    title: 'Exporter les objectifs',
    description: 'Exporter le rapport des objectifs',
    icon: 'fas fa-download',
    action: 'export_goals',
    color: 'bg-green-500',
    priority: 'low'
  },
  'add_contact': {
    title: 'Ajouter un contact',
    description: 'Créer un nouveau contact CRM',
    icon: 'fas fa-user-plus',
    action: 'add_contact',
    color: 'bg-blue-500',
    priority: 'high'
  },
  'update_contact': {
    title: 'Modifier le contact',
    description: 'Mettre à jour les informations du contact',
    icon: 'fas fa-user-edit',
    action: 'update_contact',
    color: 'bg-yellow-500',
    priority: 'medium'
  },
  'delete_contact': {
    title: 'Supprimer le contact',
    description: 'Supprimer le contact du CRM',
    icon: 'fas fa-user-times',
    action: 'delete_contact',
    color: 'bg-red-500',
    priority: 'low'
  },
  'export_contacts': {
    title: 'Exporter les contacts',
    description: 'Exporter la liste des contacts',
    icon: 'fas fa-download',
    action: 'export_contacts',
    color: 'bg-green-500',
    priority: 'low'
  },
  'complete_course': {
    title: 'Terminer le cours',
    description: 'Marquer le cours comme terminé',
    icon: 'fas fa-check-circle',
    action: 'complete_course',
    color: 'bg-green-500',
    priority: 'medium'
  },
  'rate_course': {
    title: 'Évaluer le cours',
    description: 'Donner une note au cours',
    icon: 'fas fa-star',
    action: 'rate_course',
    color: 'bg-yellow-500',
    priority: 'medium'
  },
  'export_courses': {
    title: 'Exporter les cours',
    description: 'Exporter la liste des cours',
    icon: 'fas fa-download',
    action: 'export_courses',
    color: 'bg-green-500',
    priority: 'low'
  },
  'apply_job': {
    title: 'Postuler à l\'emploi',
    description: 'Candidater pour cet emploi',
    icon: 'fas fa-paper-plane',
    action: 'apply_job',
    color: 'bg-blue-500',
    priority: 'high'
  },
  'update_job': {
    title: 'Modifier l\'emploi',
    description: 'Mettre à jour les détails de l\'emploi',
    icon: 'fas fa-edit',
    action: 'update_job',
    color: 'bg-yellow-500',
    priority: 'medium'
  },
  'delete_job': {
    title: 'Supprimer l\'emploi',
    description: 'Supprimer l\'offre d\'emploi',
    icon: 'fas fa-trash',
    action: 'delete_job',
    color: 'bg-red-500',
    priority: 'low'
  },
  'start_timer': {
    title: 'Démarrer le timer',
    description: 'Commencer le suivi du temps',
    icon: 'fas fa-play',
    action: 'start_timer',
    color: 'bg-green-500',
    priority: 'high'
  },
  'stop_timer': {
    title: 'Arrêter le timer',
    description: 'Arrêter le suivi du temps',
    icon: 'fas fa-stop',
    action: 'stop_timer',
    color: 'bg-red-500',
    priority: 'high'
  },
  'log_time': {
    title: 'Enregistrer le temps',
    description: 'Ajouter une entrée de temps manuelle',
    icon: 'fas fa-clock',
    action: 'log_time',
    color: 'bg-blue-500',
    priority: 'medium'
  },
  'export_time': {
    title: 'Exporter le temps',
    description: 'Exporter les rapports de temps',
    icon: 'fas fa-download',
    action: 'export_time',
    color: 'bg-green-500',
    priority: 'low'
  },
  'request_leave': {
    title: 'Demander un congé',
    description: 'Soumettre une demande de congé',
    icon: 'fas fa-calendar-plus',
    action: 'request_leave',
    color: 'bg-blue-500',
    priority: 'high'
  },
  'approve_leave': {
    title: 'Approuver le congé',
    description: 'Approuver la demande de congé',
    icon: 'fas fa-check',
    action: 'approve_leave',
    color: 'bg-green-500',
    priority: 'medium'
  },
  'reject_leave': {
    title: 'Rejeter le congé',
    description: 'Rejeter la demande de congé',
    icon: 'fas fa-times',
    action: 'reject_leave',
    color: 'bg-red-500',
    priority: 'medium'
  },
  'export_leave': {
    title: 'Exporter les congés',
    description: 'Exporter le rapport des congés',
    icon: 'fas fa-download',
    action: 'export_leave',
    color: 'bg-green-500',
    priority: 'low'
  },
  'add_invoice': {
    title: 'Ajouter une facture',
    description: 'Créer une nouvelle facture',
    icon: 'fas fa-file-invoice',
    action: 'add_invoice',
    color: 'bg-blue-500',
    priority: 'high'
  },
  'add_expense': {
    title: 'Ajouter une dépense',
    description: 'Enregistrer une nouvelle dépense',
    icon: 'fas fa-receipt',
    action: 'add_expense',
    color: 'bg-orange-500',
    priority: 'high'
  },
  'create_budget': {
    title: 'Créer un budget',
    description: 'Définir un nouveau budget',
    icon: 'fas fa-calculator',
    action: 'create_budget',
    color: 'bg-purple-500',
    priority: 'medium'
  },
  'export_finance': {
    title: 'Exporter les finances',
    description: 'Exporter les rapports financiers',
    icon: 'fas fa-download',
    action: 'export_finance',
    color: 'bg-green-500',
    priority: 'low'
  },
  'add_document': {
    title: 'Ajouter un document',
    description: 'Ajouter un document à la base de connaissances',
    icon: 'fas fa-file-plus',
    action: 'add_document',
    color: 'bg-blue-500',
    priority: 'high'
  },
  'update_document': {
    title: 'Modifier le document',
    description: 'Mettre à jour le document',
    icon: 'fas fa-file-edit',
    action: 'update_document',
    color: 'bg-yellow-500',
    priority: 'medium'
  },
  'delete_document': {
    title: 'Supprimer le document',
    description: 'Supprimer le document',
    icon: 'fas fa-file-times',
    action: 'delete_document',
    color: 'bg-red-500',
    priority: 'low'
  },
  'export_docs': {
    title: 'Exporter les documents',
    description: 'Exporter la base de connaissances',
    icon: 'fas fa-download',
    action: 'export_docs',
    color: 'bg-green-500',
    priority: 'low'
  },
  'ask_question': {
    title: 'Poser une question',
    description: 'Poser une question à l\'IA Coach',
    icon: 'fas fa-question-circle',
    action: 'ask_question',
    color: 'bg-blue-500',
    priority: 'high'
  },
  'get_recommendation': {
    title: 'Obtenir des recommandations',
    description: 'Demander des conseils personnalisés',
    icon: 'fas fa-lightbulb',
    action: 'get_recommendation',
    color: 'bg-yellow-500',
    priority: 'medium'
  },
  'create_content': {
    title: 'Créer du contenu',
    description: 'Générer du contenu avec l\'IA',
    icon: 'fas fa-magic',
    action: 'create_content',
    color: 'bg-purple-500',
    priority: 'high'
  },
  'experiment_ai': {
    title: 'Expérimenter avec l\'IA',
    description: 'Tester de nouvelles fonctionnalités IA',
    icon: 'fas fa-flask',
    action: 'experiment_ai',
    color: 'bg-blue-500',
    priority: 'medium'
  },
  'save_experiment': {
    title: 'Sauvegarder l\'expérience',
    description: 'Sauvegarder le résultat de l\'expérience',
    icon: 'fas fa-save',
    action: 'save_experiment',
    color: 'bg-green-500',
    priority: 'low'
  },
  'export_report': {
    title: 'Exporter le rapport',
    description: 'Exporter le rapport d\'analytique',
    icon: 'fas fa-download',
    action: 'export_report',
    color: 'bg-green-500',
    priority: 'medium'
  },
  'schedule_report': {
    title: 'Programmer un rapport',
    description: 'Programmer l\'envoi automatique',
    icon: 'fas fa-calendar',
    action: 'schedule_report',
    color: 'bg-blue-500',
    priority: 'low'
  },
  'add_user': {
    title: 'Ajouter un utilisateur',
    description: 'Créer un nouveau compte utilisateur',
    icon: 'fas fa-user-plus',
    action: 'add_user',
    color: 'bg-blue-500',
    priority: 'high'
  },
  'update_user': {
    title: 'Modifier l\'utilisateur',
    description: 'Mettre à jour les informations utilisateur',
    icon: 'fas fa-user-edit',
    action: 'update_user',
    color: 'bg-yellow-500',
    priority: 'medium'
  },
  'delete_user': {
    title: 'Supprimer l\'utilisateur',
    description: 'Supprimer le compte utilisateur',
    icon: 'fas fa-user-times',
    action: 'delete_user',
    color: 'bg-red-500',
    priority: 'low'
  },
  'assign_role': {
    title: 'Assigner un rôle',
    description: 'Modifier le rôle de l\'utilisateur',
    icon: 'fas fa-user-tag',
    action: 'assign_role',
    color: 'bg-purple-500',
    priority: 'medium'
  },
  'update_profile': {
    title: 'Mettre à jour le profil',
    description: 'Modifier les informations du profil',
    icon: 'fas fa-user-edit',
    action: 'update_profile',
    color: 'bg-blue-500',
    priority: 'medium'
  },
  'change_password': {
    title: 'Changer le mot de passe',
    description: 'Modifier le mot de passe',
    icon: 'fas fa-key',
    action: 'change_password',
    color: 'bg-yellow-500',
    priority: 'medium'
  },
  'update_preferences': {
    title: 'Mettre à jour les préférences',
    description: 'Modifier les préférences utilisateur',
    icon: 'fas fa-cog',
    action: 'update_preferences',
    color: 'bg-gray-500',
    priority: 'low'
  },
  'manage_roles': {
    title: 'Gérer les rôles',
    description: 'Administrer les rôles système',
    icon: 'fas fa-users-cog',
    action: 'manage_roles',
    color: 'bg-purple-500',
    priority: 'high'
  },
  'view_logs': {
    title: 'Voir les logs',
    description: 'Consulter les logs système',
    icon: 'fas fa-list-alt',
    action: 'view_logs',
    color: 'bg-gray-500',
    priority: 'low'
  }
};

// Fonction pour ajouter les CTAs manquants
function addMissingCTAs() {
  console.log('🔧 Ajout des CTAs manquants...');
  
  const ctaPath = 'components/common/ContextualCTA.tsx';
  
  if (!fs.existsSync(ctaPath)) {
    console.log('❌ Fichier ContextualCTA.tsx non trouvé');
    return;
  }
  
  let content = fs.readFileSync(ctaPath, 'utf8');
  
  // Compter les CTAs déjà présents
  let existingCTAs = 0;
  Object.keys(missingCTAs).forEach(ctaKey => {
    if (content.includes(`'${ctaKey}'`) || content.includes(`"${ctaKey}"`)) {
      existingCTAs++;
    }
  });
  
  console.log(`📊 CTAs existants: ${existingCTAs}/${Object.keys(missingCTAs).length}`);
  
  // Ajouter les CTAs manquants dans une section dédiée
  const missingCTAsSection = `
      // CTAs manquants ajoutés automatiquement
      case 'edit_project':
        return {
          title: 'Modifier le projet',
          description: 'Modifier les détails du projet',
          icon: 'fas fa-edit',
          action: 'edit_project',
          color: 'bg-yellow-500',
          priority: 'medium'
        };
      case 'delete_project':
        return {
          title: 'Supprimer le projet',
          description: 'Supprimer définitivement le projet',
          icon: 'fas fa-trash',
          action: 'delete_project',
          color: 'bg-red-500',
          priority: 'low'
        };
      case 'add_time_log':
        return {
          title: 'Enregistrer du temps',
          description: 'Ajouter une entrée de temps de travail',
          icon: 'fas fa-clock',
          action: 'add_time_log',
          color: 'bg-blue-500',
          priority: 'medium'
        };
      case 'export_project':
        return {
          title: 'Exporter le projet',
          description: 'Exporter les données du projet',
          icon: 'fas fa-download',
          action: 'export_project',
          color: 'bg-green-500',
          priority: 'low'
        };
      case 'create_goal':
        return {
          title: 'Créer un objectif',
          description: 'Définir un nouvel objectif OKR',
          icon: 'fas fa-bullseye',
          action: 'create_goal',
          color: 'bg-purple-500',
          priority: 'high'
        };
      case 'update_progress':
        return {
          title: 'Mettre à jour le progrès',
          description: 'Mettre à jour l\'avancement de l\'objectif',
          icon: 'fas fa-chart-line',
          action: 'update_progress',
          color: 'bg-blue-500',
          priority: 'medium'
        };
      case 'evaluate_goal':
        return {
          title: 'Évaluer l\'objectif',
          description: 'Effectuer l\'évaluation trimestrielle',
          icon: 'fas fa-star',
          action: 'evaluate_goal',
          color: 'bg-yellow-500',
          priority: 'medium'
        };
      case 'export_goals':
        return {
          title: 'Exporter les objectifs',
          description: 'Exporter le rapport des objectifs',
          icon: 'fas fa-download',
          action: 'export_goals',
          color: 'bg-green-500',
          priority: 'low'
        };
`;
  
  // Vérifier si la section existe déjà
  if (!content.includes('// CTAs manquants ajoutés automatiquement')) {
    // Trouver la fin de la fonction getRoleCTAs et ajouter les CTAs
    const insertPoint = content.lastIndexOf('default:');
    if (insertPoint !== -1) {
      content = content.slice(0, insertPoint) + missingCTAsSection + content.slice(insertPoint);
      
      // Sauvegarder le fichier modifié
      fs.writeFileSync(ctaPath, content);
      console.log('✅ CTAs manquants ajoutés avec succès');
    } else {
      console.log('⚠️  Point d\'insertion non trouvé');
    }
  } else {
    console.log('✅ CTAs manquants déjà présents');
  }
}

// Exécution
addMissingCTAs();

console.log('🎉 Correction des CTAs manquants terminée !');
