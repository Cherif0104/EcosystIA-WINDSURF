-- Script pour créer les tables de gestion des rôles et permissions granulaires
-- À exécuter dans l'éditeur SQL de Supabase

-- ========================================
-- TABLE POUR LES RÔLES PERSONNALISÉS
-- ========================================

CREATE TABLE IF NOT EXISTS public.custom_roles (
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

-- ========================================
-- TABLE POUR LES PERMISSIONS GRANULAIRES
-- ========================================

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================
-- TABLE DE LIAISON RÔLES-PERMISSIONS
-- ========================================

CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id UUID REFERENCES public.custom_roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(role_id, permission_id)
);

-- ========================================
-- TABLE POUR LES GROUPES D'UTILISATEURS
-- ========================================

CREATE TABLE IF NOT EXISTS public.user_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ========================================
-- TABLE DE LIAISON UTILISATEURS-GROUPES
-- ========================================

CREATE TABLE IF NOT EXISTS public.user_group_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.user_groups(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    joined_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(user_id, group_id)
);

-- ========================================
-- TABLE POUR LES RÔLES DES GROUPES
-- ========================================

CREATE TABLE IF NOT EXISTS public.group_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.user_groups(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.custom_roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(group_id, role_id)
);

-- ========================================
-- INDEX POUR LES PERFORMANCES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_custom_roles_name ON public.custom_roles(name);
CREATE INDEX IF NOT EXISTS idx_custom_roles_is_active ON public.custom_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON public.permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON public.permissions(action);
CREATE INDEX IF NOT EXISTS idx_permissions_is_active ON public.permissions(is_active);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_name ON public.user_groups(name);
CREATE INDEX IF NOT EXISTS idx_user_group_memberships_user_id ON public.user_group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_group_memberships_group_id ON public.user_group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_roles_group_id ON public.group_roles(group_id);
CREATE INDEX IF NOT EXISTS idx_group_roles_role_id ON public.group_roles(role_id);

-- ========================================
-- TRIGGERS POUR UPDATED_AT
-- ========================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_custom_roles_updated_at
    BEFORE UPDATE ON public.custom_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at
    BEFORE UPDATE ON public.permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_groups_updated_at
    BEFORE UPDATE ON public.user_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- RLS (ROW LEVEL SECURITY)
-- ========================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_roles ENABLE ROW LEVEL SECURITY;

-- Politiques pour custom_roles
CREATE POLICY "Super admins can manage custom roles" ON public.custom_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_administrator'
        )
    );

CREATE POLICY "Admins can view custom roles" ON public.custom_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('super_administrator', 'administrator')
        )
    );

-- Politiques pour permissions
CREATE POLICY "Super admins can manage permissions" ON public.permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_administrator'
        )
    );

CREATE POLICY "All authenticated users can view permissions" ON public.permissions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Politiques pour role_permissions
CREATE POLICY "Super admins can manage role permissions" ON public.role_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_administrator'
        )
    );

CREATE POLICY "All authenticated users can view role permissions" ON public.role_permissions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Politiques pour user_groups
CREATE POLICY "Super admins can manage user groups" ON public.user_groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_administrator'
        )
    );

CREATE POLICY "Admins can view user groups" ON public.user_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('super_administrator', 'administrator')
        )
    );

-- Politiques pour user_group_memberships
CREATE POLICY "Super admins can manage group memberships" ON public.user_group_memberships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_administrator'
        )
    );

CREATE POLICY "Users can view their own group memberships" ON public.user_group_memberships
    FOR SELECT USING (user_id = auth.uid());

-- Politiques pour group_roles
CREATE POLICY "Super admins can manage group roles" ON public.group_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_administrator'
        )
    );

CREATE POLICY "All authenticated users can view group roles" ON public.group_roles
    FOR SELECT USING (auth.role() = 'authenticated');

-- ========================================
-- DONNÉES INITIALES
-- ========================================

-- Insérer les rôles système de base
INSERT INTO public.custom_roles (name, display_name, description, is_system_role) VALUES
('super_administrator', 'Super Administrateur', 'Accès complet au système', true),
('administrator', 'Administrateur', 'Administration générale', true),
('manager', 'Manager', 'Gestion d''équipe', true),
('supervisor', 'Superviseur', 'Supervision des activités', true),
('teacher', 'Enseignant', 'Gestion des cours', true),
('student', 'Étudiant', 'Accès aux cours et projets', true)
ON CONFLICT (name) DO NOTHING;

-- Insérer les permissions de base
INSERT INTO public.permissions (name, display_name, description, module, action, resource) VALUES
-- Permissions utilisateurs
('user.create', 'Créer des utilisateurs', 'Créer de nouveaux utilisateurs', 'users', 'create', 'user'),
('user.read', 'Lire les utilisateurs', 'Consulter les informations utilisateurs', 'users', 'read', 'user'),
('user.update', 'Modifier les utilisateurs', 'Modifier les informations utilisateurs', 'users', 'update', 'user'),
('user.delete', 'Supprimer les utilisateurs', 'Supprimer des utilisateurs', 'users', 'delete', 'user'),
('user.manage_roles', 'Gérer les rôles utilisateurs', 'Attribuer/modifier les rôles utilisateurs', 'users', 'manage_roles', 'user'),

-- Permissions cours
('course.create', 'Créer des cours', 'Créer de nouveaux cours', 'courses', 'create', 'course'),
('course.read', 'Lire les cours', 'Consulter les cours', 'courses', 'read', 'course'),
('course.update', 'Modifier les cours', 'Modifier les cours existants', 'courses', 'update', 'course'),
('course.delete', 'Supprimer les cours', 'Supprimer des cours', 'courses', 'delete', 'course'),
('course.manage_students', 'Gérer les étudiants', 'Inscrire/désinscrire des étudiants', 'courses', 'manage_students', 'course'),

-- Permissions projets
('project.create', 'Créer des projets', 'Créer de nouveaux projets', 'projects', 'create', 'project'),
('project.read', 'Lire les projets', 'Consulter les projets', 'projects', 'read', 'project'),
('project.update', 'Modifier les projets', 'Modifier les projets existants', 'projects', 'update', 'project'),
('project.delete', 'Supprimer les projets', 'Supprimer des projets', 'projects', 'delete', 'project'),
('project.manage_team', 'Gérer l''équipe projet', 'Ajouter/retirer des membres d''équipe', 'projects', 'manage_team', 'project'),

-- Permissions analytics
('analytics.view', 'Voir les analytics', 'Consulter les tableaux de bord et rapports', 'analytics', 'view', 'analytics'),
('analytics.export', 'Exporter les données', 'Exporter les données analytics', 'analytics', 'export', 'analytics'),

-- Permissions système
('system.config', 'Configuration système', 'Modifier la configuration du système', 'system', 'config', 'system'),
('system.logs', 'Voir les logs', 'Consulter les logs système', 'system', 'logs', 'system'),
('system.backup', 'Sauvegarde système', 'Effectuer des sauvegardes', 'system', 'backup', 'system'),
('system.maintenance', 'Maintenance système', 'Effectuer la maintenance système', 'system', 'maintenance', 'system'),

-- Permissions rôles et permissions
('roles.create', 'Créer des rôles', 'Créer de nouveaux rôles personnalisés', 'roles', 'create', 'role'),
('roles.read', 'Lire les rôles', 'Consulter les rôles', 'roles', 'read', 'role'),
('roles.update', 'Modifier les rôles', 'Modifier les rôles existants', 'roles', 'update', 'role'),
('roles.delete', 'Supprimer les rôles', 'Supprimer des rôles', 'roles', 'delete', 'role'),
('roles.assign_permissions', 'Attribuer des permissions', 'Attribuer des permissions aux rôles', 'roles', 'assign_permissions', 'role'),

-- Permissions groupes
('groups.create', 'Créer des groupes', 'Créer de nouveaux groupes d''utilisateurs', 'groups', 'create', 'group'),
('groups.read', 'Lire les groupes', 'Consulter les groupes', 'groups', 'read', 'group'),
('groups.update', 'Modifier les groupes', 'Modifier les groupes existants', 'groups', 'update', 'group'),
('groups.delete', 'Supprimer les groupes', 'Supprimer des groupes', 'groups', 'delete', 'group'),
('groups.manage_members', 'Gérer les membres', 'Ajouter/retirer des membres de groupes', 'groups', 'manage_members', 'group')
ON CONFLICT (name) DO NOTHING;

-- Attribuer les permissions aux rôles système
-- Super Administrateur (toutes les permissions)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT cr.id, p.id
FROM public.custom_roles cr, public.permissions p
WHERE cr.name = 'super_administrator'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Administrateur (permissions limitées)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT cr.id, p.id
FROM public.custom_roles cr, public.permissions p
WHERE cr.name = 'administrator'
AND p.name IN (
    'user.create', 'user.read', 'user.update', 'user.manage_roles',
    'course.create', 'course.read', 'course.update', 'course.delete', 'course.manage_students',
    'project.create', 'project.read', 'project.update', 'project.delete', 'project.manage_team',
    'analytics.view', 'analytics.export',
    'roles.read', 'groups.create', 'groups.read', 'groups.update', 'groups.manage_members'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Manager
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT cr.id, p.id
FROM public.custom_roles cr, public.permissions p
WHERE cr.name = 'manager'
AND p.name IN (
    'user.read',
    'course.create', 'course.read', 'course.update', 'course.manage_students',
    'project.create', 'project.read', 'project.update', 'project.manage_team',
    'analytics.view'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Enseignant
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT cr.id, p.id
FROM public.custom_roles cr, public.permissions p
WHERE cr.name = 'teacher'
AND p.name IN (
    'course.create', 'course.read', 'course.update', 'course.manage_students',
    'project.create', 'project.read', 'project.update'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Étudiant (permissions limitées)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT cr.id, p.id
FROM public.custom_roles cr, public.permissions p
WHERE cr.name = 'student'
AND p.name IN (
    'course.read',
    'project.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ========================================
-- COMMENTAIRES
-- ========================================

COMMENT ON TABLE public.custom_roles IS 'Rôles personnalisés du système';
COMMENT ON TABLE public.permissions IS 'Permissions granulaires du système';
COMMENT ON TABLE public.role_permissions IS 'Liaison entre rôles et permissions';
COMMENT ON TABLE public.user_groups IS 'Groupes d''utilisateurs';
COMMENT ON TABLE public.user_group_memberships IS 'Appartenance des utilisateurs aux groupes';
COMMENT ON TABLE public.group_roles IS 'Rôles attribués aux groupes';

-- ========================================
-- FIN DU SCRIPT
-- ========================================

-- Vérification finale
SELECT 
    'custom_roles' as table_name, 
    COUNT(*) as record_count 
FROM public.custom_roles
UNION ALL
SELECT 
    'permissions' as table_name, 
    COUNT(*) as record_count 
FROM public.permissions
UNION ALL
SELECT 
    'role_permissions' as table_name, 
    COUNT(*) as record_count 
FROM public.role_permissions
UNION ALL
SELECT 
    'user_groups' as table_name, 
    COUNT(*) as record_count 
FROM public.user_groups;