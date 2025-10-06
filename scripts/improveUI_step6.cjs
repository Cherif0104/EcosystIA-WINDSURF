const fs = require('fs');
const path = require('path');

console.log('🎨 AMÉLIORATION UI - ÉTAPE 6: États pour modales');
console.log('='.repeat(50));

const filePath = path.join(__dirname, '..', 'components', 'admin', 'RoleManagement.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 6. Ajouter les états pour les modales de groupes
console.log('Ajout des états pour les modales de groupes...');
const oldStates = `  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);`;

const newStates = `  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);`;

content = content.replace(oldStates, newStates);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ États pour modales ajoutés !');
