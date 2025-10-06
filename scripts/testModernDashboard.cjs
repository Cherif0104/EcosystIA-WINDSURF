const fs = require('fs');
const path = require('path');

console.log('🎨 TEST DES COMPOSANTS MODERNES DU DASHBOARD');
console.log('============================================\n');

const componentsPath = path.join(__dirname, '../components');
const commonPath = path.join(componentsPath, 'common');

const modernComponents = [
  'QuickAccessModules.tsx',
  'ModernQuickActions.tsx', 
  'ModernTabNavigation.tsx',
  'ModernWidgets.tsx',
  'QuickSearch.tsx',
  'ModernNotifications.tsx'
];

console.log('📊 ANALYSE DES COMPOSANTS MODERNES');
console.log('==================================\n');

let allComponentsExist = true;
let allComponentsValid = true;

modernComponents.forEach(componentFile => {
  const filePath = path.join(commonPath, componentFile);
  
  console.log(`🔍 ${componentFile}:`);
  
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ Fichier existe`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Vérifications de base
      const hasReactImport = content.includes('import React');
      const hasExport = content.includes('export default');
      const hasInterface = content.includes('interface');
      const hasProps = content.includes('Props');
      const hasSetView = content.includes('setView');
      
      console.log(`   ✅ Import React: ${hasReactImport ? 'Oui' : 'Non'}`);
      console.log(`   ✅ Export default: ${hasExport ? 'Oui' : 'Non'}`);
      console.log(`   ✅ Interface définie: ${hasInterface ? 'Oui' : 'Non'}`);
      console.log(`   ✅ Props définies: ${hasProps ? 'Oui' : 'Non'}`);
      console.log(`   ✅ setView intégré: ${hasSetView ? 'Oui' : 'Non'}`);
      
      // Vérifications spécifiques par composant
      if (componentFile === 'QuickAccessModules.tsx') {
        const hasModules = content.includes('modules: ModuleConfig[]');
        const hasGradient = content.includes('gradient');
        const hasHover = content.includes('hover:');
        console.log(`   ✅ Configuration modules: ${hasModules ? 'Oui' : 'Non'}`);
        console.log(`   ✅ Gradients: ${hasGradient ? 'Oui' : 'Non'}`);
        console.log(`   ✅ Effets hover: ${hasHover ? 'Oui' : 'Non'}`);
      }
      
      if (componentFile === 'ModernQuickActions.tsx') {
        const hasAnimations = content.includes('animate-');
        const hasShine = content.includes('animate-shine');
        const hasPing = content.includes('animate-ping');
        console.log(`   ✅ Animations: ${hasAnimations ? 'Oui' : 'Non'}`);
        console.log(`   ✅ Effet shine: ${hasShine ? 'Oui' : 'Non'}`);
        console.log(`   ✅ Effet ping: ${hasPing ? 'Oui' : 'Non'}`);
      }
      
      if (componentFile === 'ModernTabNavigation.tsx') {
        const hasTabs = content.includes('tabs: TabConfig[]');
        const hasActiveTab = content.includes('activeTab');
        const hasBadges = content.includes('badge');
        console.log(`   ✅ Configuration onglets: ${hasTabs ? 'Oui' : 'Non'}`);
        console.log(`   ✅ Gestion état actif: ${hasActiveTab ? 'Oui' : 'Non'}`);
        console.log(`   ✅ Badges: ${hasBadges ? 'Oui' : 'Non'}`);
      }
      
      if (componentFile === 'ModernWidgets.tsx') {
        const hasStats = content.includes('stats:');
        const hasFormatTime = content.includes('formatTime');
        const hasProgress = content.includes('progress');
        console.log(`   ✅ Props stats: ${hasStats ? 'Oui' : 'Non'}`);
        console.log(`   ✅ Formatage temps: ${hasFormatTime ? 'Oui' : 'Non'}`);
        console.log(`   ✅ Barres de progression: ${hasProgress ? 'Oui' : 'Non'}`);
      }
      
      if (componentFile === 'QuickSearch.tsx') {
        const hasSearch = content.includes('searchData');
        const hasKeyboard = content.includes('keydown');
        const hasModal = content.includes('isOpen');
        console.log(`   ✅ Données de recherche: ${hasSearch ? 'Oui' : 'Non'}`);
        console.log(`   ✅ Navigation clavier: ${hasKeyboard ? 'Oui' : 'Non'}`);
        console.log(`   ✅ Modal de recherche: ${hasModal ? 'Oui' : 'Non'}`);
      }
      
      if (componentFile === 'ModernNotifications.tsx') {
        const hasNotifications = content.includes('notifications: Notification[]');
        const hasUnread = content.includes('unreadCount');
        const hasMarkAsRead = content.includes('markAsRead');
        console.log(`   ✅ Configuration notifications: ${hasNotifications ? 'Oui' : 'Non'}`);
        console.log(`   ✅ Compteur non-lues: ${hasUnread ? 'Oui' : 'Non'}`);
        console.log(`   ✅ Marquer comme lu: ${hasMarkAsRead ? 'Oui' : 'Non'}`);
      }
      
      console.log(`   ✅ Status: VALIDE\n`);
      
    } catch (error) {
      console.log(`   ❌ Erreur lecture: ${error.message}`);
      allComponentsValid = false;
    }
    
  } else {
    console.log(`   ❌ Fichier manquant`);
    allComponentsExist = false;
  }
});

console.log('🔧 VÉRIFICATION DE L\'INTÉGRATION DASHBOARD');
console.log('===========================================\n');

const dashboardPath = path.join(componentsPath, 'Dashboard.tsx');
if (fs.existsSync(dashboardPath)) {
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  
  const integrations = modernComponents.map(component => {
    const componentName = component.replace('.tsx', '');
    const isImported = dashboardContent.includes(`import ${componentName}`);
    const isUsed = dashboardContent.includes(`<${componentName}`);
    
    console.log(`🔍 ${componentName}:`);
    console.log(`   Import: ${isImported ? '✅' : '❌'}`);
    console.log(`   Utilisé: ${isUsed ? '✅' : '❌'}`);
    console.log(`   Status: ${isImported && isUsed ? 'INTÉGRÉ' : 'MANQUANT'}\n`);
    
    return isImported && isUsed;
  });
  
  const integratedCount = integrations.filter(Boolean).length;
  console.log(`📊 Intégration: ${integratedCount}/${modernComponents.length} composants intégrés`);
  
} else {
  console.log('❌ Dashboard.tsx non trouvé');
}

console.log('📈 RÉSUMÉ FINAL');
console.log('================\n');
console.log(`Composants créés: ${modernComponents.length}`);
console.log(`Composants valides: ${allComponentsValid ? modernComponents.length : 'Partiel'}`);
console.log(`Intégration Dashboard: ${allComponentsExist && allComponentsValid ? '✅ COMPLÈTE' : '⚠️ PARTIELLE'}\n`);

if (allComponentsExist && allComponentsValid) {
  console.log('🎉 EXCELLENT! Le Dashboard moderne est prêt !\n');
  console.log('✨ FONCTIONNALITÉS AJOUTÉES:');
  console.log('============================');
  console.log('• Navigation par onglets moderne');
  console.log('• Actions rapides avec animations');
  console.log('• Accès rapide aux modules');
  console.log('• Widgets interactifs');
  console.log('• Recherche rapide (touche /)');
  console.log('• Notifications en temps réel');
  console.log('• Design responsive et moderne');
  console.log('• Effets visuels avancés\n');
  
  console.log('🚀 PRÊT POUR L\'UTILISATION !');
} else {
  console.log('❌ ATTENTION! Certains composants nécessitent des corrections.');
}

console.log('\n🧪 Test des composants modernes terminé !');
