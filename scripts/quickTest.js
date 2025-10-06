import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickTest() {
  console.log('🧪 TEST RAPIDE DE L\'APPLICATION\n');
  console.log('='.repeat(40));

  try {
    // 1. Test de connexion Supabase
    console.log('1️⃣ Test connexion Supabase...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log(authError ? '❌ Erreur auth:' + authError.message : '✅ Connexion OK');

    // 2. Test de la table users
    console.log('\n2️⃣ Test table users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.log('❌ Erreur users:', usersError.message);
      
      if (usersError.message.includes('is_active does not exist')) {
        console.log('💡 SOLUTION: Exécutez le script SQL dans Supabase');
        console.log('📄 Script disponible dans: scripts/final_sql_fix.sql');
        return;
      }
    } else {
      const columns = users.length > 0 ? Object.keys(users[0]) : [];
      const hasRequiredColumns = ['is_active', 'last_login', 'deleted_at'].every(col => columns.includes(col));
      
      console.log(`✅ Table users OK (${columns.length} colonnes)`);
      console.log(`✅ Colonnes requises: ${hasRequiredColumns ? 'OK' : 'MANQUANTES'}`);
      
      if (!hasRequiredColumns) {
        console.log('💡 SOLUTION: Exécutez le script SQL dans Supabase');
        console.log('📄 Script disponible dans: scripts/final_sql_fix.sql');
        return;
      }
    }

    // 3. Test de la table system_logs
    console.log('\n3️⃣ Test table system_logs...');
    const { data: logs, error: logsError } = await supabase
      .from('system_logs')
      .select('*')
      .limit(1);
    
    if (logsError) {
      if (logsError.message.includes('does not exist')) {
        console.log('⚠️  Table system_logs n\'existe pas encore');
      } else {
        console.log('❌ Erreur logs:', logsError.message);
      }
    } else {
      console.log(`✅ Table system_logs OK (${logs?.length || 0} logs)`);
    }

    // 4. Test de l'application web
    console.log('\n4️⃣ Test application web...');
    try {
      const response = await fetch('http://localhost:5173/');
      console.log(response.ok ? '✅ Application web accessible' : `❌ HTTP ${response.status}`);
    } catch (error) {
      console.log('❌ Application web non accessible:', error.message);
    }

    // 5. Résumé
    console.log('\n' + '='.repeat(40));
    console.log('📊 RÉSUMÉ:');
    console.log('='.repeat(40));
    
    const results = {
      supabase: !authError || authError.message === 'Auth session missing!',
      usersTable: !usersError,
      usersColumns: !usersError && users && users.length > 0,
      systemLogs: !logsError || logsError.message.includes('does not exist'),
      webApp: false
    };

    // Test web app
    try {
      const response = await fetch('http://localhost:5173/');
      results.webApp = response.ok;
    } catch (e) {
      results.webApp = false;
    }

    console.log(`✅ Supabase: ${results.supabase ? 'OK' : '❌'}`);
    console.log(`✅ Table users: ${results.usersTable ? 'OK' : '❌'}`);
    console.log(`✅ Colonnes users: ${results.usersColumns ? 'OK' : '❌'}`);
    console.log(`✅ System logs: ${results.systemLogs ? 'OK' : '❌'}`);
    console.log(`✅ Web app: ${results.webApp ? 'OK' : '❌'}`);

    const allGood = Object.values(results).every(Boolean);
    
    if (allGood) {
      console.log('\n🎉 TOUS LES TESTS PASSÉS !');
      console.log('✅ L\'application est prête');
      console.log('🌐 URL: http://localhost:5173/');
    } else {
      console.log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ');
      console.log('💡 Exécutez le script SQL si nécessaire');
    }

  } catch (error) {
    console.error('\n💥 Erreur générale:', error.message);
  }
}

quickTest();
