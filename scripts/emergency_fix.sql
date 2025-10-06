-- CORRECTION D'URGENCE - RÉSOLUTION DÉFINITIVE
-- Supprimer TOUTES les politiques et recréer depuis zéro

-- 1. SUPPRIMER TOUTES LES POLITIQUES EXISTANTES
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins full access" ON public.users;
DROP POLICY IF EXISTS "Admins read access" ON public.users;
DROP POLICY IF EXISTS "Super admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- 2. DÉSACTIVER COMPLÈTEMENT RLS TEMPORAIREMENT
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 3. RÉACTIVER RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. CRÉER DES POLITIQUES ULTRA-SIMPLES SANS RÉCURSION
-- Politique de base : tout le monde peut voir ses propres données
CREATE POLICY "simple_select_policy" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Politique de base : tout le monde peut modifier ses propres données  
CREATE POLICY "simple_update_policy" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Politique de base : tout le monde peut insérer ses propres données
CREATE POLICY "simple_insert_policy" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. DONNER ACCÈS TOTAL AU SERVICE ROLE (pour les scripts)
-- Cette politique permet au service role d'avoir accès complet
CREATE POLICY "service_role_access" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- 6. VÉRIFICATION FINALE
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY policyname;

-- 7. TEST SIMPLE
SELECT COUNT(*) as total_users FROM public.users;