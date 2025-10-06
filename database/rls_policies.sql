-- =====================================================
-- POLITIQUES RLS (ROW LEVEL SECURITY) - ECOSYSTIA
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 1. POLITIQUES POUR LA TABLE USERS
-- =====================================================

-- Super Administrateurs peuvent tout voir
CREATE POLICY "Super admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_administrator'
        )
    );

-- Administrateurs peuvent voir tous les utilisateurs sauf les super admins
CREATE POLICY "Admins can view non-super-admin users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('administrator', 'manager')
        ) AND role != 'super_administrator'
    );

-- Utilisateurs peuvent voir leur propre profil et les profils publics
CREATE POLICY "Users can view own profile and public profiles" ON public.users
    FOR SELECT USING (
        id = auth.uid() OR status = 'active'
    );

-- Super Administrateurs peuvent modifier tous les utilisateurs
CREATE POLICY "Super admins can update all users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_administrator'
        )
    );

-- Utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (id = auth.uid());

-- Super Administrateurs peuvent insérer des utilisateurs
CREATE POLICY "Super admins can insert users" ON public.users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_administrator'
        )
    );

-- =====================================================
-- 2. POLITIQUES POUR ROLE_PERMISSIONS
-- =====================================================

-- Seuls les super administrateurs peuvent gérer les permissions
CREATE POLICY "Only super admins can manage permissions" ON public.role_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_administrator'
        )
    );

-- =====================================================
-- 3. POLITIQUES POUR LES PROJETS
-- =====================================================

-- Super Administrateurs et Administrateurs peuvent voir tous les projets
CREATE POLICY "Admins can view all projects" ON public.projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('super_administrator', 'administrator')
        )
    );

-- Managers peuvent voir les projets dont ils sont membres ou créateurs
CREATE POLICY "Managers can view assigned projects" ON public.projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'manager'
        ) AND (
            created_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.project_team_members 
                WHERE project_id = id AND user_id = auth.uid()
            )
        )
    );

-- Utilisateurs peuvent voir les projets publics et ceux dont ils sont membres
CREATE POLICY "Users can view accessible projects" ON public.projects
    FOR SELECT USING (
        is_public = true OR
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.project_team_members 
            WHERE project_id = id AND user_id = auth.uid() AND is_active = true
        )
    );

-- Super Administrateurs peuvent créer/modifier/supprimer tous les projets
CREATE POLICY "Super admins can manage all projects" ON public.projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_administrator'
        )
    );

-- Managers et Administrateurs peuvent créer des projets
CREATE POLICY "Managers can create projects" ON public.projects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('administrator', 'manager', 'entrepreneur')
        )
    );

-- Créateurs et membres actifs peuvent modifier les projets
CREATE POLICY "Project members can update projects" ON public.projects
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('administrator', 'manager')
        ) OR
        EXISTS (
            SELECT 1 FROM public.project_team_members 
            WHERE project_id = id AND user_id = auth.uid() AND is_active = true
        )
    );

-- =====================================================
-- 4. POLITIQUES POUR LES TÂCHES
-- =====================================================

-- Utilisateurs peuvent voir les tâches des projets accessibles
CREATE POLICY "Users can view accessible tasks" ON public.tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id AND (
                is_public = true OR
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.project_team_members 
                    WHERE project_id = id AND user_id = auth.uid() AND is_active = true
                )
            )
        )
    );

-- Assignés et créateurs peuvent modifier les tâches
CREATE POLICY "Task assignees can update tasks" ON public.tasks
    FOR UPDATE USING (
        assignee_id = auth.uid() OR
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('administrator', 'manager', 'supervisor')
        )
    );

-- Managers et créateurs peuvent créer des tâches
CREATE POLICY "Managers can create tasks" ON public.tasks
    FOR INSERT WITH CHECK (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('administrator', 'manager', 'supervisor')
        )
    );

-- =====================================================
-- 5. POLITIQUES POUR LES COURS
-- =====================================================

-- Tous les utilisateurs peuvent voir les cours publiés
CREATE POLICY "Everyone can view published courses" ON public.courses
    FOR SELECT USING (is_published = true);

-- Formateurs et administrateurs peuvent voir tous les cours
CREATE POLICY "Trainers can view all courses" ON public.courses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('super_administrator', 'administrator', 'trainer', 'teacher')
        )
    );

-- Utilisateurs inscrits peuvent voir leurs cours
CREATE POLICY "Enrolled users can view their courses" ON public.courses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.course_enrollments 
            WHERE course_id = id AND user_id = auth.uid()
        )
    );

-- Formateurs et administrateurs peuvent gérer les cours
CREATE POLICY "Trainers can manage courses" ON public.courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('super_administrator', 'administrator', 'trainer', 'teacher')
        )
    );

-- =====================================================
-- 6. POLITIQUES POUR LES EMPLOIS
-- =====================================================

-- Tous les utilisateurs peuvent voir les emplois ouverts
CREATE POLICY "Everyone can view open jobs" ON public.jobs
    FOR SELECT USING (status = 'Open');

-- Employeurs peuvent voir leurs propres emplois
CREATE POLICY "Employers can view own jobs" ON public.jobs
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('employer', 'administrator')
        )
    );

-- Employeurs et administrateurs peuvent gérer les emplois
CREATE POLICY "Employers can manage jobs" ON public.jobs
    FOR ALL USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('employer', 'administrator', 'super_administrator')
        )
    );

-- =====================================================
-- 7. POLITIQUES POUR LES LOGS DE TEMPS
-- =====================================================

-- Utilisateurs peuvent voir leurs propres logs
CREATE POLICY "Users can view own time logs" ON public.time_logs
    FOR SELECT USING (user_id = auth.uid());

-- Managers peuvent voir les logs de leur équipe
CREATE POLICY "Managers can view team time logs" ON public.time_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('administrator', 'manager', 'supervisor')
        )
    );

-- Utilisateurs peuvent créer/modifier leurs propres logs
CREATE POLICY "Users can manage own time logs" ON public.time_logs
    FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- 8. POLITIQUES POUR LES CONGÉS
-- =====================================================

-- Utilisateurs peuvent voir leurs propres demandes
CREATE POLICY "Users can view own leave requests" ON public.leave_requests
    FOR SELECT USING (user_id = auth.uid());

-- Managers peuvent voir les demandes de leur équipe
CREATE POLICY "Managers can view team leave requests" ON public.leave_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('administrator', 'manager', 'supervisor')
        )
    );

-- Utilisateurs peuvent créer leurs propres demandes
CREATE POLICY "Users can create own leave requests" ON public.leave_requests
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Managers peuvent approuver/rejeter les demandes
CREATE POLICY "Managers can approve leave requests" ON public.leave_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('administrator', 'manager', 'supervisor')
        )
    );

-- =====================================================
-- 9. POLITIQUES POUR LES FACTURES
-- =====================================================

-- Administrateurs et créateurs peuvent voir les factures
CREATE POLICY "Admins can view invoices" ON public.invoices
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('super_administrator', 'administrator', 'manager')
        )
    );

-- Administrateurs et créateurs peuvent gérer les factures
CREATE POLICY "Admins can manage invoices" ON public.invoices
    FOR ALL USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('super_administrator', 'administrator', 'manager')
        )
    );

-- =====================================================
-- 10. POLITIQUES POUR LES CONTACTS CRM
-- =====================================================

-- Utilisateurs assignés et créateurs peuvent voir les contacts
CREATE POLICY "Assigned users can view contacts" ON public.contacts
    FOR SELECT USING (
        assigned_to = auth.uid() OR
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('super_administrator', 'administrator', 'manager')
        )
    );

-- Utilisateurs assignés peuvent gérer les contacts
CREATE POLICY "Assigned users can manage contacts" ON public.contacts
    FOR ALL USING (
        assigned_to = auth.uid() OR
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('super_administrator', 'administrator', 'manager')
        )
    );

-- =====================================================
-- 11. POLITIQUES POUR LES DOCUMENTS
-- =====================================================

-- Tous les utilisateurs peuvent voir les documents publics
CREATE POLICY "Everyone can view public documents" ON public.documents
    FOR SELECT USING (is_public = true);

-- Créateurs et administrateurs peuvent voir tous les documents
CREATE POLICY "Creators can view all documents" ON public.documents
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('super_administrator', 'administrator')
        )
    );

-- Créateurs et administrateurs peuvent gérer les documents
CREATE POLICY "Creators can manage documents" ON public.documents
    FOR ALL USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('super_administrator', 'administrator', 'editor')
        )
    );

-- =====================================================
-- 12. POLITIQUES POUR LES LOGS SYSTÈME
-- =====================================================

-- Seuls les super administrateurs peuvent voir les logs système
CREATE POLICY "Only super admins can view system logs" ON public.system_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_administrator'
        )
    );

-- Le système peut insérer des logs (pas d'authentification requise)
CREATE POLICY "System can insert logs" ON public.system_logs
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 13. POLITIQUES POUR LES NOTIFICATIONS
-- =====================================================

-- Utilisateurs peuvent voir leurs propres notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

-- Utilisateurs peuvent modifier leurs propres notifications
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Le système peut créer des notifications
CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 14. POLITIQUES POUR LES MEMBRES D'ÉQUIPE
-- =====================================================

-- Utilisateurs peuvent voir les équipes des projets accessibles
CREATE POLICY "Users can view accessible team members" ON public.project_team_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id AND (
                is_public = true OR
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.project_team_members ptm2
                    WHERE ptm2.project_id = project_id AND ptm2.user_id = auth.uid() AND ptm2.is_active = true
                )
            )
        )
    );

-- Managers et créateurs peuvent gérer les équipes
CREATE POLICY "Managers can manage team members" ON public.project_team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('super_administrator', 'administrator', 'manager')
        ) OR
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id AND created_by = auth.uid()
        )
    );

-- =====================================================
-- 15. FONCTIONS UTILITAIRES POUR LES POLITIQUES
-- =====================================================

-- Fonction pour vérifier si un utilisateur est super administrateur
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id AND role = 'super_administrator'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur est administrateur ou manager
CREATE OR REPLACE FUNCTION is_admin_or_manager(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id AND role IN ('super_administrator', 'administrator', 'manager')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur a accès à un projet
CREATE OR REPLACE FUNCTION has_project_access(project_id INTEGER, user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = project_id AND (
            is_public = true OR
            created_by = user_id OR
            EXISTS (
                SELECT 1 FROM public.project_team_members 
                WHERE project_id = project_id AND user_id = user_id AND is_active = true
            ) OR
            EXISTS (
                SELECT 1 FROM public.users 
                WHERE id = user_id AND role IN ('super_administrator', 'administrator')
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
