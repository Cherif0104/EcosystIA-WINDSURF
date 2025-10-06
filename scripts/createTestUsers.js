import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

const testUsers = [
  {
    email: 'admin@ecosystia.com',
    password: 'Admin123!',
    first_name: 'Admin',
    last_name: 'EcosystIA',
    full_name: 'Admin EcosystIA',
    role: 'super_administrator',
    phone: '+221 77 123 45 67',
    location: 'Dakar, Sénégal'
  },
  {
    email: 'contact@impulcia-afrique.com',
    password: 'Contact123!',
    first_name: 'Contact',
    last_name: 'Impulcia',
    full_name: 'Contact Impulcia Afrique',
    role: 'super_administrator',
    phone: '+221 77 987 65 43',
    location: 'Dakar, Sénégal'
  },
  {
    email: 'student@test.com',
    password: 'Student123!',
    first_name: 'Amadou',
    last_name: 'Diop',
    full_name: 'Amadou Diop',
    role: 'student',
    phone: '+221 77 111 22 33',
    location: 'Thiès, Sénégal'
  },
  {
    email: 'manager@test.com',
    password: 'Manager123!',
    first_name: 'Fatou',
    last_name: 'Sall',
    full_name: 'Fatou Sall',
    role: 'manager',
    phone: '+221 77 444 55 66',
    location: 'Saint-Louis, Sénégal'
  },
  {
    email: 'employer@test.com',
    password: 'Employer123!',
    first_name: 'Moussa',
    last_name: 'Ba',
    full_name: 'Moussa Ba',
    role: 'employer',
    phone: '+221 77 777 88 99',
    location: 'Kaolack, Sénégal'
  }
];

async function createTestUsers() {
  console.log('🚀 Création des utilisateurs de test...\n');

  for (const userData of testUsers) {
    try {
      console.log(`📝 Création de ${userData.email} (${userData.role})...`);

      // Créer l'utilisateur avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            full_name: userData.full_name,
            role: userData.role
          }
        }
      });

      if (authError) {
        console.error(`❌ Erreur Auth pour ${userData.email}:`, authError.message);
        continue;
      }

      if (!authData.user) {
        console.error(`❌ Aucun utilisateur créé pour ${userData.email}`);
        continue;
      }

      // Créer l'entrée dans la table users
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          full_name: userData.full_name,
          role: userData.role,
          phone: userData.phone,
          location: userData.location,
          skills: [],
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (userError) {
        console.error(`❌ Erreur table users pour ${userData.email}:`, userError.message);
        continue;
      }

      console.log(`✅ Utilisateur créé: ${userData.email} (${userData.role})`);
      console.log(`   ID: ${authData.user.id}`);
      console.log(`   Nom: ${userRecord.full_name}\n`);

    } catch (error) {
      console.error(`❌ Erreur générale pour ${userData.email}:`, error.message);
    }
  }

  console.log('🎉 Création des utilisateurs de test terminée !');
  console.log('\n📋 Utilisateurs créés:');
  testUsers.forEach(user => {
    console.log(`   • ${user.email} (${user.role}) - Mot de passe: ${user.password}`);
  });
  
  console.log('\n🔐 Vous pouvez maintenant tester la connexion avec ces comptes.');
}

// Exécuter le script
createTestUsers().catch(console.error);
