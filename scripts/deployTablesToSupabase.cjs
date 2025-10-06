const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

console.log('🚀 DÉPLOIEMENT DES TABLES MANQUANTES VERS SUPABASE');
console.log('==================================================');

const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deployTables() {
  try {
    console.log('📖 Lecture du script SQL...');
    const sqlScript = fs.readFileSync('scripts/createMissingTables.sql', 'utf8');
    
    console.log('📡 Exécution du script SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlScript });
    
    if (error) {
      console.error('❌ Erreur lors de l\'exécution du script:', error);
      return false;
    }
    
    console.log('✅ Script SQL exécuté avec succès');
    
    // Vérifier que les tables ont été créées
    console.log('\n🔍 Vérification des tables créées...');
    
    const tables = ['contacts', 'invoices', 'expenses', 'objectives', 'documents', 'time_logs', 'leave_requests', 'notifications', 'system_logs'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: Créée et accessible`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    return false;
  }
}

// Note: Cette fonction nécessite une fonction RPC personnalisée dans Supabase
// Pour l'instant, nous allons utiliser une approche alternative
async function createTablesManually() {
  console.log('📝 Création manuelle des tables...');
  
  const tables = [
    {
      name: 'contacts',
      sql: `
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
      `
    },
    {
      name: 'invoices',
      sql: `
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
      `
    },
    {
      name: 'expenses',
      sql: `
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
      `
    },
    {
      name: 'objectives',
      sql: `
        CREATE TABLE IF NOT EXISTS objectives (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          project_id INTEGER,
          key_results JSONB,
          status VARCHAR(50) DEFAULT 'Not Started',
          progress INTEGER DEFAULT 0,
          due_date DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_by UUID REFERENCES auth.users(id)
        );
      `
    },
    {
      name: 'documents',
      sql: `
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
      `
    }
  ];
  
  for (const table of tables) {
    try {
      console.log(`📋 Création de la table ${table.name}...`);
      
      // Note: Supabase ne permet pas l'exécution directe de SQL via l'API client
      // Il faut utiliser l'éditeur SQL du dashboard
      console.log(`⚠️  Table ${table.name}: Doit être créée manuellement dans l'éditeur SQL`);
      console.log(`   SQL: ${table.sql.trim()}`);
    } catch (error) {
      console.error(`❌ Erreur pour la table ${table.name}:`, error.message);
    }
  }
  
  console.log('\n📋 INSTRUCTIONS POUR CRÉER LES TABLES:');
  console.log('=====================================');
  console.log('1. Ouvrez votre dashboard Supabase');
  console.log('2. Allez dans l\'onglet "SQL Editor"');
  console.log('3. Copiez le contenu du fichier scripts/createMissingTables.sql');
  console.log('4. Collez-le dans l\'éditeur et cliquez sur "Run"');
  console.log('5. Vérifiez que toutes les tables ont été créées');
  
  return true;
}

createTablesManually().then(success => {
  if (success) {
    console.log('\n🎉 Instructions de déploiement générées !');
  } else {
    console.log('\n💥 Erreur lors de la génération des instructions !');
  }
});
