const fs = require('fs');
const path = require('path');

console.log('🎯 TEST DE CORRESPONDANCE DES VUES');
console.log('==================================\n');

const componentsPath = path.join(__dirname, '../components');
const appPath = path.join(__dirname, '../App.tsx');
const dashboardPath = path.join(componentsPath, 'common', 'SimpleModernDashboard.tsx');

console.log('📊 ANALYSE DES VUES DISPONIBLES DANS APP.TSX');
console.log('============================================\n');

// Extraire les cases du switch dans App.tsx
function extractSwitchCases() {
  try {
    const appContent = fs.readFileSync(appPath, 'utf8');
    
    // Chercher le switch statement
    const switchMatch = appContent.match(/switch\s*\(\s*currentView\s*\)\s*\{([\s\S]*?)\s*default:/);
    if (!switchMatch) {
      console.log('❌ Switch statement non trouvé dans App.tsx');
      return [];
    }
    
    const switchContent = switchMatch[1];
    
    // Extraire tous les case statements
    const caseMatches = switchContent.match(/case\s*['"`]([^'"`]+)['"`]\s*:/g);
    if (!caseMatches) {
      console.log('❌ Aucun case trouvé dans le switch');
      return [];
    }
    
    const cases = caseMatches.map(match => {
      const caseMatch = match.match(/case\s*['"`]([^'"`]+)['"`]\s*:/);
      return caseMatch ? caseMatch[1] : null;
    }).filter(Boolean);
    
    console.log(`✅ Cases trouvés dans App.tsx (${cases.length}):`);
    cases.forEach((caseName, index) => {
      console.log(`   ${index + 1}. '${caseName}'`);
    });
    console.log('');
    
    return cases;
  } catch (error) {
    console.error('❌ Erreur lors de la lecture d\'App.tsx:', error.message);
    return [];
  }
}

// Extraire les vues utilisées dans SimpleModernDashboard
function extractDashboardViews() {
  try {
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    
    // Chercher toutes les vues utilisées
    const viewMatches = dashboardContent.match(/view:\s*['"`]([^'"`]+)['"`]/g);
    if (!viewMatches) {
      console.log('❌ Aucune vue trouvée dans SimpleModernDashboard');
      return [];
    }
    
    const views = viewMatches.map(match => {
      const viewMatch = match.match(/view:\s*['"`]([^'"`]+)['"`]/);
      return viewMatch ? viewMatch[1] : null;
    }).filter(Boolean);
    
    // Supprimer les doublons
    const uniqueViews = [...new Set(views)];
    
    console.log(`✅ Vues utilisées dans SimpleModernDashboard (${uniqueViews.length}):`);
    uniqueViews.forEach((view, index) => {
      console.log(`   ${index + 1}. '${view}'`);
    });
    console.log('');
    
    return uniqueViews;
  } catch (error) {
    console.error('❌ Erreur lors de la lecture de SimpleModernDashboard:', error.message);
    return [];
  }
}

// Vérifier la correspondance
function checkViewMapping(availableCases, usedViews) {
  console.log('🔍 VÉRIFICATION DE LA CORRESPONDANCE');
  console.log('====================================\n');
  
  const validViews = [];
  const invalidViews = [];
  
  usedViews.forEach(view => {
    if (availableCases.includes(view)) {
      validViews.push(view);
      console.log(`✅ '${view}': Valide`);
    } else {
      invalidViews.push(view);
      console.log(`❌ '${view}': INVALIDE - Case manquant dans App.tsx`);
    }
  });
  
  console.log('');
  console.log(`📊 Résumé:`);
  console.log(`   ✅ Vues valides: ${validViews.length}/${usedViews.length}`);
  console.log(`   ❌ Vues invalides: ${invalidViews.length}/${usedViews.length}`);
  
  if (invalidViews.length > 0) {
    console.log(`\n🚨 VUES À CORRIGER:`);
    invalidViews.forEach(view => {
      console.log(`   • '${view}'`);
    });
  }
  
  return { validViews, invalidViews };
}

// Vérifier les vues manquantes dans le Dashboard
function checkMissingViews(availableCases, usedViews) {
  console.log('\n🔍 VUES DISPONIBLES NON UTILISÉES');
  console.log('==================================\n');
  
  const unusedCases = availableCases.filter(caseName => !usedViews.includes(caseName));
  
  if (unusedCases.length > 0) {
    console.log(`📋 Vues disponibles non utilisées (${unusedCases.length}):`);
    unusedCases.forEach((caseName, index) => {
      console.log(`   ${index + 1}. '${caseName}'`);
    });
  } else {
    console.log('✅ Toutes les vues disponibles sont utilisées');
  }
  
  return unusedCases;
}

// Exécuter les tests
const availableCases = extractSwitchCases();
const usedViews = extractDashboardViews();
const { validViews, invalidViews } = checkViewMapping(availableCases, usedViews);
const unusedCases = checkMissingViews(availableCases, usedViews);

console.log('\n📈 RÉSUMÉ FINAL');
console.log('================\n');

if (invalidViews.length === 0) {
  console.log('🎉 EXCELLENT! Toutes les vues correspondent !\n');
  console.log('✨ CORRESPONDANCE PARFAITE:');
  console.log('===========================');
  console.log(`• ${validViews.length} vues valides`);
  console.log(`• 0 vues invalides`);
  console.log(`• Toutes les redirections fonctionneront\n`);
  
  console.log('🚀 PRÊT POUR TOUS LES RÔLES !');
} else {
  console.log('❌ ATTENTION! Des vues nécessitent des corrections.\n');
  console.log('🔧 ACTIONS REQUISES:');
  console.log('===================');
  console.log('1. Corriger les vues invalides dans SimpleModernDashboard.tsx');
  console.log('2. Ou ajouter les cases manquants dans App.tsx');
  console.log('3. Tester les redirections pour chaque rôle\n');
}

console.log('\n🧪 Test de correspondance des vues terminé !');
