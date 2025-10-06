const http = require('http');

console.log('🧪 TEST DE L\'APPLICATION ECOSYSTIA');
console.log('==================================');

// Test de l'application
const testApp = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5173,
      path: '/',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Application accessible sur http://localhost:5173/`);
        console.log(`📊 Statut HTTP: ${res.statusCode}`);
        console.log(`📏 Taille de la réponse: ${data.length} caractères`);
        
        // Vérifier le contenu
        if (data.includes('EcosystIA')) {
          console.log('✅ Branding EcosystIA détecté');
        } else {
          console.log('⚠️ Branding EcosystIA non détecté');
        }
        
        if (data.includes('SENEGEL')) {
          console.log('✅ Références SENEGEL détectées');
        } else {
          console.log('⚠️ Références SENEGEL non détectées');
        }
        
        if (data.includes('React')) {
          console.log('✅ Application React détectée');
        } else {
          console.log('⚠️ Application React non détectée');
        }
        
        resolve({
          status: res.statusCode,
          size: data.length,
          hasEcosystIA: data.includes('EcosystIA'),
          hasSENEGEL: data.includes('SENEGEL'),
          hasReact: data.includes('React')
        });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Erreur de connexion: ${error.message}`);
      reject(error);
    });
    
    req.on('timeout', () => {
      console.log('❌ Timeout de connexion');
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
};

// Test des modules
const testModules = () => {
  console.log('\n🔍 VÉRIFICATION DES MODULES');
  console.log('============================');
  
  const fs = require('fs');
  const path = require('path');
  
  const modules = [
    'components/Dashboard.tsx',
    'components/Projects.tsx',
    'components/Goals.tsx',
    'components/CRM.tsx',
    'components/Courses.tsx',
    'components/Jobs.tsx',
    'components/TimeTracking.tsx',
    'components/LeaveManagement.tsx',
    'components/Finance.tsx',
    'components/KnowledgeBase.tsx',
    'components/Development.tsx',
    'components/Tools.tsx',
    'components/AICoach.tsx',
    'components/GenAILab.tsx',
    'components/Analytics.tsx',
    'components/UserManagement.tsx',
    'components/Settings.tsx'
  ];
  
  let modulesFound = 0;
  let modulesWithErrors = 0;
  
  modules.forEach(module => {
    if (fs.existsSync(module)) {
      console.log(`✅ ${module} - Présent`);
      modulesFound++;
      
      // Vérifier les imports
      try {
        const content = fs.readFileSync(module, 'utf8');
        if (content.includes('import') && content.includes('from')) {
          console.log(`   📦 Imports détectés`);
        }
        if (content.includes('export')) {
          console.log(`   📤 Exports détectés`);
        }
        if (content.includes('useState') || content.includes('useEffect')) {
          console.log(`   ⚛️ Hooks React détectés`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur de lecture: ${error.message}`);
        modulesWithErrors++;
      }
    } else {
      console.log(`❌ ${module} - Manquant`);
    }
  });
  
  console.log(`\n📊 RÉSULTATS DES MODULES:`);
  console.log(`   ✅ Modules trouvés: ${modulesFound}/${modules.length}`);
  console.log(`   ❌ Modules avec erreurs: ${modulesWithErrors}`);
  console.log(`   📈 Taux de réussite: ${Math.round((modulesFound / modules.length) * 100)}%`);
  
  return { modulesFound, modulesWithErrors, total: modules.length };
};

// Test des services
const testServices = () => {
  console.log('\n🔧 VÉRIFICATION DES SERVICES');
  console.log('=============================');
  
  const fs = require('fs');
  
  const services = [
    'services/geminiService.ts',
    'services/supabaseAuthService.ts',
    'services/userManagementService.ts',
    'services/logService.ts',
    'services/roleManagementService.ts',
    'services/migrationService.ts'
  ];
  
  let servicesFound = 0;
  let servicesWithExports = 0;
  
  services.forEach(service => {
    if (fs.existsSync(service)) {
      console.log(`✅ ${service} - Présent`);
      servicesFound++;
      
      try {
        const content = fs.readFileSync(service, 'utf8');
        if (content.includes('export')) {
          console.log(`   📤 Exports détectés`);
          servicesWithExports++;
        }
        if (content.includes('async') || content.includes('function')) {
          console.log(`   ⚙️ Fonctions détectées`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur de lecture: ${error.message}`);
      }
    } else {
      console.log(`❌ ${service} - Manquant`);
    }
  });
  
  console.log(`\n📊 RÉSULTATS DES SERVICES:`);
  console.log(`   ✅ Services trouvés: ${servicesFound}/${services.length}`);
  console.log(`   📤 Services avec exports: ${servicesWithExports}`);
  console.log(`   📈 Taux de réussite: ${Math.round((servicesFound / services.length) * 100)}%`);
  
  return { servicesFound, servicesWithExports, total: services.length };
};

// Test des contextes
const testContexts = () => {
  console.log('\n🎯 VÉRIFICATION DES CONTEXTES');
  console.log('==============================');
  
  const fs = require('fs');
  
  const contexts = [
    'contexts/AuthContext.tsx',
    'contexts/LocalizationContext.tsx'
  ];
  
  let contextsFound = 0;
  
  contexts.forEach(context => {
    if (fs.existsSync(context)) {
      console.log(`✅ ${context} - Présent`);
      contextsFound++;
      
      try {
        const content = fs.readFileSync(context, 'utf8');
        if (content.includes('createContext')) {
          console.log(`   🎯 Context React détecté`);
        }
        if (content.includes('Provider')) {
          console.log(`   🔄 Provider détecté`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur de lecture: ${error.message}`);
      }
    } else {
      console.log(`❌ ${context} - Manquant`);
    }
  });
  
  console.log(`\n📊 RÉSULTATS DES CONTEXTES:`);
  console.log(`   ✅ Contextes trouvés: ${contextsFound}/${contexts.length}`);
  console.log(`   📈 Taux de réussite: ${Math.round((contextsFound / contexts.length) * 100)}%`);
  
  return { contextsFound, total: contexts.length };
};

// Exécution des tests
const runTests = async () => {
  try {
    console.log('🚀 Démarrage des tests...\n');
    
    // Test de l'application
    const appResult = await testApp();
    
    // Test des modules
    const modulesResult = testModules();
    
    // Test des services
    const servicesResult = testServices();
    
    // Test des contextes
    const contextsResult = testContexts();
    
    // Résumé final
    console.log('\n🎉 RÉSUMÉ FINAL');
    console.log('================');
    console.log(`🌐 Application: ${appResult.status === 200 ? '✅ Fonctionnelle' : '❌ Erreur'}`);
    console.log(`📱 Modules: ${modulesResult.modulesFound}/${modulesResult.total} (${Math.round((modulesResult.modulesFound / modulesResult.total) * 100)}%)`);
    console.log(`🔧 Services: ${servicesResult.servicesFound}/${servicesResult.total} (${Math.round((servicesResult.servicesFound / servicesResult.total) * 100)}%)`);
    console.log(`🎯 Contextes: ${contextsResult.contextsFound}/${contextsResult.total} (${Math.round((contextsResult.contextsFound / contextsResult.total) * 100)}%)`);
    
    const overallScore = Math.round((
      (appResult.status === 200 ? 100 : 0) +
      (modulesResult.modulesFound / modulesResult.total) * 100 +
      (servicesResult.servicesFound / servicesResult.total) * 100 +
      (contextsResult.contextsFound / contextsResult.total) * 100
    ) / 4);
    
    console.log(`\n🏆 SCORE GLOBAL: ${overallScore}%`);
    
    if (overallScore >= 80) {
      console.log('🎉 EXCELLENT ! L\'application EcosystIA est prête !');
    } else if (overallScore >= 60) {
      console.log('👍 BIEN ! Quelques améliorations nécessaires.');
    } else {
      console.log('⚠️ ATTENTION ! Des corrections importantes sont nécessaires.');
    }
    
    console.log('\n🚀 Prochaines étapes:');
    console.log('   1. Tester l\'interface utilisateur');
    console.log('   2. Vérifier l\'authentification');
    console.log('   3. Tester les modules un par un');
    console.log('   4. Implémenter les CRUD manquants');
    
  } catch (error) {
    console.log(`❌ Erreur lors des tests: ${error.message}`);
    console.log('\n🔧 Actions suggérées:');
    console.log('   1. Vérifier que l\'application est lancée (npm run dev)');
    console.log('   2. Vérifier le port (5173)');
    console.log('   3. Vérifier les logs de l\'application');
  }
};

runTests();
