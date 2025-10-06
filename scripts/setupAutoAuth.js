import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAutoAuth() {
  console.log('🚀 Configuration de l\'authentification automatique...\n');

  try {
    // 1. Confirmer l'utilisateur admin existant
    console.log('✅ Confirmation de l\'utilisateur admin existant...');
    const { data: adminData, error: adminError } = await supabase.auth.signInWithPassword({
      email: 'admin@senegal.com',
      password: 'Admin123!'
    });

    if (adminError && adminError.message === 'Email not confirmed') {
      console.log('📧 Email non confirmé - cela sera résolu automatiquement');
    }

    // 2. Créer un nouvel utilisateur test avec confirmation automatique
    console.log('\n🔄 Test de création d\'utilisateur avec confirmation automatique...');
    
    const testEmail = `test${Date.now()}@senegal.com`;
    const testPassword = 'Test123!';

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'Auto',
          role: 'student'
        }
      }
    });

    if (signupError) {
      console.error('❌ Erreur lors de l\'inscription:', signupError.message);
      return;
    }

    console.log('✅ Utilisateur créé:', signupData.user?.id);

    // 3. Créer le profil dans la table users
    if (signupData.user) {
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .insert({
          id: signupData.user.id,
          email: testEmail,
          first_name: 'Test',
          last_name: 'Auto',
          full_name: 'Test Auto',
          role: 'student',
          phone: '+221 77 000 00 00',
          location: 'Dakar, Sénégal',
          skills: ['Test'],
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (userError) {
        console.error('❌ Erreur table users:', userError.message);
      } else {
        console.log('✅ Profil utilisateur créé:', userRecord.id);
      }
    }

    // 4. Tester la connexion immédiate
    console.log('\n🔐 Test de connexion immédiate...');
    
    // Attendre un peu pour que la confirmation automatique se fasse
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.log('⚠️ Connexion non immédiate:', loginError.message);
      console.log('📋 Instructions pour finaliser la configuration :');
      console.log('1. Allez dans Supabase Dashboard → Authentication → Settings');
      console.log('2. Désactivez "Enable email confirmations"');
      console.log('3. Ou exécutez le SQL dans scripts/disableEmailConfirmation.sql');
    } else {
      console.log('🎉 SUCCÈS ! Connexion automatique fonctionne !');
      console.log('👤 Utilisateur connecté:', loginData.user?.email);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

setupAutoAuth();
