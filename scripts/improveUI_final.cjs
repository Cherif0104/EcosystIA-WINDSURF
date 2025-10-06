const fs = require('fs');
const path = require('path');

console.log('🎨 AMÉLIORATION UI - ÉTAPE FINALE: Composant CreateGroupModal');
console.log('='.repeat(50));

const filePath = path.join(__dirname, '..', 'components', 'admin', 'RoleManagement.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Ajouter le composant CreateGroupModal avant l'export
console.log('Ajout du composant CreateGroupModal...');
const oldExport = `export default RoleManagement;`;

const newExport = `const CreateGroupModal: React.FC<{
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

content = content.replace(oldExport, newExport);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Composant CreateGroupModal ajouté !');
console.log('');
console.log('🎉 TOUTES LES AMÉLIORATIONS ONT ÉTÉ APPLIQUÉES !');
console.log('');
console.log('📋 RÉSUMÉ DES MODIFICATIONS:');
console.log('✅ En-tête principal simplifié (bouton centralisé supprimé)');
console.log('✅ Onglet Rôles: bouton "+ Nouveau Rôle" dans l\'en-tête du tableau');
console.log('✅ Onglet Permissions: en-tête avec boutons "Nouvelle Permission" et "Importer"');
console.log('✅ Onglet Permissions: bouton "Ajouter" pour chaque module');
console.log('✅ Onglet Groupes: en-tête complet avec boutons d\'action');
console.log('✅ Onglet Groupes: zone de contenu améliorée avec boutons contextuels');
console.log('✅ États pour modales de groupes ajoutés');
console.log('✅ Composant CreateGroupModal ajouté');
console.log('');
console.log('🚀 L\'interface est maintenant plus intuitive et contextuelle !');
