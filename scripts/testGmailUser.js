import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGmailUser() {
  console.log('🧪 Test avec un email Gmail...\n');

  try {
    // Test avec un email Gmail
    const { data, error } = await supabase.auth.signUp({
      email: 'testuser123@gmail.com',
      password: 'Test123!',
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          role: 'super_administrator'
        }
      }
    });

    if (error) {
      console.error('❌ Erreur:', error.message);
      console.log('\n🔧 Le problème vient de la configuration Supabase !');
      console.log('📋 Actions à faire :');
      console.log('1. Allez dans Supabase Dashboard → Authentication → Settings');
      console.log('2. Désactivez "Enable email confirmations"');
      console.log('3. Vérifiez qu\'il n\'y a pas de restrictions sur les domaines');
      console.log('4. Ou créez l\'utilisateur manuellement dans Authentication → Users');
    } else {
      console.log('✅ Utilisateur créé !');
      console.log('📧 Email: testuser123@gmail.com');
      console.log('🔑 Mot de passe: Test123!');
      console.log('🆔 ID:', data.user?.id);
      
      // Créer dans la table users
      await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: 'testuser123@gmail.com',
          first_name: 'Test',
          last_name: 'User',
          full_name: 'Test User',
          role: 'super_administrator',
          phone: '+221 77 123 45 67',
          location: 'Dakar, Sénégal',
          skills: ['Test'],
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      console.log('✅ Entrée créée dans la table users');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testGmailUser();
