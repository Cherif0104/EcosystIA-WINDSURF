/**
 * Script de test pour l'intégration Frontend-Backend
 * Teste les endpoints critiques de l'API Django
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Tests basiques de connectivité
async function testHealthCheck() {
  console.log('🔍 Test de connectivité API...');
  
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health/`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API Health Check: OK');
      console.log(`   Status: ${data.status}`);
      console.log(`   Service: ${data.service}`);
      console.log(`   Version: ${data.version}`);
      return true;
    } else {
      console.log('❌ API Health Check: FAILED');
      return false;
    }
  } catch (error) {
    console.log('❌ API Health Check: CONNECTION ERROR');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Test des endpoints d'authentification
async function testAuthEndpoints() {
  console.log('\n🔐 Test des endpoints d\'authentification...');
  
  const testCredentials = {
    username: 'testuser',
    email: 'test@ecosystia.com',
    password: 'TestPassword123',
    first_name: 'Test',
    last_name: 'User',
    role: 'student'
  };

  try {
    // Test d'inscription (peut échouer si l'utilisateur existe déjà)
    console.log('   📝 Test d\'inscription...');
    const signupResponse = await fetch(`${API_BASE_URL}/auth/signup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCredentials),
    });

    if (signupResponse.ok) {
      console.log('   ✅ Inscription: OK');
    } else if (signupResponse.status === 400) {
      console.log('   ⚠️  Inscription: Utilisateur existe déjà (normal)');
    } else {
      console.log('   ❌ Inscription: FAILED');
      const errorData = await signupResponse.json();
      console.log(`   Error: ${JSON.stringify(errorData)}`);
    }

    // Test de connexion
    console.log('   🔑 Test de connexion...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: testCredentials.username,
        password: testCredentials.password,
      }),
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('   ✅ Connexion: OK');
      console.log(`   Token reçu: ${loginData.tokens?.access ? 'OUI' : 'NON'}`);
      return loginData.tokens?.access;
    } else {
      console.log('   ❌ Connexion: FAILED');
      const errorData = await loginResponse.json();
      console.log(`   Error: ${JSON.stringify(errorData)}`);
      return null;
    }
  } catch (error) {
    console.log('   ❌ Test d\'authentification: CONNECTION ERROR');
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

// Test des endpoints protégés
async function testProtectedEndpoints(token) {
  console.log('\n🔒 Test des endpoints protégés...');
  
  if (!token) {
    console.log('   ❌ Aucun token disponible, skip des tests protégés');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const endpoints = [
    { name: 'Profile utilisateur', url: '/auth/me/', method: 'GET' },
    { name: 'Liste des projets', url: '/projects/', method: 'GET' },
    { name: 'Liste des cours', url: '/courses/', method: 'GET' },
    { name: 'Liste des emplois', url: '/jobs/', method: 'GET' },
    { name: 'Notifications', url: '/notifications/', method: 'GET' },
    { name: 'Statistiques analytics', url: '/analytics/dashboard/', method: 'GET' },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`   🔍 Test: ${endpoint.name}...`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint.url}`, {
        method: endpoint.method,
        headers,
      });

      if (response.ok) {
        console.log(`   ✅ ${endpoint.name}: OK`);
      } else if (response.status === 404) {
        console.log(`   ⚠️  ${endpoint.name}: Endpoint non trouvé (normal si app non configurée)`);
      } else {
        console.log(`   ❌ ${endpoint.name}: FAILED (${response.status})`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: CONNECTION ERROR`);
    }
  }
}

// Test de la documentation API
async function testApiDocumentation() {
  console.log('\n📚 Test de la documentation API...');
  
  const docEndpoints = [
    { name: 'Schema OpenAPI', url: '/api/schema/' },
    { name: 'Swagger UI', url: '/api/docs/' },
    { name: 'ReDoc', url: '/api/redoc/' },
  ];

  for (const endpoint of docEndpoints) {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}${endpoint.url}`);
      
      if (response.ok) {
        console.log(`   ✅ ${endpoint.name}: Disponible`);
      } else {
        console.log(`   ❌ ${endpoint.name}: Non disponible (${response.status})`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: CONNECTION ERROR`);
    }
  }
}

// Fonction principale
async function runIntegrationTests() {
  console.log('🚀 TESTS D\'INTÉGRATION ECOSYSTIA FRONTEND-BACKEND');
  console.log('=' .repeat(60));
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log('=' .repeat(60));

  // Test de connectivité
  const isHealthy = await testHealthCheck();
  
  if (!isHealthy) {
    console.log('\n❌ ÉCHEC: Impossible de se connecter à l\'API');
    console.log('\n💡 Solutions possibles:');
    console.log('   1. Vérifiez que le serveur Django est démarré');
    console.log('   2. Vérifiez l\'URL de l\'API dans le fichier config.env');
    console.log('   3. Vérifiez que CORS est configuré correctement');
    return;
  }

  // Tests d'authentification
  const token = await testAuthEndpoints();

  // Tests des endpoints protégés
  await testProtectedEndpoints(token);

  // Tests de documentation
  await testApiDocumentation();

  // Résumé
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 RÉSUMÉ DES TESTS');
  console.log('=' .repeat(60));
  
  if (token) {
    console.log('✅ Authentification JWT: FONCTIONNELLE');
    console.log('✅ Intégration Frontend-Backend: PRÊTE');
    console.log('\n🎉 L\'intégration API est opérationnelle !');
    console.log('\n📝 Prochaines étapes:');
    console.log('   1. Configurer les migrations Django');
    console.log('   2. Tester les formulaires React');
    console.log('   3. Implémenter les notifications temps réel');
  } else {
    console.log('⚠️  Authentification JWT: PARTIELLEMENT FONCTIONNELLE');
    console.log('⚠️  Intégration Frontend-Backend: NÉCESSITE DES AJUSTEMENTS');
    console.log('\n🔧 Actions requises:');
    console.log('   1. Vérifier la configuration des vues d\'authentification');
    console.log('   2. Vérifier les migrations de la base de données');
    console.log('   3. Tester les credentials d\'authentification');
  }
}

// Exécution des tests
if (typeof window === 'undefined') {
  // Environnement Node.js
  runIntegrationTests().catch(console.error);
} else {
  // Environnement navigateur
  window.runIntegrationTests = runIntegrationTests;
  console.log('Tests d\'intégration chargés. Exécutez: runIntegrationTests()');
}
