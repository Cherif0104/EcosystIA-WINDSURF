-- Script pour corriger le schéma de la table users
-- Exécuter dans l'éditeur SQL de Supabase

-- Supprimer la table users existante si elle existe
DROP TABLE IF EXISTS public.users CASCADE;

-- Créer la table users avec le bon schéma
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_administrator', 'administrator', 'teacher', 'student', 'manager', 'supervisor', 'guest')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Créer les index pour les performances
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_is_active ON public.users(is_active);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- Activer RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres données
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres données
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Politique pour permettre aux super administrateurs de tout faire
CREATE POLICY "Super admins can manage all users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_administrator'
        )
    );

-- Politique pour permettre aux administrateurs de voir tous les utilisateurs
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('super_administrator', 'administrator')
        )
    );

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insérer l'utilisateur admin existant si il n'existe pas
INSERT INTO public.users (id, email, first_name, last_name, role, is_active)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'first_name', 'Admin'),
    COALESCE(au.raw_user_meta_data->>'last_name', 'System'),
    COALESCE(au.raw_user_meta_data->>'role', 'super_administrator'),
    true
FROM auth.users au
WHERE au.email = 'admin@senegal.com'
AND NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = au.id
);

-- Commentaires sur la table
COMMENT ON TABLE public.users IS 'Table des utilisateurs avec informations étendues';
COMMENT ON COLUMN public.users.id IS 'ID de l''utilisateur (référence vers auth.users)';
COMMENT ON COLUMN public.users.email IS 'Email de l''utilisateur';
COMMENT ON COLUMN public.users.first_name IS 'Prénom de l''utilisateur';
COMMENT ON COLUMN public.users.last_name IS 'Nom de l''utilisateur';
COMMENT ON COLUMN public.users.role IS 'Rôle de l''utilisateur dans le système';
COMMENT ON COLUMN public.users.is_active IS 'Statut actif/inactif de l''utilisateur';
COMMENT ON COLUMN public.users.created_at IS 'Date de création du compte';
COMMENT ON COLUMN public.users.updated_at IS 'Date de dernière modification';
COMMENT ON COLUMN public.users.last_login IS 'Date de dernière connexion';
COMMENT ON COLUMN public.users.deleted_at IS 'Date de suppression (soft delete)';
