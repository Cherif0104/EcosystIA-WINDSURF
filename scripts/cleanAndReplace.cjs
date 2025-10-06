const fs = require('fs');
const path = require('path');

console.log('🧹 NETTOYAGE ET REMPLACEMENT PAR MVP ORIGINAL');
console.log('==============================================');

// 1. Supprimer les fichiers frontend actuels (sauf backend Supabase)
console.log('\n🗑️ Suppression des fichiers frontend actuels...');

const filesToDelete = [
  'App.tsx',
  'components/',
  'constants/data.ts',
  'constants/localization.ts',
  'types.ts',
  'index.html',
  'index.tsx',
  'vite.config.ts',
  'tsconfig.json',
  'package.json',
  'package-lock.json',
  'node_modules/',
  'dist/',
  'backup_2025-10-01/',
  'mvp-config.json',
  'README-MVP.md',
  'GUIDE_DEMO_CLIENT.md',
  'RESUME_EXECUTIF_MVP.md',
  'PLAN_RESTITUTION_MVP_SENEGEL.md'
];

filesToDelete.forEach(file => {
  if (fs.existsSync(file)) {
    if (fs.statSync(file).isDirectory()) {
      fs.rmSync(file, { recursive: true, force: true });
      console.log(`🗑️ Dossier supprimé: ${file}`);
    } else {
      fs.unlinkSync(file);
      console.log(`🗑️ Fichier supprimé: ${file}`);
    }
  }
});

// 2. Copier les fichiers du MVP original
console.log('\n📦 Copie des fichiers MVP original...');

const mvpOriginalDir = './mvp-senegel-original';
const filesToCopy = [
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
  'package.json',
  'README.md',
  'metadata.json'
];

filesToCopy.forEach(file => {
  const srcPath = path.join(mvpOriginalDir, file);
  const destPath = file;
  
  if (fs.existsSync(srcPath)) {
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
      console.log(`📁 Dossier copié: ${file}`);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`📄 Fichier copié: ${file}`);
    }
  } else {
    console.log(`⚠️ ${file} non trouvé dans MVP original`);
  }
});

// 3. Restaurer les services Supabase depuis la sauvegarde
console.log('\n🔄 Restauration des services Supabase...');

const backupDir = './backup_supabase_2025-10-01';
const supabaseFiles = [
  'services/supabaseAuthService.ts',
  'services/userManagementService.ts',
  'services/logService.ts',
  'services/roleManagementService.ts',
  'services/migrationService.ts'
];

supabaseFiles.forEach(file => {
  const srcPath = path.join(backupDir, file);
  const destPath = file;
  
  if (fs.existsSync(srcPath)) {
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Service Supabase restauré: ${file}`);
  } else {
    console.log(`⚠️ ${file} non trouvé dans la sauvegarde`);
  }
});

// 4. Mettre à jour package.json avec les dépendances Supabase
console.log('\n📝 Mise à jour du package.json...');
const packageJsonPath = './package.json';
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Ajouter les dépendances Supabase
  packageJson.dependencies = {
    ...packageJson.dependencies,
    '@supabase/supabase-js': '^2.39.0',
    '@google/genai': '^1.8.0'
  };
  
  // Mettre à jour le nom et la description
  packageJson.name = 'senegel-workflow-original';
  packageJson.description = 'SENEGEL WorkFlow - MVP Original avec Supabase';
  packageJson.version = '1.0.0';
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json mis à jour avec Supabase');
}

// 5. Créer un fichier .env.local pour Supabase
console.log('\n🔧 Création du fichier .env.local...');
const envContent = `# Configuration Supabase pour SENEGEL WorkFlow
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
`;

fs.writeFileSync('.env.local', envContent);
console.log('✅ Fichier .env.local créé');

// 6. Nettoyer le dossier MVP original
console.log('\n🧹 Nettoyage du dossier MVP original...');
fs.rmSync(mvpOriginalDir, { recursive: true, force: true });
console.log('✅ Dossier MVP original supprimé');

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

console.log('\n🎉 RESTRUCTURATION TERMINÉE !');
console.log('=============================');
console.log('✅ MVP original SENEGEL installé');
console.log('✅ Services Supabase intégrés');
console.log('✅ Configuration prête');
console.log('\n🚀 Prochaines étapes:');
console.log('   1. npm install');
console.log('   2. Configurer .env.local');
console.log('   3. npm run dev');
