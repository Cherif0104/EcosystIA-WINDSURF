import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMissingColumns() {
  console.log('🔧 Ajout des colonnes manquantes à la table users...\n');

  try {
    // 1. Vérifier l'état actuel
    console.log('1️⃣ Vérification des colonnes actuelles...');
    const { data: currentUsers, error: currentError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (currentError) {
      console.error('❌ Erreur:', currentError.message);
      return;
    }

    const currentColumns = currentUsers.length > 0 ? Object.keys(currentUsers[0]) : [];
    console.log('📋 Colonnes actuelles:', currentColumns);

    // 2. Identifier les colonnes manquantes
    const requiredColumns = ['is_active', 'last_login', 'deleted_at'];
    const missingColumns = requiredColumns.filter(col => !currentColumns.includes(col));
    
    console.log('\n2️⃣ Colonnes manquantes:', missingColumns);

    if (missingColumns.length === 0) {
      console.log('✅ Toutes les colonnes nécessaires sont présentes !');
      return;
    }

    // 3. Générer le script SQL pour ajouter les colonnes manquantes
    console.log('\n3️⃣ Script SQL pour ajouter les colonnes manquantes:');
    console.log('\n' + '='.repeat(80));
    
    let sqlScript = '-- Script pour ajouter les colonnes manquantes\n';
    
    if (missingColumns.includes('is_active')) {
      sqlScript += `
-- Ajouter la colonne is_active
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Créer un index pour is_active
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
`;
    }
    
    if (missingColumns.includes('last_login')) {
      sqlScript += `
-- Ajouter la colonne last_login
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
`;
    }
    
    if (missingColumns.includes('deleted_at')) {
      sqlScript += `
-- Ajouter la colonne deleted_at pour soft delete
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
`;
    }

    // Ajouter les politiques RLS si elles n'existent pas
    sqlScript += `
-- Vérifier et créer les politiques RLS si nécessaire
DO $$
BEGIN
    -- Activer RLS si ce n'est pas déjà fait
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'users' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Créer la politique pour les utilisateurs de voir leur propre profil
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON public.users
            FOR SELECT USING (auth.uid() = id);
    END IF;

    -- Créer la politique pour les super administrateurs
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Super admins can manage all users'
    ) THEN
        CREATE POLICY "Super admins can manage all users" ON public.users
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE users.id = auth.uid() 
                    AND users.role = 'super_administrator'
                )
            );
    END IF;

    -- Créer la politique pour les administrateurs
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Admins can view all users'
    ) THEN
        CREATE POLICY "Admins can view all users" ON public.users
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE users.id = auth.uid() 
                    AND users.role IN ('super_administrator', 'administrator')
                )
            );
    END IF;
END $$;
`;

    console.log(sqlScript);
    console.log('\n' + '='.repeat(80));

    // 4. Tester si nous pouvons au moins insérer des données de test
    console.log('\n4️⃣ Test de fonctionnement...');
    
    // Essayer de sélectionner des utilisateurs
    const { data: testSelect, error: selectError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(1);
    
    if (selectError) {
      console.log('❌ Erreur de sélection:', selectError.message);
    } else {
      console.log('✅ Sélection OK -', testSelect?.length || 0, 'utilisateur(s) trouvé(s)');
    }

    console.log('\n🎯 INSTRUCTIONS:');
    console.log('1. Copiez le script SQL ci-dessus');
    console.log('2. Allez sur https://supabase.com/dashboard');
    console.log('3. Ouvrez votre projet → SQL Editor');
    console.log('4. Collez le script et cliquez sur "Run"');
    console.log('5. Revenez tester l\'application');
    console.log('\n⚠️  IMPORTANT: Ce script ajoute seulement les colonnes manquantes sans supprimer les existantes');

  } catch (error) {
    console.error('💥 Erreur générale:', error.message);
  }
}

addMissingColumns();
