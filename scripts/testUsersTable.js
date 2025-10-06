import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseServiceKey = 'your-service-key'; // Remplacez par votre service key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUsersTable() {
  console.log('🧪 Test de la table users...\n');

  try {
    // 1. Vérifier la structure de la table
    console.log('1️⃣ Vérification de la structure de la table...');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erreur:', error.message);
      return;
    }

    console.log('✅ Table users accessible');
    console.log('📋 Colonnes disponibles:', data.length > 0 ? Object.keys(data[0]) : 'Aucune donnée');

    // 2. Insérer un utilisateur de test
    console.log('\n2️⃣ Test d\'insertion...');
    const testUser = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      role: 'student',
      is_active: true
    };

    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select();

    if (insertError) {
      console.error('❌ Erreur d\'insertion:', insertError.message);
    } else {
      console.log('✅ Insertion réussie:', insertData[0]);
    }

    // 3. Nettoyer les données de test
    console.log('\n3️⃣ Nettoyage...');
    await supabase
      .from('users')
      .delete()
      .eq('email', 'test@example.com');

    console.log('✅ Test terminé avec succès !');

  } catch (error) {
    console.error('💥 Erreur générale:', error.message);
  }
}

testUsersTable();
