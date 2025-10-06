const fs = require('fs');
const path = require('path');

console.log('🎨 AMÉLIORATION UI - ÉTAPE 4: Boutons pour modules de permissions');
console.log('='.repeat(50));

const filePath = path.join(__dirname, '..', 'components', 'admin', 'RoleManagement.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 4. Ajouter des boutons pour chaque module de permissions
console.log('Ajout de boutons pour chaque module de permissions...');
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

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Boutons pour modules de permissions ajoutés !');
