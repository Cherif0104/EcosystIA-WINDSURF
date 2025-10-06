const fs = require('fs');
const path = require('path');

console.log('🎯 TEST DE LA CONNEXION PAR RÔLE');
console.log('=================================\n');

const constantsPath = path.join(__dirname, '../constants');
const componentsPath = path.join(__dirname, '../components');

console.log('📊 ANALYSE DE LA CONNEXION PAR RÔLE');
console.log('===================================\n');

// Vérifier les rôles dans mockUsers
const dataPath = path.join(constantsPath, 'data.ts');
if (fs.existsSync(dataPath)) {
  console.log('✅ data.ts: Présent');
  
  const content = fs.readFileSync(dataPath, 'utf8');
  
  // Extraire tous les utilisateurs et leurs rôles
  const userMatches = content.match(/const mockUsers: \{[\s\S]*?\} = \{([\s\S]*?)\};/);
  if (userMatches) {
    const usersContent = userMatches[1];
    
    // Extraire chaque utilisateur
    const userBlocks = usersContent.match(/\w+:\s*\{[\s\S]*?\}/g);
    const users = [];
    
    if (userBlocks) {
      userBlocks.forEach(block => {
        const nameMatch = block.match(/name:\s*["']([^"']+)["']/);
        const emailMatch = block.match(/email:\s*["']([^"']+)["']/);
        const roleMatch = block.match(/role:\s*['"`]([^'"`]+)['"`]/);
        
        if (nameMatch && emailMatch && roleMatch) {
          users.push({
            name: nameMatch[1],
            email: emailMatch[1],
            role: roleMatch[1]
          });
        }
      });
    }
    
    console.log(`📋 Utilisateurs disponibles (${users.length}):`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - Rôle: ${user.role}`);
    });
    console.log('');
    
    // Vérifier les rôles uniques
    const uniqueRoles = [...new Set(users.map(u => u.role))];
    console.log(`📊 Rôles uniques disponibles (${uniqueRoles.length}):`);
    uniqueRoles.forEach((role, index) => {
      const roleUsers = users.filter(u => u.role === role);
      console.log(`   ${index + 1}. '${role}' (${roleUsers.length} utilisateur(s))`);
      roleUsers.forEach(user => {
        console.log(`      • ${user.name} (${user.email})`);
      });
    });
    console.log('');
    
  } else {
    console.log('❌ Structure mockUsers non trouvée');
  }
  
} else {
  console.log('❌ data.ts: MANQUANT\n');
}

// Vérifier les rôles dans Login.tsx
const loginPath = path.join(componentsPath, 'Login.tsx');
if (fs.existsSync(loginPath)) {
  console.log('✅ Login.tsx: Présent');
  
  const content = fs.readFileSync(loginPath, 'utf8');
  
  // Extraire le rôle par défaut
  const defaultRoleMatch = content.match(/useState<Role>\('([^']+)'\)/);
  const defaultRole = defaultRoleMatch ? defaultRoleMatch[1] : 'non trouvé';
  console.log(`🎯 Rôle par défaut: '${defaultRole}'`);
  
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
  
} else {
  console.log('❌ Login.tsx: MANQUANT\n');
}

// Vérifier la logique de connexion
console.log('🔍 VÉRIFICATION DE LA LOGIQUE DE CONNEXION');
console.log('==========================================\n');

if (fs.existsSync(loginPath)) {
  const content = fs.readFileSync(loginPath, 'utf8');
  
  // Vérifier la fonction handleLogin
  const handleLoginMatch = content.match(/const handleLogin = \(e: React\.FormEvent\) => \{[\s\S]*?\};/);
  if (handleLoginMatch) {
    console.log('✅ Fonction handleLogin trouvée');
    
    const handleLoginContent = handleLoginMatch[0];
    
    // Vérifier la logique de recherche d'utilisateur
    const findUserMatch = handleLoginContent.match(/Object\.values\(mockUsers\)\.find\(u => u\.role === selectedRole\)/);
    if (findUserMatch) {
      console.log('✅ Logique de recherche d\'utilisateur trouvée');
    } else {
      console.log('❌ Logique de recherche d\'utilisateur manquante');
    }
    
    // Vérifier le fallback
    const fallbackMatch = handleLoginContent.match(/\|\| mockUsers\.student/);
    if (fallbackMatch) {
      console.log('✅ Fallback vers mockUsers.student trouvé');
    } else {
      console.log('❌ Fallback vers mockUsers.student manquant');
    }
    
    // Vérifier l'appel à login
    const loginCallMatch = handleLoginContent.match(/login\(userToLogin\)/);
    if (loginCallMatch) {
      console.log('✅ Appel à login() trouvé');
    } else {
      console.log('❌ Appel à login() manquant');
    }
    
  } else {
    console.log('❌ Fonction handleLogin non trouvée');
  }
  
} else {
  console.log('❌ Login.tsx: MANQUANT');
}

console.log('\n📈 RÉSUMÉ FINAL');
console.log('================\n');

console.log('🎯 RÉSULTATS DU TEST:');
console.log('=====================');
console.log('• Vérifiez que tous les rôles sont disponibles dans Login.tsx');
console.log('• Vérifiez que tous les rôles ont des utilisateurs correspondants dans data.ts');
console.log('• Vérifiez que la logique de connexion fonctionne correctement');
console.log('• Testez la connexion avec différents rôles dans l\'application\n');

console.log('🚀 ACTIONS RECOMMANDÉES:');
console.log('========================');
console.log('1. Ouvrir l\'application dans le navigateur');
console.log('2. Sélectionner un rôle différent (ex: administrator)');
console.log('3. Cliquer sur "Se connecter"');
console.log('4. Vérifier que le Dashboard affiche le bon rôle');
console.log('5. Vérifier les logs dans la console du navigateur\n');

console.log('🧪 Test de la connexion par rôle terminé !');
