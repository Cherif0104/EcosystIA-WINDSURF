import api from './api';
import { User, LoginData, RegisterData } from '../types';

export const authService = {
  // Inscription
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register/', data);
    return response.data;
  },

  // Connexion
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login/', data);
    const { tokens, user } = response.data;
    
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    
    return { user, tokens };
  },

  // Déconnexion
  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await api.post('/auth/logout/', { refresh_token: refreshToken });
    }
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  // Changement de mot de passe
  changePassword: async (data: { old_password: string; new_password: string; new_password_confirm: string }) => {
    const response = await api.post('/auth/password/change/', data);
    return response.data;
  },

  // Réinitialisation de mot de passe
  resetPassword: async (email: string) => {
    const response = await api.post('/auth/password/reset/', { email });
    return response.data;
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/current/');
    return response.data;
  },
};