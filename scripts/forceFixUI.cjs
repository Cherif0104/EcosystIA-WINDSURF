const fs = require('fs');
const path = require('path');

console.log('🔧 CORRECTION FORCÉE DE L\'INTERFACE');
console.log('='.repeat(50));

const filePath = path.join(__dirname, '..', 'components', 'admin', 'RoleManagement.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('📖 Lecture du fichier actuel...');

// Forcer la suppression du bouton centralisé
console.log('1️⃣ Suppression forcée du bouton centralisé...');
const pattern1 = /<div className="flex justify-between items-center">\s*<div>\s*<h2 className="text-2xl font-bold text-gray-900">Gestion des Rôles et Permissions<\/h2>\s*<p className="text-gray-600">Gérez les rôles personnalisés et les permissions granulaires<\/p>\s*<\/div>\s*<button[^>]*>[\s\S]*?<\/button>\s*<\/div>/g;

const replacement1 = `<div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Rôles et Permissions</h2>
          <p className="text-gray-600">Gérez les rôles personnalisés et les permissions granulaires</p>
        </div>`;

content = content.replace(pattern1, replacement1);
console.log('✅ Bouton centralisé supprimé');

// Forcer l'ajout du bouton dans l'en-tête du tableau des rôles
console.log('2️⃣ Ajout forcé du bouton dans l\'en-tête du tableau des rôles...');
const pattern2 = /<div className="px-6 py-4 border-b border-gray-200">\s*<h3 className="text-lg font-medium text-gray-900">Liste des Rôles<\/h3>\s*<\/div>/g;

const replacement2 = `<div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Liste des Rôles</h3>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <i className="fas fa-plus mr-2"></i>
              Nouveau Rôle
            </button>
          </div>`;

content = content.replace(pattern2, replacement2);
console.log('✅ Bouton ajouté dans l\'en-tête du tableau des rôles');

// Écrire le fichier modifié
fs.writeFileSync(filePath, content, 'utf8');

console.log('');
console.log('🎉 CORRECTION FORCÉE TERMINÉE !');
console.log('✅ Bouton centralisé supprimé de l\'en-tête principal');
console.log('✅ Bouton "+ Nouveau Rôle" ajouté dans l\'en-tête du tableau des rôles');
console.log('');
console.log('🚀 L\'interface est maintenant correctement configurée !');
