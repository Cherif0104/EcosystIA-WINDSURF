const fs = require('fs');
const path = require('path');

console.log('💾 SAUVEGARDE BACKEND SUPABASE');
console.log('==============================');

// Créer le dossier de sauvegarde
const backupDir = './backup_supabase_' + new Date().toISOString().split('T')[0];
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Fichiers backend à sauvegarder
const backendFiles = [
  'contexts/AuthContext.tsx',
  'contexts/LocalizationContext.tsx',
  'services/supabaseAuthService.ts',
  'services/userManagementService.ts',
  'services/logService.ts',
  'services/roleManagementService.ts',
  'services/migrationService.ts',
  'services/geminiService.ts',
  'services/enhancedGeminiService.ts',
  'types/index.ts',
  'constants/data.ts',
  'constants/localization.ts',
  '.env.local',
  'supabase/',
  'scripts/'
];

console.log('📦 Sauvegarde des fichiers backend...');
let savedCount = 0;

backendFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const backupPath = path.join(backupDir, file);
    const backupDirPath = path.dirname(backupPath);
    
    if (!fs.existsSync(backupDirPath)) {
      fs.mkdirSync(backupDirPath, { recursive: true });
    }
    
    if (fs.statSync(file).isDirectory()) {
      // Copier le dossier entier
      copyDir(file, backupPath);
    } else {
      // Copier le fichier
      fs.copyFileSync(file, backupPath);
    }
    
    console.log(`✅ ${file} sauvegardé`);
    savedCount++;
  } else {
    console.log(`⚠️ ${file} non trouvé`);
  }
});

// Fonction pour copier un dossier récursivement
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Créer un fichier de configuration Supabase
const supabaseConfig = {
  project: 'EcosystIA',
  client: 'IMPULCIA AFRIQUE',
  date: new Date().toISOString(),
  version: '1.0.0',
  description: 'Configuration Supabase sauvegardée pour intégration MVP SENEGEL',
  files: backendFiles.filter(f => fs.existsSync(f)),
  savedCount: savedCount
};

fs.writeFileSync(path.join(backupDir, 'supabase-config.json'), JSON.stringify(supabaseConfig, null, 2));

console.log('\n🎉 SAUVEGARDE TERMINÉE !');
console.log('========================');
console.log(`✅ ${savedCount} fichiers/dossiers sauvegardés`);
console.log(`📁 Sauvegarde dans: ${backupDir}`);
console.log('✅ Configuration Supabase préservée');
console.log('✅ Prêt pour intégration MVP SENEGEL');
