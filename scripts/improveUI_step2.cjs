const fs = require('fs');
const path = require('path');

console.log('🎨 AMÉLIORATION UI - ÉTAPE 2: Onglet Rôles');
console.log('='.repeat(50));

const filePath = path.join(__dirname, '..', 'components', 'admin', 'RoleManagement.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 2. Ajouter le bouton dans l'en-tête du tableau des rôles
console.log('Ajout du bouton dans l\'en-tête du tableau des rôles...');
const oldRolesHeader = `          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Liste des Rôles</h3>
          </div>`;

const newRolesHeader = `          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Liste des Rôles</h3>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <i className="fas fa-plus mr-2"></i>
              Nouveau Rôle
            </button>
          </div>`;

content = content.replace(oldRolesHeader, newRolesHeader);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Onglet Rôles modifié !');
