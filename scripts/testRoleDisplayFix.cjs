const fs = require('fs');
const path = require('path');

console.log('🔍 Test de l\'affichage des rôles dans le Dashboard...\n');

// Vérifier que le dashboard utilise bien roleConfig.name
const dashboardPath = path.join(__dirname, '..', 'components', 'common', 'SimpleModernDashboard.tsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

console.log('✅ Dashboard trouvé:', dashboardPath);

// Vérifier l'utilisation de roleConfig.name
const roleConfigNameUsage = dashboardContent.includes('{roleConfig.name}');
console.log('✅ Utilisation de roleConfig.name:', roleConfigNameUsage ? 'OUI' : 'NON');

// Vérifier les logs de debug
const debugLogs = dashboardContent.includes('console.log(\'🎯 Dashboard - Nom du rôle affiché:\', roleConfig.name)');
console.log('✅ Logs de debug ajoutés:', debugLogs ? 'OUI' : 'NON');

// Vérifier la configuration des rôles
const roleColorsPath = path.join(__dirname, '..', 'constants', 'roleColors.ts');
const roleColorsContent = fs.readFileSync(roleColorsPath, 'utf8');

// Extraire tous les rôles définis
const roleMatches = roleColorsContent.match(/(\w+):\s*{[\s\S]*?name:\s*['"`]([^'"`]+)['"`]/g);
const roles = roleMatches ? roleMatches.map(match => {
  const nameMatch = match.match(/name:\s*['"`]([^'"`]+)['"`]/);
  return nameMatch ? nameMatch[1] : null;
}).filter(Boolean) : [];

console.log('\n📋 Rôles configurés dans roleColors.ts:');
roles.forEach((role, index) => {
  console.log(`  ${index + 1}. ${role}`);
});

// Vérifier que le rôle 'manager' est bien configuré
const managerRole = roleColorsContent.includes('manager:') && roleColorsContent.includes('name: \'Directeur\'');
console.log('\n✅ Rôle Manager configuré:', managerRole ? 'OUI' : 'NON');

// Vérifier les données utilisateur
const dataPath = path.join(__dirname, '..', 'constants', 'data.ts');
const dataContent = fs.readFileSync(dataPath, 'utf8');

const managerUser = dataContent.includes('manager:') && dataContent.includes('role: \'manager\'');
console.log('✅ Utilisateur Manager dans data.ts:', managerUser ? 'OUI' : 'NON');

// Vérifier le login
const loginPath = path.join(__dirname, '..', 'components', 'Login.tsx');
const loginContent = fs.readFileSync(loginPath, 'utf8');

const managerInLogin = loginContent.includes('value="manager"');
console.log('✅ Manager dans Login.tsx:', managerInLogin ? 'OUI' : 'NON');

console.log('\n🎯 RÉSUMÉ:');
console.log('==================');
console.log('✅ Dashboard utilise roleConfig.name:', roleConfigNameUsage ? 'OUI' : 'NON');
console.log('✅ Logs de debug ajoutés:', debugLogs ? 'OUI' : 'NON');
console.log('✅ Rôle Manager configuré:', managerRole ? 'OUI' : 'NON');
console.log('✅ Utilisateur Manager dans data.ts:', managerUser ? 'OUI' : 'NON');
console.log('✅ Manager dans Login.tsx:', managerInLogin ? 'OUI' : 'NON');

const allGood = roleConfigNameUsage && debugLogs && managerRole && managerUser && managerInLogin;
console.log('\n🎉 ÉTAT GÉNÉRAL:', allGood ? 'TOUT EST CORRECT !' : 'PROBLÈMES DÉTECTÉS');

if (allGood) {
  console.log('\n📝 INSTRUCTIONS POUR L\'UTILISATEUR:');
  console.log('1. Videz le cache du navigateur (Ctrl+Shift+Delete)');
  console.log('2. Videz le Local Storage et Session Storage');
  console.log('3. Fermez et rouvrez le navigateur');
  console.log('4. Allez sur http://localhost:5173');
  console.log('5. Connectez-vous en tant que "Directeur" (manager)');
  console.log('6. Vérifiez les logs dans la console (F12)');
  console.log('7. Le rôle devrait maintenant s\'afficher correctement');
}
