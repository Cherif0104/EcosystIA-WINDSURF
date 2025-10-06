// Script de vérification de l'environnement EcosystIA
console.log('🔍 VÉRIFICATION ENVIRONNEMENT ECOSYSTIA');
console.log('='.repeat(50));

// Vérification des fichiers critiques
import fs from 'fs';
import path from 'path';

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

// Vérification des variables d'environnement
console.log('\n🔧 Vérification des variables d\'environnement...');

const envFile = '.env.local';
if (fs.existsSync(envFile)) {
  console.log(`✅ ${envFile} existe`);
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY');
  const hasGeminiKey = envContent.includes('VITE_GEMINI_API_KEY');
  
  console.log(`   - VITE_SUPABASE_URL: ${hasSupabaseUrl ? '✅' : '❌'}`);
  console.log(`   - VITE_SUPABASE_ANON_KEY: ${hasSupabaseKey ? '✅' : '❌'}`);
  console.log(`   - VITE_GEMINI_API_KEY: ${hasGeminiKey ? '✅' : '❌'}`);
} else {
  console.log(`❌ ${envFile} manquant`);
  console.log('💡 Créez le fichier .env.local avec vos clés Supabase et Gemini');
}

// Vérification des imports Supabase
console.log('\n🔗 Vérification des imports Supabase...');

const supabaseFiles = [
  'services/realtimeService.ts',
  'services/databaseService.ts',
  'services/supabaseAuthService.ts',
  'services/roleManagementService.ts',
  'services/userManagementService.ts'
];

supabaseFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes("from '../src/lib/supabase.js'")) {
      console.log(`✅ ${file} - Import correct`);
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

console.log('\n🚀 PROCHAINES ÉTAPES:');
console.log('1. Vérifiez que le serveur de développement fonctionne');
console.log('2. Ouvrez http://localhost:5173 dans votre navigateur');
console.log('3. Vérifiez que l\'erreur d\'import a disparu');
console.log('4. Testez la connexion Supabase');

console.log('\n✨ Vérification terminée !');
