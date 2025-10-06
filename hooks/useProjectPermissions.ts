import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

export interface ProjectPermissions {
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

export const useProjectPermissions = (): ProjectPermissions => {
  const { user } = useAuth();
  
  if (!user) {
    return {
      canCreate: false,
      canRead: false,
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

  const role = user.role as Role;

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
      canDelete: false, // Pas de suppression pour les managers
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
      canManageTeam: false, // Limité aux projets pédagogiques
      canViewAll: false, // Seulement ses projets
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
      canUpdate: false, // Seulement ses tâches assignées
      canDelete: false,
      canManageTeam: false,
      canViewAll: false, // Seulement les projets où il est membre
      canManageTasks: false, // Seulement ses propres tâches
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
      canDelete: true, // Seulement ses projets
      canManageTeam: true,
      canViewAll: false, // Seulement ses projets
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
      canViewAll: false, // Seulement les projets financés
      canManageTasks: false,
      canManageRisks: false,
      canGenerateReports: true, // Rapports financiers
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
      canUpdate: false, // Seulement commentaires/avis
      canDelete: false,
      canManageTeam: false,
      canViewAll: false, // Seulement projets mentorés
      canManageTasks: false,
      canManageRisks: true, // Peut identifier des risques
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
      canViewAll: false, // Seulement projets assignés
      canManageTasks: false, // Seulement ses tâches
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
      canUpdate: false, // Seulement commentaires
      canDelete: false,
      canManageTeam: false,
      canViewAll: false, // Seulement projets coachés
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
      canViewAll: false, // Seulement projets facilités
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
      canDelete: true, // Seulement leurs projets
      canManageTeam: true,
      canViewAll: false, // Seulement leurs projets
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
      canUpdate: false, // Seulement ses contributions
      canDelete: false,
      canManageTeam: false,
      canViewAll: false, // Seulement projets créatifs
      canManageTasks: false, // Seulement ses tâches
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
      canViewAll: false, // Seulement projets publics
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
      canDelete: true, // Seulement ses projets d'emploi
      canManageTeam: true,
      canViewAll: false, // Seulement ses projets
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
      canDelete: false, // Pas de suppression
      canManageTeam: false, // Limité aux contenus
      canViewAll: false, // Seulement projets éditoriaux
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
      canUpdate: true, // Seulement les tâches d'implémentation
      canDelete: false,
      canManageTeam: false,
      canViewAll: false, // Seulement projets assignés
      canManageTasks: true, // Seulement ses tâches d'implémentation
      canManageRisks: true, // Peut identifier les risques techniques
      canGenerateReports: false,
      canLogTime: true,
      canViewAnalytics: false,
      canExportData: false,
    };
  }

  // Teacher - Enseignant (ajout pour cohérence)
  if (role === 'teacher') {
    return {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: false,
      canManageTeam: false, // Limité aux projets pédagogiques
      canViewAll: false, // Seulement ses projets
      canManageTasks: true,
      canManageRisks: false,
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
