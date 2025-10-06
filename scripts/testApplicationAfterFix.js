import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testApplicationAfterFix() {
  console.log('🧪 Test complet de l\'application après correction...\n');

  try {
    // 1. Test de connexion à Supabase
    console.log('1️⃣ Test de connexion Supabase...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('⚠️  Pas d\'utilisateur connecté (normal pour ce test)');
    } else {
      console.log('✅ Utilisateur connecté:', user?.email);
    }

    // 2. Test de la table users avec toutes les colonnes
    console.log('\n2️⃣ Test de la table users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        is_active,
        created_at,
        updated_at,
        last_login
      `)
      .limit(1);

    if (usersError) {
      console.error('❌ Erreur table users:', usersError.message);
      
      // Analyser l'erreur
      if (usersError.message.includes('is_active does not exist')) {
        console.log('\n🔧 SOLUTION: La colonne is_active manque encore');
        console.log('📋 Exécutez le script SQL généré précédemment dans Supabase');
        return;
      } else if (usersError.message.includes('relation "users" does not exist')) {
        console.log('\n🔧 SOLUTION: La table users n\'existe pas');
        console.log('📋 Créez d\'abord la table users dans Supabase');
        return;
      }
      
      return;
    }

    console.log(`✅ Table users OK - ${users?.length || 0} utilisateur(s)`);
    if (users && users.length > 0) {
      const user = users[0];
      console.log('📋 Exemple d\'utilisateur:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Rôle: ${user.role}`);
      console.log(`   Actif: ${user.is_active !== undefined ? user.is_active : 'N/A'}`);
    }

    // 3. Test des statistiques utilisateurs
    console.log('\n3️⃣ Test des statistiques...');
    const { data: allUsers, error: statsError } = await supabase
      .from('users')
      .select('role, is_active');

    if (statsError) {
      console.error('❌ Erreur statistiques:', statsError.message);
    } else {
      const stats = {
        total: allUsers?.length || 0,
        active: allUsers?.filter(u => u.is_active === true).length || 0,
        inactive: allUsers?.filter(u => u.is_active === false).length || 0
      };
      
      console.log('✅ Statistiques calculées:');
      console.log(`   Total: ${stats.total}`);
      console.log(`   Actifs: ${stats.active}`);
      console.log(`   Inactifs: ${stats.inactive}`);
    }

    // 4. Test de la table system_logs
    console.log('\n4️⃣ Test de la table system_logs...');
    const { data: logs, error: logsError } = await supabase
      .from('system_logs')
      .select('*')
      .limit(1);

    if (logsError) {
      console.error('❌ Erreur system_logs:', logsError.message);
      if (logsError.message.includes('does not exist')) {
        console.log('💡 La table system_logs n\'existe pas encore');
      }
    } else {
      console.log(`✅ Table system_logs OK - ${logs?.length || 0} log(s)`);
    }

    // 5. Test de l'application web
    console.log('\n5️⃣ Test de l\'application web...');
    try {
      const response = await fetch('http://localhost:5173/');
      if (response.ok) {
        console.log('✅ Application web accessible (HTTP 200)');
      } else {
        console.log(`⚠️  Application web répond avec HTTP ${response.status}`);
      }
    } catch (fetchError) {
      console.log('❌ Application web non accessible:', fetchError.message);
      console.log('💡 Assurez-vous que le serveur de développement est lancé (npm run dev)');
    }

    // 6. Résumé final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DU TEST:');
    console.log('='.repeat(60));
    
    const results = {
      supabaseConnection: !authError || authError.message !== 'Auth session missing!',
      usersTable: !usersError,
      usersColumns: !usersError && users && users.length > 0,
      statistics: !statsError,
      systemLogs: !logsError,
      webApp: false // sera mis à jour par le test fetch
    };

    // Test web app
    try {
      const response = await fetch('http://localhost:5173/');
      results.webApp = response.ok;
    } catch (e) {
      results.webApp = false;
    }

    console.log(`✅ Connexion Supabase: ${results.supabaseConnection ? 'OK' : '❌'}`);
    console.log(`✅ Table users: ${results.usersTable ? 'OK' : '❌'}`);
    console.log(`✅ Colonnes users: ${results.usersColumns ? 'OK' : '❌'}`);
    console.log(`✅ Statistiques: ${results.statistics ? 'OK' : '❌'}`);
    console.log(`✅ System logs: ${results.systemLogs ? 'OK' : '❌'}`);
    console.log(`✅ Application web: ${results.webApp ? 'OK' : '❌'}`);

    const allGood = Object.values(results).every(Boolean);
    
    if (allGood) {
      console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !');
      console.log('✅ L\'application est prête à être utilisée');
      console.log('🚀 Vous pouvez maintenant tester la gestion des utilisateurs');
    } else {
      console.log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ');
      console.log('📋 Vérifiez les erreurs ci-dessus et corrigez-les');
    }

  } catch (error) {
    console.error('💥 Erreur générale:', error.message);
  }
}

testApplicationAfterFix();
