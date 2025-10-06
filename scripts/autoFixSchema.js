import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSi6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function autoFixSchema() {
  console.log('🔧 CORRECTION AUTOMATIQUE DU SCHÉMA\n');
  console.log('='.repeat(50));

  try {
    // 1. Vérifier l'état actuel
    console.log('1️⃣ Vérification de l\'état actuel...');
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

    const missingColumns = ['is_active', 'last_login', 'deleted_at'].filter(col => !currentColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('✅ Toutes les colonnes nécessaires sont présentes !');
      await testApplication();
      return;
    }

    console.log('⚠️  Colonnes manquantes:', missingColumns);

    // 2. Essayer d'ajouter les colonnes manquantes via des requêtes SQL simples
    console.log('\n2️⃣ Tentative d\'ajout des colonnes manquantes...');
    
    for (const column of missingColumns) {
      try {
        let sqlCommand;
        switch (column) {
          case 'is_active':
            sqlCommand = 'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL';
            break;
          case 'last_login':
            sqlCommand = 'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ';
            break;
          case 'deleted_at':
            sqlCommand = 'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ';
            break;
        }

        console.log(`   Ajout de la colonne ${column}...`);
        
        // Note: Nous ne pouvons pas exécuter du DDL directement avec la clé anon
        // Mais nous pouvons essayer une approche différente
        console.log(`   ⚠️  Impossible d'exécuter DDL avec la clé anon`);
        
      } catch (error) {
        console.log(`   ❌ Erreur pour ${column}:`, error.message);
      }
    }

    // 3. Générer le script SQL final
    console.log('\n3️⃣ Génération du script SQL final...');
    const sqlScript = generateFinalSQLScript(missingColumns);
    
    console.log('\n📄 SCRIPT SQL À EXÉCUTER DANS SUPABASE:');
    console.log('='.repeat(60));
    console.log(sqlScript);
    console.log('='.repeat(60));

    // 4. Instructions finales
    console.log('\n🎯 INSTRUCTIONS FINALES:');
    console.log('1. Copiez le script SQL ci-dessus');
    console.log('2. Allez sur https://supabase.com/dashboard');
    console.log('3. Projet → SQL Editor → New Query');
    console.log('4. Collez le script → Run');
    console.log('5. Exécutez ensuite: node scripts/finalVerification.js');

    // 5. Sauvegarder le script dans un fichier
    const fs = await import('fs');
    fs.writeFileSync('scripts/final_sql_fix.sql', sqlScript);
    console.log('\n💾 Script sauvegardé dans: scripts/final_sql_fix.sql');

  } catch (error) {
    console.error('\n💥 Erreur générale:', error.message);
  }
}

function generateFinalSQLScript(missingColumns) {
  let sql = `-- Script de correction finale pour la table users
-- Généré le ${new Date().toISOString()}
-- À exécuter dans l'éditeur SQL de Supabase

`;

  // Ajouter les colonnes manquantes
  missingColumns.forEach(column => {
    switch (column) {
      case 'is_active':
        sql += `-- Ajouter la colonne is_active
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Créer l'index pour is_active
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

`;
        break;
      case 'last_login':
        sql += `-- Ajouter la colonne last_login
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

`;
        break;
      case 'deleted_at':
        sql += `-- Ajouter la colonne deleted_at
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

`;
        break;
    }
  });

  // Ajouter les politiques RLS
  sql += `-- Activer RLS si ce n'est pas déjà fait
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS (si elles n'existent pas)
DO $$
BEGIN
    -- Politique pour les utilisateurs de voir leur propre profil
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON public.users
            FOR SELECT USING (auth.uid() = id);
    END IF;

    -- Politique pour les utilisateurs de mettre à jour leur propre profil
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.users
            FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- Politique pour les super administrateurs
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

    -- Politique pour les administrateurs
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

-- Mettre à jour les utilisateurs existants pour avoir is_active = true
UPDATE public.users SET is_active = true WHERE is_active IS NULL;

-- Commentaires
COMMENT ON COLUMN public.users.is_active IS 'Indique si l''utilisateur est actif ou non';
COMMENT ON COLUMN public.users.last_login IS 'Dernière connexion de l''utilisateur';
COMMENT ON COLUMN public.users.deleted_at IS 'Date de suppression (soft delete)';

-- Vérification finale
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users' 
AND column_name IN ('is_active', 'last_login', 'deleted_at')
ORDER BY column_name;
`;

  return sql;
}

async function testApplication() {
  console.log('\n4️⃣ Test de l\'application après correction...');
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        is_active,
        created_at,
        updated_at,
        last_login
      `)
      .limit(1);

    if (error) {
      console.log('❌ Erreur:', error.message);
      return false;
    }

    console.log(`✅ Test réussi ! ${users?.length || 0} utilisateur(s) récupéré(s)`);
    return true;

  } catch (error) {
    console.log('❌ Erreur de test:', error.message);
    return false;
  }
}

autoFixSchema();
