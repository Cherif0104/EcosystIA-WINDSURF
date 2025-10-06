import fs from 'fs';

function generateSQLFix() {
  console.log('🔧 GÉNÉRATION DU SCRIPT SQL DE CORRECTION\n');
  console.log('='.repeat(50));

  const sqlScript = `-- Script de correction finale pour la table users
-- Généré le ${new Date().toISOString()}
-- À exécuter dans l'éditeur SQL de Supabase

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

  // Sauvegarder le script
  fs.writeFileSync('scripts/final_sql_fix.sql', sqlScript);
  
  console.log('✅ Script SQL généré et sauvegardé dans: scripts/final_sql_fix.sql');
  console.log('\n📄 SCRIPT SQL À EXÉCUTER:');
  console.log('='.repeat(60));
  console.log(sqlScript);
  console.log('='.repeat(60));

  console.log('\n🎯 INSTRUCTIONS:');
  console.log('1. Copiez le script SQL ci-dessus');
  console.log('2. Allez sur https://supabase.com/dashboard');
  console.log('3. Sélectionnez votre projet');
  console.log('4. Allez dans "SQL Editor"');
  console.log('5. Cliquez sur "New Query"');
  console.log('6. Collez le script ci-dessus');
  console.log('7. Cliquez sur "Run"');
  console.log('8. Attendez que le script s\'exécute');
  console.log('9. Revenez ici et exécutez: node scripts/finalVerification.js');

  console.log('\n💾 Le script est également sauvegardé dans: scripts/final_sql_fix.sql');
}

generateSQLFix();
