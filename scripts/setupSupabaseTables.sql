-- Créer la table users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'student',
    phone TEXT,
    location TEXT,
    skills TEXT[] DEFAULT '{}',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent voir leur propre profil
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Politique pour que les utilisateurs puissent modifier leur propre profil
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

-- Politique pour que les super administrateurs puissent modifier tous les utilisateurs
CREATE POLICY "Super admins can update all users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'super_administrator'
        )
    );

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Créer un utilisateur admin de test
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    raw_user_meta_data,
    raw_app_meta_data,
    is_super_admin
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@ecosystia.com',
    crypt('Admin123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    '{"first_name": "Admin", "last_name": "EcosystIA", "full_name": "Admin EcosystIA", "role": "super_administrator"}',
    '{"provider": "email", "providers": ["email"]}',
    false
) ON CONFLICT (email) DO NOTHING;

-- Insérer le profil utilisateur correspondant
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    full_name,
    role,
    phone,
    location,
    skills,
    avatar_url,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'first_name',
    au.raw_user_meta_data->>'last_name',
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'role',
    '+221 77 123 45 67',
    'Dakar, Sénégal',
    '{}',
    null,
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'admin@ecosystia.com'
ON CONFLICT (id) DO NOTHING;
