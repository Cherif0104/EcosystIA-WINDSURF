import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createValidUser() {
  console.log('🚀 Création d\'un utilisateur valide...\n');

  try {
    // Utiliser un email valide
    const testEmail = 'admin@test.com';
    const testPassword = 'Admin123!';

    console.log('📝 Création utilisateur avec email:', testEmail);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Admin',
          last_name: 'Test',
          full_name: 'Admin Test',
          role: 'super_administrator'
        }
      }
    });

    if (authError) {
      console.error('❌ Erreur Auth:', authError.message);
      return;
    }

    if (!authData.user) {
      console.error('❌ Aucun utilisateur créé');
      return;
    }

    console.log('✅ Utilisateur Auth créé:', authData.user.id);

    // Créer l'entrée dans la table users
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: testEmail,
        first_name: 'Admin',
        last_name: 'Test',
        full_name: 'Admin Test',
        role: 'super_administrator',
        phone: '+221 77 123 45 67',
        location: 'Dakar, Sénégal',
        skills: ['Administration', 'Test'],
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

    console.log('\n🎉 UTILISATEUR CRÉÉ AVEC SUCCÈS !');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Mot de passe:', testPassword);
    console.log('👤 Rôle: super_administrator');
    console.log('🆔 ID:', userRecord.id);
    console.log('\n🧪 TESTEZ MAINTENANT LA CONNEXION !');
    console.log('🔗 Allez sur: http://localhost:5173/');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

createValidUser();
