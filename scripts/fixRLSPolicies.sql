-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can manage all users" ON public.users;

-- Créer des politiques plus permissives pour le développement
CREATE POLICY "Enable insert for authenticated users only" ON public.users
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable select for users based on user_id" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Politique temporaire pour permettre l'insertion depuis le script
CREATE POLICY "Allow all operations for service role" ON public.users
    FOR ALL USING (true);
