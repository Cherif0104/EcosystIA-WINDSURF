-- Créer la table users avec UUID
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    role TEXT,
    phone TEXT,
    location TEXT,
    skills TEXT[],
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Activer RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent voir leur propre profil
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Politique pour que les utilisateurs puissent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Politique pour que les super administrateurs puissent voir tous les utilisateurs
CREATE POLICY "Super admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'super_administrator'
        )
    );

-- Politique pour que les super administrateurs puissent gérer tous les utilisateurs
CREATE POLICY "Super admins can manage all users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'super_administrator'
        )
    );
