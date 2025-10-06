-- Script SQL pour créer la table projects dans Supabase
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Créer la table projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMPTZ,
    budget DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    client_name VARCHAR(255),
    team JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Créer un index sur les colonnes fréquemment utilisées
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date);

-- Activer RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
-- Les utilisateurs authentifiés peuvent voir tous les projets
CREATE POLICY "Les utilisateurs authentifiés peuvent voir tous les projets" ON projects
    FOR SELECT USING (auth.role() = 'authenticated');

-- Les utilisateurs authentifiés peuvent créer des projets
CREATE POLICY "Les utilisateurs authentifiés peuvent créer des projets" ON projects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Les utilisateurs authentifiés peuvent modifier les projets
CREATE POLICY "Les utilisateurs authentifiés peuvent modifier les projets" ON projects
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Les utilisateurs authentifiés peuvent supprimer les projets
CREATE POLICY "Les utilisateurs authentifiés peuvent supprimer les projets" ON projects
    FOR DELETE USING (auth.role() = 'authenticated');

-- Créer une fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insérer des données de test
INSERT INTO projects (title, description, status, priority, due_date, budget, currency, client_name, team, created_by) VALUES
('Site Web E-commerce', 'Développement d''un site e-commerce moderne avec panier et paiement', 'in_progress', 'high', '2024-02-15', 15000.00, 'EUR', 'TechCorp', '[{"id": 1, "name": "Jean Dupont", "role": "developer"}, {"id": 2, "name": "Marie Martin", "role": "designer"}]', auth.uid()),
('Application Mobile', 'Création d''une application mobile cross-platform', 'draft', 'medium', '2024-03-01', 25000.00, 'EUR', 'StartupXYZ', '[{"id": 3, "name": "Pierre Durand", "role": "developer"}]', auth.uid()),
('Refonte UI/UX', 'Amélioration de l''interface utilisateur existante', 'completed', 'low', '2024-01-30', 8000.00, 'EUR', 'DesignStudio', '[{"id": 4, "name": "Sophie Bernard", "role": "designer"}, {"id": 5, "name": "Lucas Petit", "role": "developer"}]', auth.uid())
ON CONFLICT (id) DO NOTHING;

-- Créer une vue pour les statistiques des projets
CREATE OR REPLACE VIEW project_stats AS
SELECT 
    status,
    COUNT(*) as count,
    AVG(budget) as avg_budget,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
FROM projects
GROUP BY status;

-- Donner les permissions sur la vue
GRANT SELECT ON project_stats TO authenticated;
GRANT SELECT ON project_stats TO anon;
