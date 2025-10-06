// Script de test pour la connexion base de données EcosystIA
console.log('🧪 TEST DE CONNEXION BASE DE DONNÉES ECOSYSTIA');
console.log('='.repeat(60));

// Configuration (à adapter selon votre environnement)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

console.log('🔗 Configuration détectée:');
console.log(`   - URL: ${SUPABASE_URL}`);
console.log(`   - Clé: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
console.log('');

// Test 1: Connexion de base
console.log('📋 Test 1: Connexion de base à Supabase');

async function testConnection() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ Connexion Supabase établie avec succès');
      return true;
    } else {
      console.log('❌ Erreur de connexion:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
    return false;
  }
}

// Test 2: Vérification des tables
console.log('📋 Test 2: Vérification des tables créées');

async function testTables() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/information_schema.tables?select=table_name&table_schema=eq.public`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const tables = data.map(item => item.table_name);
      
      const requiredTables = [
        'users', 'projects', 'courses', 'jobs', 'time_logs', 
        'leave_requests', 'invoices', 'contacts', 'documents',
        'system_logs', 'notifications', 'modules', 'role_permissions'
      ];
      
      const missingTables = requiredTables.filter(table => !tables.includes(table));
      
      if (missingTables.length === 0) {
        console.log('✅ Toutes les tables requises sont présentes');
        console.log(`   - ${tables.length} tables trouvées`);
      } else {
        console.log('⚠️  Tables manquantes:', missingTables.join(', '));
      }
      
      return missingTables.length === 0;
    } else {
      console.log('❌ Erreur lors de la vérification des tables');
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur lors de la vérification des tables:', error.message);
    return false;
  }
}

// Test 3: Vérification des modules
console.log('📋 Test 3: Vérification des modules configurés');

async function testModules() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/modules?select=id,name`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const modules = data.map(item => item.id);
      
      const requiredModules = [
        'dashboard', 'projects', 'courses', 'jobs', 'time_tracking',
        'leave_management', 'finance', 'crm_sales', 'knowledge_base',
        'development', 'tools', 'ai_coach', 'gen_ai_lab', 'analytics',
        'user_management', 'settings', 'super_admin'
      ];
      
      const missingModules = requiredModules.filter(module => !modules.includes(module));
      
      if (missingModules.length === 0) {
        console.log('✅ Tous les modules sont configurés');
        console.log(`   - ${modules.length} modules trouvés`);
      } else {
        console.log('⚠️  Modules manquants:', missingModules.join(', '));
      }
      
      return missingModules.length === 0;
    } else {
      console.log('❌ Erreur lors de la vérification des modules');
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur lors de la vérification des modules:', error.message);
    return false;
  }
}

// Test 4: Vérification des permissions
console.log('📋 Test 4: Vérification des permissions par rôle');

async function testPermissions() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/role_permissions?select=role,module_id,can_view&limit=5`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.length > 0) {
        console.log('✅ Permissions configurées');
        console.log(`   - ${data.length} permissions trouvées (échantillon)`);
        
        // Vérifier les permissions du super administrateur
        const superAdminPermissions = data.filter(p => p.role === 'super_administrator');
        if (superAdminPermissions.length > 0) {
          console.log('✅ Permissions super administrateur configurées');
        } else {
          console.log('⚠️  Permissions super administrateur non trouvées');
        }
      } else {
        console.log('⚠️  Aucune permission trouvée');
      }
      
      return data.length > 0;
    } else {
      console.log('❌ Erreur lors de la vérification des permissions');
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur lors de la vérification des permissions:', error.message);
    return false;
  }
}

// Test 5: Vérification des données de démonstration
console.log('📋 Test 5: Vérification des données de démonstration');

async function testDemoData() {
  try {
    const [projectsResponse, coursesResponse, jobsResponse] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/projects?select=id,title`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }),
      fetch(`${SUPABASE_URL}/rest/v1/courses?select=id,title`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }),
      fetch(`${SUPABASE_URL}/rest/v1/jobs?select=id,title`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      })
    ]);

    const [projectsData, coursesData, jobsData] = await Promise.all([
      projectsResponse.ok ? projectsResponse.json() : [],
      coursesResponse.ok ? coursesResponse.json() : [],
      jobsResponse.ok ? jobsResponse.json() : []
    ]);

    console.log('✅ Données de démonstration:');
    console.log(`   - Projets: ${projectsData.length}`);
    console.log(`   - Cours: ${coursesData.length}`);
    console.log(`   - Emplois: ${jobsData.length}`);

    if (projectsData.length > 0) {
      console.log('   - Exemple de projet:', projectsData[0].title);
    }

    return projectsData.length > 0 && coursesData.length > 0 && jobsData.length > 0;
  } catch (error) {
    console.log('❌ Erreur lors de la vérification des données:', error.message);
    return false;
  }
}

// Test 6: Test de performance
console.log('📋 Test 6: Test de performance');

async function testPerformance() {
  const startTime = performance.now();
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id&limit=10`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    if (response.ok) {
      console.log(`✅ Requête exécutée en ${duration.toFixed(2)}ms`);
      
      if (duration < 500) {
        console.log('✅ Performance excellente (< 500ms)');
      } else if (duration < 1000) {
        console.log('✅ Performance acceptable (< 1s)');
      } else {
        console.log('⚠️  Performance à améliorer (> 1s)');
      }
      
      return duration < 1000;
    } else {
      console.log('❌ Erreur lors du test de performance');
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur lors du test de performance:', error.message);
    return false;
  }
}

// Exécution de tous les tests
async function runAllTests() {
  console.log('🚀 Démarrage des tests de connexion...');
  console.log('');

  const results = {
    connection: await testConnection(),
    tables: await testTables(),
    modules: await testModules(),
    permissions: await testPermissions(),
    demoData: await testDemoData(),
    performance: await testPerformance()
  };

  console.log('');
  console.log('='.repeat(60));
  console.log('📊 RÉSULTATS DES TESTS');
  console.log('='.repeat(60));

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSÉ' : 'ÉCHOUÉ'}`);
  });

  console.log('');
  console.log(`📈 Score: ${passedTests}/${totalTests} tests passés`);

  if (passedTests === totalTests) {
    console.log('🎉 TOUS LES TESTS SONT PASSÉS !');
    console.log('✅ Votre base de données EcosystIA est prête !');
    console.log('');
    console.log('🚀 PROCHAINES ÉTAPES:');
    console.log('1. Créer votre premier utilisateur super administrateur');
    console.log('2. Tester l\'application avec: npm run dev');
    console.log('3. Vérifier les permissions dans le Super Admin');
  } else {
    console.log('⚠️  CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('');
    console.log('🔧 ACTIONS REQUISES:');
    if (!results.connection) {
      console.log('- Vérifiez vos variables d\'environnement Supabase');
    }
    if (!results.tables) {
      console.log('- Exécutez le fichier database/schema.sql');
    }
    if (!results.modules) {
      console.log('- Exécutez le fichier database/seed_data.sql');
    }
    if (!results.permissions) {
      console.log('- Vérifiez la configuration des permissions');
    }
    if (!results.demoData) {
      console.log('- Vérifiez l\'insertion des données de démonstration');
    }
  }

  console.log('');
  console.log('📖 Documentation complète: GUIDE_CONFIGURATION_DATABASE.md');
  console.log('🔗 Dashboard Supabase: https://supabase.com/dashboard');
  console.log('');
  console.log('✨ Tests terminés !');
}

// Démarrer les tests si le script est exécuté directement
if (typeof window === 'undefined') {
  // Node.js environment
  runAllTests().catch(console.error);
} else {
  // Browser environment
  window.testDatabaseConnection = runAllTests;
  console.log('💡 Pour exécuter les tests, appelez: testDatabaseConnection()');
}
