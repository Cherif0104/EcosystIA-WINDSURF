const fs = require('fs');
const path = require('path');

console.log('🎨 AMÉLIORATION UI - ÉTAPE 7: Modale de création de groupe');
console.log('='.repeat(50));

const filePath = path.join(__dirname, '..', 'components', 'admin', 'RoleManagement.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 7. Ajouter la modale de création de groupe
console.log('Ajout de la modale de création de groupe...');
const oldModalsEnd = `      {/* Affichage des erreurs */}
      {error && (`;`;

const newModalsEnd = '      {isCreateGroupModalOpen && (' +
  '\n        <CreateGroupModal' +
  '\n          isOpen={isCreateGroupModalOpen}' +
  '\n          onClose={() => setIsCreateGroupModalOpen(false)}' +
  '\n          onCreate={() => {' +
  '\n            setIsCreateGroupModalOpen(false);' +
  '\n            // TODO: Implémenter la création de groupe' +
  '\n          }}' +
  '\n        />' +
  '\n      )}' +
  '\n\n      {/* Affichage des erreurs */}' +
  '\n      {error && (';

content = content.replace(oldModalsEnd, newModalsEnd);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Modale de création de groupe ajoutée !');
