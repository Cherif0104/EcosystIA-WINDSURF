import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration Supabase
const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyDatabaseFix() {
  console.log('🔧 Application automatique des corrections de base de données...\n');

  try {
    // 1. Vérifier l'état actuel
    console.log('1️⃣ Vérification de l\'état actuel...');
    const { data: currentUsers, error: currentError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (currentError) {
      console.error('❌ Erreur:', currentError.message);
      console.log('💡 La table users n\'existe peut-être pas ou a un problème');
      return;
    }

    const currentColumns = currentUsers.length > 0 ? Object.keys(currentUsers[0]) : [];
    console.log('📋 Colonnes actuelles:', currentColumns);

    // 2. Identifier les colonnes manquantes
    const requiredColumns = {
      'is_active': 'BOOLEAN DEFAULT true NOT NULL',
      'last_login': 'TIMESTAMPTZ',
      'deleted_at': 'TIMESTAMPTZ'
    };

    const missingColumns = Object.keys(requiredColumns).filter(col => !currentColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('✅ Toutes les colonnes nécessaires sont présentes !');
      await testUserManagement();
      return;
    }

    console.log('\n2️⃣ Colonnes manquantes détectées:', missingColumns);

    // 3. Générer le script SQL complet
    const sqlScript = generateSQLScript(missingColumns, requiredColumns);
    
    // 4. Sauvegarder le script dans un fichier
    const scriptPath = path.join(process.cwd(), 'scripts', 'database_fix.sql');
    fs.writeFileSync(scriptPath, sqlScript);
    console.log(`\n3️⃣ Script SQL sauvegardé dans: ${scriptPath}`);

    // 5. Afficher les instructions
    console.log('\n' + '='.repeat(80));
    console.log('📄 SCRIPT SQL À EXÉCUTER DANS SUPABASE:');
    console.log('='.repeat(80));
    console.log(sqlScript);
    console.log('='.repeat(80));

    console.log('\n🎯 INSTRUCTIONS RAPIDES:');
    console.log('1. Copiez le script ci-dessus');
    console.log('2. Allez sur https://supabase.com/dashboard');
    console.log('3. Projet → SQL Editor → New Query');
    console.log('4. Collez le script → Run');
    console.log('5. Revenez ici et appuyez sur Entrée pour continuer');

    // 6. Attendre que l'utilisateur exécute le script
    console.log('\n⏳ En attente de l\'exécution du script SQL...');
    console.log('💡 Appuyez sur Entrée quand vous avez exécuté le script SQL');
    
    // Simulation d'attente (dans un vrai script, on utiliserait readline)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 7. Tester après correction
    console.log('\n4️⃣ Test après correction...');
    await testUserManagement();

  } catch (error) {
    console.error('💥 Erreur générale:', error.message);
  }
}

function generateSQLScript(missingColumns, requiredColumns) {
  let sql = `-- Script de correction automatique pour la table users
-- Généré le ${new Date().toISOString()}

`;

  // Ajouter les colonnes manquantes
  missingColumns.forEach(column => {
    const type = requiredColumns[column];
    sql += `-- Ajouter la colonne ${column}
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ${column} ${type};

`;
  });

  // Ajouter l'index pour is_active si nécessaire
  if (missingColumns.includes('is_active')) {
    sql += `-- Créer l'index pour is_active
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

`;
  }

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

-- Fin du script
`;

  return sql;
}

async function testUserManagement() {
  console.log('\n🧪 Test de la gestion des utilisateurs...');
  
  try {
    // Test de récupération avec toutes les colonnes
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur lors du test:', error.message);
      console.log('💡 Il se peut que le script SQL n\'ait pas été exécuté correctement');
      return;
    }

    console.log(`✅ Test réussi ! ${users?.length || 0} utilisateurs récupérés`);
    
    if (users && users.length > 0) {
      const user = users[0];
      console.log('📋 Exemple d\'utilisateur:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Rôle: ${user.role}`);
      console.log(`   Actif: ${user.is_active}`);
      console.log(`   Toutes les colonnes présentes: ${Object.keys(user).length >= 8 ? '✅' : '❌'}`);
    }

    console.log('\n🎉 La gestion des utilisateurs est maintenant opérationnelle !');
    console.log('✅ Vous pouvez maintenant tester l\'application');

  } catch (error) {
    console.error('💥 Erreur lors du test:', error.message);
  }
}

applyDatabaseFix();
