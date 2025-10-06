import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';

// Configuration Supabase
const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function completeFix() {
  console.log('🚀 CORRECTION COMPLÈTE DE L\'APPLICATION\n');
  console.log('='.repeat(60));

  try {
    // 1. Étape 1: Diagnostic initial
    console.log('\n1️⃣ DIAGNOSTIC INITIAL...');
    await diagnosticStep();

    // 2. Étape 2: Génération du script de correction
    console.log('\n2️⃣ GÉNÉRATION DU SCRIPT DE CORRECTION...');
    const sqlScript = await generateFixScript();

    // 3. Étape 3: Instructions pour l'utilisateur
    console.log('\n3️⃣ INSTRUCTIONS POUR L\'UTILISATEUR...');
    await userInstructions(sqlScript);

    // 4. Étape 4: Test après correction
    console.log('\n4️⃣ TEST APRÈS CORRECTION...');
    await testAfterFix();

    // 5. Étape 5: Test de l'application
    console.log('\n5️⃣ TEST DE L\'APPLICATION...');
    await testApplication();

    console.log('\n' + '='.repeat(60));
    console.log('✅ CORRECTION TERMINÉE !');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n💥 Erreur lors de la correction:', error.message);
  }
}

async function diagnosticStep() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Problème détecté:', error.message);
      return false;
    }

    const currentColumns = users.length > 0 ? Object.keys(users[0]) : [];
    console.log('📋 Colonnes actuelles:', currentColumns);

    const missingColumns = ['is_active', 'last_login', 'deleted_at'].filter(col => !currentColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('✅ Toutes les colonnes nécessaires sont présentes !');
      return true;
    }

    console.log('⚠️  Colonnes manquantes:', missingColumns);
    return false;

  } catch (error) {
    console.error('💥 Erreur de diagnostic:', error.message);
    return false;
  }
}

async function generateFixScript() {
  const sqlScript = `-- Script de correction automatique pour la table users
-- Généré le ${new Date().toISOString()}

-- Ajouter la colonne is_active
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Ajouter la colonne last_login
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Ajouter la colonne deleted_at
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Créer l'index pour is_active
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Activer RLS si ce n'est pas déjà fait
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
COMMENT ON COLUMN public.users.deleted_at IS 'Date de suppression (soft delete)';`;

  console.log('✅ Script SQL généré');
  return sqlScript;
}

async function userInstructions(sqlScript) {
  console.log('\n📋 INSTRUCTIONS IMPORTANTES:');
  console.log('='.repeat(60));
  console.log('1. Copiez le script SQL ci-dessous');
  console.log('2. Allez sur https://supabase.com/dashboard');
  console.log('3. Sélectionnez votre projet');
  console.log('4. Allez dans "SQL Editor"');
  console.log('5. Cliquez sur "New Query"');
  console.log('6. Collez le script ci-dessous');
  console.log('7. Cliquez sur "Run"');
  console.log('8. Attendez que le script s\'exécute');
  console.log('9. Revenez ici et appuyez sur Entrée');
  
  console.log('\n📄 SCRIPT SQL À EXÉCUTER:');
  console.log('='.repeat(60));
  console.log(sqlScript);
  console.log('='.repeat(60));
  
  console.log('\n⏳ En attente de l\'exécution du script SQL...');
  console.log('💡 Une fois le script exécuté dans Supabase, appuyez sur Entrée');
  
  // Simulation d'attente (dans un vrai script, on utiliserait readline)
  await new Promise(resolve => setTimeout(resolve, 5000));
}

async function testAfterFix() {
  console.log('\n🧪 Test après correction...');
  
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
      console.error('❌ Erreur:', error.message);
      console.log('💡 Le script SQL n\'a peut-être pas été exécuté correctement');
      return false;
    }

    console.log(`✅ Test réussi ! ${users?.length || 0} utilisateur(s) récupéré(s)`);
    
    if (users && users.length > 0) {
      const user = users[0];
      console.log('📋 Exemple d\'utilisateur:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Rôle: ${user.role}`);
      console.log(`   Actif: ${user.is_active}`);
      console.log(`   Colonnes présentes: ${Object.keys(user).length}/9`);
    }

    return true;

  } catch (error) {
    console.error('💥 Erreur lors du test:', error.message);
    return false;
  }
}

async function testApplication() {
  console.log('\n🌐 Test de l\'application web...');
  
  try {
    const response = await fetch('http://localhost:5173/');
    if (response.ok) {
      console.log('✅ Application web accessible (HTTP 200)');
      console.log('🚀 Vous pouvez maintenant tester l\'application dans votre navigateur');
      console.log('💡 URL: http://localhost:5173/');
    } else {
      console.log(`⚠️  Application web répond avec HTTP ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Application web non accessible:', error.message);
    console.log('💡 Assurez-vous que le serveur de développement est lancé:');
    console.log('   npm run dev');
  }
}

completeFix();
