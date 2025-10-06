import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSimpleTestUser() {
  console.log('🚀 Création d\'un utilisateur de test simple...\n');

  try {
    // Utiliser un email plus simple
    const email = 'test@example.com';
    const password = 'Test123!';
    
    console.log(`📝 Création de ${email}...`);

    // Créer l'utilisateur avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          full_name: 'Test User',
          role: 'student'
        }
      }
    });

    if (authError) {
      console.error(`❌ Erreur Auth:`, authError.message);
      return;
    }

    if (!authData.user) {
      console.error(`❌ Aucun utilisateur créé`);
      return;
    }

    console.log(`✅ Utilisateur créé avec succès !`);
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe: ${password}`);
    console.log(`   ID: ${authData.user.id}`);
    console.log(`   Role: student`);
    
    console.log('\n🔐 Vous pouvez maintenant vous connecter avec :');
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe: ${password}`);

  } catch (error) {
    console.error(`❌ Erreur générale:`, error.message);
  }
}

// Exécuter le script
createSimpleTestUser().catch(console.error);
