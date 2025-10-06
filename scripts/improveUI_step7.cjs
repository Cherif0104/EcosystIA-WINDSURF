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

const newModalsEnd = `      {isCreateGroupModalOpen && (
        <CreateGroupModal
          isOpen={isCreateGroupModalOpen}
          onClose={() => setIsCreateGroupModalOpen(false)}
          onCreate={() => {
            setIsCreateGroupModalOpen(false);
            // TODO: Implémenter la création de groupe
          }}
        />
      )}

      {/* Affichage des erreurs */}
      {error && (`;`;

content = content.replace(oldModalsEnd, newModalsEnd);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Modale de création de groupe ajoutée !');
