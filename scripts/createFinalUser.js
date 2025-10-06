import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createFinalUser() {
  console.log('🚀 Création du dernier utilisateur...\n');

  try {
    // Supprimer l'ancien utilisateur problématique
    console.log('🗑️ Suppression de l\'ancien utilisateur...');
    await supabase
      .from('users')
      .delete()
      .eq('email', 'testuser123@gmail.com');

    // Créer un nouvel utilisateur avec un email différent
    const finalEmail = 'admin@senegal.com';
    const finalPassword = 'Admin123!';

    console.log('📝 Création utilisateur avec email:', finalEmail);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: finalEmail,
      password: finalPassword,
      options: {
        data: {
          first_name: 'Admin',
          last_name: 'Senegal',
          role: 'super_administrator'
        }
      }
    });

    if (authError) {
      console.error('❌ Erreur Auth:', authError.message);
      return;
    }

    console.log('✅ Utilisateur Auth créé:', authData.user.id);

    // Créer dans la table users
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: finalEmail,
        first_name: 'Admin',
        last_name: 'Senegal',
        full_name: 'Admin Senegal',
        role: 'super_administrator',
        phone: '+221 77 123 45 67',
        location: 'Dakar, Sénégal',
        skills: ['Administration', 'Management'],
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Erreur table users:', userError.message);
      return;
    }

    console.log('\n🎉 UTILISATEUR FINAL CRÉÉ !');
    console.log('📧 Email:', finalEmail);
    console.log('🔑 Mot de passe:', finalPassword);
    console.log('👤 Rôle: super_administrator');
    console.log('🆔 ID:', userRecord.id);
    
    console.log('\n📋 Maintenant :');
    console.log('1. Allez dans Supabase Dashboard → SQL Editor');
    console.log('2. Exécutez ce SQL :');
    console.log(`UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = '${finalEmail}';`);
    console.log('3. Testez la connexion !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

createFinalUser();
