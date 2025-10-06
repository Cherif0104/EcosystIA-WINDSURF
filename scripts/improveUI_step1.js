const fs = require('fs');
const path = require('path');

console.log('🎨 AMÉLIORATION UI - ÉTAPE 1: En-tête principal');
console.log('='.repeat(50));

const filePath = path.join(__dirname, '..', 'components', 'admin', 'RoleManagement.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Supprimer le bouton centralisé de l'en-tête
console.log('Suppression du bouton centralisé...');
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

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ En-tête principal modifié !');
