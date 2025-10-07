-- =====================================================
-- REFACTORING : TABLES DE PERMISSIONS SÉCURISÉES
-- =====================================================
-- Ce script crée les tables nécessaires pour sécuriser
-- le système de permissions d'EcosystIA

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABLE DES RÔLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- =====================================================
-- 2. TABLE DES MODULES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- =====================================================
-- 3. TABLE DE LIAISON RÔLES-MODULES-PERMISSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_manage BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(role_id, module_id)
);

-- =====================================================
-- 4. TABLE DES UTILISATEURS (Extension de auth.users)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    last_login TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT false,
    phone TEXT,
    location TEXT,
    bio TEXT,
    website TEXT,
    linkedin TEXT,
    twitter TEXT,
    github TEXT,
    preferred_language TEXT DEFAULT 'fr',
    timezone TEXT DEFAULT 'Africa/Dakar',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. INDEX POUR LES PERFORMANCES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_roles_name ON public.roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON public.roles(is_active);
CREATE INDEX IF NOT EXISTS idx_modules_name ON public.modules(name);
CREATE INDEX IF NOT EXISTS idx_modules_order ON public.modules(order_index);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_module_id ON public.role_permissions(module_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON public.users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- =====================================================
-- 6. TRIGGERS POUR UPDATED_AT
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at
    BEFORE UPDATE ON public.modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_permissions_updated_at
    BEFORE UPDATE ON public.role_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. POLITIQUES RLS POUR LES RÔLES
-- =====================================================

-- Politique pour les rôles : lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can view roles" ON public.roles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour les rôles : modification uniquement pour les super administrateurs
CREATE POLICY "Super admins can manage roles" ON public.roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role_id IN (
                SELECT id FROM public.roles WHERE name = 'super_administrator'
            )
        )
    );

-- =====================================================
-- 9. POLITIQUES RLS POUR LES MODULES
-- =====================================================

-- Politique pour les modules : lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can view modules" ON public.modules
    FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour les modules : modification uniquement pour les super administrateurs
CREATE POLICY "Super admins can manage modules" ON public.modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role_id IN (
                SELECT id FROM public.roles WHERE name = 'super_administrator'
            )
        )
    );

-- =====================================================
-- 10. POLITIQUES RLS POUR LES PERMISSIONS
-- =====================================================

-- Politique pour les permissions : lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can view permissions" ON public.role_permissions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour les permissions : modification uniquement pour les super administrateurs
CREATE POLICY "Super admins can manage permissions" ON public.role_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role_id IN (
                SELECT id FROM public.roles WHERE name = 'super_administrator'
            )
        )
    );

-- =====================================================
-- 11. POLITIQUES RLS POUR LES UTILISATEURS
-- =====================================================

-- Politique pour les utilisateurs : lecture de son propre profil
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Politique pour les utilisateurs : lecture de tous les profils pour les admins
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role_id IN (
                SELECT id FROM public.roles WHERE name IN ('super_administrator', 'administrator')
            )
        )
    );

-- Politique pour les utilisateurs : modification uniquement pour les super administrateurs
CREATE POLICY "Super admins can manage users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role_id IN (
                SELECT id FROM public.roles WHERE name = 'super_administrator'
            )
        )
    );

-- =====================================================
-- 12. DONNÉES INITIALES
-- =====================================================

-- Insérer les rôles système de base
INSERT INTO public.roles (name, display_name, description, is_system_role) VALUES
('super_administrator', 'Super Administrateur', 'Accès complet au système avec tous les privilèges', true),
('administrator', 'Administrateur', 'Administration générale du système', true),
('manager', 'Manager', 'Gestion d''équipe et de projets', true),
('supervisor', 'Superviseur', 'Supervision des activités et des utilisateurs', true),
('teacher', 'Enseignant', 'Gestion des cours et de la formation', true),
('trainer', 'Formateur', 'Conception et animation de formations', true),
('student', 'Étudiant', 'Accès aux cours et projets d''apprentissage', true),
('entrepreneur', 'Entrepreneur', 'Gestion de projets entrepreneuriaux', true),
('employer', 'Employeur', 'Gestion des emplois et recrutements', true),
('funder', 'Financeur', 'Gestion des financements et investissements', true),
('mentor', 'Mentor', 'Accompagnement et mentorat', true),
('coach', 'Coach', 'Coaching et développement personnel', true),
('facilitator', 'Facilitateur', 'Animation et facilitation de groupes', true),
('publisher', 'Éditeur', 'Publication et diffusion de contenu', true),
('producer', 'Producteur', 'Production de contenu multimédia', true),
('artist', 'Artiste', 'Création artistique et culturelle', true),
('editor', 'Rédacteur', 'Rédaction et édition de contenu', true),
('implementer', 'Implémenteur', 'Mise en œuvre de projets techniques', true),
('intern', 'Stagiaire', 'Apprentissage et formation pratique', true),
('alumni', 'Ancien Élève', 'Réseau des anciens et alumni', true)
ON CONFLICT (name) DO NOTHING;

-- Insérer les modules système de base
INSERT INTO public.modules (name, display_name, description, icon, order_index) VALUES
('dashboard', 'Tableau de Bord', 'Vue d''ensemble et KPIs', 'fas fa-tachometer-alt', 1),
('projects', 'Projets', 'Gestion des projets et tâches', 'fas fa-project-diagram', 2),
('goals_okrs', 'Objectifs & OKRs', 'Gestion des objectifs et résultats clés', 'fas fa-bullseye', 3),
('courses', 'Formations', 'Cours et certifications', 'fas fa-graduation-cap', 4),
('jobs', 'Emplois', 'Gestion des emplois et recrutements', 'fas fa-briefcase', 5),
('time_tracking', 'Suivi du Temps', 'Gestion du temps et productivité', 'fas fa-clock', 6),
('leave_management', 'Congés', 'Gestion des congés et absences', 'fas fa-calendar-times', 7),
('finance', 'Finance', 'Gestion financière et comptabilité', 'fas fa-euro-sign', 8),
('crm_sales', 'CRM & Ventes', 'Relation client et gestion commerciale', 'fas fa-handshake', 9),
('knowledge_base', 'Base de Connaissances', 'Documentation et ressources', 'fas fa-book', 10),
('development', 'Développement', 'Outils de développement et API', 'fas fa-code', 11),
('tools', 'Outils', 'Outils intégrés et utilitaires', 'fas fa-tools', 12),
('ai_coach', 'Coach IA', 'Assistant IA et coaching', 'fas fa-robot', 13),
('gen_ai_lab', 'Lab IA', 'Laboratoire d''intelligence artificielle', 'fas fa-flask', 14),
('analytics', 'Analytics', 'Analyses et rapports avancés', 'fas fa-chart-line', 15),
('user_management', 'Gestion Utilisateurs', 'Administration des utilisateurs', 'fas fa-users-cog', 16),
('settings', 'Paramètres', 'Configuration du système', 'fas fa-cog', 17),
('super_admin', 'Super Admin', 'Administration système avancée', 'fas fa-shield-alt', 18)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 13. PERMISSIONS PAR DÉFAUT POUR LE SUPER ADMINISTRATEUR
-- =====================================================

-- Attribuer toutes les permissions au super administrateur
INSERT INTO public.role_permissions (role_id, module_id, can_view, can_create, can_update, can_delete, can_manage)
SELECT 
    r.id as role_id,
    m.id as module_id,
    true as can_view,
    true as can_create,
    true as can_update,
    true as can_delete,
    true as can_manage
FROM public.roles r, public.modules m
WHERE r.name = 'super_administrator'
ON CONFLICT (role_id, module_id) DO NOTHING;

-- =====================================================
-- 14. PERMISSIONS PAR DÉFAUT POUR L'ADMINISTRATEUR
-- =====================================================

-- Attribuer des permissions limitées à l'administrateur
INSERT INTO public.role_permissions (role_id, module_id, can_view, can_create, can_update, can_delete, can_manage)
SELECT 
    r.id as role_id,
    m.id as module_id,
    true as can_view,
    CASE 
        WHEN m.name IN ('projects', 'courses', 'jobs', 'user_management') THEN true
        ELSE false
    END as can_create,
    CASE 
        WHEN m.name IN ('projects', 'courses', 'jobs', 'user_management', 'settings') THEN true
        ELSE false
    END as can_update,
    CASE 
        WHEN m.name IN ('projects', 'courses', 'jobs') THEN true
        ELSE false
    END as can_delete,
    CASE 
        WHEN m.name IN ('user_management') THEN true
        ELSE false
    END as can_manage
FROM public.roles r, public.modules m
WHERE r.name = 'administrator'
ON CONFLICT (role_id, module_id) DO NOTHING;

-- =====================================================
-- 15. PERMISSIONS PAR DÉFAUT POUR LES AUTRES RÔLES
-- =====================================================

-- Permissions de base pour tous les autres rôles
INSERT INTO public.role_permissions (role_id, module_id, can_view, can_create, can_update, can_delete, can_manage)
SELECT 
    r.id as role_id,
    m.id as module_id,
    CASE 
        WHEN m.name IN ('dashboard', 'projects', 'courses', 'time_tracking', 'settings') THEN true
        ELSE false
    END as can_view,
    CASE 
        WHEN r.name IN ('manager', 'teacher', 'trainer') AND m.name IN ('projects', 'courses') THEN true
        WHEN r.name IN ('student', 'intern') AND m.name = 'time_tracking' THEN true
        ELSE false
    END as can_create,
    CASE 
        WHEN r.name IN ('manager', 'teacher', 'trainer') AND m.name IN ('projects', 'courses') THEN true
        WHEN r.name IN ('student', 'intern') AND m.name = 'time_tracking' THEN true
        ELSE false
    END as can_update,
    false as can_delete,
    false as can_manage
FROM public.roles r, public.modules m
WHERE r.name NOT IN ('super_administrator', 'administrator')
ON CONFLICT (role_id, module_id) DO NOTHING;

-- =====================================================
-- 16. COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.roles IS 'Rôles utilisateur avec permissions granulaires';
COMMENT ON TABLE public.modules IS 'Modules de l''application EcosystIA';
COMMENT ON TABLE public.role_permissions IS 'Matrice des permissions par rôle et module';
COMMENT ON TABLE public.users IS 'Profils utilisateur étendus avec rôles';

COMMENT ON COLUMN public.roles.is_system_role IS 'Indique si le rôle est un rôle système (non supprimable)';
COMMENT ON COLUMN public.modules.order_index IS 'Ordre d''affichage des modules dans l''interface';
COMMENT ON COLUMN public.role_permissions.can_manage IS 'Permission de gestion complète du module';

-- =====================================================
-- 17. VÉRIFICATION FINALE
-- =====================================================

-- Vérifier que les tables ont été créées correctement
SELECT 
    'roles' as table_name, 
    COUNT(*) as record_count 
FROM public.roles
UNION ALL
SELECT 
    'modules' as table_name, 
    COUNT(*) as record_count 
FROM public.modules
UNION ALL
SELECT 
    'role_permissions' as table_name, 
    COUNT(*) as record_count 
FROM public.role_permissions
UNION ALL
SELECT 
    'users' as table_name, 
    COUNT(*) as record_count 
FROM public.users;

-- =====================================================
-- FIN DU SCRIPT DE REFACTORING
-- =====================================================
