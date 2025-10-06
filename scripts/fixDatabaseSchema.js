import { createClient } from '@supabase/supabase-js';

// Configuration Supabase avec la clé anon
const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabaseSchema() {
  console.log('🔧 Correction du schéma de la base de données...\n');

  try {
    // 1. Vérifier l'état actuel de la table users
    console.log('1️⃣ Vérification de l\'état actuel...');
    const { data: currentUsers, error: currentError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (currentError) {
      console.log('❌ Erreur actuelle:', currentError.message);
      console.log('📋 La table users n\'existe pas ou a un problème de schéma');
    } else {
      console.log('✅ Table users existe');
      if (currentUsers.length > 0) {
        console.log('📋 Colonnes actuelles:', Object.keys(currentUsers[0]));
      }
    }

    // 2. Essayer de créer la table avec le bon schéma
    console.log('\n2️⃣ Création/correction de la table users...');
    
    // Note: Nous ne pouvons pas exécuter du DDL directement avec la clé anon
    // Mais nous pouvons vérifier si les colonnes existent
    const testColumns = ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at', 'updated_at'];
    
    console.log('⚠️  Note: Pour corriger le schéma, vous devez exécuter le script SQL manuellement dans Supabase');
    console.log('📄 Script à exécuter dans l\'éditeur SQL de Supabase:');
    console.log('\n' + '='.repeat(80));
    
    const sqlScript = `
-- Script pour corriger le schéma de la table users
-- Exécuter dans l'éditeur SQL de Supabase

-- Supprimer la table users existante si elle existe
DROP TABLE IF EXISTS public.users CASCADE;

-- Créer la table users avec le bon schéma
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_administrator', 'administrator', 'teacher', 'student', 'manager', 'supervisor', 'guest')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Créer les index pour les performances
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_is_active ON public.users(is_active);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- Activer RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres données
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres données
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Politique pour permettre aux super administrateurs de tout faire
CREATE POLICY "Super admins can manage all users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_administrator'
        )
    );

-- Politique pour permettre aux administrateurs de voir tous les utilisateurs
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('super_administrator', 'administrator')
        )
    );

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insérer l'utilisateur admin existant si il n'existe pas
INSERT INTO public.users (id, email, first_name, last_name, role, is_active)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'first_name', 'Admin'),
    COALESCE(au.raw_user_meta_data->>'last_name', 'System'),
    COALESCE(au.raw_user_meta_data->>'role', 'super_administrator'),
    true
FROM auth.users au
WHERE au.email = 'admin@senegal.com'
AND NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = au.id
);
`;
    
    console.log(sqlScript);
    console.log('\n' + '='.repeat(80));

    // 3. Tester si nous pouvons au moins lire les utilisateurs auth
    console.log('\n3️⃣ Test de connexion à Supabase...');
    const { data: authUsers, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Erreur d\'authentification:', authError.message);
    } else {
      console.log('✅ Connexion Supabase OK');
      if (authUsers.user) {
        console.log('👤 Utilisateur connecté:', authUsers.user.email);
      }
    }

    console.log('\n🎯 INSTRUCTIONS:');
    console.log('1. Copiez le script SQL ci-dessus');
    console.log('2. Allez sur https://supabase.com/dashboard');
    console.log('3. Ouvrez votre projet');
    console.log('4. Allez dans "SQL Editor"');
    console.log('5. Collez le script et cliquez sur "Run"');
    console.log('6. Revenez tester l\'application');

  } catch (error) {
    console.error('💥 Erreur générale:', error.message);
  }
}

fixDatabaseSchema();
