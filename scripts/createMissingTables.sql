-- Script pour créer les tables manquantes dans Supabase
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Table contacts (CRM)
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    company VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Lead',
    source VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table invoices (Finance)
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft',
    due_date DATE,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table expenses (Finance)
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    date DATE NOT NULL,
    receipt_url TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table objectives (Goals)
CREATE TABLE IF NOT EXISTS objectives (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_id INTEGER REFERENCES projects(id),
    key_results JSONB,
    status VARCHAR(50) DEFAULT 'Not Started',
    progress INTEGER DEFAULT 0,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table documents (KnowledgeBase)
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table time_logs (Time Tracking)
CREATE TABLE IF NOT EXISTS time_logs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    user_id UUID REFERENCES auth.users(id),
    description TEXT,
    hours DECIMAL(4,2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table leave_requests (Leave Management)
CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table system_logs
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(255) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur toutes les tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS basiques
-- Politique pour contacts
CREATE POLICY "Users can view their own contacts" ON contacts
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own contacts" ON contacts
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own contacts" ON contacts
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own contacts" ON contacts
    FOR DELETE USING (auth.uid() = created_by);

-- Politique pour invoices
CREATE POLICY "Users can view their own invoices" ON invoices
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own invoices" ON invoices
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own invoices" ON invoices
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own invoices" ON invoices
    FOR DELETE USING (auth.uid() = created_by);

-- Politique pour expenses
CREATE POLICY "Users can view their own expenses" ON expenses
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own expenses" ON expenses
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own expenses" ON expenses
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own expenses" ON expenses
    FOR DELETE USING (auth.uid() = created_by);

-- Politique pour objectives
CREATE POLICY "Users can view their own objectives" ON objectives
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own objectives" ON objectives
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own objectives" ON objectives
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own objectives" ON objectives
    FOR DELETE USING (auth.uid() = created_by);

-- Politique pour documents
CREATE POLICY "Users can view their own documents" ON documents
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own documents" ON documents
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own documents" ON documents
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own documents" ON documents
    FOR DELETE USING (auth.uid() = created_by);

-- Politique pour time_logs
CREATE POLICY "Users can view their own time logs" ON time_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time logs" ON time_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time logs" ON time_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time logs" ON time_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Politique pour leave_requests
CREATE POLICY "Users can view their own leave requests" ON leave_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leave requests" ON leave_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leave requests" ON leave_requests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leave requests" ON leave_requests
    FOR DELETE USING (auth.uid() = user_id);

-- Politique pour notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour system_logs
CREATE POLICY "Users can view their own system logs" ON system_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own system logs" ON system_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON contacts(created_by);
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_objectives_created_by ON objectives(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
CREATE INDEX IF NOT EXISTS idx_time_logs_user_id ON time_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);

-- Créer des triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_objectives_updated_at BEFORE UPDATE ON objectives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_logs_updated_at BEFORE UPDATE ON time_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer des données de test
INSERT INTO contacts (name, email, company, status, created_by) VALUES
('Jean Dupont', 'jean.dupont@example.com', 'Acme Corp', 'Lead', (SELECT id FROM auth.users LIMIT 1)),
('Marie Martin', 'marie.martin@example.com', 'Tech Solutions', 'Prospect', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;

INSERT INTO invoices (invoice_number, client_name, amount, status, created_by) VALUES
('INV-001', 'Acme Corp', 1500.00, 'Paid', (SELECT id FROM auth.users LIMIT 1)),
('INV-002', 'Tech Solutions', 2300.50, 'Pending', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;

INSERT INTO expenses (description, amount, category, date, created_by) VALUES
('Matériel de bureau', 150.00, 'Office', CURRENT_DATE, (SELECT id FROM auth.users LIMIT 1)),
('Formation', 500.00, 'Training', CURRENT_DATE, (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;

COMMIT;
