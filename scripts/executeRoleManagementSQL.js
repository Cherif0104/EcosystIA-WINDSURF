import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeRoleManagementSQL() {
  console.log('🚀 EXÉCUTION AUTOMATIQUE DU SCRIPT SQL\n');
  console.log('='.repeat(60));

  try {
    // 1. Connexion et vérification
    console.log('1️⃣ Connexion à Supabase...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log(authError ? '⚠️  Auth session missing (normal pour les scripts)' : '✅ Connexion OK');

    // 2. Exécution du script SQL complet
    console.log('\n2️⃣ Exécution du script SQL...');
    
    const sqlScript = `
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
`;

    // Exécution du script SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlScript });
    
    if (error) {
      console.log('❌ Erreur lors de l\'exécution du script SQL:', error.message);
      console.log('💡 Tentative alternative avec des requêtes individuelles...');
      
      // Alternative: exécuter les requêtes une par une
      await executeQueriesIndividually();
    } else {
      console.log('✅ Script SQL exécuté avec succès!');
    }

    // 3. Insertion des données initiales
    console.log('\n3️⃣ Insertion des données initiales...');
    await insertInitialData();

    // 4. Vérification finale
    console.log('\n4️⃣ Vérification finale...');
    await verifyTables();

  } catch (error) {
    console.error('\n💥 Erreur générale:', error.message);
  }
}

async function executeQueriesIndividually() {
  console.log('🔄 Exécution des requêtes individuelles...');
  
  const queries = [
    // Tables
    `CREATE TABLE IF NOT EXISTS public.custom_roles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        description TEXT,
        is_system_role BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS public.permissions (
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
    )`,
    
    `CREATE TABLE IF NOT EXISTS public.role_permissions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        role_id UUID REFERENCES public.custom_roles(id) ON DELETE CASCADE,
        permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
        granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        UNIQUE(role_id, permission_id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS public.user_groups (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        display_name TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS public.user_group_memberships (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        group_id UUID REFERENCES public.user_groups(id) ON DELETE CASCADE,
        joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        joined_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        UNIQUE(user_id, group_id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS public.group_roles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        group_id UUID REFERENCES public.user_groups(id) ON DELETE CASCADE,
        role_id UUID REFERENCES public.custom_roles(id) ON DELETE CASCADE,
        assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        UNIQUE(group_id, role_id)
    )`
  ];

  for (const query of queries) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) {
        console.log(`⚠️  Erreur requête: ${error.message}`);
      } else {
        console.log('✅ Requête exécutée');
      }
    } catch (err) {
      console.log(`❌ Exception: ${err.message}`);
    }
  }
}

async function insertInitialData() {
  try {
    // Insérer les rôles système
    console.log('📝 Insertion des rôles système...');
    const { error: rolesError } = await supabase
      .from('custom_roles')
      .upsert([
        { name: 'super_administrator', display_name: 'Super Administrateur', description: 'Accès complet au système', is_system_role: true },
        { name: 'administrator', display_name: 'Administrateur', description: 'Administration générale', is_system_role: true },
        { name: 'manager', display_name: 'Manager', description: 'Gestion d\'équipe', is_system_role: true },
        { name: 'supervisor', display_name: 'Superviseur', description: 'Supervision des activités', is_system_role: true },
        { name: 'teacher', display_name: 'Enseignant', description: 'Gestion des cours', is_system_role: true },
        { name: 'student', display_name: 'Étudiant', description: 'Accès aux cours et projets', is_system_role: true }
      ], { onConflict: 'name' });

    if (rolesError) {
      console.log('❌ Erreur insertion rôles:', rolesError.message);
    } else {
      console.log('✅ Rôles système insérés');
    }

    // Insérer les permissions
    console.log('📝 Insertion des permissions...');
    const permissions = [
      // Permissions utilisateurs
      { name: 'user.create', display_name: 'Créer des utilisateurs', description: 'Créer de nouveaux utilisateurs', module: 'users', action: 'create', resource: 'user' },
      { name: 'user.read', display_name: 'Lire les utilisateurs', description: 'Consulter les informations utilisateurs', module: 'users', action: 'read', resource: 'user' },
      { name: 'user.update', display_name: 'Modifier les utilisateurs', description: 'Modifier les informations utilisateurs', module: 'users', action: 'update', resource: 'user' },
      { name: 'user.delete', display_name: 'Supprimer les utilisateurs', description: 'Supprimer des utilisateurs', module: 'users', action: 'delete', resource: 'user' },
      { name: 'user.manage_roles', display_name: 'Gérer les rôles utilisateurs', description: 'Attribuer/modifier les rôles utilisateurs', module: 'users', action: 'manage_roles', resource: 'user' },

      // Permissions cours
      { name: 'course.create', display_name: 'Créer des cours', description: 'Créer de nouveaux cours', module: 'courses', action: 'create', resource: 'course' },
      { name: 'course.read', display_name: 'Lire les cours', description: 'Consulter les cours', module: 'courses', action: 'read', resource: 'course' },
      { name: 'course.update', display_name: 'Modifier les cours', description: 'Modifier les cours existants', module: 'courses', action: 'update', resource: 'course' },
      { name: 'course.delete', display_name: 'Supprimer les cours', description: 'Supprimer des cours', module: 'courses', action: 'delete', resource: 'course' },
      { name: 'course.manage_students', display_name: 'Gérer les étudiants', description: 'Inscrire/désinscrire des étudiants', module: 'courses', action: 'manage_students', resource: 'course' },

      // Permissions projets
      { name: 'project.create', display_name: 'Créer des projets', description: 'Créer de nouveaux projets', module: 'projects', action: 'create', resource: 'project' },
      { name: 'project.read', display_name: 'Lire les projets', description: 'Consulter les projets', module: 'projects', action: 'read', resource: 'project' },
      { name: 'project.update', display_name: 'Modifier les projets', description: 'Modifier les projets existants', module: 'projects', action: 'update', resource: 'project' },
      { name: 'project.delete', display_name: 'Supprimer les projets', description: 'Supprimer des projets', module: 'projects', action: 'delete', resource: 'project' },
      { name: 'project.manage_team', display_name: 'Gérer l\'équipe projet', description: 'Ajouter/retirer des membres d\'équipe', module: 'projects', action: 'manage_team', resource: 'project' },

      // Permissions analytics
      { name: 'analytics.view', display_name: 'Voir les analytics', description: 'Consulter les tableaux de bord et rapports', module: 'analytics', action: 'view', resource: 'analytics' },
      { name: 'analytics.export', display_name: 'Exporter les données', description: 'Exporter les données analytics', module: 'analytics', action: 'export', resource: 'analytics' },

      // Permissions système
      { name: 'system.config', display_name: 'Configuration système', description: 'Modifier la configuration du système', module: 'system', action: 'config', resource: 'system' },
      { name: 'system.logs', display_name: 'Voir les logs', description: 'Consulter les logs système', module: 'system', action: 'logs', resource: 'system' },
      { name: 'system.backup', display_name: 'Sauvegarde système', description: 'Effectuer des sauvegardes', module: 'system', action: 'backup', resource: 'system' },
      { name: 'system.maintenance', display_name: 'Maintenance système', description: 'Effectuer la maintenance système', module: 'system', action: 'maintenance', resource: 'system' },

      // Permissions rôles
      { name: 'roles.create', display_name: 'Créer des rôles', description: 'Créer de nouveaux rôles personnalisés', module: 'roles', action: 'create', resource: 'role' },
      { name: 'roles.read', display_name: 'Lire les rôles', description: 'Consulter les rôles', module: 'roles', action: 'read', resource: 'role' },
      { name: 'roles.update', display_name: 'Modifier les rôles', description: 'Modifier les rôles existants', module: 'roles', action: 'update', resource: 'role' },
      { name: 'roles.delete', display_name: 'Supprimer les rôles', description: 'Supprimer des rôles', module: 'roles', action: 'delete', resource: 'role' },
      { name: 'roles.assign_permissions', display_name: 'Attribuer des permissions', description: 'Attribuer des permissions aux rôles', module: 'roles', action: 'assign_permissions', resource: 'role' },

      // Permissions groupes
      { name: 'groups.create', display_name: 'Créer des groupes', description: 'Créer de nouveaux groupes d\'utilisateurs', module: 'groups', action: 'create', resource: 'group' },
      { name: 'groups.read', display_name: 'Lire les groupes', description: 'Consulter les groupes', module: 'groups', action: 'read', resource: 'group' },
      { name: 'groups.update', display_name: 'Modifier les groupes', description: 'Modifier les groupes existants', module: 'groups', action: 'update', resource: 'group' },
      { name: 'groups.delete', display_name: 'Supprimer les groupes', description: 'Supprimer des groupes', module: 'groups', action: 'delete', resource: 'group' },
      { name: 'groups.manage_members', display_name: 'Gérer les membres', description: 'Ajouter/retirer des membres de groupes', module: 'groups', action: 'manage_members', resource: 'group' }
    ];

    const { error: permissionsError } = await supabase
      .from('permissions')
      .upsert(permissions, { onConflict: 'name' });

    if (permissionsError) {
      console.log('❌ Erreur insertion permissions:', permissionsError.message);
    } else {
      console.log('✅ Permissions insérées');
    }

  } catch (error) {
    console.log('❌ Erreur insertion données:', error.message);
  }
}

async function verifyTables() {
  try {
    console.log('🔍 Vérification des tables...');
    
    const tables = ['custom_roles', 'permissions', 'role_permissions', 'user_groups', 'user_group_memberships', 'group_roles'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: OK`);
      }
    }

    // Compter les enregistrements
    const { data: rolesCount } = await supabase
      .from('custom_roles')
      .select('*', { count: 'exact', head: true });
    
    const { data: permissionsCount } = await supabase
      .from('permissions')
      .select('*', { count: 'exact', head: true });

    console.log(`\n📊 Résumé:`);
    console.log(`   Rôles: ${rolesCount?.length || 0}`);
    console.log(`   Permissions: ${permissionsCount?.length || 0}`);

  } catch (error) {
    console.log('❌ Erreur vérification:', error.message);
  }
}

// Exécution du script
executeRoleManagementSQL();
