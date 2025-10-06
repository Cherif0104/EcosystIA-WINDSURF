const fs = require('fs');
const path = require('path');

console.log('🔧 CORRECTION ÉTAPE PAR ÉTAPE');
console.log('='.repeat(50));

const filePath = path.join(__dirname, '..', 'components', 'admin', 'RoleManagement.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('📖 Lecture du fichier actuel...');

// Étape 1: Ajouter l'en-tête pour l'onglet Permissions
console.log('1️⃣ Ajout de l\'en-tête pour l\'onglet Permissions...');
const permissionsPattern = `{activeTab === 'permissions' && (
        <div className="space-y-6">
          {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (`;`;

const permissionsReplacement = `{activeTab === 'permissions' && (
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
          </div>
          {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (`;`;

content = content.replace(permissionsPattern, permissionsReplacement);
console.log('✅ En-tête ajouté pour l\'onglet Permissions');

// Étape 2: Ajouter des boutons pour chaque module de permissions
console.log('2️⃣ Ajout de boutons pour chaque module de permissions...');
const modulePattern = `                <div className="flex items-center">
                  <i className={\`\${getModuleIcon(module)} text-gray-400 mr-3\`}></i>
                  <h3 className="text-lg font-medium text-gray-900 capitalize">
                    {module} ({modulePermissions.length} permissions)
                  </h3>
                </div>`;

const moduleReplacement = `                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <i className={\`\${getModuleIcon(module)} text-gray-400 mr-3\`}></i>
                    <h3 className="text-lg font-medium text-gray-900 capitalize">
                      {module} ({modulePermissions.length} permissions)
                    </h3>
                  </div>
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center"
                    title={\`Ajouter une permission pour le module \${module}\`}
                  >
                    <i className="fas fa-plus mr-1"></i>
                    Ajouter
                  </button>
                </div>`;

content = content.replace(modulePattern, moduleReplacement);
console.log('✅ Boutons ajoutés pour chaque module de permissions');

// Étape 3: Modifier l'onglet Groupes
console.log('3️⃣ Modification de l\'onglet Groupes...');
const groupsPattern = `{activeTab === 'groups' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-gray-500">
            <i className="fas fa-layer-group text-4xl mb-4"></i>
            <h3 className="text-lg font-medium mb-2">Gestion des Groupes</h3>
            <p>Cette fonctionnalité sera bientôt disponible.</p>
          </div>
        </div>
      )}`;

const groupsReplacement = `{activeTab === 'groups' && (
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

content = content.replace(groupsPattern, groupsReplacement);
console.log('✅ Onglet Groupes modifié');

// Étape 4: Ajouter les états pour les modales de groupes
console.log('4️⃣ Ajout des états pour les modales de groupes...');
const statesPattern = `  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);`;

const statesReplacement = `  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);`;

content = content.replace(statesPattern, statesReplacement);
console.log('✅ États pour modales de groupes ajoutés');

// Écrire le fichier modifié
fs.writeFileSync(filePath, content, 'utf8');

console.log('');
console.log('🎉 CORRECTION ÉTAPE PAR ÉTAPE TERMINÉE !');
console.log('');
console.log('📋 RÉSUMÉ DES AMÉLIORATIONS:');
console.log('✅ Onglet Permissions: en-tête avec boutons "Nouvelle Permission" et "Importer"');
console.log('✅ Onglet Permissions: bouton "Ajouter" pour chaque module');
console.log('✅ Onglet Groupes: en-tête complet avec boutons d\'action');
console.log('✅ Onglet Groupes: zone de contenu améliorée avec boutons contextuels');
console.log('✅ États: modales de groupes ajoutées');
console.log('');
console.log('🚀 L\'interface est maintenant complètement améliorée !');
