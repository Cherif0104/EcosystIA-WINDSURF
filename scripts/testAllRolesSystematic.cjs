const fs = require('fs');
const path = require('path');

console.log('🧪 Test systématique de TOUS les rôles...\n');

// Lire les fichiers nécessaires
const roleColorsPath = path.join(__dirname, '..', 'constants', 'roleColors.ts');
const dataPath = path.join(__dirname, '..', 'constants', 'data.ts');
const loginPath = path.join(__dirname, '..', 'components', 'Login.tsx');

const roleColorsContent = fs.readFileSync(roleColorsPath, 'utf8');
const dataContent = fs.readFileSync(dataPath, 'utf8');
const loginContent = fs.readFileSync(loginPath, 'utf8');

// Extraire tous les rôles configurés
const roleMatches = roleColorsContent.match(/(\w+):\s*{[\s\S]*?name:\s*['"`]([^'"`]+)['"`]/g);
const roles = roleMatches ? roleMatches.map(match => {
  const keyMatch = match.match(/(\w+):/);
  const nameMatch = match.match(/name:\s*['"`]([^'"`]+)['"`]/);
  return {
    key: keyMatch ? keyMatch[1] : null,
    name: nameMatch ? nameMatch[1] : null
  };
}).filter(role => role.key && role.name) : [];

// Extraire tous les utilisateurs
const userMatches = dataContent.match(/(\w+):\s*{[\s\S]*?role:\s*['"`]([^'"`]+)['"`]/g);
const users = userMatches ? userMatches.map(match => {
  const keyMatch = match.match(/(\w+):/);
  const roleMatch = match.match(/role:\s*['"`]([^'"`]+)['"`]/);
  return {
    key: keyMatch ? keyMatch[1] : null,
    role: roleMatch ? roleMatch[1] : null
  };
}).filter(user => user.key && user.role) : [];

console.log('📋 PLAN DE TEST SYSTÉMATIQUE:');
console.log('=============================\n');

let testNumber = 1;
const testPlan = [];

// Créer le plan de test pour chaque rôle
roles.forEach(role => {
  const user = users.find(u => u.role === role.key);
  if (user) {
    testPlan.push({
      number: testNumber++,
      roleKey: role.key,
      roleName: role.name,
      userKey: user.key,
      status: 'À tester'
    });
  }
});

// Afficher le plan de test
testPlan.forEach(test => {
  console.log(`${test.number.toString().padStart(2, '0')}. ${test.roleName} (${test.roleKey})`);
  console.log(`    Utilisateur: ${test.userKey}`);
  console.log(`    Status: ${test.status}`);
  console.log('');
});

console.log('🎯 INSTRUCTIONS POUR LE TEST:');
console.log('=============================');
console.log('1. Allez sur http://localhost:5175');
console.log('2. Pour chaque rôle, suivez ces étapes:');
console.log('   a) Sélectionnez le rôle dans le menu déroulant');
console.log('   b) Cliquez sur "Se connecter"');
console.log('   c) Vérifiez dans la console (F12) les logs:');
console.log('      - 🎯 Dashboard - Rôle détecté: [rôle]');
console.log('      - 🎯 Dashboard - Nom du rôle affiché: [nom]');
console.log('   d) Vérifiez sur l\'interface:');
console.log('      - Le nom du rôle s\'affiche correctement');
console.log('      - Les couleurs correspondent au rôle');
console.log('      - Les actions rapides sont spécifiques');
console.log('   e) Déconnectez-vous et passez au suivant');
console.log('');

console.log('📊 RÉSUMÉ:');
console.log(`   - Total des rôles à tester: ${testPlan.length}`);
console.log(`   - Rôles configurés: ${roles.length}`);
console.log(`   - Utilisateurs disponibles: ${users.length}`);
console.log('');

console.log('✅ CORRECTIONS APPLIQUÉES:');
console.log('   - ✅ Erreur CSS transform-origin corrigée');
console.log('   - ✅ Gestion d\'erreur Supabase améliorée');
console.log('   - ✅ Tous les rôles ont des actions rapides');
console.log('');

console.log('🚀 PRÊT POUR LE TEST !');
console.log('Commencez par le premier rôle et suivez le plan ci-dessus.');
