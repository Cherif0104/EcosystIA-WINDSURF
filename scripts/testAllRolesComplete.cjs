const fs = require('fs');
const path = require('path');

console.log('🔍 Test complet de TOUS les rôles...\n');

// Lire les fichiers nécessaires
const roleColorsPath = path.join(__dirname, '..', 'constants', 'roleColors.ts');
const dataPath = path.join(__dirname, '..', 'constants', 'data.ts');
const loginPath = path.join(__dirname, '..', 'components', 'Login.tsx');
const dashboardPath = path.join(__dirname, '..', 'components', 'common', 'SimpleModernDashboard.tsx');

const roleColorsContent = fs.readFileSync(roleColorsPath, 'utf8');
const dataContent = fs.readFileSync(dataPath, 'utf8');
const loginContent = fs.readFileSync(loginPath, 'utf8');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

// Extraire tous les rôles définis dans roleColors.ts
const roleMatches = roleColorsContent.match(/(\w+):\s*{[\s\S]*?name:\s*['"`]([^'"`]+)['"`]/g);
const rolesFromColors = roleMatches ? roleMatches.map(match => {
  const keyMatch = match.match(/(\w+):/);
  const nameMatch = match.match(/name:\s*['"`]([^'"`]+)['"`]/);
  return {
    key: keyMatch ? keyMatch[1] : null,
    name: nameMatch ? nameMatch[1] : null
  };
}).filter(role => role.key && role.name) : [];

console.log('📋 Rôles configurés dans roleColors.ts:');
rolesFromColors.forEach((role, index) => {
  console.log(`  ${index + 1}. ${role.key} → "${role.name}"`);
});

// Extraire tous les utilisateurs définis dans data.ts
const userMatches = dataContent.match(/(\w+):\s*{[\s\S]*?role:\s*['"`]([^'"`]+)['"`]/g);
const usersFromData = userMatches ? userMatches.map(match => {
  const keyMatch = match.match(/(\w+):/);
  const roleMatch = match.match(/role:\s*['"`]([^'"`]+)['"`]/);
  return {
    key: keyMatch ? keyMatch[1] : null,
    role: roleMatch ? roleMatch[1] : null
  };
}).filter(user => user.key && user.role) : [];

console.log('\n👥 Utilisateurs définis dans data.ts:');
usersFromData.forEach((user, index) => {
  console.log(`  ${index + 1}. ${user.key} → role: "${user.role}"`);
});

// Extraire tous les rôles dans Login.tsx
const loginRoleMatches = loginContent.match(/value="([^"]+)"/g);
const rolesFromLogin = loginRoleMatches ? loginRoleMatches.map(match => {
  return match.replace('value="', '').replace('"', '');
}).filter(role => role !== 'role') : [];

console.log('\n🔐 Rôles disponibles dans Login.tsx:');
rolesFromLogin.forEach((role, index) => {
  console.log(`  ${index + 1}. ${role}`);
});

// Vérifier la cohérence
console.log('\n🔍 VÉRIFICATION DE COHÉRENCE:');
console.log('================================');

let issues = [];

// 1. Vérifier que tous les rôles de Login.tsx ont une configuration dans roleColors.ts
const missingInColors = rolesFromLogin.filter(role => 
  !rolesFromColors.some(r => r.key === role)
);
if (missingInColors.length > 0) {
  issues.push(`❌ Rôles manquants dans roleColors.ts: ${missingInColors.join(', ')}`);
} else {
  console.log('✅ Tous les rôles de Login.tsx ont une configuration dans roleColors.ts');
}

// 2. Vérifier que tous les rôles de Login.tsx ont un utilisateur dans data.ts
const missingInData = rolesFromLogin.filter(role => 
  !usersFromData.some(u => u.role === role)
);
if (missingInData.length > 0) {
  issues.push(`❌ Rôles manquants dans data.ts: ${missingInData.join(', ')}`);
} else {
  console.log('✅ Tous les rôles de Login.tsx ont un utilisateur dans data.ts');
}

// 3. Vérifier que tous les utilisateurs de data.ts ont une configuration dans roleColors.ts
const missingUserConfigs = usersFromData.filter(user => 
  !rolesFromColors.some(r => r.key === user.role)
);
if (missingUserConfigs.length > 0) {
  issues.push(`❌ Utilisateurs sans configuration de rôle: ${missingUserConfigs.map(u => `${u.key} (${u.role})`).join(', ')}`);
} else {
  console.log('✅ Tous les utilisateurs de data.ts ont une configuration de rôle');
}

// 4. Vérifier que le Dashboard utilise bien roleConfig.name
const dashboardUsesRoleConfig = dashboardContent.includes('{roleConfig.name}');
if (dashboardUsesRoleConfig) {
  console.log('✅ Dashboard utilise roleConfig.name pour l\'affichage des rôles');
} else {
  issues.push('❌ Dashboard n\'utilise pas roleConfig.name');
}

// 5. Vérifier les actions rapides pour tous les rôles
const quickActionsStart = dashboardContent.indexOf('const getQuickActions = (role: string) => {');
const quickActionsEnd = dashboardContent.indexOf('};', quickActionsStart);
const quickActionsSection = dashboardContent.substring(quickActionsStart, quickActionsEnd);

const rolesInQuickActions = rolesFromColors.filter(role => 
  quickActionsSection.includes(`${role.key}:`)
);

console.log(`✅ Actions rapides configurées pour ${rolesInQuickActions.length}/${rolesFromColors.length} rôles`);

if (rolesInQuickActions.length < rolesFromColors.length) {
  const missing = rolesFromColors.filter(role => !rolesInQuickActions.includes(role));
  issues.push(`❌ Actions rapides manquantes pour: ${missing.map(r => r.key).join(', ')}`);
}

// Afficher les résultats
console.log('\n🎯 RÉSULTATS:');
console.log('==============');

if (issues.length === 0) {
  console.log('🎉 EXCELLENT ! Tous les rôles sont correctement configurés !');
  console.log('\n📝 INSTRUCTIONS POUR TESTER:');
  console.log('1. Allez sur http://localhost:5175');
  console.log('2. Testez chaque rôle un par un:');
  rolesFromLogin.forEach((role, index) => {
    const roleConfig = rolesFromColors.find(r => r.key === role);
    const userName = usersFromData.find(u => u.role === role);
    console.log(`   ${index + 1}. Connectez-vous en tant que "${roleConfig?.name || role}"`);
    console.log(`      - Vérifiez que le rôle s'affiche correctement`);
    console.log(`      - Vérifiez les actions rapides spécifiques au rôle`);
  });
  console.log('3. Vérifiez les logs dans la console (F12) pour chaque connexion');
} else {
  console.log('❌ PROBLÈMES DÉTECTÉS:');
  issues.forEach(issue => console.log(`   ${issue}`));
  console.log('\n🔧 CORRECTIONS NÉCESSAIRES:');
  console.log('1. Ajoutez les rôles manquants dans roleColors.ts');
  console.log('2. Ajoutez les utilisateurs manquants dans data.ts');
  console.log('3. Ajoutez les actions rapides manquantes dans SimpleModernDashboard.tsx');
}

console.log(`\n📊 STATISTIQUES:`);
console.log(`   - Rôles dans roleColors.ts: ${rolesFromColors.length}`);
console.log(`   - Utilisateurs dans data.ts: ${usersFromData.length}`);
console.log(`   - Rôles dans Login.tsx: ${rolesFromLogin.length}`);
console.log(`   - Actions rapides configurées: ${rolesInQuickActions.length}`);
console.log(`   - Problèmes détectés: ${issues.length}`);
