const fs = require('fs');
const path = require('path');

console.log('🎨 AMÉLIORATION UI - ÉTAPE 3: Onglet Permissions');
console.log('='.repeat(50));

const filePath = path.join(__dirname, '..', 'components', 'admin', 'RoleManagement.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 3. Ajouter l'en-tête avec boutons pour l'onglet Permissions
console.log('Ajout de l\'en-tête avec boutons pour l\'onglet Permissions...');
const oldPermissionsStart = `      {activeTab === 'permissions' && (
        <div className="space-y-6">`;

const newPermissionsStart = `      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Gestion des Permissions</h3>
              <div className="flex space-x-2">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                  title="Créer une nouvelle permission"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Nouvelle Permission
                </button>
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center"
                  title="Importer des permissions"
                >
                  <i className="fas fa-upload mr-2"></i>
                  Importer
                </button>
              </div>
            </div>
            <p className="text-gray-600">Les permissions sont organisées par modules pour une meilleure gestion</p>
          </div>`;

content = content.replace(oldPermissionsStart, newPermissionsStart);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Onglet Permissions modifié !');
