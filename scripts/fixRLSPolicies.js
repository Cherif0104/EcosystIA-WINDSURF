console.log('🔧 CORRECTION DES POLITIQUES RLS\n');
console.log('='.repeat(50));

const sqlScript = `-- Script de correction des politiques RLS
-- Problème : récursion infinie détectée
-- Solution : simplifier les politiques

-- Supprimer toutes les politiques existantes pour la table users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Désactiver temporairement RLS pour corriger
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Réactiver RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Créer des politiques simplifiées sans récursion
-- Politique pour permettre à tous les utilisateurs authentifiés de voir leurs propres données
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre à tous les utilisateurs authentifiés de mettre à jour leurs propres données
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Politique pour permettre l'insertion (nécessaire pour la création d'utilisateurs)
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politique pour les super administrateurs (sans récursion)
CREATE POLICY "Super admins full access" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (auth.users.raw_user_meta_data->>'role')::text = 'super_administrator'
        )
    );

-- Politique pour les administrateurs (lecture seule)
CREATE POLICY "Admins read access" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (auth.users.raw_user_meta_data->>'role')::text IN ('super_administrator', 'administrator')
        )
    );

-- Vérification finale
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY policyname;`;

console.log('📄 SCRIPT SQL À EXÉCUTER DANS SUPABASE:');
console.log('='.repeat(60));
console.log(sqlScript);
console.log('='.repeat(60));

console.log('\n🎯 INSTRUCTIONS:');
console.log('1. Copiez le script SQL ci-dessus');
console.log('2. Allez dans l\'éditeur SQL de Supabase');
console.log('3. Collez le script et cliquez sur "Run"');
console.log('4. Attendez que le script s\'exécute');
console.log('5. Revenez ici et exécutez: node scripts/quickTest.js');

console.log('\n💡 Ce script corrige le problème de récursion infinie dans les politiques RLS');
