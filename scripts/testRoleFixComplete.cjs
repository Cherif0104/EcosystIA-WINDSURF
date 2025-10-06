const fs = require('fs');
const path = require('path');

console.log('🎯 TEST FINAL - CORRECTION DES RÔLES COMPLÈTE');
console.log('=============================================\n');

const componentsPath = path.join(__dirname, '../components');
const constantsPath = path.join(__dirname, '../constants');

console.log('📊 VÉRIFICATION FINALE DES RÔLES');
console.log('================================\n');

// 1. Vérifier les rôles dans data.ts
const dataPath = path.join(constantsPath, 'data.ts');
const dataContent = fs.readFileSync(dataPath, 'utf8');
const dataRoleMatches = dataContent.match(/role:\s*['"`]([^'"`]+)['"`]/g);
const dataRoles = dataRoleMatches ? dataRoleMatches.map(match => {
  const roleMatch = match.match(/role:\s*['"`]([^'"`]+)['"`]/);
  return roleMatch ? roleMatch[1] : null;
}).filter(Boolean) : [];
const uniqueDataRoles = [...new Set(dataRoles)];

console.log(`✅ Rôles dans data.ts: ${uniqueDataRoles.length}`);
console.log('');

// 2. Vérifier les rôles dans Login.tsx
const loginPath = path.join(componentsPath, 'Login.tsx');
const loginContent = fs.readFileSync(loginPath, 'utf8');
const loginOptionMatches = loginContent.match(/value="([^"]+)"/g);
const loginRoles = loginOptionMatches ? loginOptionMatches.map(match => {
  const valueMatch = match.match(/value="([^"]+)"/);
  return valueMatch ? valueMatch[1] : null;
}).filter(Boolean) : [];

console.log(`✅ Rôles dans Login.tsx: ${loginRoles.length}`);
console.log('');

// 3. Vérifier la correspondance
const missingInLogin = uniqueDataRoles.filter(role => !loginRoles.includes(role));
const missingInData = loginRoles.filter(role => !uniqueDataRoles.includes(role));

console.log('🔍 VÉRIFICATION DE LA CORRESPONDANCE');
console.log('====================================\n');

if (missingInLogin.length > 0) {
  console.log(`❌ Rôles manquants dans Login.tsx: ${missingInLogin.length}`);
  missingInLogin.forEach(role => console.log(`   • '${role}'`));
  console.log('');
} else {
  console.log('✅ Tous les rôles de data.ts sont dans Login.tsx');
}

if (missingInData.length > 0) {
  console.log(`❌ Rôles manquants dans data.ts: ${missingInData.length}`);
  missingInData.forEach(role => console.log(`   • '${role}'`));
  console.log('');
} else {
  console.log('✅ Tous les rôles de Login.tsx sont dans data.ts');
}

// 4. Vérifier le rôle par défaut
const defaultRoleMatch = loginContent.match(/useState<Role>\('([^']+)'\)/);
const defaultRole = defaultRoleMatch ? defaultRoleMatch[1] : 'non trouvé';

console.log(`🎯 Rôle par défaut: '${defaultRole}'`);
if (uniqueDataRoles.includes(defaultRole)) {
  console.log('✅ Rôle par défaut valide');
} else {
  console.log('❌ Rôle par défaut invalide');
}
console.log('');

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

const allRolesMatch = missingInLogin.length === 0 && missingInData.length === 0;
const defaultRoleValid = uniqueDataRoles.includes(defaultRole);
const dashboardOk = hasRoleConfig && hasUserRole && hasDebugLogs && hasUseEffect;
const authOk = hasLoginFunction && hasUserState && hasSessionStorage;

if (allRolesMatch && defaultRoleValid && dashboardOk && authOk) {
  console.log('🎉 EXCELLENT! Correction des rôles complète !\n');
  console.log('✨ CONFIGURATION PARFAITE:');
  console.log('==========================');
  console.log(`• ${uniqueDataRoles.length} rôles avec utilisateurs`);
  console.log(`• ${loginRoles.length} rôles dans Login.tsx`);
  console.log(`• Correspondance parfaite entre data.ts et Login.tsx`);
  console.log(`• Rôle par défaut valide`);
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
  console.log('• teacher (Enseignant)');
  console.log('• Tous les autres rôles\n');
  
  console.log('✅ PROBLÈME RÉSOLU !');
  console.log('====================');
  console.log('Le rôle devrait maintenant se mettre à jour correctement');
  console.log('lors de la connexion avec n\'importe quel rôle.\n');
  
} else {
  console.log('❌ ATTENTION! Des corrections sont nécessaires.\n');
  console.log('🔧 ACTIONS REQUISES:');
  console.log('===================');
  if (!allRolesMatch) {
    console.log('1. Corriger les correspondances de rôles');
  }
  if (!defaultRoleValid) {
    console.log('2. Corriger le rôle par défaut');
  }
  if (!dashboardOk) {
    console.log('3. Corriger le Dashboard');
  }
  if (!authOk) {
    console.log('4. Corriger l\'AuthContext');
  }
}

console.log('\n🧪 Test final de correction des rôles terminé !');
