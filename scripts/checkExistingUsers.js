import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExistingUsers() {
  console.log('🔍 Vérification des utilisateurs existants...\n');

  try {
    // Vérifier les utilisateurs dans la table users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError.message);
    } else {
      console.log('📋 Utilisateurs dans la table users:');
      if (users && users.length > 0) {
        users.forEach(user => {
          console.log(`   • ${user.email} (${user.role}) - ID: ${user.id}`);
        });
      } else {
        console.log('   Aucun utilisateur trouvé');
      }
    }

    // Tenter de se connecter avec un utilisateur existant
    console.log('\n🔐 Test de connexion avec contact@impulcia-afrique.com...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'contact@impulcia-afrique.com',
      password: 'Contact123!'
    });

    if (loginError) {
      console.error('❌ Erreur de connexion:', loginError.message);
    } else {
      console.log('✅ Connexion réussie !');
      console.log(`   Utilisateur: ${loginData.user?.email}`);
      console.log(`   ID: ${loginData.user?.id}`);
    }

  } catch (error) {
    console.error(`❌ Erreur générale:`, error.message);
  }
}

// Exécuter le script
checkExistingUsers().catch(console.error);
