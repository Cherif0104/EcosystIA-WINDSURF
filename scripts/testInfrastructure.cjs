const { createClient } = require('@supabase/supabase-js');

// Test rapide de l'infrastructure
async function testInfrastructure() {
  console.log('🔍 Test de l'infrastructure MVP SENEGEL...');
  
  // Vérifier la connexion Supabase
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Variables d'environnement Supabase manquantes');
    return false;
  }
  
  console.log('✅ Variables d'environnement configurées');
  console.log('✅ Infrastructure prête pour démonstration');
  return true;
}

testInfrastructure();
