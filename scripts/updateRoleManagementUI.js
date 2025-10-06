const fs = require('fs');
const path = require('path');

console.log('🎨 MISE À JOUR DE L\'INTERFACE DE GESTION DES RÔLES');
console.log('='.repeat(60));

// Lire le fichier actuel
const filePath = path.join(__dirname, '..', 'components', 'admin', 'RoleManagement.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('📖 Lecture du fichier RoleManagement.tsx...');

// 1. Modifier l'en-tête principal - supprimer le bouton centralisé
console.log('1️⃣ Modification de l\'en-tête principal...');
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

content = content.replace(oldHeader, newHeader);

// 2. Modifier l'onglet Rôles - ajouter le bouton dans l'en-tête du tableau
console.log('2️⃣ Modification de l\'onglet Rôles...');
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

// 3. Modifier l'onglet Permissions - ajouter l'en-tête avec boutons
console.log('3️⃣ Modification de l\'onglet Permissions...');
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

content = content.replace(oldModuleHeader, newModuleHeader);

// 5. Modifier l'onglet Groupes - ajouter l'en-tête avec boutons
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

content = content.replace(oldGroupsContent, newGroupsContent);

// 6. Ajouter les états pour les modales de groupes
console.log('6️⃣ Ajout des états pour les modales de groupes...');
const oldStates = `  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);`;

const newStates = `  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);`;

content = content.replace(oldStates, newStates);

// 7. Ajouter la modale de création de groupe à la fin des modales
console.log('7️⃣ Ajout de la modale de création de groupe...');
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

// 8. Ajouter le composant CreateGroupModal à la fin du fichier
console.log('8️⃣ Ajout du composant CreateGroupModal...');
const oldFileEnd = `export default RoleManagement;`;

const newFileEnd = `const CreateGroupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
}> = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.display_name) {
      onCreate();
      setFormData({ name: '', display_name: '', description: '' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Créer un Nouveau Groupe</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom du groupe</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: marketing_team"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom d'affichage</label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: Équipe Marketing"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Description du groupe..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;`;

content = content.replace(oldFileEnd, newFileEnd);

// Écrire le fichier modifié
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Modifications appliquées avec succès !');
console.log('');
console.log('🎯 RÉSUMÉ DES AMÉLIORATIONS:');
console.log('• En-tête principal simplifié (bouton centralisé supprimé)');
console.log('• Onglet Rôles: bouton "+ Nouveau Rôle" dans l\'en-tête du tableau');
console.log('• Onglet Permissions: en-tête avec boutons "Nouvelle Permission" et "Importer"');
console.log('• Onglet Permissions: bouton "Ajouter" pour chaque module');
console.log('• Onglet Groupes: en-tête complet avec boutons d\'action');
console.log('• Onglet Groupes: zone de contenu améliorée avec boutons contextuels');
console.log('• Modale de création de groupe ajoutée');
console.log('');
console.log('🚀 L\'interface est maintenant plus intuitive et contextuelle !');
