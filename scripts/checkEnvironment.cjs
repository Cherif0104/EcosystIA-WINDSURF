// Script de vérification de l'environnement EcosystIA
console.log('🔍 VÉRIFICATION ENVIRONNEMENT ECOSYSTIA');
console.log('='.repeat(50));

// Vérification des fichiers critiques
const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'src/lib/supabase.js',
  'services/realtimeService.ts',
  'services/databaseService.ts',
  'hooks/useRealtime.ts',
  'components/common/RealtimeNotifications.tsx',
  'package.json',
  'vite.config.ts'
];

console.log('📁 Vérification des fichiers critiques...');

let allFilesExist = true;
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

// Vérification des imports Supabase
console.log('\n🔗 Vérification des imports Supabase...');

const supabaseFiles = [
  'services/realtimeService.ts',
  'services/databaseService.ts',
  'services/supabaseAuthService.ts',
  'services/roleManagementService.ts',
  'services/userManagementService.ts'
];

let correctImports = 0;
supabaseFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes("from '../src/lib/supabase.js'")) {
      console.log(`✅ ${file} - Import correct`);
      correctImports++;
    } else if (content.includes("from '../lib/supabase'")) {
      console.log(`❌ ${file} - Import incorrect (ancien chemin)`);
    } else {
      console.log(`⚠️  ${file} - Import Supabase non trouvé`);
    }
  }
});

// Résumé
console.log('\n' + '='.repeat(50));
console.log('📊 RÉSUMÉ DE LA VÉRIFICATION');

if (allFilesExist) {
  console.log('✅ Tous les fichiers critiques sont présents');
} else {
  console.log('❌ Certains fichiers critiques sont manquants');
}

console.log(`✅ Imports Supabase corrects: ${correctImports}/${supabaseFiles.length}`);

if (correctImports === supabaseFiles.length) {
  console.log('✅ Tous les imports Supabase sont corrects');
} else {
  console.log('❌ Certains imports Supabase sont incorrects');
}

console.log('\n🚀 PROCHAINES ÉTAPES:');
console.log('1. Vérifiez que le serveur de développement fonctionne');
console.log('2. Ouvrez http://localhost:5173 dans votre navigateur');
console.log('3. Vérifiez que l\'erreur d\'import a disparu');
console.log('4. Testez la connexion Supabase');

console.log('\n✨ Vérification terminée !');
