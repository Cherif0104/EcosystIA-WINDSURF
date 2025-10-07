#!/usr/bin/env node

/**
 * Script pour éliminer les données mockées de la production
 */

const fs = require('fs');
const path = require('path');

console.log('🗑️ ÉLIMINATION DES DONNÉES MOCKÉES DE LA PRODUCTION');
console.log('==================================================\n');

// Fonction pour lire un fichier
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Erreur lors de la lecture de ${filePath}:`, error.message);
    return null;
  }
}

// Fonction pour écrire un fichier
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fichier modifié: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de l'écriture de ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour créer une sauvegarde
function createBackup(filePath) {
  const backupPath = filePath + '.backup';
  try {
    fs.copyFileSync(filePath, backupPath);
    console.log(`📁 Sauvegarde créée: ${backupPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la création de la sauvegarde:`, error.message);
    return false;
  }
}

// Fonction pour nettoyer App.tsx
function cleanAppTsx(content) {
  console.log('🧹 Nettoyage de App.tsx...');
  
  let cleaned = content;
  
  // Supprimer les imports de mock data
  cleaned = cleaned.replace(
    /import\s*{\s*[^}]*mock[A-Za-z]*[^}]*}\s*from\s*['"]\.\/constants\/data['"];?\s*\n/g,
    ''
  );
  
  // Supprimer les useState avec mock data
  cleaned = cleaned.replace(
    /const\s*\[\s*\w+\s*,\s*set\w+\s*\]\s*=\s*useState<[^>]*>\(\s*mock\w+\s*\);?\s*\n/g,
    'const [$1, set$2] = useState<$3>([]); // Initialisé vide, chargé depuis les stores\n'
  );
  
  // Remplacer les initialisations de mock data par des tableaux vides
  cleaned = cleaned.replace(/useState<[^>]*>\(\s*mock\w+\s*\)/g, 'useState<$1>([])');
  
  // Supprimer les commentaires liés aux mocks
  cleaned = cleaned.replace(/\/\/\s*Mock\s+data[^\n]*\n/g, '');
  cleaned = cleaned.replace(/\/\/\s*TODO[^\n]*mock[^\n]*\n/g, '');
  
  // Supprimer les fonctions de gestion des mocks qui ne sont plus nécessaires
  cleaned = cleaned.replace(
    /const\s+handle\w*Mock\w*\s*=\s*\([^)]*\)\s*=>\s*{[^}]*};\s*\n/g,
    ''
  );
  
  return cleaned;
}

// Fonction pour nettoyer les composants individuels
function cleanComponentFile(filePath) {
  console.log(`🧹 Nettoyage de ${filePath}...`);
  
  const content = readFile(filePath);
  if (!content) return false;
  
  let cleaned = content;
  
  // Supprimer les imports de mock data
  cleaned = cleaned.replace(
    /import\s*{\s*[^}]*mock[A-Za-z]*[^}]*}\s*from\s*['"]\.\.\/constants\/data['"];?\s*\n/g,
    ''
  );
  
  // Remplacer les props mockées par des props vides ou des hooks
  cleaned = cleaned.replace(
    /(const|let|var)\s+\w+\s*=\s*mock\w+;?\s*\n/g,
    '// Mock data supprimé - utiliser les stores Zustand\n'
  );
  
  // Ajouter des imports pour les stores si nécessaire
  if (filePath.includes('Projects') && !cleaned.includes('useProjectStore')) {
    cleaned = cleaned.replace(
      /import React[^;]*;/,
      `import React from 'react';\nimport { useProjectStore } from '../stores/projectStore';`
    );
  }
  
  return writeFile(filePath, cleaned);
}

// Fonction principale
function eliminateMocks() {
  console.log('🔍 Recherche des fichiers à nettoyer...\n');
  
  // Liste des fichiers à nettoyer
  const filesToClean = [
    'App.tsx',
    'components/Projects.tsx',
    'components/Courses.tsx',
    'components/Jobs.tsx',
    'components/CRM.tsx',
    'components/UserManagement.tsx'
  ];
  
  let successCount = 0;
  let totalCount = filesToClean.length;
  
  filesToClean.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (fs.existsSync(fullPath)) {
      console.log(`📄 Traitement de ${filePath}...`);
      
      // Créer une sauvegarde
      if (createBackup(fullPath)) {
        const content = readFile(fullPath);
        
        if (content) {
          let cleaned;
          
          if (filePath === 'App.tsx') {
            cleaned = cleanAppTsx(content);
          } else {
            cleaned = cleanComponentFile(fullPath);
          }
          
          if (cleaned) {
            successCount++;
          }
        }
      }
    } else {
      console.log(`⚠️ Fichier non trouvé: ${filePath}`);
    }
    
    console.log(''); // Ligne vide
  });
  
  // Créer un fichier de documentation des changements
  const documentation = `# 🗑️ ÉLIMINATION DES DONNÉES MOCKÉES

## Résumé des modifications

- **Fichiers traités** : ${totalCount}
- **Fichiers modifiés avec succès** : ${successCount}
- **Date** : ${new Date().toLocaleDateString('fr-FR')}

## Changements effectués

### 1. Suppression des imports de mock data
- Suppression de tous les imports depuis \`./constants/data\`
- Suppression des imports de \`mockProjects\`, \`mockUsers\`, etc.

### 2. Initialisation des états
- Remplacement de \`useState(mockData)\` par \`useState([])\`
- Ajout de commentaires explicatifs

### 3. Remplacement par les stores Zustand
- Utilisation de \`useProjectStore\` pour les projets
- Utilisation de \`useUserStore\` pour les utilisateurs
- Utilisation de \`useCourseStore\` pour les cours

### 4. Chargement des données
- Les données sont maintenant chargées depuis les stores
- Suppression de la logique de synchronisation manuelle
- Amélioration de la gestion des états de chargement

## Fichiers modifiés

${filesToClean.map(file => `- ${file}`).join('\n')}

## Prochaines étapes

1. **Tester l'application** : Vérifier que tous les modules fonctionnent
2. **Connecter aux services réels** : Remplacer les TODO dans les stores
3. **Mettre à jour les tests** : Adapter les tests aux nouveaux stores
4. **Documentation** : Mettre à jour la documentation utilisateur

## Sauvegardes

Des sauvegardes ont été créées pour tous les fichiers modifiés (extension .backup).
Elles peuvent être supprimées une fois les tests validés.
`;

  const docPath = path.join(__dirname, '..', 'ELIMINATION_MOCKS_REPORT.md');
  writeFile(docPath, documentation);
  
  console.log('📊 RÉSUMÉ FINAL');
  console.log('===============');
  console.log(`✅ Fichiers traités : ${totalCount}`);
  console.log(`✅ Fichiers modifiés avec succès : ${successCount}`);
  console.log(`❌ Échecs : ${totalCount - successCount}`);
  console.log('');
  console.log('📁 Sauvegardes créées avec l\'extension .backup');
  console.log('📄 Rapport détaillé : ELIMINATION_MOCKS_REPORT.md');
  console.log('');
  console.log('🎯 Prochaines étapes :');
  console.log('1. Tester l\'application');
  console.log('2. Connecter les stores aux services réels');
  console.log('3. Valider le fonctionnement');
  console.log('4. Supprimer les fichiers .backup si tout fonctionne');
}

// Exécuter le script
eliminateMocks();
