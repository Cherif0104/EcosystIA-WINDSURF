import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndTestLogin() {
  console.log('🔍 Vérification des utilisateurs existants...\n');

  try {
    // Vérifier les utilisateurs dans auth.users via SQL
    console.log('📋 Liste des utilisateurs dans auth.users :');
    
    // Test direct de connexion avec l'utilisateur existant
    console.log('🧪 Test de connexion avec contact@impulcia-afrique.com...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'contact@impulcia-afrique.com',
      password: 'Impulcia123!'
    });

    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      
      // Essayons de créer un utilisateur avec un email qui fonctionne
      console.log('\n🔄 Tentative de création avec un email différent...');
      
      const { data: newUser, error: newError } = await supabase.auth.signUp({
        email: 'test@supabase.com',
        password: 'Test123!',
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User',
            role: 'super_administrator'
          }
        }
      });

      if (newError) {
        console.error('❌ Erreur création:', newError.message);
      } else {
        console.log('✅ Nouvel utilisateur créé:', newUser.user?.id);
        
        // Tester la connexion immédiatement
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: 'test@supabase.com',
          password: 'Test123!'
        });

        if (loginError) {
          console.error('❌ Erreur connexion nouvel utilisateur:', loginError.message);
        } else {
          console.log('🎉 CONNEXION RÉUSSIE !');
          console.log('📧 Email: test@supabase.com');
          console.log('🔑 Mot de passe: Test123!');
        }
      }
      
    } else {
      console.log('🎉 CONNEXION RÉUSSIE !');
      console.log('👤 Utilisateur:', data.user?.email);
      console.log('🆔 ID:', data.user?.id);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

checkAndTestLogin();
