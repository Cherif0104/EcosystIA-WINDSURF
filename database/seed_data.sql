-- =====================================================
-- DONNÉES INITIALES (SEED DATA) - ECOSYSTIA
-- =====================================================

-- =====================================================
-- 1. INSERTION DES MODULES
-- =====================================================

INSERT INTO public.modules (id, name, description, icon, category, sort_order) VALUES
('dashboard', 'Dashboard', 'Vue d\'ensemble et KPIs', 'fas fa-tachometer-alt', 'workspace', 1),
('projects', 'Projets', 'Gestion de projets', 'fas fa-project-diagram', 'workspace', 2),
('goals', 'Objectifs (OKRs)', 'Objectifs et résultats clés', 'fas fa-bullseye', 'workspace', 3),
('courses', 'Cours', 'Formation et certification', 'fas fa-graduation-cap', 'development', 4),
('jobs', 'Emplois', 'Gestion des emplois', 'fas fa-briefcase', 'development', 5),
('time_tracking', 'Suivi Temps', 'Suivi du temps de travail', 'fas fa-clock', 'workspace', 6),
('leave_management', 'Congés', 'Gestion des congés', 'fas fa-calendar-times', 'workspace', 7),
('finance', 'Finance', 'Gestion financière', 'fas fa-chart-line', 'workspace', 8),
('crm_sales', 'CRM & Ventes', 'Relation client et ventes', 'fas fa-handshake', 'business', 9),
('knowledge_base', 'Base de Connaissances', 'Base de connaissances', 'fas fa-book', 'tools', 10),
('development', 'Développement', 'Développement et API', 'fas fa-code', 'tools', 11),
('tools', 'Outils', 'Outils intégrés', 'fas fa-tools', 'tools', 12),
('ai_coach', 'Coach IA', 'Assistant IA personnel', 'fas fa-robot', 'ai', 13),
('gen_ai_lab', 'Laboratoire IA', 'Expérimentation IA', 'fas fa-flask', 'ai', 14),
('analytics', 'Analytique', 'Analyses et rapports', 'fas fa-chart-bar', 'management', 15),
('user_management', 'Gestion Utilisateurs', 'Administration des utilisateurs', 'fas fa-users-cog', 'management', 16),
('settings', 'Paramètres', 'Configuration système', 'fas fa-cog', 'system', 17),
('super_admin', 'Super Admin', 'Administration système', 'fas fa-shield-alt', 'system', 18);

-- =====================================================
-- 2. PERMISSIONS PAR DÉFAUT PAR RÔLE
-- =====================================================

-- Super Administrateur - Accès total
INSERT INTO public.role_permissions (role, module_id, can_view, can_create, can_update, can_delete, can_manage)
SELECT 'super_administrator', id, true, true, true, true, true
FROM public.modules;

-- Administrateur - Presque tout sauf super_admin
INSERT INTO public.role_permissions (role, module_id, can_view, can_create, can_update, can_delete, can_manage)
SELECT 'administrator', id, 
    CASE WHEN id = 'super_admin' THEN false ELSE true END,
    CASE WHEN id = 'super_admin' THEN false ELSE true END,
    CASE WHEN id = 'super_admin' THEN false ELSE true END,
    CASE WHEN id = 'super_admin' THEN false ELSE true END,
    CASE WHEN id = 'super_admin' THEN false ELSE true END
FROM public.modules;

-- Manager - Gestion d'équipe et projets
INSERT INTO public.role_permissions (role, module_id, can_view, can_create, can_update, can_delete, can_manage) VALUES
('manager', 'dashboard', true, false, false, false, false),
('manager', 'projects', true, true, true, false, true),
('manager', 'goals', true, true, true, false, true),
('manager', 'courses', true, true, true, false, true),
('manager', 'jobs', true, true, true, false, true),
('manager', 'time_tracking', true, true, true, false, true),
('manager', 'leave_management', true, false, true, false, true),
('manager', 'finance', true, true, true, false, true),
('manager', 'crm_sales', true, true, true, false, true),
('manager', 'knowledge_base', true, true, true, false, true),
('manager', 'development', true, false, false, false, false),
('manager', 'tools', true, false, false, false, false),
('manager', 'ai_coach', true, false, false, false, false),
('manager', 'gen_ai_lab', true, false, false, false, false),
('manager', 'analytics', true, false, false, false, false),
('manager', 'user_management', false, false, false, false, false),
('manager', 'settings', true, false, true, false, false),
('manager', 'super_admin', false, false, false, false, false);

-- Superviseur - Supervision des projets
INSERT INTO public.role_permissions (role, module_id, can_view, can_create, can_update, can_delete, can_manage) VALUES
('supervisor', 'dashboard', true, false, false, false, false),
('supervisor', 'projects', true, true, true, false, true),
('supervisor', 'goals', true, true, true, false, true),
('supervisor', 'courses', true, true, true, false, true),
('supervisor', 'jobs', true, true, true, false, true),
('supervisor', 'time_tracking', true, true, true, false, true),
('supervisor', 'leave_management', true, false, true, false, true),
('supervisor', 'finance', true, true, true, false, true),
('supervisor', 'crm_sales', true, true, true, false, true),
('supervisor', 'knowledge_base', true, true, true, false, true),
('supervisor', 'development', true, false, false, false, false),
('supervisor', 'tools', true, false, false, false, false),
('supervisor', 'ai_coach', true, false, false, false, false),
('supervisor', 'gen_ai_lab', true, false, false, false, false),
('supervisor', 'analytics', true, false, false, false, false),
('supervisor', 'user_management', false, false, false, false, false),
('supervisor', 'settings', true, false, true, false, false),
('supervisor', 'super_admin', false, false, false, false, false);

-- Étudiant - Participation limitée
INSERT INTO public.role_permissions (role, module_id, can_view, can_create, can_update, can_delete, can_manage) VALUES
('student', 'dashboard', true, false, false, false, false),
('student', 'projects', true, false, false, false, false),
('student', 'goals', true, false, false, false, false),
('student', 'courses', true, false, false, false, false),
('student', 'jobs', true, false, false, false, false),
('student', 'time_tracking', true, true, true, false, false),
('student', 'leave_management', true, true, false, false, false),
('student', 'finance', false, false, false, false, false),
('student', 'crm_sales', false, false, false, false, false),
('student', 'knowledge_base', true, false, false, false, false),
('student', 'development', false, false, false, false, false),
('student', 'tools', true, false, false, false, false),
('student', 'ai_coach', true, false, false, false, false),
('student', 'gen_ai_lab', true, false, false, false, false),
('student', 'analytics', false, false, false, false, false),
('student', 'user_management', false, false, false, false, false),
('student', 'settings', true, false, true, false, false),
('student', 'super_admin', false, false, false, false, false);

-- Formateur/Enseignant - Gestion pédagogique
INSERT INTO public.role_permissions (role, module_id, can_view, can_create, can_update, can_delete, can_manage) VALUES
('trainer', 'dashboard', true, false, false, false, false),
('trainer', 'projects', true, true, true, false, false),
('trainer', 'goals', true, false, false, false, false),
('trainer', 'courses', true, true, true, false, true),
('trainer', 'jobs', true, false, false, false, false),
('trainer', 'time_tracking', true, true, true, false, false),
('trainer', 'leave_management', true, true, false, false, false),
('trainer', 'finance', false, false, false, false, false),
('trainer', 'crm_sales', false, false, false, false, false),
('trainer', 'knowledge_base', true, true, true, false, false),
('trainer', 'development', false, false, false, false, false),
('trainer', 'tools', true, false, false, false, false),
('trainer', 'ai_coach', true, false, false, false, false),
('trainer', 'gen_ai_lab', true, false, false, false, false),
('trainer', 'analytics', false, false, false, false, false),
('trainer', 'user_management', false, false, false, false, false),
('trainer', 'settings', true, false, true, false, false),
('trainer', 'super_admin', false, false, false, false, false);

-- Entrepreneur - Gestion de ses projets
INSERT INTO public.role_permissions (role, module_id, can_view, can_create, can_update, can_delete, can_manage) VALUES
('entrepreneur', 'dashboard', true, false, false, false, false),
('entrepreneur', 'projects', true, true, true, true, true),
('entrepreneur', 'goals', true, true, true, true, true),
('entrepreneur', 'courses', true, false, false, false, false),
('entrepreneur', 'jobs', true, true, true, true, true),
('entrepreneur', 'time_tracking', true, true, true, false, false),
('entrepreneur', 'leave_management', true, true, false, false, false),
('entrepreneur', 'finance', true, true, true, true, true),
('entrepreneur', 'crm_sales', true, true, true, true, true),
('entrepreneur', 'knowledge_base', true, true, true, false, false),
('entrepreneur', 'development', true, true, true, false, false),
('entrepreneur', 'tools', true, false, false, false, false),
('entrepreneur', 'ai_coach', true, false, false, false, false),
('entrepreneur', 'gen_ai_lab', true, false, false, false, false),
('entrepreneur', 'analytics', true, false, false, false, false),
('entrepreneur', 'user_management', false, false, false, false, false),
('entrepreneur', 'settings', true, false, true, false, false),
('entrepreneur', 'super_admin', false, false, false, false, false);

-- Employeur - Gestion des emplois
INSERT INTO public.role_permissions (role, module_id, can_view, can_create, can_update, can_delete, can_manage) VALUES
('employer', 'dashboard', true, false, false, false, false),
('employer', 'projects', true, true, true, true, true),
('employer', 'goals', true, false, false, false, false),
('employer', 'courses', true, false, false, false, false),
('employer', 'jobs', true, true, true, true, true),
('employer', 'time_tracking', true, true, true, false, false),
('employer', 'leave_management', true, false, true, false, false),
('employer', 'finance', true, true, true, true, true),
('employer', 'crm_sales', true, true, true, true, true),
('employer', 'knowledge_base', true, false, false, false, false),
('employer', 'development', false, false, false, false, false),
('employer', 'tools', true, false, false, false, false),
('employer', 'ai_coach', true, false, false, false, false),
('employer', 'gen_ai_lab', true, false, false, false, false),
('employer', 'analytics', true, false, false, false, false),
('employer', 'user_management', false, false, false, false, false),
('employer', 'settings', true, false, true, false, false),
('employer', 'super_admin', false, false, false, false, false);

-- Financeur - Consultation des projets financés
INSERT INTO public.role_permissions (role, module_id, can_view, can_create, can_update, can_delete, can_manage) VALUES
('funder', 'dashboard', true, false, false, false, false),
('funder', 'projects', true, false, false, false, false),
('funder', 'goals', true, false, false, false, false),
('funder', 'courses', false, false, false, false, false),
('funder', 'jobs', false, false, false, false, false),
('funder', 'time_tracking', false, false, false, false, false),
('funder', 'leave_management', false, false, false, false, false),
('funder', 'finance', true, false, false, false, false),
('funder', 'crm_sales', true, false, false, false, false),
('funder', 'knowledge_base', true, false, false, false, false),
('funder', 'development', false, false, false, false, false),
('funder', 'tools', false, false, false, false, false),
('funder', 'ai_coach', false, false, false, false, false),
('funder', 'gen_ai_lab', false, false, false, false, false),
('funder', 'analytics', true, false, false, false, false),
('funder', 'user_management', false, false, false, false, false),
('funder', 'settings', true, false, true, false, false),
('funder', 'super_admin', false, false, false, false, false);

-- Mentor/Coach - Accompagnement
INSERT INTO public.role_permissions (role, module_id, can_view, can_create, can_update, can_delete, can_manage) VALUES
('mentor', 'dashboard', true, false, false, false, false),
('mentor', 'projects', true, false, false, false, false),
('mentor', 'goals', true, false, false, false, false),
('mentor', 'courses', true, false, false, false, false),
('mentor', 'jobs', true, false, false, false, false),
('mentor', 'time_tracking', false, false, false, false, false),
('mentor', 'leave_management', false, false, false, false, false),
('mentor', 'finance', false, false, false, false, false),
('mentor', 'crm_sales', false, false, false, false, false),
('mentor', 'knowledge_base', true, true, true, false, false),
('mentor', 'development', false, false, false, false, false),
('mentor', 'tools', false, false, false, false, false),
('mentor', 'ai_coach', true, false, false, false, false),
('mentor', 'gen_ai_lab', true, false, false, false, false),
('mentor', 'analytics', false, false, false, false, false),
('mentor', 'user_management', false, false, false, false, false),
('mentor', 'settings', true, false, true, false, false),
('mentor', 'super_admin', false, false, false, false, false);

-- Stagiaire - Participation limitée
INSERT INTO public.role_permissions (role, module_id, can_view, can_create, can_update, can_delete, can_manage) VALUES
('intern', 'dashboard', true, false, false, false, false),
('intern', 'projects', true, false, false, false, false),
('intern', 'goals', true, false, false, false, false),
('intern', 'courses', true, false, false, false, false),
('intern', 'jobs', true, false, false, false, false),
('intern', 'time_tracking', true, true, true, false, false),
('intern', 'leave_management', true, true, false, false, false),
('intern', 'finance', false, false, false, false, false),
('intern', 'crm_sales', false, false, false, false, false),
('intern', 'knowledge_base', true, false, false, false, false),
('intern', 'development', false, false, false, false, false),
('intern', 'tools', true, false, false, false, false),
('intern', 'ai_coach', true, false, false, false, false),
('intern', 'gen_ai_lab', true, false, false, false, false),
('intern', 'analytics', false, false, false, false, false),
('intern', 'user_management', false, false, false, false, false),
('intern', 'settings', true, false, true, false, false),
('intern', 'super_admin', false, false, false, false, false);

-- Alumni - Consultation des projets publics
INSERT INTO public.role_permissions (role, module_id, can_view, can_create, can_update, can_delete, can_manage) VALUES
('alumni', 'dashboard', true, false, false, false, false),
('alumni', 'projects', true, false, false, false, false),
('alumni', 'goals', true, false, false, false, false),
('alumni', 'courses', true, false, false, false, false),
('alumni', 'jobs', true, false, false, false, false),
('alumni', 'time_tracking', false, false, false, false, false),
('alumni', 'leave_management', false, false, false, false, false),
('alumni', 'finance', false, false, false, false, false),
('alumni', 'crm_sales', false, false, false, false, false),
('alumni', 'knowledge_base', true, false, false, false, false),
('alumni', 'development', false, false, false, false, false),
('alumni', 'tools', false, false, false, false, false),
('alumni', 'ai_coach', false, false, false, false, false),
('alumni', 'gen_ai_lab', false, false, false, false, false),
('alumni', 'analytics', false, false, false, false, false),
('alumni', 'user_management', false, false, false, false, false),
('alumni', 'settings', true, false, true, false, false),
('alumni', 'super_admin', false, false, false, false, false);

-- =====================================================
-- 3. UTILISATEURS DE TEST
-- =====================================================

-- Note: Les utilisateurs réels seront créés via l'authentification Supabase
-- Ici on insère seulement les profils publics pour les tests

-- =====================================================
-- 4. PROJETS DE DÉMONSTRATION
-- =====================================================

INSERT INTO public.projects (title, description, status, priority, due_date, client_name, is_public, tags) VALUES
('Plateforme EcosystIA', 'Développement de la plateforme de gestion intelligente pour SENEGEL', 'In Progress', 'High', '2024-03-31', 'SENEGEL', true, ARRAY['Développement', 'Plateforme', 'SENEGEL']),
('Formation Entrepreneuriat', 'Programme de formation pour jeunes entrepreneurs', 'Not Started', 'Medium', '2024-04-15', 'SENEGEL', true, ARRAY['Formation', 'Entrepreneuriat', 'Jeunes']),
('Mission Commerciale USA', 'Organisation de mission commerciale aux États-Unis', 'In Progress', 'High', '2024-03-20', 'SENEGEL', false, ARRAY['Commercial', 'International', 'USA']),
('Coopérative Habitat', 'Projet de 1000 parcelles à Khinine, Keur Moussa', 'In Progress', 'Critical', '2024-06-30', 'SENEGEL', true, ARRAY['Immobilier', 'Coopérative', 'Khinine']);

-- =====================================================
-- 5. COURS DE DÉMONSTRATION
-- =====================================================

INSERT INTO public.courses (title, description, instructor, duration_hours, level, category, is_published, tags) VALUES
('Leadership et Management', 'Formation complète en leadership et gestion d\'équipe', 'Pape Samb', 40, 'Advanced', 'Management', true, ARRAY['Leadership', 'Management', 'Équipe']),
('Développement Web', 'Apprentissage du développement web moderne', 'Amadou Dia LY', 60, 'Intermediate', 'Technologie', true, ARRAY['Web', 'Développement', 'JavaScript']),
('Entrepreneuriat Social', 'Comment créer une entreprise à impact social', 'Mariame GUINDO', 30, 'Beginner', 'Entrepreneuriat', true, ARRAY['Entrepreneuriat', 'Social', 'Impact']),
('Gestion Financière', 'Gestion financière pour PME et startups', 'Adama Mandaw SENE', 25, 'Intermediate', 'Finance', true, ARRAY['Finance', 'PME', 'Gestion']);

-- =====================================================
-- 6. EMPLOIS DE DÉMONSTRATION
-- =====================================================

INSERT INTO public.jobs (title, company, description, job_type, status, location, salary_min, salary_max, experience_level, skills_required, is_featured) VALUES
('Développeur Full Stack', 'SENEGEL', 'Recherche développeur full stack pour la plateforme EcosystIA', 'Full-time', 'Open', 'Dakar, Sénégal', 500000, 800000, 'Mid', ARRAY['React', 'Node.js', 'TypeScript', 'Supabase'], true),
('Formateur en Leadership', 'SENEGEL', 'Formateur expérimenté en leadership et management', 'Contract', 'Open', 'Dakar, Sénégal', 300000, 500000, 'Senior', ARRAY['Leadership', 'Formation', 'Management'], false),
('Chargé de Projet', 'SENEGEL', 'Gestion de projets internationaux et partenariats', 'Full-time', 'Open', 'Dakar, Sénégal', 400000, 600000, 'Mid', ARRAY['Gestion Projet', 'International', 'Partenariats'], false),
('Analyste Financier', 'SENEGEL', 'Analyse financière et reporting pour les projets', 'Full-time', 'Open', 'Dakar, Sénégal', 350000, 550000, 'Entry', ARRAY['Finance', 'Analyse', 'Reporting'], false);

-- =====================================================
-- 7. DOCUMENTS DE BASE DE CONNAISSANCES
-- =====================================================

INSERT INTO public.documents (title, content, document_type, category, tags, is_public, is_featured) VALUES
('Guide d\'utilisation EcosystIA', 'Guide complet pour utiliser la plateforme EcosystIA', 'Guide', 'Utilisation', ARRAY['Guide', 'Utilisation', 'EcosystIA'], true, true),
('Politique de Confidentialité', 'Politique de confidentialité et protection des données', 'Policy', 'Légal', ARRAY['Confidentialité', 'Données', 'Politique'], true, false),
('FAQ EcosystIA', 'Questions fréquemment posées sur la plateforme', 'FAQ', 'Support', ARRAY['FAQ', 'Support', 'Questions'], true, false),
('Template de Projet', 'Modèle standard pour la création de projets', 'Template', 'Projets', ARRAY['Template', 'Projet', 'Modèle'], true, false);

-- =====================================================
-- 8. CONTACTS CRM DE DÉMONSTRATION
-- =====================================================

INSERT INTO public.contacts (name, email, phone, company, position, contact_type, source, tags) VALUES
('Pape Samb', 'pape@senegel.org', '+221 77 853 33 99', 'SENEGEL', 'CEO', 'Customer', 'Direct', ARRAY['CEO', 'SENEGEL', 'Principal']),
('Amadou Dia LY', 'amadou@senegel.org', '+221 77 123 45 67', 'SENEGEL', 'Co-Founder', 'Customer', 'Direct', ARRAY['Co-Founder', 'SENEGEL', 'Direction']),
('Mariame GUINDO', 'mariame@senegel.org', '+221 77 234 56 78', 'SENEGEL', 'Directrice Formation', 'Customer', 'Direct', ARRAY['Formation', 'SENEGEL', 'Direction']),
('Adama Mandaw SENE', 'adama@senegel.org', '+221 77 345 67 89', 'SENEGEL', 'Responsable Projets', 'Customer', 'Direct', ARRAY['Projets', 'SENEGEL', 'Gestion']);

-- =====================================================
-- 9. NOTIFICATIONS SYSTÈME
-- =====================================================

-- Note: Les notifications seront créées dynamiquement par l'application

-- =====================================================
-- 10. LOGS SYSTÈME INITIAUX
-- =====================================================

INSERT INTO public.system_logs (module, action, details, severity) VALUES
('System', 'Database Initialized', 'Base de données EcosystIA initialisée avec succès', 'info'),
('System', 'Seed Data Inserted', 'Données initiales insérées dans toutes les tables', 'info'),
('System', 'RLS Policies Applied', 'Politiques RLS appliquées à toutes les tables', 'info'),
('System', 'Modules Configured', '18 modules configurés avec permissions par rôle', 'info');

-- =====================================================
-- 11. INDEXES SUPPLÉMENTAIRES POUR PERFORMANCE
-- =====================================================

-- Index sur les permissions pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_module ON public.role_permissions(role, module_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role);

-- Index sur les projets pour les filtres courants
CREATE INDEX IF NOT EXISTS idx_projects_status_public ON public.projects(status, is_public);
CREATE INDEX IF NOT EXISTS idx_projects_created_by_status ON public.projects(created_by, status);

-- Index sur les cours pour les recherches
CREATE INDEX IF NOT EXISTS idx_courses_published_category ON public.courses(is_published, category);
CREATE INDEX IF NOT EXISTS idx_courses_level_category ON public.courses(level, category);

-- Index sur les emplois pour les filtres
CREATE INDEX IF NOT EXISTS idx_jobs_status_type ON public.jobs(status, job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_location_remote ON public.jobs(location, remote_allowed);

-- Index sur les documents pour la recherche
CREATE INDEX IF NOT EXISTS idx_documents_public_type ON public.documents(is_public, document_type);
CREATE INDEX IF NOT EXISTS idx_documents_category_featured ON public.documents(category, is_featured);

-- Index sur les contacts CRM
CREATE INDEX IF NOT EXISTS idx_contacts_type_status ON public.contacts(contact_type, status);
CREATE INDEX IF NOT EXISTS idx_contacts_assigned_to ON public.contacts(assigned_to);

-- =====================================================
-- 12. FONCTIONS UTILITAIRES POUR L'APPLICATION
-- =====================================================

-- Fonction pour obtenir les permissions d'un utilisateur pour un module
CREATE OR REPLACE FUNCTION get_user_module_permissions(user_id UUID, module_id TEXT)
RETURNS TABLE(can_view BOOLEAN, can_create BOOLEAN, can_update BOOLEAN, can_delete BOOLEAN, can_manage BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT rp.can_view, rp.can_create, rp.can_update, rp.can_delete, rp.can_manage
    FROM public.role_permissions rp
    JOIN public.users u ON u.role = rp.role
    WHERE u.id = user_id AND rp.module_id = module_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir tous les modules accessibles par un utilisateur
CREATE OR REPLACE FUNCTION get_user_accessible_modules(user_id UUID)
RETURNS TABLE(module_id TEXT, module_name TEXT, can_view BOOLEAN, can_create BOOLEAN, can_update BOOLEAN, can_delete BOOLEAN, can_manage BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.name, rp.can_view, rp.can_create, rp.can_update, rp.can_delete, rp.can_manage
    FROM public.modules m
    JOIN public.role_permissions rp ON rp.module_id = m.id
    JOIN public.users u ON u.role = rp.role
    WHERE u.id = user_id AND rp.can_view = true
    ORDER BY m.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour logger les actions système
CREATE OR REPLACE FUNCTION log_system_action(
    p_user_id UUID DEFAULT NULL,
    p_module TEXT,
    p_action TEXT,
    p_details TEXT DEFAULT NULL,
    p_severity TEXT DEFAULT 'info'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
    user_email TEXT;
    user_role user_role;
BEGIN
    -- Récupérer les infos utilisateur si fourni
    IF p_user_id IS NOT NULL THEN
        SELECT email, role INTO user_email, user_role
        FROM public.users
        WHERE id = p_user_id;
    END IF;
    
    -- Insérer le log
    INSERT INTO public.system_logs (user_id, user_email, user_role, module, action, details, severity)
    VALUES (p_user_id, user_email, user_role, p_module::log_module, p_action, p_details, p_severity::log_severity)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 13. COMMENTAIRES FINAUX
-- =====================================================

COMMENT ON FUNCTION get_user_module_permissions IS 'Retourne les permissions d''un utilisateur pour un module spécifique';
COMMENT ON FUNCTION get_user_accessible_modules IS 'Retourne tous les modules accessibles par un utilisateur avec leurs permissions';
COMMENT ON FUNCTION log_system_action IS 'Fonction utilitaire pour logger les actions système avec contexte utilisateur';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Base de données EcosystIA initialisée avec succès !';
    RAISE NOTICE 'Tables créées: %, Modules configurés: %, Rôles: %', 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'),
        (SELECT COUNT(*) FROM public.modules),
        (SELECT COUNT(DISTINCT role) FROM public.role_permissions);
END $$;
