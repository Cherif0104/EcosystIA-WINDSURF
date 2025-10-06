const fs = require('fs');
const path = require('path');

console.log('🔍 VÉRIFICATION DE LA TABLE NOTIFICATIONS');
console.log('==========================================\n');

// Lire le fichier de configuration Supabase
const supabaseConfigPath = path.join(__dirname, '..', 'src', 'lib', 'supabase.js');
let supabaseUrl = '';
let supabaseAnonKey = '';

try {
  const supabaseConfig = fs.readFileSync(supabaseConfigPath, 'utf8');
  
  // Extraire l'URL et la clé
  const urlMatch = supabaseConfig.match(/supabaseUrl\s*=\s*['"`]([^'"`]+)['"`]/);
  const keyMatch = supabaseConfig.match(/supabaseKey\s*=\s*['"`]([^'"`]+)['"`]/);
  
  if (urlMatch) supabaseUrl = urlMatch[1];
  if (keyMatch) supabaseAnonKey = keyMatch[1];
  
  console.log('✅ Configuration Supabase trouvée');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Clé: ${supabaseAnonKey.substring(0, 20)}...`);
} catch (error) {
  console.log('❌ Impossible de lire la configuration Supabase');
  console.log('   Vérifiez que le fichier src/lib/supabase.js existe');
  process.exit(1);
}

// Créer un script SQL pour vérifier la structure de la table
const sqlScript = `
-- Script pour vérifier la structure de la table notifications
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier si la table notifications existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'notifications';

-- 2. Vérifier la structure de la table notifications
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'notifications'
ORDER BY ordinal_position;

-- 3. Vérifier les contraintes et index
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
  AND table_name = 'notifications';

-- 4. Vérifier les fonctions RPC disponibles
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%notification%';
`;

// Sauvegarder le script SQL
const sqlPath = path.join(__dirname, 'check_notifications_structure.sql');
fs.writeFileSync(sqlPath, sqlScript);

console.log('\n📝 INSTRUCTIONS POUR VÉRIFIER LA TABLE NOTIFICATIONS:');
console.log('====================================================');
console.log('1. Allez sur https://supabase.com/dashboard');
console.log('2. Sélectionnez votre projet');
console.log('3. Allez dans "SQL Editor"');
console.log('4. Copiez et exécutez le contenu du fichier:');
console.log(`   ${sqlPath}`);
console.log('\n5. Vérifiez les résultats pour:');
console.log('   - La table "notifications" existe-t-elle ?');
console.log('   - Quelles sont les colonnes disponibles ?');
console.log('   - Y a-t-il une colonne "is_read" ou "read" ?');
console.log('   - La fonction "get_unread_notifications" existe-t-elle ?');

console.log('\n🔧 CORRECTIONS POSSIBLES:');
console.log('========================');
console.log('Si la table n\'existe pas, créez-la avec:');
console.log(`
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs voient leurs propres notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs marquent leurs notifications comme lues
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
`);

console.log('\nSi la colonne s\'appelle "read" au lieu de "is_read":');
console.log(`
ALTER TABLE notifications RENAME COLUMN read TO is_read;
`);

console.log('\nSi la fonction RPC n\'existe pas, créez-la avec:');
console.log(`
CREATE OR REPLACE FUNCTION get_unread_notifications(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  message TEXT,
  type TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.user_id,
    n.title,
    n.message,
    n.type,
    n.is_read,
    n.created_at,
    n.updated_at
  FROM notifications n
  WHERE n.user_id = p_user_id
    AND n.is_read = FALSE
  ORDER BY n.created_at DESC;
END;
$$;
`);

console.log('\n✅ Script de vérification créé !');
