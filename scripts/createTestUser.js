import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  console.log('🚀 Création de l\'utilisateur de test...\n');

  try {
    // 1. Créer l'utilisateur dans Supabase Auth
    console.log('📝 Création dans Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'contact@impulcia-afrique.com',
      password: 'Impulcia123!',
      options: {
        data: {
          first_name: 'Contact',
          last_name: 'Impulcia',
          full_name: 'Contact Impulcia',
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

    // 2. Créer l'entrée dans la table users
    console.log('📝 Création dans la table users...');
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id, // Utilise l'UUID de Supabase Auth
        email: 'contact@impulcia-afrique.com',
        first_name: 'Contact',
        last_name: 'Impulcia',
        full_name: 'Contact Impulcia',
        role: 'super_administrator',
        phone: '+221 77 123 45 67',
        location: 'Dakar, Sénégal',
        skills: ['Management', 'Développement'],
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

    console.log('✅ Utilisateur créé avec succès !');
    console.log('📧 Email:', userRecord.email);
    console.log('🔑 Mot de passe: Impulcia123!');
    console.log('👤 Rôle:', userRecord.role);
    console.log('🆔 ID:', userRecord.id);

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

createTestUser();
