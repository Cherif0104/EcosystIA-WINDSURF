import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSystemLogs() {
  console.log('🧪 Test du système de logs...\n');

  try {
    // Test 1: Vérifier si la table system_logs existe
    console.log('1️⃣ Vérification de l\'existence de la table system_logs...');
    
    const { data: tableCheck, error: tableError } = await supabase
      .from('system_logs')
      .select('*')
      .limit(1);

    if (tableError) {
      console.log('❌ Table system_logs non trouvée:', tableError.message);
      console.log('\n📋 INSTRUCTIONS :');
      console.log('1. Allez dans Supabase Dashboard → SQL Editor');
      console.log('2. Remplacez votre script par le script SQL corrigé');
      console.log('3. Cliquez sur "Run"');
      console.log('4. Relancez ce test');
      return;
    }

    console.log('✅ Table system_logs trouvée !');

    // Test 2: Se connecter avec un utilisateur admin
    console.log('\n2️⃣ Connexion avec l\'utilisateur admin...');
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@senegal.com',
      password: 'Admin123!'
    });

    if (authError) {
      console.log('⚠️ Impossible de se connecter:', authError.message);
      console.log('✅ Table créée avec succès, mais test d\'insertion nécessite une authentification');
      return;
    }

    console.log('✅ Connexion réussie avec:', authData.user.email);

    // Test 3: Créer un log de test
    console.log('\n3️⃣ Création d\'un log de test...');
    
    const testLog = {
      user_id: authData.user.id,
      user_email: authData.user.email,
      user_role: 'super_administrator',
      module: 'test',
      action: 'system_test',
      details: 'Test du système de logs',
      severity: 'info'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('system_logs')
      .insert([testLog])
      .select();

    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion du log:', insertError.message);
      return;
    }

    console.log('✅ Log de test créé:', insertData[0].id);

    // Test 3: Récupérer les logs
    console.log('\n3️⃣ Récupération des logs...');
    
    const { data: logs, error: fetchError } = await supabase
      .from('system_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des logs:', fetchError.message);
      return;
    }

    console.log('✅ Logs récupérés:', logs.length, 'entrées');
    
    if (logs.length > 0) {
      console.log('\n📊 Derniers logs :');
      logs.forEach((log, index) => {
        console.log(`${index + 1}. ${log.timestamp} - ${log.user_email} - ${log.module} - ${log.action}`);
      });
    }

    // Test 4: Tester les filtres
    console.log('\n4️⃣ Test des filtres...');
    
    const { data: filteredLogs, error: filterError } = await supabase
      .from('system_logs')
      .select('*')
      .eq('module', 'test')
      .order('timestamp', { ascending: false });

    if (filterError) {
      console.error('❌ Erreur lors du filtrage:', filterError.message);
      return;
    }

    console.log('✅ Filtrage par module "test":', filteredLogs.length, 'entrées');

    // Test 5: Nettoyer les logs de test
    console.log('\n5️⃣ Nettoyage des logs de test...');
    
    const { error: deleteError } = await supabase
      .from('system_logs')
      .delete()
      .eq('module', 'test');

    if (deleteError) {
      console.error('❌ Erreur lors du nettoyage:', deleteError.message);
      return;
    }

    console.log('✅ Logs de test supprimés');

    console.log('\n🎉 SYSTÈME DE LOGS FONCTIONNEL !');
    console.log('📊 Résumé :');
    console.log('- ✅ Table system_logs créée');
    console.log('- ✅ Insertion de logs fonctionnelle');
    console.log('- ✅ Récupération de logs fonctionnelle');
    console.log('- ✅ Filtrage des logs fonctionnel');
    console.log('- ✅ Suppression de logs fonctionnelle');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testSystemLogs();
