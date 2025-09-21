import api from './api';
import { Project, Task, Risk } from '../types';

export const projectsService = {
  // Liste des projets
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects/');
    return response.data.results || response.data;
  },

  // Détails d'un projet
  getProject: async (id: number): Promise<Project> => {
    const response = await api.get(`/projects/${id}/`);
    return response.data;
  },

  // Créer un projet
  createProject: async (data: Omit<Project, 'id'>): Promise<Project> => {
    const response = await api.post('/projects/', data);
    return response.data;
  },

  // Modifier un projet
  updateProject: async (id: number, data: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}/`, data);
    return response.data;
  },

  // Supprimer un projet
  deleteProject: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}/`);
  },

  // Tâches d'un projet
  getProjectTasks: async (projectId: number): Promise<Task[]> => {
    const response = await api.get(`/projects/${projectId}/tasks/`);
    return response.data.results || response.data;
  },

  // Créer une tâche
  createTask: async (projectId: number, data: Omit<Task, 'id'>): Promise<Task> => {
    const response = await api.post(`/projects/${projectId}/tasks/`, data);
    return response.data;
  },

  // Risques d'un projet
  getProjectRisks: async (projectId: number): Promise<Risk[]> => {
    const response = await api.get(`/projects/${projectId}/risks/`);
    return response.data.results || response.data;
  },

  // Créer un risque
  createRisk: async (projectId: number, data: Omit<Risk, 'id'>): Promise<Risk> => {
    const response = await api.post(`/projects/${projectId}/risks/`, data);
    return response.data;
  },

  // Ajouter un membre à l'équipe
  addTeamMember: async (projectId: number, userId: number): Promise<void> => {
    await api.post(`/projects/${projectId}/team/add/${userId}/`);
  },

  // Retirer un membre de l'équipe
  removeTeamMember: async (projectId: number, userId: number): Promise<void> => {
    await api.delete(`/projects/${projectId}/team/remove/${userId}/`);
  },
};
