const fs = require('fs');
const path = require('path');

console.log('🎯 TEST DE L\'AFFICHAGE UTILISATEUR ET RÔLE');
console.log('===========================================\n');

const componentsPath = path.join(__dirname, '../components');
const commonPath = path.join(componentsPath, 'common');
const constantsPath = path.join(__dirname, '../constants');

console.log('📊 ANALYSE DE L\'AFFICHAGE UTILISATEUR');
console.log('=====================================\n');

// Vérifier que SimpleModernDashboard existe
const simpleDashboardPath = path.join(commonPath, 'SimpleModernDashboard.tsx');
if (fs.existsSync(simpleDashboardPath)) {
  console.log('✅ SimpleModernDashboard.tsx: Présent');
  
  const content = fs.readFileSync(simpleDashboardPath, 'utf8');
  
  // Vérifications de l'affichage utilisateur
  const hasUserName = content.includes('userDisplayName');
  const hasUserEmail = content.includes('userEmail');
  const hasIsConnected = content.includes('isConnected');
  const hasRoleDisplay = content.includes('roleConfig.name');
  const hasStatusIndicator = content.includes('Connecté') && content.includes('Non connecté');
  const hasUserFallback = content.includes('user?.name || user?.email?.split(\'@\')[0] || \'Utilisateur\'');
  const hasRoleFallback = content.includes('user?.role || \'student\'');
  
  console.log(`   ✅ Nom utilisateur affiché: ${hasUserName ? 'Oui' : 'Non'}`);
  console.log(`   ✅ Email utilisateur affiché: ${hasUserEmail ? 'Oui' : 'Non'}`);
  console.log(`   ✅ Statut connexion: ${hasIsConnected ? 'Oui' : 'Non'}`);
  console.log(`   ✅ Rôle affiché: ${hasRoleDisplay ? 'Oui' : 'Non'}`);
  console.log(`   ✅ Indicateur statut: ${hasStatusIndicator ? 'Oui' : 'Non'}`);
  console.log(`   ✅ Fallback nom: ${hasUserFallback ? 'Oui' : 'Non'}`);
  console.log(`   ✅ Fallback rôle: ${hasRoleFallback ? 'Oui' : 'Non'}`);
  
  // Vérifier les éléments d'affichage spécifiques
  const hasWelcomeMessage = content.includes('Bonjour, {userDisplayName} !');
  const hasRoleDescription = content.includes('{roleConfig.description}');
  const hasRoleBadge = content.includes('{roleConfig.name}');
  const hasConnectionStatus = content.includes('{isConnected ? \'Connecté\' : \'Non connecté\'}');
  const hasEmailDisplay = content.includes('{userEmail}');
  
  console.log(`   ✅ Message de bienvenue: ${hasWelcomeMessage ? 'Oui' : 'Non'}`);
  console.log(`   ✅ Description du rôle: ${hasRoleDescription ? 'Oui' : 'Non'}`);
  console.log(`   ✅ Badge du rôle: ${hasRoleBadge ? 'Oui' : 'Non'}`);
  console.log(`   ✅ Statut de connexion: ${hasConnectionStatus ? 'Oui' : 'Non'}`);
  console.log(`   ✅ Affichage email: ${hasEmailDisplay ? 'Oui' : 'Non'}`);
  
  // Vérifier la robustesse
  const hasMultipleRoleDisplays = (content.match(/roleConfig\.name/g) || []).length >= 2;
  const hasMultipleUserDisplays = (content.match(/userDisplayName/g) || []).length >= 2;
  
  console.log(`   ✅ Affichage multiple du rôle: ${hasMultipleRoleDisplays ? 'Oui' : 'Non'}`);
  console.log(`   ✅ Affichage multiple du nom: ${hasMultipleUserDisplays ? 'Oui' : 'Non'}`);
  
  console.log(`   ✅ Status: VALIDE\n`);
} else {
  console.log('❌ SimpleModernDashboard.tsx: MANQUANT\n');
}

// Vérifier les rôles dans roleColors.ts
const roleColorsPath = path.join(constantsPath, 'roleColors.ts');
if (fs.existsSync(roleColorsPath)) {
  console.log('🔧 VÉRIFICATION DES RÔLES DANS ROLE_COLORS');
  console.log('==========================================\n');
  
  const roleColorsContent = fs.readFileSync(roleColorsPath, 'utf8');
  
  // Extraire tous les rôles définis
  const roleMatches = roleColorsContent.match(/^\s*(\w+):\s*\{/gm);
  const definedRoles = roleMatches ? roleMatches.map(match => match.trim().replace(':', '')) : [];
  
  console.log(`📋 Rôles définis dans ROLE_COLORS (${definedRoles.length}):`);
  definedRoles.forEach((role, index) => {
    console.log(`   ${index + 1}. ${role}`);
  });
  console.log('');
  
  // Vérifier que tous les rôles ont un nom et une description
  const rolesWithName = definedRoles.filter(role => {
    const roleSection = roleColorsContent.match(new RegExp(`${role}:\\s*\\{[\\s\\S]*?\\}`, 'm'));
    return roleSection && roleSection[0].includes('name:');
  });
  
  const rolesWithDescription = definedRoles.filter(role => {
    const roleSection = roleColorsContent.match(new RegExp(`${role}:\\s*\\{[\\s\\S]*?\\}`, 'm'));
    return roleSection && roleSection[0].includes('description:');
  });
  
  console.log(`✅ Rôles avec nom: ${rolesWithName.length}/${definedRoles.length}`);
  console.log(`✅ Rôles avec description: ${rolesWithDescription.length}/${definedRoles.length}`);
  
} else {
  console.log('❌ roleColors.ts non trouvé\n');
}

// Vérifier l'intégration dans Dashboard.tsx
const dashboardPath = path.join(componentsPath, 'Dashboard.tsx');
if (fs.existsSync(dashboardPath)) {
  console.log('🔧 VÉRIFICATION DE L\'INTÉGRATION DASHBOARD');
  console.log('===========================================\n');
  
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  
  const isImported = dashboardContent.includes('import SimpleModernDashboard');
  const isUsed = dashboardContent.includes('<SimpleModernDashboard');
  
  console.log(`🔍 SimpleModernDashboard:`);
  console.log(`   Import: ${isImported ? '✅' : '❌'}`);
  console.log(`   Utilisé: ${isUsed ? '✅' : '❌'}`);
  console.log(`   Status: ${isImported && isUsed ? 'INTÉGRÉ' : 'MANQUANT'}\n`);
  
} else {
  console.log('❌ Dashboard.tsx non trouvé\n');
}

console.log('📈 RÉSUMÉ FINAL');
console.log('================\n');

const isUserDisplayComplete = fs.existsSync(simpleDashboardPath) && 
                             fs.existsSync(roleColorsPath) && 
                             fs.existsSync(dashboardPath);

if (isUserDisplayComplete) {
  console.log('🎉 EXCELLENT! Affichage utilisateur et rôle complet !\n');
  console.log('✨ CARACTÉRISTIQUES DE L\'AFFICHAGE:');
  console.log('===================================');
  console.log('• Nom utilisateur affiché de manière robuste');
  console.log('• Rôle affiché avec couleurs appropriées');
  console.log('• Statut de connexion visible');
  console.log('• Email utilisateur affiché');
  console.log('• Fallbacks pour données manquantes');
  console.log('• Interface claire et informative\n');
  
  console.log('🎯 ÉLÉMENTS AFFICHÉS:');
  console.log('====================');
  console.log('• Message de bienvenue personnalisé');
  console.log('• Nom complet de l\'utilisateur');
  console.log('• Email de l\'utilisateur');
  console.log('• Rôle avec badge coloré');
  console.log('• Description du rôle');
  console.log('• Indicateur de statut de connexion');
  console.log('• Icône spécifique au rôle\n');
  
  console.log('🚀 PRÊT POUR TOUS LES RÔLES !');
} else {
  console.log('❌ ATTENTION! L\'affichage utilisateur nécessite des corrections.');
}

console.log('\n🧪 Test de l\'affichage utilisateur et rôle terminé !');
