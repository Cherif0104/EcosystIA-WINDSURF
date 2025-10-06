const fs = require('fs');
const path = require('path');

console.log('🚀 MIGRATION VERS MVP SENEGEL - DÉMARRAGE');
console.log('==========================================');

// 1. Sauvegarder la version actuelle
console.log('📦 Sauvegarde de la version actuelle...');
const backupDir = './backup_' + new Date().toISOString().split('T')[0];
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Fichiers à sauvegarder
const filesToBackup = [
  'App.tsx',
  'components/Sidebar.tsx',
  'components/Dashboard.tsx',
  'package.json'
];

filesToBackup.forEach(file => {
  if (fs.existsSync(file)) {
    const backupPath = path.join(backupDir, path.basename(file));
    fs.copyFileSync(file, backupPath);
    console.log(`✅ ${file} sauvegardé vers ${backupPath}`);
  }
});

// 2. Remplacer par les versions MVP SENEGEL
console.log('\n🔄 Remplacement par les versions MVP SENEGEL...');

const mvpFiles = [
  {
    source: 'App_MVP_SENEGEL.tsx',
    target: 'App.tsx',
    description: 'Application principale MVP'
  },
  {
    source: 'components/Sidebar_MVP_SENEGEL.tsx',
    target: 'components/Sidebar.tsx',
    description: 'Navigation MVP'
  },
  {
    source: 'components/Dashboard_MVP_SENEGEL.tsx',
    target: 'components/Dashboard.tsx',
    description: 'Tableau de bord MVP'
  }
];

mvpFiles.forEach(({ source, target, description }) => {
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, target);
    console.log(`✅ ${description} installé`);
  } else {
    console.log(`❌ ${source} non trouvé`);
  }
});

// 3. Mettre à jour package.json pour MVP SENEGEL
console.log('\n📝 Mise à jour du package.json...');
const packageJsonPath = './package.json';
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Mise à jour des métadonnées pour MVP SENEGEL
  packageJson.name = 'senegel-workflow-mvp';
  packageJson.description = 'MVP SENEGEL WorkFlow - Plateforme de gestion de projets';
  packageJson.version = '1.0.0-mvp';
  
  // Ajouter des scripts MVP
  packageJson.scripts = {
    ...packageJson.scripts,
    'dev:mvp': 'vite --mode mvp',
    'build:mvp': 'vite build --mode mvp',
    'preview:mvp': 'vite preview --mode mvp'
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json mis à jour pour MVP SENEGEL');
}

// 4. Créer un fichier de configuration MVP
console.log('\n⚙️ Création de la configuration MVP...');
const mvpConfig = {
  name: 'SENEGEL WorkFlow MVP',
  version: '1.0.0',
  description: 'Version MVP conforme aux exigences SENEGEL',
  features: [
    'Gestion de projets simplifiée',
    'Gestion de tâches basique',
    'Tableau de bord essentiel',
    'Authentification utilisateur',
    'Rôles utilisateur (admin, user, viewer)',
    'Interface responsive'
  ],
  architecture: {
    frontend: 'React + TypeScript + Vite',
    styling: 'Tailwind CSS',
    state: 'React Hooks',
    auth: 'Supabase',
    deployment: 'VPS Ready'
  },
  modules: [
    'Dashboard',
    'Projets',
    'Tâches',
    'Profil utilisateur',
    'ARVA Assistant'
  ],
  roles: {
    admin: ['Tous les modules', 'Gestion utilisateurs'],
    user: ['Projets', 'Tâches', 'Profil'],
    viewer: ['Dashboard', 'Profil']
  }
};

fs.writeFileSync('./mvp-config.json', JSON.stringify(mvpConfig, null, 2));
console.log('✅ Configuration MVP créée');

// 5. Créer un README MVP
console.log('\n📚 Création du README MVP...');
const mvpReadme = `# SENEGEL WorkFlow MVP

## Description
Version MVP conforme aux exigences de l'entreprise SENEGEL. Cette version se concentre sur les fonctionnalités essentielles de gestion de projets et de tâches.

## Fonctionnalités MVP
- ✅ Tableau de bord simplifié
- ✅ Gestion de projets basique
- ✅ Gestion de tâches
- ✅ Authentification utilisateur
- ✅ Système de rôles (admin, user, viewer)
- ✅ Interface responsive
- ✅ Assistant ARVA intégré

## Architecture
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentification**: Supabase
- **Déploiement**: VPS Ready

## Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

## Déploiement
\`\`\`bash
npm run build
# Déployer le dossier dist/ sur votre VPS
\`\`\`

## Rôles utilisateur
- **Admin**: Accès complet à tous les modules
- **User**: Gestion des projets et tâches
- **Viewer**: Consultation uniquement

## Support
Pour toute question concernant le MVP SENEGEL, contactez l'équipe de développement.
`;

fs.writeFileSync('./README-MVP.md', mvpReadme);
console.log('✅ README MVP créé');

// 6. Nettoyer les fichiers temporaires
console.log('\n🧹 Nettoyage des fichiers temporaires...');
const tempFiles = [
  'App_MVP_SENEGEL.tsx',
  'components/Sidebar_MVP_SENEGEL.tsx',
  'components/Dashboard_MVP_SENEGEL.tsx'
];

tempFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`🗑️ ${file} supprimé`);
  }
});

console.log('\n🎉 MIGRATION MVP SENEGEL TERMINÉE !');
console.log('=====================================');
console.log('✅ Version MVP installée et configurée');
console.log('✅ Sauvegarde créée dans:', backupDir);
console.log('✅ Configuration MVP disponible');
console.log('✅ README MVP créé');
console.log('\n🚀 Vous pouvez maintenant lancer: npm run dev');
console.log('📦 Pour déployer: npm run build');
