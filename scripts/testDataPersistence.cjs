const fs = require('fs');
const path = require('path');

console.log('🧪 TEST DE PERSISTANCE DES DONNÉES ECOSYSTIA');
console.log('============================================');

// Fonction pour analyser un fichier
function analyzeFile(filePath, componentName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier l'utilisation de genericDatabaseService
    const usesGenericService = content.includes('genericDatabaseService');
    const usesOldService = (content.includes('databaseService.create') || 
                          content.includes('databaseService.update') || 
                          content.includes('databaseService.delete') || 
                          content.includes('databaseService.getAll')) &&
                          !content.includes('// Import legacy service');
    
    // Vérifier l'utilisation de useDataSync
    const usesDataSync = content.includes('useDataSync');
    
    // Vérifier les gestionnaires d'événements
    const hasCreateHandler = content.includes('handleCreate') || content.includes('createWithSync');
    const hasUpdateHandler = content.includes('handleEdit') || content.includes('updateWithSync');
    const hasDeleteHandler = content.includes('handleDelete') || content.includes('deleteWithSync');
    const hasExportHandler = content.includes('handleExport');
    const hasImportHandler = content.includes('handleImport');
    
    // Vérifier les commentaires de rafraîchissement
    const hasRefreshComments = content.includes('Rafraîchir les données');
    const hasActualRefresh = content.includes('refreshData') || content.includes('refreshTable');
    
    return {
      componentName,
      usesGenericService,
      usesOldService,
      usesDataSync,
      hasCreateHandler,
      hasUpdateHandler,
      hasDeleteHandler,
      hasExportHandler,
      hasImportHandler,
      hasRefreshComments,
      hasActualRefresh,
      status: usesGenericService && usesDataSync && hasActualRefresh ? '✅ CORRECT' : '❌ INCORRECT'
    };
  } catch (error) {
    return {
      componentName,
      error: error.message,
      status: '❌ ERREUR'
    };
  }
}

// Composants à analyser
const componentsToTest = [
  'Projects.tsx',
  'CRM.tsx',
  'Finance.tsx',
  'Goals.tsx',
  'KnowledgeBase.tsx',
  'Jobs.tsx',
  'Courses.tsx',
  'Dashboard.tsx',
  'GenAILab.tsx',
  'AICoach.tsx'
];

console.log('\n📊 ANALYSE DES COMPOSANTS');
console.log('==========================');

let totalComponents = 0;
let correctComponents = 0;
let incorrectComponents = 0;
let errorComponents = 0;

const results = [];

componentsToTest.forEach(componentName => {
  const filePath = path.join('components', componentName);
  
  if (fs.existsSync(filePath)) {
    const result = analyzeFile(filePath, componentName);
    results.push(result);
    totalComponents++;
    
    console.log(`\n🔍 ${componentName}:`);
    console.log(`   Status: ${result.status}`);
    
    if (result.error) {
      console.log(`   Erreur: ${result.error}`);
      errorComponents++;
    } else {
      console.log(`   Generic Service: ${result.usesGenericService ? '✅' : '❌'}`);
      console.log(`   Old Service: ${result.usesOldService ? '❌' : '✅'}`);
      console.log(`   Data Sync: ${result.usesDataSync ? '✅' : '⚠️'}`);
      console.log(`   Create Handler: ${result.hasCreateHandler ? '✅' : '❌'}`);
      console.log(`   Update Handler: ${result.hasUpdateHandler ? '✅' : '❌'}`);
      console.log(`   Delete Handler: ${result.hasDeleteHandler ? '✅' : '❌'}`);
      console.log(`   Export Handler: ${result.hasExportHandler ? '✅' : '❌'}`);
      console.log(`   Import Handler: ${result.hasImportHandler ? '✅' : '❌'}`);
      console.log(`   Refresh Comments: ${result.hasRefreshComments ? '✅' : '❌'}`);
      console.log(`   Actual Refresh: ${result.hasActualRefresh ? '✅' : '❌'}`);
      
      if (result.status === '✅ CORRECT') {
        correctComponents++;
      } else {
        incorrectComponents++;
      }
    }
  } else {
    console.log(`\n❌ ${componentName}: Fichier non trouvé`);
    errorComponents++;
  }
});

// Vérifier les services
console.log('\n🔧 ANALYSE DES SERVICES');
console.log('========================');

const servicesToCheck = [
  'services/genericDatabaseService.ts',
  'services/dataSyncService.ts',
  'hooks/useDataSync.ts'
];

servicesToCheck.forEach(servicePath => {
  if (fs.existsSync(servicePath)) {
    console.log(`✅ ${servicePath}: Présent`);
  } else {
    console.log(`❌ ${servicePath}: Manquant`);
  }
});

// Résumé final
console.log('\n📈 RÉSUMÉ FINAL');
console.log('================');

const correctPercentage = totalComponents > 0 ? Math.round((correctComponents / totalComponents) * 100) : 0;

console.log(`Total composants analysés: ${totalComponents}`);
console.log(`Composants corrects: ${correctComponents} (${correctPercentage}%)`);
console.log(`Composants incorrects: ${incorrectComponents}`);
console.log(`Composants avec erreurs: ${errorComponents}`);

if (correctPercentage >= 90) {
  console.log('\n🎉 EXCELLENT! La persistance des données est bien configurée.');
} else if (correctPercentage >= 70) {
  console.log('\n✅ BON! Quelques améliorations nécessaires.');
} else if (correctPercentage >= 50) {
  console.log('\n⚠️ MOYEN! Des corrections importantes sont nécessaires.');
} else {
  console.log('\n❌ CRITIQUE! La persistance des données nécessite une refonte complète.');
}

// Recommandations
console.log('\n💡 RECOMMANDATIONS');
console.log('===================');

if (incorrectComponents > 0) {
  console.log('1. Corriger les composants qui utilisent encore databaseService');
  console.log('2. Remplacer tous les appels par genericDatabaseService');
}

if (results.some(r => r.hasRefreshComments && !r.hasActualRefresh)) {
  console.log('3. Implémenter le rafraîchissement réel des données');
  console.log('4. Utiliser le hook useDataSync pour la synchronisation');
}

if (results.some(r => !r.usesDataSync)) {
  console.log('5. Intégrer useDataSync dans tous les composants');
  console.log('6. Remplacer les gestionnaires manuels par les fonctions synchronisées');
}

console.log('\n🧪 Test de persistance terminé !');
