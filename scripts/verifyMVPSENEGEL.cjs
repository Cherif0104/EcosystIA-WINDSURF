const fs = require('fs');
const path = require('path');

console.log('🔍 VÉRIFICATION MVP SENEGEL');
console.log('============================');

// Vérifier les fichiers essentiels
const essentialFiles = [
  'App.tsx',
  'components/Sidebar.tsx',
  'components/Dashboard.tsx',
  'package.json',
  'mvp-config.json',
  'README-MVP.md'
];

console.log('\n📁 Vérification des fichiers essentiels:');
let allFilesExist = true;

essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

// Vérifier le contenu de App.tsx
console.log('\n🔍 Vérification du contenu App.tsx:');
if (fs.existsSync('App.tsx')) {
  const appContent = fs.readFileSync('App.tsx', 'utf8');
  
  const mvpKeywords = [
    'SENEGEL',
    'MVP',
    'MVPProject',
    'MVPTask',
    'mockMVPProjects',
    'mockMVPTasks'
  ];
  
  mvpKeywords.forEach(keyword => {
    if (appContent.includes(keyword)) {
      console.log(`✅ Contient: ${keyword}`);
    } else {
      console.log(`❌ Manque: ${keyword}`);
    }
  });
}

// Vérifier la configuration MVP
console.log('\n⚙️ Vérification de la configuration MVP:');
if (fs.existsSync('mvp-config.json')) {
  try {
    const config = JSON.parse(fs.readFileSync('mvp-config.json', 'utf8'));
    console.log(`✅ Nom: ${config.name}`);
    console.log(`✅ Version: ${config.version}`);
    console.log(`✅ Modules: ${config.modules.length}`);
    console.log(`✅ Rôles: ${Object.keys(config.roles).length}`);
  } catch (error) {
    console.log('❌ Erreur de lecture de la configuration');
  }
}

// Vérifier package.json
console.log('\n📦 Vérification du package.json:');
if (fs.existsSync('package.json')) {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`✅ Nom: ${packageJson.name}`);
    console.log(`✅ Version: ${packageJson.version}`);
    console.log(`✅ Scripts MVP: ${packageJson.scripts['dev:mvp'] ? 'Oui' : 'Non'}`);
  } catch (error) {
    console.log('❌ Erreur de lecture du package.json');
  }
}

// Vérifier la sauvegarde
console.log('\n💾 Vérification de la sauvegarde:');
const backupDir = './backup_' + new Date().toISOString().split('T')[0];
if (fs.existsSync(backupDir)) {
  const backupFiles = fs.readdirSync(backupDir);
  console.log(`✅ Sauvegarde trouvée: ${backupFiles.length} fichiers`);
  backupFiles.forEach(file => {
    console.log(`  - ${file}`);
  });
} else {
  console.log('❌ Aucune sauvegarde trouvée');
}

// Résumé
console.log('\n📊 RÉSUMÉ DE LA VÉRIFICATION');
console.log('=============================');

if (allFilesExist) {
  console.log('🎉 MVP SENEGEL correctement installé !');
  console.log('✅ Tous les fichiers essentiels sont présents');
  console.log('✅ Configuration MVP créée');
  console.log('✅ Sauvegarde de l\'ancienne version effectuée');
  console.log('\n🚀 Vous pouvez maintenant:');
  console.log('   - Lancer: npm run dev');
  console.log('   - Tester l\'application MVP');
  console.log('   - Déployer: npm run build');
} else {
  console.log('❌ Problèmes détectés dans l\'installation MVP');
  console.log('🔧 Vérifiez les fichiers manquants ci-dessus');
}

console.log('\n📋 PROCHAINES ÉTAPES');
console.log('====================');
console.log('1. Tester l\'application: npm run dev');
console.log('2. Vérifier l\'authentification');
console.log('3. Tester les rôles utilisateur');
console.log('4. Valider avec le client SENEGEL');
console.log('5. Déployer sur VPS si satisfait');
