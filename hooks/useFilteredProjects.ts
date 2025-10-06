import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Project } from '../types';
import { useProjectPermissions } from './useProjectPermissions';

export const useFilteredProjects = (projects: Project[]) => {
  const { user } = useAuth();
  const permissions = useProjectPermissions();

  const filteredProjects = useMemo(() => {
    if (!user) return [];

    // Si l'utilisateur peut voir tous les projets
    if (permissions.canViewAll) {
      return projects;
    }

    // Sinon, filtrer selon le rôle
    switch (user.role) {
      case 'student':
      case 'intern':
        // Étudiants et stagiaires voient seulement les projets où ils sont membres
        return projects.filter(project => 
          project.team.some(member => member.id === user.id)
        );

      case 'entrepreneur':
      case 'publisher':
      case 'producer':
        // Entrepreneurs voient seulement leurs propres projets (créés par eux)
        return projects.filter(project => 
          project.team.some(member => member.id === user.id && member.role === user.role)
        );

      case 'trainer':
      case 'teacher':
        // Enseignants voient seulement les projets pédagogiques où ils sont impliqués
        return projects.filter(project => 
          project.team.some(member => member.id === user.id) ||
          project.description.toLowerCase().includes('formation') ||
          project.description.toLowerCase().includes('cours') ||
          project.description.toLowerCase().includes('pédagogique')
        );

      case 'funder':
        // Funders voient seulement les projets financés
        return projects.filter(project => 
          project.description.toLowerCase().includes('financement') ||
          project.description.toLowerCase().includes('funder') ||
          project.title.toLowerCase().includes('financement')
        );

      case 'mentor':
      case 'coach':
        // Mentors et coaches voient seulement les projets qu'ils accompagnent
        return projects.filter(project => 
          project.team.some(member => member.id === user.id) ||
          project.description.toLowerCase().includes('mentorat') ||
          project.description.toLowerCase().includes('coaching')
        );

      case 'facilitator':
        // Facilitateurs voient seulement les projets qu'ils facilitent
        return projects.filter(project => 
          project.team.some(member => member.id === user.id) ||
          project.description.toLowerCase().includes('facilitation')
        );

      case 'artist':
        // Artistes voient seulement les projets créatifs
        return projects.filter(project => 
          project.team.some(member => member.id === user.id) ||
          project.description.toLowerCase().includes('créatif') ||
          project.description.toLowerCase().includes('art') ||
          project.description.toLowerCase().includes('culture')
        );

      case 'alumni':
        // Alumni voient seulement les projets publics
        return projects.filter(project => 
          project.status === 'Completed' && // Projets terminés
          (project.description.toLowerCase().includes('public') ||
           project.description.toLowerCase().includes('alumni'))
        );

      case 'employer':
        // Employeurs voient seulement leurs projets d'emploi
        return projects.filter(project => 
          project.team.some(member => member.id === user.id) ||
          project.description.toLowerCase().includes('emploi') ||
          project.description.toLowerCase().includes('recrutement') ||
          project.title.toLowerCase().includes('emploi')
        );

      case 'editor':
        // Éditeurs voient seulement les projets éditoriaux
        return projects.filter(project => 
          project.team.some(member => member.id === user.id) ||
          project.description.toLowerCase().includes('éditorial') ||
          project.description.toLowerCase().includes('contenu') ||
          project.description.toLowerCase().includes('publication')
        );

      case 'implementer':
        // Implémenteurs voient seulement les projets assignés
        return projects.filter(project => 
          project.team.some(member => member.id === user.id) ||
          project.description.toLowerCase().includes('implémentation') ||
          project.description.toLowerCase().includes('développement')
        );


      default:
        // Par défaut, voir seulement les projets où l'utilisateur est membre
        return projects.filter(project => 
          project.team.some(member => member.id === user.id)
        );
    }
  }, [projects, user, permissions]);

  const canUserAccessProject = (project: Project): boolean => {
    if (!user) return false;

    // Vérifier si l'utilisateur peut voir tous les projets
    if (permissions.canViewAll) return true;

    // Vérifier si l'utilisateur est membre de l'équipe
    const isTeamMember = project.team.some(member => member.id === user.id);
    if (isTeamMember) return true;

    // Vérifications spécifiques par rôle
    switch (user.role) {
      case 'funder':
        return project.description.toLowerCase().includes('financement') ||
               project.title.toLowerCase().includes('financement');

      case 'alumni':
        return project.status === 'Completed' && 
               (project.description.toLowerCase().includes('public') ||
                project.description.toLowerCase().includes('alumni'));

      case 'employer':
        return project.team.some(member => member.id === user.id) ||
               project.description.toLowerCase().includes('emploi') ||
               project.description.toLowerCase().includes('recrutement') ||
               project.title.toLowerCase().includes('emploi');

      case 'editor':
        return project.team.some(member => member.id === user.id) ||
               project.description.toLowerCase().includes('éditorial') ||
               project.description.toLowerCase().includes('contenu') ||
               project.description.toLowerCase().includes('publication');

      case 'implementer':
        return project.team.some(member => member.id === user.id) ||
               project.description.toLowerCase().includes('implémentation') ||
               project.description.toLowerCase().includes('développement');

      case 'teacher':
        return project.team.some(member => member.id === user.id) ||
               project.description.toLowerCase().includes('formation') ||
               project.description.toLowerCase().includes('cours') ||
               project.description.toLowerCase().includes('pédagogique');

      default:
        return false;
    }
  };

  const getProjectActions = (project: Project) => {
    const actions = [];

    if (permissions.canRead && canUserAccessProject(project)) {
      actions.push('view');
    }

    if (permissions.canUpdate && canUserAccessProject(project)) {
      actions.push('edit');
    }

    if (permissions.canDelete && canUserAccessProject(project)) {
      actions.push('delete');
    }

    if (permissions.canManageTeam && canUserAccessProject(project)) {
      actions.push('manage_team');
    }

    if (permissions.canLogTime && canUserAccessProject(project)) {
      actions.push('log_time');
    }

    if (permissions.canGenerateReports && canUserAccessProject(project)) {
      actions.push('generate_report');
    }

    return actions;
  };

  return {
    filteredProjects,
    canUserAccessProject,
    getProjectActions,
    permissions
  };
};
