import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createConfirmedUser() {
  console.log('🚀 Création d\'un utilisateur confirmé...\n');

  try {
    // Supprimer l'ancien utilisateur s'il existe
    console.log('🗑️ Suppression de l\'ancien utilisateur...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser('d06c32be-9f0a-423c-9b9b-3754dbc46b35');
    if (deleteError && deleteError.message !== 'User not found') {
      console.log('⚠️ Erreur suppression (normal si pas trouvé):', deleteError.message);
    }

    // Supprimer de la table users aussi
    await supabase
      .from('users')
      .delete()
      .eq('email', 'contact@impulcia-afrique.com');

    console.log('✅ Ancien utilisateur supprimé');

    // Créer un nouvel utilisateur avec confirmation forcée
    console.log('📝 Création du nouvel utilisateur...');
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

    // Confirmer manuellement via SQL (à faire dans Supabase Dashboard)
    console.log('\n📋 Instructions importantes :');
    console.log('1. Allez dans Supabase Dashboard → SQL Editor');
    console.log('2. Exécutez ce SQL :');
    console.log(`UPDATE auth.users SET email_confirmed_at = NOW(), confirmed_at = NOW() WHERE id = '${authData.user.id}';`);
    console.log('3. Puis créez l\'entrée dans la table users :');

    // Créer l'entrée dans la table users
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
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
      console.log('\n📋 Créez manuellement dans la table users avec cet ID:', authData.user.id);
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

createConfirmedUser();
