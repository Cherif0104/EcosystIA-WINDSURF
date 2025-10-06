import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAutoAuth() {
  console.log('🧪 Test final de l\'authentification automatique...\n');

  // Test 1: Connexion avec l'utilisateur admin existant
  console.log('1️⃣ Test de connexion admin existant...');
  try {
    const { data: adminLogin, error: adminError } = await supabase.auth.signInWithPassword({
      email: 'admin@senegal.com',
      password: 'Admin123!'
    });

    if (adminError) {
      console.log('❌ Admin non connecté:', adminError.message);
    } else {
      console.log('✅ Admin connecté:', adminLogin.user?.email);
    }
  } catch (error) {
    console.log('❌ Erreur admin:', error.message);
  }

  // Test 2: Création d'un nouvel utilisateur
  console.log('\n2️⃣ Test de création d\'utilisateur...');
  const testEmail = `autotest${Date.now()}@senegal.com`;
  const testPassword = 'AutoTest123!';

  try {
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Auto',
          last_name: 'Test',
          role: 'student'
        }
      }
    });

    if (signupError) {
      console.log('❌ Erreur inscription:', signupError.message);
      return;
    }

    console.log('✅ Utilisateur créé:', signupData.user?.id);

    // Test 3: Connexion immédiate
    console.log('\n3️⃣ Test de connexion immédiate...');
    
    // Attendre un peu pour la confirmation automatique
    await new Promise(resolve => setTimeout(resolve, 3000));

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.log('❌ Connexion échouée:', loginError.message);
      console.log('\n📋 ACTION REQUISE :');
      console.log('1. Allez dans Supabase Dashboard → Authentication → Settings');
      console.log('2. Désactivez "Enable email confirmations"');
      console.log('3. Ou exécutez le SQL dans scripts/finalAutoConfig.sql');
      console.log('4. Relancez ce test');
    } else {
      console.log('🎉 SUCCÈS ! Authentification automatique fonctionne !');
      console.log('👤 Utilisateur connecté:', loginData.user?.email);
      console.log('🔐 Session active:', !!loginData.session);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testAutoAuth();
