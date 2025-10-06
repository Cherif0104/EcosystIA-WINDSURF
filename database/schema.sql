-- =====================================================
-- SCHEMA BASE DE DONNÉES ECOSYSTIA - SUPABASE
-- =====================================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABLES DE BASE - UTILISATEURS ET RÔLES
-- =====================================================

-- Table des rôles (enum personnalisé)
CREATE TYPE user_role AS ENUM (
    'super_administrator',
    'administrator', 
    'manager',
    'supervisor',
    'student',
    'trainer',
    'teacher',
    'entrepreneur',
    'employer',
    'funder',
    'mentor',
    'coach',
    'facilitator',
    'publisher',
    'producer',
    'artist',
    'editor',
    'implementer',
    'intern',
    'alumni'
);

-- Table des utilisateurs (extension de auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    role user_role NOT NULL DEFAULT 'student',
    skills TEXT[] DEFAULT '{}',
    phone TEXT,
    location TEXT,
    bio TEXT,
    website TEXT,
    linkedin TEXT,
    twitter TEXT,
    github TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    last_login TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    preferred_language TEXT DEFAULT 'fr',
    timezone TEXT DEFAULT 'Africa/Dakar',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. SYSTÈME DE PERMISSIONS
-- =====================================================

-- Table des modules
CREATE TABLE public.modules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des permissions par rôle et module
CREATE TABLE public.role_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    role user_role NOT NULL,
    module_id TEXT REFERENCES public.modules(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT FALSE,
    can_create BOOLEAN DEFAULT FALSE,
    can_update BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    can_manage BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role, module_id)
);

-- =====================================================
-- 3. MODULE PROJETS
-- =====================================================

-- Table des projets
CREATE TYPE project_status AS ENUM ('Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled');
CREATE TYPE project_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');

CREATE TABLE public.projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status project_status DEFAULT 'Not Started',
    priority project_priority DEFAULT 'Medium',
    due_date DATE,
    start_date DATE,
    completed_date DATE,
    budget DECIMAL(12,2),
    currency TEXT DEFAULT 'XOF',
    client_name TEXT,
    client_email TEXT,
    client_phone TEXT,
    location TEXT,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    is_template BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des membres d'équipe de projet
CREATE TABLE public.project_team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id INTEGER REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- member, lead, coordinator
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(project_id, user_id)
);

-- Table des tâches
CREATE TYPE task_status AS ENUM ('To Do', 'In Progress', 'Done', 'Cancelled');
CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');

CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id INTEGER REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status task_status DEFAULT 'To Do',
    priority task_priority DEFAULT 'Medium',
    assignee_id UUID REFERENCES public.users(id),
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2) DEFAULT 0,
    due_date DATE,
    completed_date TIMESTAMPTZ,
    tags TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des risques
CREATE TYPE risk_level AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE risk_status AS ENUM ('Identified', 'Assessed', 'Mitigated', 'Resolved', 'Accepted');

CREATE TABLE public.project_risks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id INTEGER REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    probability risk_level NOT NULL,
    impact risk_level NOT NULL,
    status risk_status DEFAULT 'Identified',
    mitigation_plan TEXT,
    owner_id UUID REFERENCES public.users(id),
    identified_by UUID REFERENCES public.users(id),
    identified_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. MODULE COURS
-- =====================================================

-- Table des cours
CREATE TABLE public.courses (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    instructor TEXT,
    duration_hours INTEGER,
    level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    prerequisites TEXT,
    learning_objectives TEXT,
    resources TEXT[], -- URLs ou fichiers
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    max_students INTEGER,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'XOF',
    thumbnail_url TEXT,
    video_url TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des inscriptions aux cours
CREATE TYPE enrollment_status AS ENUM ('enrolled', 'completed', 'dropped', 'suspended');

CREATE TABLE public.course_enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id INTEGER REFERENCES public.courses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status enrollment_status DEFAULT 'enrolled',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    certificate_url TEXT,
    UNIQUE(course_id, user_id)
);

-- =====================================================
-- 5. MODULE EMPLOIS
-- =====================================================

-- Table des emplois
CREATE TYPE job_type AS ENUM ('Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance');
CREATE TYPE job_status AS ENUM ('Open', 'Closed', 'Paused', 'Draft');

CREATE TABLE public.jobs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    benefits TEXT,
    job_type job_type NOT NULL,
    status job_status DEFAULT 'Open',
    location TEXT,
    remote_allowed BOOLEAN DEFAULT FALSE,
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    currency TEXT DEFAULT 'XOF',
    experience_level TEXT CHECK (experience_level IN ('Entry', 'Mid', 'Senior', 'Executive')),
    education_level TEXT,
    skills_required TEXT[] DEFAULT '{}',
    application_deadline DATE,
    start_date DATE,
    contact_email TEXT,
    contact_phone TEXT,
    external_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des candidatures
CREATE TYPE application_status AS ENUM ('Applied', 'Under Review', 'Interview', 'Accepted', 'Rejected', 'Withdrawn');

CREATE TABLE public.job_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id INTEGER REFERENCES public.jobs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status application_status DEFAULT 'Applied',
    cover_letter TEXT,
    resume_url TEXT,
    portfolio_url TEXT,
    expected_salary DECIMAL(10,2),
    available_from DATE,
    notes TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, user_id)
);

-- =====================================================
-- 6. MODULE SUIVI DU TEMPS
-- =====================================================

-- Table des logs de temps
CREATE TABLE public.time_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES public.projects(id),
    task_id UUID REFERENCES public.tasks(id),
    course_id INTEGER REFERENCES public.courses(id),
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration DECIMAL(5,2) NOT NULL, -- en heures
    description TEXT,
    billable BOOLEAN DEFAULT FALSE,
    hourly_rate DECIMAL(10,2),
    currency TEXT DEFAULT 'XOF',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. MODULE CONGÉS
-- =====================================================

-- Table des demandes de congés
CREATE TYPE leave_type AS ENUM ('Annual', 'Sick', 'Personal', 'Maternity', 'Paternity', 'Study', 'Unpaid');
CREATE TYPE leave_status AS ENUM ('Pending', 'Approved', 'Rejected', 'Cancelled');

CREATE TABLE public.leave_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    leave_type leave_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INTEGER NOT NULL,
    reason TEXT,
    status leave_status DEFAULT 'Pending',
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. MODULE FINANCE
-- =====================================================

-- Table des factures
CREATE TYPE invoice_status AS ENUM ('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled');

CREATE TABLE public.invoices (
    id SERIAL PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_address TEXT,
    project_id INTEGER REFERENCES public.projects(id),
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'XOF',
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    status invoice_status DEFAULT 'Draft',
    due_date DATE NOT NULL,
    sent_date DATE,
    paid_date DATE,
    payment_method TEXT,
    notes TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des dépenses
CREATE TABLE public.expenses (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'XOF',
    date DATE NOT NULL,
    due_date DATE,
    status TEXT DEFAULT 'Unpaid' CHECK (status IN ('Paid', 'Unpaid', 'Overdue')),
    vendor TEXT,
    project_id INTEGER REFERENCES public.projects(id),
    budget_item_id UUID,
    receipt_url TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. MODULE CRM & VENTES
-- =====================================================

-- Table des contacts
CREATE TYPE contact_type AS ENUM ('Lead', 'Prospect', 'Customer', 'Partner', 'Vendor');

CREATE TABLE public.contacts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    position TEXT,
    contact_type contact_type DEFAULT 'Lead',
    source TEXT, -- Comment ils nous ont contactés
    status TEXT DEFAULT 'Active',
    tags TEXT[] DEFAULT '{}',
    address TEXT,
    notes TEXT,
    last_contact_date DATE,
    next_follow_up DATE,
    assigned_to UUID REFERENCES public.users(id),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. MODULE BASE DE CONNAISSANCES
-- =====================================================

-- Table des documents
CREATE TYPE document_type AS ENUM ('Article', 'Tutorial', 'FAQ', 'Guide', 'Template', 'Policy');

CREATE TABLE public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    document_type document_type NOT NULL,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    file_url TEXT,
    file_type TEXT,
    file_size INTEGER,
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. MODULE SYSTÈME
-- =====================================================

-- Table des logs système
CREATE TYPE log_severity AS ENUM ('info', 'warning', 'error', 'critical');
CREATE TYPE log_module AS ENUM ('Auth', 'Projects', 'Courses', 'Jobs', 'Finance', 'CRM', 'System');

CREATE TABLE public.system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    user_email TEXT,
    user_role user_role,
    module log_module NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    severity log_severity DEFAULT 'info',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des notifications
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
CREATE TYPE notification_status AS ENUM ('unread', 'read', 'archived');

CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    status notification_status DEFAULT 'unread',
    data JSONB, -- Données supplémentaires
    action_url TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- =====================================================
-- 12. INDEXES POUR PERFORMANCE
-- =====================================================

-- Index sur les utilisateurs
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_users_email ON public.users(email);

-- Index sur les projets
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_created_by ON public.projects(created_by);
CREATE INDEX idx_projects_due_date ON public.projects(due_date);

-- Index sur les tâches
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);

-- Index sur les logs de temps
CREATE INDEX idx_time_logs_user_id ON public.time_logs(user_id);
CREATE INDEX idx_time_logs_date ON public.time_logs(date);
CREATE INDEX idx_time_logs_project_id ON public.time_logs(project_id);

-- Index sur les logs système
CREATE INDEX idx_system_logs_user_id ON public.system_logs(user_id);
CREATE INDEX idx_system_logs_module ON public.system_logs(module);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at);

-- =====================================================
-- 13. TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 14. COMMENTAIRES SUR LES TABLES
-- =====================================================

COMMENT ON TABLE public.users IS 'Utilisateurs de la plateforme EcosystIA';
COMMENT ON TABLE public.role_permissions IS 'Permissions granulaires par rôle et module';
COMMENT ON TABLE public.projects IS 'Projets gérés dans la plateforme';
COMMENT ON TABLE public.tasks IS 'Tâches des projets';
COMMENT ON TABLE public.courses IS 'Cours de formation';
COMMENT ON TABLE public.jobs IS 'Offres d\'emploi';
COMMENT ON TABLE public.time_logs IS 'Suivi du temps de travail';
COMMENT ON TABLE public.leave_requests IS 'Demandes de congés';
COMMENT ON TABLE public.invoices IS 'Factures clients';
COMMENT ON TABLE public.expenses IS 'Dépenses de l\'organisation';
COMMENT ON TABLE public.contacts IS 'Contacts CRM';
COMMENT ON TABLE public.documents IS 'Base de connaissances';
COMMENT ON TABLE public.system_logs IS 'Logs système pour audit';
COMMENT ON TABLE public.notifications IS 'Notifications utilisateurs';
