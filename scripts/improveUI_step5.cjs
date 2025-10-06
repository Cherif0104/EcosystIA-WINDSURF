const fs = require('fs');
const path = require('path');

console.log('🎨 AMÉLIORATION UI - ÉTAPE 5: Onglet Groupes');
console.log('='.repeat(50));

const filePath = path.join(__dirname, '..', 'components', 'admin', 'RoleManagement.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 5. Modifier l'onglet Groupes avec en-tête et boutons
console.log('Modification de l\'onglet Groupes...');
const oldGroupsContent = `      {activeTab === 'groups' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-gray-500">
            <i className="fas fa-layer-group text-4xl mb-4"></i>
            <h3 className="text-lg font-medium mb-2">Gestion des Groupes</h3>
            <p>Cette fonctionnalité sera bientôt disponible.</p>
          </div>
        </div>
      )}`;

const newGroupsContent = `      {activeTab === 'groups' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Gestion des Groupes</h3>
              <p className="text-gray-600">Organisez les utilisateurs en groupes pour faciliter la gestion des permissions</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsCreateGroupModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                Nouveau Groupe
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                title="Importer des groupes"
              >
                <i className="fas fa-upload mr-2"></i>
                Importer
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="text-center text-gray-500">
              <i className="fas fa-layer-group text-4xl mb-4"></i>
              <h3 className="text-lg font-medium mb-2">Gestion des Groupes</h3>
              <p className="mb-4">Cette fonctionnalité sera bientôt disponible.</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setIsCreateGroupModalOpen(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Créer un Groupe
                </button>
                <button
                  className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center"
                >
                  <i className="fas fa-info-circle mr-2"></i>
                  En savoir plus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}`;

content = content.replace(oldGroupsContent, newGroupsContent);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Onglet Groupes modifié !');
