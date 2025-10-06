const fs = require('fs');
const path = require('path');

console.log('🎯 TEST DE LA GESTION DES RÔLES');
console.log('===============================\n');

const componentsPath = path.join(__dirname, '../components');
const constantsPath = path.join(__dirname, '../constants');

console.log('📊 ANALYSE DE LA GESTION DES RÔLES');
console.log('==================================\n');

// Vérifier les rôles dans mockUsers
const dataPath = path.join(constantsPath, 'data.ts');
if (fs.existsSync(dataPath)) {
  console.log('✅ data.ts: Présent');
  
  const content = fs.readFileSync(dataPath, 'utf8');
  
  // Extraire tous les rôles définis dans mockUsers
  const roleMatches = content.match(/role:\s*['"`]([^'"`]+)['"`]/g);
  const definedRoles = roleMatches ? roleMatches.map(match => {
    const roleMatch = match.match(/role:\s*['"`]([^'"`]+)['"`]/);
    return roleMatch ? roleMatch[1] : null;
  }).filter(Boolean) : [];
  
  console.log(`📋 Rôles définis dans mockUsers (${definedRoles.length}):`);
  definedRoles.forEach((role, index) => {
    console.log(`   ${index + 1}. '${role}'`);
  });
  console.log('');
  
  // Vérifier les rôles uniques
  const uniqueRoles = [...new Set(definedRoles)];
  console.log(`📊 Rôles uniques: ${uniqueRoles.length}`);
  uniqueRoles.forEach((role, index) => {
    console.log(`   ${index + 1}. '${role}'`);
  });
  console.log('');
  
} else {
  console.log('❌ data.ts: MANQUANT\n');
}

// Vérifier les rôles dans roleColors.ts
const roleColorsPath = path.join(constantsPath, 'roleColors.ts');
if (fs.existsSync(roleColorsPath)) {
  console.log('✅ roleColors.ts: Présent');
  
  const content = fs.readFileSync(roleColorsPath, 'utf8');
  
  // Extraire tous les rôles définis dans ROLE_COLORS
  const roleMatches = content.match(/^\s*(\w+):\s*\{/gm);
  const definedRoles = roleMatches ? roleMatches.map(match => match.trim().replace(':', '')) : [];
  
  console.log(`📋 Rôles définis dans ROLE_COLORS (${definedRoles.length}):`);
  definedRoles.forEach((role, index) => {
    console.log(`   ${index + 1}. '${role}'`);
  });
  console.log('');
  
} else {
  console.log('❌ roleColors.ts: MANQUANT\n');
}

// Vérifier les rôles dans Login.tsx
const loginPath = path.join(componentsPath, 'Login.tsx');
if (fs.existsSync(loginPath)) {
  console.log('✅ Login.tsx: Présent');
  
  const content = fs.readFileSync(loginPath, 'utf8');
  
  // Extraire tous les rôles dans les options
  const optionMatches = content.match(/value="([^"]+)"/g);
  const optionRoles = optionMatches ? optionMatches.map(match => {
    const valueMatch = match.match(/value="([^"]+)"/);
    return valueMatch ? valueMatch[1] : null;
  }).filter(Boolean) : [];
  
  console.log(`📋 Rôles dans Login.tsx (${optionRoles.length}):`);
  optionRoles.forEach((role, index) => {
    console.log(`   ${index + 1}. '${role}'`);
  });
  console.log('');
  
  // Vérifier le rôle par défaut
  const defaultRoleMatch = content.match(/useState<Role>\('([^']+)'\)/);
  const defaultRole = defaultRoleMatch ? defaultRoleMatch[1] : 'non trouvé';
  console.log(`🎯 Rôle par défaut: '${defaultRole}'`);
  
} else {
  console.log('❌ Login.tsx: MANQUANT\n');
}

// Vérifier la correspondance entre les rôles
console.log('🔍 VÉRIFICATION DE LA CORRESPONDANCE');
console.log('====================================\n');

// Lire les rôles de data.ts
const dataContent = fs.readFileSync(dataPath, 'utf8');
const dataRoleMatches = dataContent.match(/role:\s*['"`]([^'"`]+)['"`]/g);
const dataRoles = dataRoleMatches ? dataRoleMatches.map(match => {
  const roleMatch = match.match(/role:\s*['"`]([^'"`]+)['"`]/);
  return roleMatch ? roleMatch[1] : null;
}).filter(Boolean) : [];

// Lire les rôles de roleColors.ts
const roleColorsContent = fs.readFileSync(roleColorsPath, 'utf8');
const roleColorsMatches = roleColorsContent.match(/^\s*(\w+):\s*\{/gm);
const roleColorsRoles = roleColorsMatches ? roleColorsMatches.map(match => match.trim().replace(':', '')) : [];

// Lire les rôles de Login.tsx
const loginContent = fs.readFileSync(loginPath, 'utf8');
const loginOptionMatches = loginContent.match(/value="([^"]+)"/g);
const loginRoles = loginOptionMatches ? loginOptionMatches.map(match => {
  const valueMatch = match.match(/value="([^"]+)"/);
  return valueMatch ? valueMatch[1] : null;
}).filter(Boolean) : [];

// Vérifier les correspondances
const dataRolesUnique = [...new Set(dataRoles)];
const roleColorsRolesUnique = [...new Set(roleColorsRoles)];
const loginRolesUnique = [...new Set(loginRoles)];

console.log(`📊 Rôles dans data.ts: ${dataRolesUnique.length}`);
console.log(`📊 Rôles dans roleColors.ts: ${roleColorsRolesUnique.length}`);
console.log(`📊 Rôles dans Login.tsx: ${loginRolesUnique.length}\n`);

// Vérifier les rôles manquants
const missingInRoleColors = dataRolesUnique.filter(role => !roleColorsRolesUnique.includes(role));
const missingInLogin = dataRolesUnique.filter(role => !loginRolesUnique.includes(role));
const missingInData = roleColorsRolesUnique.filter(role => !dataRolesUnique.includes(role));

if (missingInRoleColors.length > 0) {
  console.log(`❌ Rôles manquants dans roleColors.ts: ${missingInRoleColors.length}`);
  missingInRoleColors.forEach(role => console.log(`   • '${role}'`));
  console.log('');
}

if (missingInLogin.length > 0) {
  console.log(`❌ Rôles manquants dans Login.tsx: ${missingInLogin.length}`);
  missingInLogin.forEach(role => console.log(`   • '${role}'`));
  console.log('');
}

if (missingInData.length > 0) {
  console.log(`❌ Rôles manquants dans data.ts: ${missingInData.length}`);
  missingInData.forEach(role => console.log(`   • '${role}'`));
  console.log('');
}

// Vérifier le rôle par défaut
const defaultRoleMatch = loginContent.match(/useState<Role>\('([^']+)'\)/);
const defaultRole = defaultRoleMatch ? defaultRoleMatch[1] : 'non trouvé';

if (dataRolesUnique.includes(defaultRole)) {
  console.log(`✅ Rôle par défaut '${defaultRole}' trouvé dans data.ts`);
} else {
  console.log(`❌ Rôle par défaut '${defaultRole}' NON trouvé dans data.ts`);
  console.log(`   Rôles disponibles: ${dataRolesUnique.join(', ')}`);
}

console.log('\n📈 RÉSUMÉ FINAL');
console.log('================\n');

const allRolesMatch = missingInRoleColors.length === 0 && missingInLogin.length === 0 && missingInData.length === 0;
const defaultRoleExists = dataRolesUnique.includes(defaultRole);

if (allRolesMatch && defaultRoleExists) {
  console.log('🎉 EXCELLENT! Gestion des rôles parfaite !\n');
  console.log('✨ CORRESPONDANCE PARFAITE:');
  console.log('===========================');
  console.log(`• ${dataRolesUnique.length} rôles cohérents`);
  console.log(`• Rôle par défaut valide`);
  console.log(`• Toutes les correspondances OK\n`);
  
  console.log('🚀 PRÊT POUR TOUS LES RÔLES !');
} else {
  console.log('❌ ATTENTION! Des corrections sont nécessaires.\n');
  console.log('🔧 ACTIONS REQUISES:');
  console.log('===================');
  if (missingInRoleColors.length > 0) {
    console.log('1. Ajouter les rôles manquants dans roleColors.ts');
  }
  if (missingInLogin.length > 0) {
    console.log('2. Ajouter les rôles manquants dans Login.tsx');
  }
  if (missingInData.length > 0) {
    console.log('3. Ajouter les rôles manquants dans data.ts');
  }
  if (!defaultRoleExists) {
    console.log('4. Corriger le rôle par défaut dans Login.tsx');
  }
}

console.log('\n🧪 Test de la gestion des rôles terminé !');
