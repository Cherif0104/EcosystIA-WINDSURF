const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://your-project.supabase.co'; // Remplacez par votre URL
const supabaseServiceKey = 'your-service-key'; // Remplacez par votre service key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUserManagement() {
  console.log('🧪 Test du service de gestion des utilisateurs...\n');

  try {
    // 1. Test de récupération des utilisateurs
    console.log('1️⃣ Test de récupération des utilisateurs...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError.message);
    } else {
      console.log(`✅ ${users?.length || 0} utilisateurs récupérés`);
      if (users && users.length > 0) {
        console.log('   Premiers utilisateurs:');
        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.first_name} ${user.last_name} (${user.email}) - ${user.role}`);
        });
      }
    }

    // 2. Test des statistiques
    console.log('\n2️⃣ Test des statistiques...');
    const { data: allUsers, error: statsError } = await supabase
      .from('users')
      .select('role, is_active');

    if (statsError) {
      console.error('❌ Erreur lors de la récupération des statistiques:', statsError.message);
    } else {
      const stats = {
        total: allUsers?.length || 0,
        active: allUsers?.filter(u => u.is_active).length || 0,
        inactive: allUsers?.filter(u => !u.is_active).length || 0,
        byRole: {}
      };

      const roles = ['super_administrator', 'administrator', 'teacher', 'student'];
      roles.forEach(role => {
        stats.byRole[role] = allUsers?.filter(u => u.role === role).length || 0;
      });

      console.log('✅ Statistiques calculées:');
      console.log(`   Total: ${stats.total}`);
      console.log(`   Actifs: ${stats.active}`);
      console.log(`   Inactifs: ${stats.inactive}`);
      console.log('   Par rôle:');
      Object.entries(stats.byRole).forEach(([role, count]) => {
        console.log(`     ${role}: ${count}`);
      });
    }

    // 3. Test de filtrage
    console.log('\n3️⃣ Test de filtrage...');
    const { data: activeUsers, error: filterError } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .limit(3);

    if (filterError) {
      console.error('❌ Erreur lors du filtrage:', filterError.message);
    } else {
      console.log(`✅ ${activeUsers?.length || 0} utilisateurs actifs trouvés`);
    }

    // 4. Test de recherche
    console.log('\n4️⃣ Test de recherche...');
    const { data: searchResults, error: searchError } = await supabase
      .from('users')
      .select('*')
      .ilike('email', '%admin%')
      .limit(3);

    if (searchError) {
      console.error('❌ Erreur lors de la recherche:', searchError.message);
    } else {
      console.log(`✅ ${searchResults?.length || 0} résultats de recherche trouvés`);
      if (searchResults && searchResults.length > 0) {
        searchResults.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.first_name} ${user.last_name} (${user.email})`);
        });
      }
    }

    console.log('\n🎉 Tests terminés avec succès !');

  } catch (error) {
    console.error('💥 Erreur générale:', error.message);
  }
}

// Exécuter les tests
testUserManagement();
