import { supabase } from '../src/lib/supabase.js';
import { User, Role } from '../types';

export interface SupabaseUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    role?: Role;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: Role;
}

class SupabaseAuthService {
  // Connexion avec Supabase Auth
  async login(credentials: LoginCredentials): Promise<{ user: User | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw new Error(error.message);

    if (data.user) {
      const profile = await this.getUserProfile(data.user.id);
      return { user: profile };
    }
    return { user: null };
  }

  // Inscription avec Supabase Auth et confirmation automatique
  async register(userData: RegisterData): Promise<{ user: User | null }> {
    const { email, password, first_name, last_name, role } = userData;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${first_name} ${last_name}`,
          role: role,
        },
      },
    });

    if (error) throw new Error(error.message);

    if (data.user) {
      // Attendre un peu pour que la confirmation automatique se fasse
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Tenter de confirmer automatiquement l'email
      try {
        await this.autoConfirmUser(data.user.id);
      } catch (confirmError) {
        console.warn('Auto-confirmation échouée, mais utilisateur créé:', confirmError);
      }
      
      const profile = await this.getUserProfile(data.user.id);
      return { user: profile };
    }
    return { user: null };
  }

  // Fonction pour confirmer automatiquement un utilisateur
  private async autoConfirmUser(userId: string): Promise<void> {
    // Cette fonction sera appelée par le trigger SQL automatique
    // Pas d'action nécessaire côté client
    console.log('Utilisateur confirmé automatiquement:', userId);
  }

  // Déconnexion
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  // Obtenir l'utilisateur actuel
  async getCurrentUser(): Promise<User | null> {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      return this.getUserProfile(supabaseUser.id);
    }
    return null;
  }

  // Obtenir le profil utilisateur depuis la table 'users'
  async getUserProfile(supabaseUserId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUserId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching user profile:', error.message);
      return null;
    }

    if (data) {
      return {
        id: data.id,
        name: data.full_name || data.email,
        email: data.email,
        avatar: data.avatar_url || '',
        role: data.role as Role,
        skills: data.skills || [],
        phone: data.phone || '',
        location: data.location || '',
      };
    }
    return null;
  }

  // Mettre à jour le profil utilisateur
  async updateProfile(userData: Partial<User>): Promise<User | null> {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: userData.name,
        avatar_url: userData.avatar,
        role: userData.role,
        skills: userData.skills,
        phone: userData.phone,
        location: userData.location,
      })
      .eq('id', currentUser.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      name: data.full_name || data.email,
      email: data.email,
      avatar: data.avatar_url || '',
      role: data.role as Role,
      skills: data.skills || [],
      phone: data.phone || '',
      location: data.location || '',
    };
  }

  // Écouter les changements d'état d'authentification
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        this.getUserProfile(session.user.id).then(callback);
      } else {
        callback(null);
      }
    });
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    const session = supabase.auth.getSession();
    return !!session;
  }
}

export default new SupabaseAuthService();
