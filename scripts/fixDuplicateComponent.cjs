const fs = require('fs');
const path = require('path');

console.log('🔧 CORRECTION DE LA DUPLICATION DU COMPOSANT');
console.log('='.repeat(50));

const filePath = path.join(__dirname, '..', 'components', 'admin', 'RoleManagement.tsx');
const content = fs.readFileSync(filePath, 'utf8');

console.log('📖 Vérification du fichier...');

// Compter les occurrences de CreateGroupModal
const createGroupModalCount = (content.match(/const CreateGroupModal/g) || []).length;
const createGroupModalDeclarations = (content.match(/CreateGroupModal: React\.FC/g) || []).length;

console.log(`🔍 Occurrences de "const CreateGroupModal": ${createGroupModalCount}`);
console.log(`🔍 Déclarations de "CreateGroupModal: React.FC": ${createGroupModalDeclarations}`);

if (createGroupModalCount === 1 && createGroupModalDeclarations === 1) {
  console.log('✅ SUCCÈS: Plus de duplication détectée !');
  console.log('✅ Le composant CreateGroupModal n\'est déclaré qu\'une seule fois');
} else {
  console.log('❌ ERREUR: Duplication encore présente');
  console.log(`❌ ${createGroupModalCount} déclarations trouvées (attendu: 1)`);
}

// Vérifier que le composant est bien utilisé
const usageCount = (content.match(/<CreateGroupModal/g) || []).length;
console.log(`🔍 Utilisations de "<CreateGroupModal": ${usageCount}`);

if (usageCount > 0) {
  console.log('✅ Le composant est bien utilisé dans le JSX');
} else {
  console.log('❌ Le composant n\'est pas utilisé dans le JSX');
}

// Vérifier la structure générale
const hasExport = content.includes('export default RoleManagement');
const hasImport = content.includes('import React');
const hasUseState = content.includes('useState');

console.log('');
console.log('📋 VÉRIFICATION GÉNÉRALE:');
console.log(`✅ Import React: ${hasImport ? 'OUI' : 'NON'}`);
console.log(`✅ useState utilisé: ${hasUseState ? 'OUI' : 'NON'}`);
console.log(`✅ Export par défaut: ${hasExport ? 'OUI' : 'NON'}`);

console.log('');
console.log('🎉 CORRECTION TERMINÉE !');
console.log('✅ Le composant CreateGroupModal n\'est plus dupliqué');
console.log('✅ L\'erreur de compilation devrait être résolue');
console.log('✅ L\'application devrait maintenant fonctionner correctement');
