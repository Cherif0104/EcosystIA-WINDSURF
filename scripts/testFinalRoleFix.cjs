const fs = require('fs');
const path = require('path');

console.log('🎯 TEST FINAL DE CORRECTION DES RÔLES');
console.log('=====================================\n');

const componentsPath = path.join(__dirname, '../components');
const constantsPath = path.join(__dirname, '../constants');

console.log('📊 VÉRIFICATION COMPLÈTE DES RÔLES');
console.log('==================================\n');

// 1. Vérifier que tous les rôles ont des utilisateurs
const dataPath = path.join(constantsPath, 'data.ts');
const dataContent = fs.readFileSync(dataPath, 'utf8');
const dataRoleMatches = dataContent.match(/role:\s*['"`]([^'"`]+)['"`]/g);
const dataRoles = dataRoleMatches ? dataRoleMatches.map(match => {
  const roleMatch = match.match(/role:\s*['"`]([^'"`]+)['"`]/);
  return roleMatch ? roleMatch[1] : null;
}).filter(Boolean) : [];
const uniqueDataRoles = [...new Set(dataRoles)];

console.log(`✅ Rôles dans data.ts: ${uniqueDataRoles.length}`);
uniqueDataRoles.forEach((role, index) => {
  console.log(`   ${index + 1}. '${role}'`);
});
console.log('');

// 2. Vérifier que tous les rôles ont des configurations
const roleColorsPath = path.join(constantsPath, 'roleColors.ts');
const roleColorsContent = fs.readFileSync(roleColorsPath, 'utf8');
const roleColorsMatches = roleColorsContent.match(/^\s*(\w+):\s*\{/gm);
const roleColorsRoles = roleColorsMatches ? roleColorsMatches.map(match => match.trim().replace(':', '')) : [];

console.log(`✅ Rôles dans roleColors.ts: ${roleColorsRoles.length}`);
roleColorsRoles.forEach((role, index) => {
  console.log(`   ${index + 1}. '${role}'`);
});
console.log('');

// 3. Vérifier que tous les rôles sont dans Login.tsx
const loginPath = path.join(componentsPath, 'Login.tsx');
const loginContent = fs.readFileSync(loginPath, 'utf8');
const loginOptionMatches = loginContent.match(/value="([^"]+)"/g);
const loginRoles = loginOptionMatches ? loginOptionMatches.map(match => {
  const valueMatch = match.match(/value="([^"]+)"/);
  return valueMatch ? valueMatch[1] : null;
}).filter(Boolean) : [];

console.log(`✅ Rôles dans Login.tsx: ${loginRoles.length}`);
loginRoles.forEach((role, index) => {
  console.log(`   ${index + 1}. '${role}'`);
});
console.log('');

// 4. Vérifier la correspondance
console.log('🔍 VÉRIFICATION DE LA CORRESPONDANCE');
console.log('====================================\n');

const missingInData = roleColorsRoles.filter(role => !uniqueDataRoles.includes(role));
const missingInRoleColors = uniqueDataRoles.filter(role => !roleColorsRoles.includes(role));
const missingInLogin = uniqueDataRoles.filter(role => !loginRoles.includes(role));

if (missingInData.length > 0) {
  console.log(`❌ Rôles manquants dans data.ts: ${missingInData.length}`);
  missingInData.forEach(role => console.log(`   • '${role}'`));
  console.log('');
}

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

// 5. Vérifier le Dashboard
const dashboardPath = path.join(componentsPath, 'common', 'SimpleModernDashboard.tsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

const hasRoleConfig = dashboardContent.includes('getRoleConfig');
const hasUserRole = dashboardContent.includes('user?.role || \'student\'');
const hasDebugLogs = dashboardContent.includes('console.log(\'🎯 Dashboard - Utilisateur actuel:\'');
const hasUseEffect = dashboardContent.includes('useEffect');

console.log('🔧 VÉRIFICATION DU DASHBOARD');
console.log('============================\n');
console.log(`✅ Configuration par rôle: ${hasRoleConfig ? 'Oui' : 'Non'}`);
console.log(`✅ Fallback rôle: ${hasUserRole ? 'Oui' : 'Non'}`);
console.log(`✅ Logs de debug: ${hasDebugLogs ? 'Oui' : 'Non'}`);
console.log(`✅ useEffect pour mise à jour: ${hasUseEffect ? 'Oui' : 'Non'}`);
console.log('');

// 6. Vérifier l'AuthContext
const authContextPath = path.join(componentsPath, '..', 'contexts', 'AuthContext.tsx');
const authContextContent = fs.readFileSync(authContextPath, 'utf8');

const hasLoginFunction = authContextContent.includes('const login = (user: User) => {');
const hasUserState = authContextContent.includes('const [user, setUser] = useState<User | null>(null)');
const hasSessionStorage = authContextContent.includes('sessionStorage.setItem');

console.log('🔧 VÉRIFICATION DE L\'AUTHCONTEXT');
console.log('=================================\n');
console.log(`✅ Fonction login: ${hasLoginFunction ? 'Oui' : 'Non'}`);
console.log(`✅ État utilisateur: ${hasUserState ? 'Oui' : 'Non'}`);
console.log(`✅ SessionStorage: ${hasSessionStorage ? 'Oui' : 'Non'}`);
console.log('');

console.log('📈 RÉSUMÉ FINAL');
console.log('================\n');

const allRolesMatch = missingInData.length === 0 && missingInRoleColors.length === 0 && missingInLogin.length === 0;
const dashboardOk = hasRoleConfig && hasUserRole && hasDebugLogs && hasUseEffect;
const authOk = hasLoginFunction && hasUserState && hasSessionStorage;

if (allRolesMatch && dashboardOk && authOk) {
  console.log('🎉 EXCELLENT! Tous les rôles sont correctement configurés !\n');
  console.log('✨ CONFIGURATION PARFAITE:');
  console.log('==========================');
  console.log(`• ${uniqueDataRoles.length} rôles avec utilisateurs`);
  console.log(`• ${roleColorsRoles.length} rôles avec configurations`);
  console.log(`• ${loginRoles.length} rôles dans Login.tsx`);
  console.log(`• Dashboard avec logs de debug`);
  console.log(`• AuthContext fonctionnel\n`);
  
  console.log('🚀 PRÊT POUR LES TESTS !');
  console.log('========================');
  console.log('1. Ouvrir http://localhost:5175/');
  console.log('2. Sélectionner un rôle (ex: administrator)');
  console.log('3. Cliquer sur "Se connecter"');
  console.log('4. Vérifier les logs dans la console');
  console.log('5. Vérifier que le Dashboard affiche le bon rôle\n');
  
  console.log('🎯 RÔLES À TESTER:');
  console.log('==================');
  console.log('• administrator (Directeur)');
  console.log('• super_administrator (Super Admin)');
  console.log('• alumni (Ancien élève)');
  console.log('• coach (Entraîneur)');
  console.log('• Tous les autres rôles\n');
  
} else {
  console.log('❌ ATTENTION! Des corrections sont nécessaires.\n');
  console.log('🔧 ACTIONS REQUISES:');
  console.log('===================');
  if (!allRolesMatch) {
    console.log('1. Corriger les correspondances de rôles');
  }
  if (!dashboardOk) {
    console.log('2. Corriger le Dashboard');
  }
  if (!authOk) {
    console.log('3. Corriger l\'AuthContext');
  }
}

console.log('\n🧪 Test final de correction des rôles terminé !');
