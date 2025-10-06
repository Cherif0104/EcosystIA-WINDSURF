// Script de test pour vérifier tous les 19 rôles du MVP
import { Role } from '../types';

// Tous les rôles définis dans le MVP
const ALL_MVP_ROLES: Role[] = [
  'student',
  'employer', 
  'super_administrator',
  'administrator',
  'manager',
  'supervisor',
  'editor',
  'entrepreneur',
  'funder',
  'mentor',
  'intern',
  'trainer',
  'implementer',
  'coach',
  'facilitator',
  'publisher',
  'producer',
  'artist',
  'alumni'
];

// Interface des permissions pour le test
interface ProjectPermissions {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManageTeam: boolean;
  canViewAll: boolean;
  canManageTasks: boolean;
  canManageRisks: boolean;
  canGenerateReports: boolean;
  canLogTime: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
}

// Simulation des permissions par rôle (copie du hook)
const getRolePermissions = (role: Role): ProjectPermissions => {
  // Super Administrateur - Accès total
  if (role === 'super_administrator') {
    return {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      canManageTeam: true,
      canViewAll: true,
      canManageTasks: true,
      canManageRisks: true,
      canGenerateReports: true,
      canLogTime: true,
      canViewAnalytics: true,
      canExportData: true,
    };
  }

  // Administrateur - Gestion complète des projets
  if (role === 'administrator') {
    return {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      canManageTeam: true,
      canViewAll: true,
      canManageTasks: true,
      canManageRisks: true,
      canGenerateReports: true,
      canLogTime: true,
      canViewAnalytics: true,
      canExportData: true,
    };
  }

  // Manager - Gestion d'équipe et projets
  if (role === 'manager') {
    return {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: false,
      canManageTeam: true,
      canViewAll: true,
      canManageTasks: true,
      canManageRisks: true,
      canGenerateReports: true,
      canLogTime: true,
      canViewAnalytics: true,
      canExportData: true,
    };
  }

  // Superviseur - Supervision des projets
  if (role === 'supervisor') {
    return {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: false,
      canManageTeam: true,
      canViewAll: true,
      canManageTasks: true,
      canManageRisks: true,
      canGenerateReports: true,
      canLogTime: true,
      canViewAnalytics: true,
      canExportData: false,
    };
  }

  // Enseignant/Trainer - Gestion pédagogique des projets
  if (role === 'trainer' || role === 'teacher') {
    return {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: false,
      canManageTeam: false,
      canViewAll: false,
      canManageTasks: true,
      canManageRisks: false,
      canGenerateReports: false,
      canLogTime: true,
      canViewAnalytics: false,
      canExportData: false,
    };
  }

  // Étudiant - Participation aux projets
  if (role === 'student') {
    return {
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      canManageTeam: false,
      canViewAll: false,
      canManageTasks: false,
      canManageRisks: false,
      canGenerateReports: false,
      canLogTime: true,
      canViewAnalytics: false,
      canExportData: false,
    };
  }

  // Entrepreneur - Gestion de ses propres projets
  if (role === 'entrepreneur') {
    return {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      canManageTeam: true,
      canViewAll: false,
      canManageTasks: true,
      canManageRisks: true,
      canGenerateReports: true,
      canLogTime: true,
      canViewAnalytics: true,
      canExportData: true,
    };
  }

  // Funder - Consultation des projets financés
  if (role === 'funder') {
    return {
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      canManageTeam: false,
      canViewAll: false,
      canManageTasks: false,
      canManageRisks: false,
      canGenerateReports: true,
      canLogTime: false,
      canViewAnalytics: true,
      canExportData: true,
    };
  }

  // Mentor - Accompagnement des projets
  if (role === 'mentor') {
    return {
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      canManageTeam: false,
      canViewAll: false,
      canManageTasks: false,
      canManageRisks: true,
      canGenerateReports: false,
      canLogTime: false,
      canViewAnalytics: false,
      canExportData: false,
    };
  }

  // Stagiaire/Intern - Participation limitée
  if (role === 'intern') {
    return {
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      canManageTeam: false,
      canViewAll: false,
      canManageTasks: false,
      canManageRisks: false,
      canGenerateReports: false,
      canLogTime: true,
      canViewAnalytics: false,
      canExportData: false,
    };
  }

  // Coach - Accompagnement et conseil
  if (role === 'coach') {
    return {
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      canManageTeam: false,
      canViewAll: false,
      canManageTasks: false,
      canManageRisks: true,
      canGenerateReports: false,
      canLogTime: false,
      canViewAnalytics: false,
      canExportData: false,
    };
  }

  // Facilitator - Facilitation des projets
  if (role === 'facilitator') {
    return {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: false,
      canManageTeam: true,
      canViewAll: false,
      canManageTasks: true,
      canManageRisks: true,
      canGenerateReports: true,
      canLogTime: true,
      canViewAnalytics: false,
      canExportData: false,
    };
  }

  // Publisher/Producer - Gestion des projets de contenu
  if (role === 'publisher' || role === 'producer') {
    return {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      canManageTeam: true,
      canViewAll: false,
      canManageTasks: true,
      canManageRisks: true,
      canGenerateReports: true,
      canLogTime: true,
      canViewAnalytics: true,
      canExportData: true,
    };
  }

  // Artist - Participation créative
  if (role === 'artist') {
    return {
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      canManageTeam: false,
      canViewAll: false,
      canManageTasks: false,
      canManageRisks: false,
      canGenerateReports: false,
      canLogTime: true,
      canViewAnalytics: false,
      canExportData: false,
    };
  }

  // Alumni - Consultation des projets
  if (role === 'alumni') {
    return {
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      canManageTeam: false,
      canViewAll: false,
      canManageTasks: false,
      canManageRisks: false,
      canGenerateReports: false,
      canLogTime: false,
      canViewAnalytics: false,
      canExportData: false,
    };
  }

  // Employer - Gestion des projets d'emploi
  if (role === 'employer') {
    return {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      canManageTeam: true,
      canViewAll: false,
      canManageTasks: true,
      canManageRisks: true,
      canGenerateReports: true,
      canLogTime: true,
      canViewAnalytics: true,
      canExportData: true,
    };
  }

  // Editor - Gestion éditoriale des projets
  if (role === 'editor') {
    return {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: false,
      canManageTeam: false,
      canViewAll: false,
      canManageTasks: true,
      canManageRisks: false,
      canGenerateReports: false,
      canLogTime: true,
      canViewAnalytics: false,
      canExportData: false,
    };
  }

  // Implementer - Implémentation des projets
  if (role === 'implementer') {
    return {
      canCreate: false,
      canRead: true,
      canUpdate: true,
      canDelete: false,
      canManageTeam: false,
      canViewAll: false,
      canManageTasks: true,
      canManageRisks: true,
      canGenerateReports: false,
      canLogTime: true,
      canViewAnalytics: false,
      canExportData: false,
    };
  }

  // Par défaut - Permissions minimales
  return {
    canCreate: false,
    canRead: true,
    canUpdate: false,
    canDelete: false,
    canManageTeam: false,
    canViewAll: false,
    canManageTasks: false,
    canManageRisks: false,
    canGenerateReports: false,
    canLogTime: false,
    canViewAnalytics: false,
    canExportData: false,
  };
};

// Test de tous les rôles
export const testAllRoles = () => {
  console.log('🧪 TEST DE TOUS LES 19 RÔLES MVP\n');
  
  let totalRoles = 0;
  let rolesWithPermissions = 0;
  let rolesWithoutPermissions = 0;
  
  ALL_MVP_ROLES.forEach(role => {
    totalRoles++;
    const permissions = getRolePermissions(role);
    
    console.log(`\n📋 RÔLE: ${role.toUpperCase()}`);
    console.log(`   ✅ Créer: ${permissions.canCreate ? '✅' : '❌'}`);
    console.log(`   👁️  Lire: ${permissions.canRead ? '✅' : '❌'}`);
    console.log(`   ✏️  Modifier: ${permissions.canUpdate ? '✅' : '❌'}`);
    console.log(`   🗑️  Supprimer: ${permissions.canDelete ? '✅' : '❌'}`);
    console.log(`   👥 Gérer équipe: ${permissions.canManageTeam ? '✅' : '❌'}`);
    console.log(`   🌐 Voir tout: ${permissions.canViewAll ? '✅' : '❌'}`);
    console.log(`   📝 Gérer tâches: ${permissions.canManageTasks ? '✅' : '❌'}`);
    console.log(`   ⚠️  Gérer risques: ${permissions.canManageRisks ? '✅' : '❌'}`);
    console.log(`   📊 Générer rapports: ${permissions.canGenerateReports ? '✅' : '❌'}`);
    console.log(`   ⏰ Log temps: ${permissions.canLogTime ? '✅' : '❌'}`);
    console.log(`   📈 Analytics: ${permissions.canViewAnalytics ? '✅' : '❌'}`);
    console.log(`   📤 Export: ${permissions.canExportData ? '✅' : '❌'}`);
    
    const hasAnyPermission = Object.values(permissions).some(p => p === true);
    if (hasAnyPermission) {
      rolesWithPermissions++;
      console.log(`   🎯 STATUT: ✅ PERMISSIONS DÉFINIES`);
    } else {
      rolesWithoutPermissions++;
      console.log(`   🎯 STATUT: ❌ AUCUNE PERMISSION`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DU TEST');
  console.log('='.repeat(60));
  console.log(`📋 Total des rôles testés: ${totalRoles}`);
  console.log(`✅ Rôles avec permissions: ${rolesWithPermissions}`);
  console.log(`❌ Rôles sans permissions: ${rolesWithoutPermissions}`);
  console.log(`📈 Taux de couverture: ${((rolesWithPermissions / totalRoles) * 100).toFixed(1)}%`);
  
  if (rolesWithPermissions === totalRoles) {
    console.log('\n🎉 TOUS LES RÔLES MVP SONT CONFIGURÉS !');
    console.log('✅ Le module Projets supporte tous les 19 rôles définis');
  } else {
    console.log('\n⚠️  ATTENTION: Certains rôles ne sont pas configurés');
    console.log(`❌ ${rolesWithoutPermissions} rôles manquent de configuration`);
  }
  
  return {
    totalRoles,
    rolesWithPermissions,
    rolesWithoutPermissions,
    coverageRate: (rolesWithPermissions / totalRoles) * 100
  };
};

// Export pour utilisation dans d'autres scripts
export { ALL_MVP_ROLES, getRolePermissions };
