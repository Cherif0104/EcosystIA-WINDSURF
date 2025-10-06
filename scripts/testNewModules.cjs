const fs = require('fs');
const path = require('path');

console.log('🧪 Test des nouveaux modules EcosystIA...\n');

// Vérifier l'existence des nouveaux composants
const newModules = [
  'components/CRM.tsx',
  'components/CourseManagement.tsx', 
  'components/Analytics.tsx',
  'components/UserManagement.tsx',
  'components/Settings.tsx',
  'components/Goals.tsx',
  'components/TimeTracking.tsx'
];

console.log('📁 Vérification des fichiers des nouveaux modules:');
let allModulesExist = true;

newModules.forEach(module => {
  if (fs.existsSync(module)) {
    console.log(`✅ ${module} - Existe`);
  } else {
    console.log(`❌ ${module} - Manquant`);
    allModulesExist = false;
  }
});

// Vérifier les imports dans App.tsx
console.log('\n📦 Vérification des imports dans App.tsx:');
const appContent = fs.readFileSync('App.tsx', 'utf8');

const requiredImports = [
  'import CRM from \'./components/CRM\';',
  'import CourseManagement from \'./components/CourseManagement\';',
  'import Analytics from \'./components/Analytics\';',
  'import UserManagement from \'./components/UserManagement\';',
  'import Settings from \'./components/Settings\';',
  'import Goals from \'./components/Goals\';',
  'import TimeTracking from \'./components/TimeTracking\';'
];

let allImportsExist = true;
requiredImports.forEach(importStatement => {
  if (appContent.includes(importStatement)) {
    console.log(`✅ ${importStatement}`);
  } else {
    console.log(`❌ ${importStatement}`);
    allImportsExist = false;
  }
});

// Vérifier les routes dans App.tsx
console.log('\n🛣️  Vérification des routes dans App.tsx:');
const requiredRoutes = [
  'case \'crm_sales\':',
  'case \'course_management\':',
  'case \'analytics\':',
  'case \'user_management\':',
  'case \'settings\':',
  'case \'goals_okrs\':',
  'case \'time_tracking\':'
];

let allRoutesExist = true;
requiredRoutes.forEach(route => {
  if (appContent.includes(route)) {
    console.log(`✅ ${route}`);
  } else {
    console.log(`❌ ${route}`);
    allRoutesExist = false;
  }
});

// Vérifier la navigation dans Sidebar.tsx
console.log('\n🧭 Vérification de la navigation dans Sidebar.tsx:');
const sidebarContent = fs.readFileSync('components/Sidebar.tsx', 'utf8');

const requiredNavItems = [
  '\'crm_sales\'',
  '\'course_management\'',
  '\'analytics\'',
  '\'user_management\'',
  '\'settings\'',
  '\'goals_okrs\'',
  '\'time_tracking\''
];

let allNavItemsExist = true;
requiredNavItems.forEach(navItem => {
  if (sidebarContent.includes(navItem)) {
    console.log(`✅ ${navItem}`);
  } else {
    console.log(`❌ ${navItem}`);
    allNavItemsExist = false;
  }
});

// Vérifier les fonctionnalités spéciales
console.log('\n🎯 Vérification des fonctionnalités spéciales:');

// Vérifier le formatage FCFA
const fcfAComponents = ['CRM.tsx', 'Finance.tsx', 'CourseManagement.tsx'];
let fcfASupport = true;
fcfAComponents.forEach(component => {
  const content = fs.readFileSync(`components/${component}`, 'utf8');
  if (content.includes('formatFCFA') || content.includes('XOF')) {
    console.log(`✅ ${component} - Support FCFA`);
  } else {
    console.log(`❌ ${component} - Pas de support FCFA`);
    fcfASupport = false;
  }
});

// Vérifier les permissions
console.log('\n🔐 Vérification du système de permissions:');
const permissionComponents = ['CRM.tsx', 'CourseManagement.tsx', 'UserManagement.tsx', 'Settings.tsx'];
let permissionSupport = true;
permissionComponents.forEach(component => {
  const content = fs.readFileSync(`components/${component}`, 'utf8');
  if (content.includes('checkPermission')) {
    console.log(`✅ ${component} - Permissions intégrées`);
  } else {
    console.log(`❌ ${component} - Pas de permissions`);
    permissionSupport = false;
  }
});

// Résumé final
console.log('\n📊 RÉSUMÉ DU TEST:');
console.log('==================');

if (allModulesExist) {
  console.log('✅ Tous les modules sont créés');
} else {
  console.log('❌ Certains modules sont manquants');
}

if (allImportsExist) {
  console.log('✅ Tous les imports sont présents dans App.tsx');
} else {
  console.log('❌ Certains imports sont manquants dans App.tsx');
}

if (allRoutesExist) {
  console.log('✅ Toutes les routes sont configurées dans App.tsx');
} else {
  console.log('❌ Certaines routes sont manquantes dans App.tsx');
}

if (allNavItemsExist) {
  console.log('✅ Tous les éléments de navigation sont présents dans Sidebar.tsx');
} else {
  console.log('❌ Certains éléments de navigation sont manquants dans Sidebar.tsx');
}

if (fcfASupport) {
  console.log('✅ Support FCFA intégré');
} else {
  console.log('❌ Support FCFA incomplet');
}

if (permissionSupport) {
  console.log('✅ Système de permissions intégré');
} else {
  console.log('❌ Système de permissions incomplet');
}

const overallSuccess = allModulesExist && allImportsExist && allRoutesExist && allNavItemsExist && fcfASupport && permissionSupport;

console.log('\n🎉 RÉSULTAT FINAL:');
if (overallSuccess) {
  console.log('✅ TOUS LES NOUVEAUX MODULES SONT PRÊTS !');
  console.log('🚀 EcosystIA est maintenant complet avec tous les modules développés.');
} else {
  console.log('❌ Des corrections sont nécessaires avant de pouvoir utiliser tous les modules.');
}

console.log('\n📋 Modules développés:');
console.log('• CRM & Sales - Gestion de la relation client');
console.log('• Course Management - Administration pédagogique');
console.log('• Analytics - Tableaux de bord et analyses');
console.log('• User Management - Gestion des utilisateurs');
console.log('• Settings - Configuration du système');
console.log('• Goals (OKRs) - Suivi des objectifs');
console.log('• Time Tracking - Suivi du temps');

console.log('\n✨ Fonctionnalités spéciales:');
console.log('• Formatage FCFA pour le marché sénégalais');
console.log('• Système de permissions granulaire');
console.log('• Interface adaptée au contexte local');
console.log('• Intégration avec ARVA (IA)');