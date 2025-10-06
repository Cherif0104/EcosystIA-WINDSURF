import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnc6amppa2Frd2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwOTQzMjYsImV4cCI6MjA1MTY3MDMyNn0.4j8vQ9XqKjL7QwR8XqKjL7QwR8XqKjL7QwR8XqKjL7QwR8XqKjL7QwR8XqKjL7QwR8XqKjL7QwR8';

// Créer le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Fonction utilitaire pour vérifier la connexion
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion Supabase:', error);
      return false;
    }
    
    console.log('✅ Connexion Supabase établie');
    return true;
  } catch (err) {
    console.error('❌ Erreur de connexion Supabase:', err);
    return false;
  }
};

// Fonction utilitaire pour obtenir l'utilisateur actuel
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
    
    return user;
  } catch (err) {
    console.error('❌ Erreur lors de la récupération de l\'utilisateur:', err);
    return null;
  }
};

// Fonction utilitaire pour se connecter
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('❌ Erreur de connexion:', error);
      throw error;
    }
    
    console.log('✅ Connexion réussie:', data.user?.email);
    return data;
  } catch (err) {
    console.error('❌ Erreur de connexion:', err);
    throw err;
  }
};

// Fonction utilitaire pour se déconnecter
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Erreur de déconnexion:', error);
      throw error;
    }
    
    console.log('✅ Déconnexion réussie');
    return true;
  } catch (err) {
    console.error('❌ Erreur de déconnexion:', err);
    throw err;
  }
};

// Fonction utilitaire pour s'inscrire
export const signUp = async (email: string, password: string, metadata?: any) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) {
      console.error('❌ Erreur d\'inscription:', error);
      throw error;
    }
    
    console.log('✅ Inscription réussie:', data.user?.email);
    return data;
  } catch (err) {
    console.error('❌ Erreur d\'inscription:', err);
    throw err;
  }
};

// Fonction utilitaire pour réinitialiser le mot de passe
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) {
      console.error('❌ Erreur de réinitialisation:', error);
      throw error;
    }
    
    console.log('✅ Email de réinitialisation envoyé à:', email);
    return true;
  } catch (err) {
    console.error('❌ Erreur de réinitialisation:', err);
    throw err;
  }
};

// Export par défaut
export default supabase;
