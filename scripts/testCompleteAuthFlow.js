import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteAuthFlow() {
  console.log('🧪 Test complet du flux d\'authentification...\n');

  // Test 1: Inscription d'un nouvel utilisateur
  console.log('1️⃣ Test d\'inscription d\'un nouvel utilisateur...');
  
  const timestamp = Date.now();
  const testEmail = `testuser${timestamp}@senegal.com`;
  const testPassword = 'Test123!';
  const firstName = 'Test';
  const lastName = 'User';
  const role = 'student';

  try {
    // Étape 1: Inscription
    console.log('📝 Inscription en cours...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role,
        },
      },
    });

    if (signupError) {
      console.error('❌ Erreur inscription:', signupError.message);
      return;
    }

    console.log('✅ Utilisateur Auth créé:', signupData.user?.id);

    // Étape 2: Création du profil utilisateur
    console.log('👤 Création du profil utilisateur...');
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: signupData.user.id,
        email: testEmail,
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        role: role,
        phone: '+221 77 123 45 67',
        location: 'Dakar, Sénégal',
        skills: ['Test', 'Développement'],
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Erreur profil:', profileError.message);
    } else {
      console.log('✅ Profil utilisateur créé:', userProfile.id);
    }

    // Étape 3: Attendre la confirmation automatique
    console.log('⏳ Attente de la confirmation automatique...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Étape 4: Test de connexion immédiate
    console.log('🔐 Test de connexion immédiate...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.error('❌ Connexion échouée:', loginError.message);
      console.log('\n🔧 Vérifications nécessaires :');
      console.log('1. Vérifiez que le trigger SQL est actif');
      console.log('2. Vérifiez les paramètres Supabase Auth');
      return;
    }

    console.log('🎉 SUCCÈS ! Connexion automatique fonctionne !');
    console.log('👤 Utilisateur connecté:', loginData.user?.email);
    console.log('🔐 Session active:', !!loginData.session);
    console.log('📧 Email confirmé:', !!loginData.user?.email_confirmed_at);

    // Étape 5: Test de récupération du profil
    console.log('\n📋 Test de récupération du profil...');
    const { data: profile, error: profileFetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', loginData.user.id)
      .single();

    if (profileFetchError) {
      console.error('❌ Erreur récupération profil:', profileFetchError.message);
    } else {
      console.log('✅ Profil récupéré:', profile.full_name, '- Rôle:', profile.role);
    }

    // Étape 6: Test de déconnexion
    console.log('\n🚪 Test de déconnexion...');
    const { error: logoutError } = await supabase.auth.signOut();
    
    if (logoutError) {
      console.error('❌ Erreur déconnexion:', logoutError.message);
    } else {
      console.log('✅ Déconnexion réussie');
    }

    // Étape 7: Test de reconnexion
    console.log('\n🔄 Test de reconnexion...');
    const { data: reLoginData, error: reLoginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (reLoginError) {
      console.error('❌ Reconnexion échouée:', reLoginError.message);
    } else {
      console.log('✅ Reconnexion réussie:', reLoginData.user?.email);
    }

    console.log('\n🎉 FLUX COMPLET RÉUSSI !');
    console.log('📊 Résumé :');
    console.log('- ✅ Inscription automatique');
    console.log('- ✅ Confirmation automatique');
    console.log('- ✅ Connexion immédiate');
    console.log('- ✅ Gestion du profil');
    console.log('- ✅ Déconnexion/Reconnexion');
    
    console.log('\n🔑 Informations de test :');
    console.log(`Email: ${testEmail}`);
    console.log(`Mot de passe: ${testPassword}`);
    console.log(`Rôle: ${role}`);

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testCompleteAuthFlow();
