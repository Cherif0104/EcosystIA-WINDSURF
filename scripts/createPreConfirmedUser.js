import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createPreConfirmedUser() {
  console.log('🚀 Création d\'un utilisateur pré-confirmé...\n');

  try {
    const testEmail = 'admin123@gmail.com';
    const testPassword = 'Admin123!';

    // Créer l'utilisateur
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Admin',
          last_name: 'User',
          role: 'super_administrator'
        }
      }
    });

    if (authError) {
      console.error('❌ Erreur Auth:', authError.message);
      return;
    }

    console.log('✅ Utilisateur créé:', authData.user.id);

    // Confirmer immédiatement via SQL
    console.log('\n📋 Instructions :');
    console.log('1. Allez dans Supabase Dashboard → SQL Editor');
    console.log('2. Exécutez ce SQL :');
    console.log(`UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = '${authData.user.id}';`);
    console.log('\n3. Puis créez l\'entrée dans la table users :');
    console.log(`INSERT INTO public.users (id, email, first_name, last_name, full_name, role, phone, location, skills, avatar_url, created_at, updated_at) VALUES ('${authData.user.id}', '${testEmail}', 'Admin', 'User', 'Admin User', 'super_administrator', '+221 77 123 45 67', 'Dakar, Sénégal', ARRAY['Admin', 'Test'], null, NOW(), NOW());`);

    // Créer dans la table users
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: testEmail,
        first_name: 'Admin',
        last_name: 'User',
        full_name: 'Admin User',
        role: 'super_administrator',
        phone: '+221 77 123 45 67',
        location: 'Dakar, Sénégal',
        skills: ['Admin', 'Test'],
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Erreur table users:', userError.message);
    } else {
      console.log('✅ Entrée créée dans la table users');
    }

    console.log('\n🎉 UTILISATEUR PRÊT !');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Mot de passe:', testPassword);

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

createPreConfirmedUser();
