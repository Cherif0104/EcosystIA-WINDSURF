const fs = require('fs');
const path = require('path');

console.log('🔍 VÉRIFICATION MVP ORIGINAL SENEGEL + SUPABASE');
console.log('===============================================');

// 1. Vérifier les fichiers essentiels du MVP original
console.log('\n📁 Vérification des fichiers MVP original...');
const mvpFiles = [
  'App.tsx',
  'components/',
  'constants/',
  'contexts/',
  'services/',
  'types.ts',
  'index.html',
  'index.tsx',
  'vite.config.ts',
  'tsconfig.json',
  'package.json'
];

let mvpReady = true;
mvpFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    mvpReady = false;
  }
});

// 2. Vérifier les services Supabase
console.log('\n🔐 Vérification des services Supabase...');
const supabaseServices = [
  'services/supabaseAuthService.ts',
  'services/userManagementService.ts',
  'services/logService.ts',
  'services/roleManagementService.ts',
  'services/migrationService.ts'
];

let supabaseReady = true;
supabaseServices.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    supabaseReady = false;
  }
});

// 3. Vérifier le package.json
console.log('\n📦 Vérification du package.json...');
if (fs.existsSync('package.json')) {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`✅ Nom: ${packageJson.name}`);
    console.log(`✅ Version: ${packageJson.version}`);
    console.log(`✅ Description: ${packageJson.description}`);
    
    if (packageJson.dependencies['@supabase/supabase-js']) {
      console.log(`✅ Supabase: ${packageJson.dependencies['@supabase/supabase-js']}`);
    } else {
      console.log('❌ Supabase non trouvé dans les dépendances');
      supabaseReady = false;
    }
    
    if (packageJson.dependencies['@google/genai']) {
      console.log(`✅ Gemini: ${packageJson.dependencies['@google/genai']}`);
    } else {
      console.log('❌ Gemini non trouvé dans les dépendances');
    }
  } catch (error) {
    console.log('❌ Erreur de lecture du package.json');
    mvpReady = false;
  }
}

// 4. Vérifier la structure des composants
console.log('\n🧩 Vérification des composants...');
const components = [
  'components/Login.tsx',
  'components/Signup.tsx',
  'components/Dashboard.tsx',
  'components/Sidebar.tsx',
  'components/Header.tsx',
  'components/Projects.tsx',
  'components/Goals.tsx',
  'components/CRM.tsx',
  'components/Courses.tsx',
  'components/Jobs.tsx',
  'components/AICoach.tsx',
  'components/GenAILab.tsx'
];

let componentsReady = true;
components.forEach(component => {
  if (fs.existsSync(component)) {
    console.log(`✅ ${component}`);
  } else {
    console.log(`❌ ${component} - MANQUANT`);
    componentsReady = false;
  }
});

// 5. Vérifier les contextes
console.log('\n🔄 Vérification des contextes...');
const contexts = [
  'contexts/AuthContext.tsx',
  'contexts/LocalizationContext.tsx'
];

let contextsReady = true;
contexts.forEach(context => {
  if (fs.existsSync(context)) {
    console.log(`✅ ${context}`);
  } else {
    console.log(`❌ ${context} - MANQUANT`);
    contextsReady = false;
  }
});

// 6. Vérifier les constantes
console.log('\n📊 Vérification des constantes...');
const constants = [
  'constants/data.ts',
  'constants/localization.ts'
];

let constantsReady = true;
constants.forEach(constant => {
  if (fs.existsSync(constant)) {
    console.log(`✅ ${constant}`);
  } else {
    console.log(`❌ ${constant} - MANQUANT`);
    constantsReady = false;
  }
});

// Résumé final
console.log('\n📊 RÉSUMÉ DE LA VÉRIFICATION');
console.log('=============================');

if (mvpReady && supabaseReady && componentsReady && contextsReady && constantsReady) {
  console.log('🎉 MVP ORIGINAL SENEGEL + SUPABASE PRÊT !');
  console.log('✅ Tous les fichiers essentiels sont présents');
  console.log('✅ Services Supabase intégrés');
  console.log('✅ Composants MVP original restaurés');
  console.log('✅ Configuration complète');
  console.log('\n🚀 Vous pouvez maintenant:');
  console.log('   1. Configurer .env.local avec vos clés Supabase');
  console.log('   2. Lancer: npm run dev');
  console.log('   3. Tester l\'application MVP + Supabase');
  console.log('   4. Présenter au client SENEGEL');
} else {
  console.log('❌ Problèmes détectés dans l\'installation');
  console.log('🔧 Vérifiez les fichiers manquants ci-dessus');
}

console.log('\n📋 STATUT DES COMPOSANTS:');
console.log(`   MVP Original: ${mvpReady ? '✅' : '❌'}`);
console.log(`   Services Supabase: ${supabaseReady ? '✅' : '❌'}`);
console.log(`   Composants: ${componentsReady ? '✅' : '❌'}`);
console.log(`   Contextes: ${contextsReady ? '✅' : '❌'}`);
console.log(`   Constantes: ${constantsReady ? '✅' : '❌'}`);

console.log('\n📞 PROCHAINES ÉTAPES:');
console.log('1. Configurer les variables d\'environnement');
console.log('2. Tester l\'authentification Supabase');
console.log('3. Valider les fonctionnalités MVP');
console.log('4. Présenter au client SENEGEL');
console.log('5. Collecter les retours pour améliorations');
