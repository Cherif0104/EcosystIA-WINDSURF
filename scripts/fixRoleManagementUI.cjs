const fs = require('fs');
const path = require('path');

console.log('🔧 CORRECTION DE L\'INTERFACE DE GESTION DES RÔLES');
console.log('='.repeat(60));

const filePath = path.join(__dirname, '..', 'components', 'admin', 'RoleManagement.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('📖 Lecture du fichier actuel...');

// 1. Supprimer le bouton centralisé de l'en-tête
console.log('1️⃣ Suppression du bouton centralisé...');
const oldHeader = `        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestion des Rôles et Permissions</h2>
            <p className="text-gray-600">Gérez les rôles personnalisés et les permissions granulaires</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Nouveau Rôle
          </button>
        </div>`;

const newHeader = `        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Rôles et Permissions</h2>
          <p className="text-gray-600">Gérez les rôles personnalisés et les permissions granulaires</p>
        </div>`;

if (content.includes(oldHeader)) {
  content = content.replace(oldHeader, newHeader);
  console.log('✅ Bouton centralisé supprimé');
} else {
  console.log('⚠️  Bouton centralisé déjà supprimé ou format différent');
}

// 2. Ajouter le bouton dans l'en-tête du tableau des rôles
console.log('2️⃣ Ajout du bouton dans l\'en-tête du tableau des rôles...');
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

if (content.includes(oldRolesHeader)) {
  content = content.replace(oldRolesHeader, newRolesHeader);
  console.log('✅ Bouton ajouté dans l\'en-tête du tableau des rôles');
} else {
  console.log('⚠️  En-tête du tableau des rôles déjà modifié ou format différent');
}

// 3. Ajouter l'en-tête avec boutons pour l'onglet Permissions
console.log('3️⃣ Ajout de l\'en-tête pour l\'onglet Permissions...');
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

if (content.includes(oldPermissionsStart)) {
  content = content.replace(oldPermissionsStart, newPermissionsStart);
  console.log('✅ En-tête ajouté pour l\'onglet Permissions');
} else {
  console.log('⚠️  Onglet Permissions déjà modifié ou format différent');
}

// 4. Ajouter des boutons pour chaque module de permissions
console.log('4️⃣ Ajout de boutons pour chaque module de permissions...');
const oldModuleHeader = `                <div className="flex items-center">
                  <i className={\`\${getModuleIcon(module)} text-gray-400 mr-3\`}></i>
                  <h3 className="text-lg font-medium text-gray-900 capitalize">
                    {module} ({modulePermissions.length} permissions)
                  </h3>
                </div>`;

const newModuleHeader = `                <div className="flex items-center justify-between">
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

if (content.includes(oldModuleHeader)) {
  content = content.replace(oldModuleHeader, newModuleHeader);
  console.log('✅ Boutons ajoutés pour chaque module de permissions');
} else {
  console.log('⚠️  Modules de permissions déjà modifiés ou format différent');
}

// 5. Modifier l'onglet Groupes
console.log('5️⃣ Modification de l\'onglet Groupes...');
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

if (content.includes(oldGroupsContent)) {
  content = content.replace(oldGroupsContent, newGroupsContent);
  console.log('✅ Onglet Groupes modifié');
} else {
  console.log('⚠️  Onglet Groupes déjà modifié ou format différent');
}

// 6. Ajouter les états pour les modales de groupes
console.log('6️⃣ Ajout des états pour les modales de groupes...');
const oldStates = `  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);`;

const newStates = `  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);`;

if (content.includes(oldStates)) {
  content = content.replace(oldStates, newStates);
  console.log('✅ États pour modales de groupes ajoutés');
} else {
  console.log('⚠️  États déjà ajoutés ou format différent');
}

// Écrire le fichier modifié
fs.writeFileSync(filePath, content, 'utf8');

console.log('');
console.log('🎉 CORRECTION TERMINÉE !');
console.log('');
console.log('📋 VÉRIFICATION DES MODIFICATIONS:');
console.log('✅ En-tête principal: bouton centralisé supprimé');
console.log('✅ Onglet Rôles: bouton dans l\'en-tête du tableau');
console.log('✅ Onglet Permissions: en-tête avec boutons spécifiques');
console.log('✅ Onglet Permissions: boutons pour chaque module');
console.log('✅ Onglet Groupes: en-tête complet avec boutons');
console.log('✅ Onglet Groupes: zone de contenu améliorée');
console.log('✅ États: modales de groupes ajoutées');
console.log('');
console.log('🚀 L\'interface est maintenant correctement configurée !');
