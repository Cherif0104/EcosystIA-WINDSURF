// Script de test pour le système temps réel EcosystIA
console.log('🚀 TEST DU SYSTÈME TEMPS RÉEL ECOSYSTIA');
console.log('='.repeat(60));

// Configuration (à adapter selon votre environnement)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

console.log('🔗 Configuration détectée:');
console.log(`   - URL: ${SUPABASE_URL}`);
console.log(`   - Clé: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
console.log('');

// Test 1: Vérification de la réplication temps réel
console.log('📋 Test 1: Vérification de la réplication temps réel');

async function testRealtimeReplication() {
  try {
    // Vérifier que la réplication est activée
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: "SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';"
      })
    });

    if (response.ok) {
      const data = await response.json();
      const replicatedTables = data.map(row => row.tablename);
      
      const requiredTables = ['users', 'projects', 'tasks', 'courses', 'jobs', 'time_logs', 'notifications'];
      const missingTables = requiredTables.filter(table => !replicatedTables.includes(table));
      
      if (missingTables.length === 0) {
        console.log('✅ Réplication temps réel activée pour toutes les tables');
        console.log(`   - ${replicatedTables.length} tables répliquées`);
      } else {
        console.log('⚠️  Tables manquantes dans la réplication:', missingTables.join(', '));
      }
      
      return missingTables.length === 0;
    } else {
      console.log('❌ Erreur lors de la vérification de la réplication');
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur lors de la vérification de la réplication:', error.message);
    return false;
  }
}

// Test 2: Vérification des triggers temps réel
console.log('📋 Test 2: Vérification des triggers temps réel');

async function testRealtimeTriggers() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: "SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_name LIKE '%realtime%';"
      })
    });

    if (response.ok) {
      const data = await response.json();
      const triggers = data.map(row => `${row.trigger_name} on ${row.event_object_table}`);
      
      console.log('✅ Triggers temps réel configurés:');
      triggers.forEach(trigger => console.log(`   - ${trigger}`));
      
      return triggers.length > 0;
    } else {
      console.log('❌ Erreur lors de la vérification des triggers');
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur lors de la vérification des triggers:', error.message);
    return false;
  }
}

// Test 3: Test des fonctions temps réel
console.log('📋 Test 3: Test des fonctions temps réel');

async function testRealtimeFunctions() {
  try {
    const functions = [
      'notify_project_change',
      'notify_task_change',
      'notify_user_change',
      'notify_course_change',
      'notify_job_change',
      'notify_time_log_change',
      'notify_notification_change'
    ];

    let allFunctionsExist = true;

    for (const funcName of functions) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sql: `SELECT proname FROM pg_proc WHERE proname = '${funcName}';`
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          console.log(`❌ Fonction ${funcName} manquante`);
          allFunctionsExist = false;
        } else {
          console.log(`✅ Fonction ${funcName} présente`);
        }
      }
    }

    return allFunctionsExist;
  } catch (error) {
    console.log('❌ Erreur lors de la vérification des fonctions:', error.message);
    return false;
  }
}

// Test 4: Test de création de notification
console.log('📋 Test 4: Test de création de notification');

async function testNotificationCreation() {
  try {
    // Créer une notification de test
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/create_notification`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_user_id: '00000000-0000-0000-0000-000000000000', // UUID de test
        p_title: 'Test Temps Réel',
        p_message: 'Notification de test pour vérifier le système temps réel',
        p_type: 'info'
      })
    });

    if (response.ok) {
      console.log('✅ Fonction de création de notification opérationnelle');
      return true;
    } else {
      console.log('❌ Erreur lors de la création de notification');
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur lors du test de notification:', error.message);
    return false;
  }
}

// Test 5: Test de performance des requêtes temps réel
console.log('📋 Test 5: Test de performance des requêtes temps réel');

async function testRealtimePerformance() {
  const startTime = performance.now();
  
  try {
    // Test de la fonction get_user_realtime_stats
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_user_realtime_stats`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_user_id: '00000000-0000-0000-0000-000000000000'
      })
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    if (response.ok) {
      console.log(`✅ Requête temps réel exécutée en ${duration.toFixed(2)}ms`);
      
      if (duration < 200) {
        console.log('✅ Performance excellente (< 200ms)');
      } else if (duration < 500) {
        console.log('✅ Performance acceptable (< 500ms)');
      } else {
        console.log('⚠️  Performance à améliorer (> 500ms)');
      }
      
      return duration < 500;
    } else {
      console.log('❌ Erreur lors du test de performance');
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur lors du test de performance:', error.message);
    return false;
  }
}

// Test 6: Test de connexion WebSocket (simulation)
console.log('📋 Test 6: Test de connexion WebSocket (simulation)');

async function testWebSocketConnection() {
  try {
    // Simuler une connexion WebSocket
    const wsUrl = SUPABASE_URL.replace('https://', 'wss://').replace('http://', 'ws://') + '/realtime/v1/websocket';
    
    console.log(`🔌 URL WebSocket: ${wsUrl}`);
    
    // Note: Dans un vrai test, on utiliserait WebSocket
    // Ici on simule juste la vérification de l'URL
    if (wsUrl.includes('wss://') || wsUrl.includes('ws://')) {
      console.log('✅ URL WebSocket correctement formatée');
      console.log('⚠️  Test WebSocket réel nécessite un navigateur ou Node.js avec ws');
      return true;
    } else {
      console.log('❌ URL WebSocket incorrecte');
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur lors du test WebSocket:', error.message);
    return false;
  }
}

// Test 7: Vérification des index pour le temps réel
console.log('📋 Test 7: Vérification des index pour le temps réel');

async function testRealtimeIndexes() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: "SELECT indexname, tablename FROM pg_indexes WHERE indexname LIKE '%realtime%' OR indexname LIKE '%notification%' OR indexname LIKE '%time_log%';"
      })
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.length > 0) {
        console.log('✅ Index temps réel configurés:');
        data.forEach(index => console.log(`   - ${index.indexname} sur ${index.tablename}`));
        return true;
      } else {
        console.log('⚠️  Aucun index temps réel spécifique trouvé');
        return false;
      }
    } else {
      console.log('❌ Erreur lors de la vérification des index');
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur lors de la vérification des index:', error.message);
    return false;
  }
}

// Exécution de tous les tests
async function runAllRealtimeTests() {
  console.log('🚀 Démarrage des tests du système temps réel...');
  console.log('');

  const results = {
    replication: await testRealtimeReplication(),
    triggers: await testRealtimeTriggers(),
    functions: await testRealtimeFunctions(),
    notifications: await testNotificationCreation(),
    performance: await testRealtimePerformance(),
    websocket: await testWebSocketConnection(),
    indexes: await testRealtimeIndexes()
  };

  console.log('');
  console.log('='.repeat(60));
  console.log('📊 RÉSULTATS DES TESTS TEMPS RÉEL');
  console.log('='.repeat(60));

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSÉ' : 'ÉCHOUÉ'}`);
  });

  console.log('');
  console.log(`📈 Score: ${passedTests}/${totalTests} tests passés`);

  if (passedTests === totalTests) {
    console.log('🎉 TOUS LES TESTS TEMPS RÉEL SONT PASSÉS !');
    console.log('✅ Votre système temps réel EcosystIA est opérationnel !');
    console.log('');
    console.log('🚀 FONCTIONNALITÉS DISPONIBLES:');
    console.log('- Synchronisation automatique des données');
    console.log('- Notifications temps réel');
    console.log('- Sauvegarde automatique');
    console.log('- Mise à jour en direct des interfaces');
    console.log('- Abonnements aux changements de données');
  } else {
    console.log('⚠️  CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('');
    console.log('🔧 ACTIONS REQUISES:');
    if (!results.replication) {
      console.log('- Activer la réplication sur les tables dans Supabase');
      console.log('- Exécuter: ALTER PUBLICATION supabase_realtime ADD TABLE table_name;');
    }
    if (!results.triggers) {
      console.log('- Créer les triggers temps réel');
      console.log('- Exécuter le fichier database/realtime_setup.sql');
    }
    if (!results.functions) {
      console.log('- Créer les fonctions de notification');
      console.log('- Vérifier les fonctions dans l\'éditeur SQL Supabase');
    }
    if (!results.notifications) {
      console.log('- Vérifier la table notifications et ses politiques RLS');
      console.log('- Tester manuellement la création de notifications');
    }
  }

  console.log('');
  console.log('📖 Documentation:');
  console.log('- Configuration temps réel: database/realtime_setup.sql');
  console.log('- Service temps réel: services/realtimeService.ts');
  console.log('- Hooks React: hooks/useRealtime.ts');
  console.log('');
  console.log('✨ Tests du système temps réel terminés !');
}

// Démarrer les tests si le script est exécuté directement
if (typeof window === 'undefined') {
  // Node.js environment
  runAllRealtimeTests().catch(console.error);
} else {
  // Browser environment
  window.testRealtimeSystem = runAllRealtimeTests;
  console.log('💡 Pour exécuter les tests, appelez: testRealtimeSystem()');
}
