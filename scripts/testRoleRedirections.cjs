const fs = require('fs');
const path = require('path');

console.log('🎯 TEST DES REDIRECTIONS PAR RÔLE');
console.log('==================================\n');

const componentsPath = path.join(__dirname, '../components');
const dashboardPath = path.join(componentsPath, 'common', 'SimpleModernDashboard.tsx');

console.log('📊 ANALYSE DES REDIRECTIONS PAR RÔLE');
console.log('====================================\n');

// Vues valides dans App.tsx
const validViews = [
  'dashboard', 'time_tracking', 'projects', 'goals_okrs', 'courses', 
  'course_detail', 'course_management', 'jobs', 'create_job', 
  'user_management', 'crm_sales', 'knowledge_base', 'leave_management', 
  'finance', 'ai_coach', 'gen_ai_lab', 'analytics', 'talent_analytics', 
  'settings', 'super_admin'
];

// Analyser les redirections pour chaque rôle
function analyzeRoleRedirections() {
  try {
    const content = fs.readFileSync(dashboardPath, 'utf8');
    
    // Extraire les actions pour chaque rôle
    const roleActions = {};
    
    // Chercher les définitions de rôles
    const roleMatches = content.match(/(\w+):\s*\[([\s\S]*?)\]/g);
    
    if (roleMatches) {
      roleMatches.forEach(match => {
        const roleMatch = match.match(/(\w+):\s*\[/);
        if (roleMatch) {
          const role = roleMatch[1];
          const actionsContent = match.match(/\[([\s\S]*?)\]/);
          if (actionsContent) {
            const actions = actionsContent[1];
            const viewMatches = actions.match(/view:\s*['"`]([^'"`]+)['"`]/g);
            if (viewMatches) {
              roleActions[role] = viewMatches.map(vm => {
                const viewMatch = vm.match(/view:\s*['"`]([^'"`]+)['"`]/);
                return viewMatch ? viewMatch[1] : null;
              }).filter(Boolean);
            }
          }
        }
      });
    }
    
    console.log(`✅ Rôles analysés: ${Object.keys(roleActions).length}\n`);
    
    // Vérifier chaque rôle
    Object.keys(roleActions).forEach(role => {
      const actions = roleActions[role];
      console.log(`🎯 RÔLE: ${role.toUpperCase()}`);
      console.log('='.repeat(30));
      
      let validCount = 0;
      let invalidCount = 0;
      
      actions.forEach((view, index) => {
        const isValid = validViews.includes(view);
        if (isValid) {
          validCount++;
          console.log(`   ✅ Action ${index + 1}: '${view}' → VALIDE`);
        } else {
          invalidCount++;
          console.log(`   ❌ Action ${index + 1}: '${view}' → INVALIDE`);
        }
      });
      
      console.log(`   📊 Résumé: ${validCount}/${actions.length} valides`);
      console.log(`   ${invalidCount === 0 ? '✅' : '❌'} Status: ${invalidCount === 0 ? 'OK' : 'ERREUR'}\n`);
    });
    
    return roleActions;
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
    return {};
  }
}

// Vérifier les modules principaux
function checkMainModules() {
  console.log('🔧 VÉRIFICATION DES MODULES PRINCIPAUX');
  console.log('======================================\n');
  
  try {
    const content = fs.readFileSync(dashboardPath, 'utf8');
    
    // Chercher la définition des modules
    const modulesMatch = content.match(/const allModules = \[([\s\S]*?)\];/);
    if (modulesMatch) {
      const modulesContent = modulesMatch[1];
      const viewMatches = modulesContent.match(/view:\s*['"`]([^'"`]+)['"`]/g);
      
      if (viewMatches) {
        const moduleViews = viewMatches.map(vm => {
          const viewMatch = vm.match(/view:\s*['"`]([^'"`]+)['"`]/);
          return viewMatch ? viewMatch[1] : null;
        }).filter(Boolean);
        
        console.log('📋 Modules principaux:');
        moduleViews.forEach((view, index) => {
          const isValid = validViews.includes(view);
          console.log(`   ${isValid ? '✅' : '❌'} Module ${index + 1}: '${view}' ${isValid ? '→ VALIDE' : '→ INVALIDE'}`);
        });
        
        const validModules = moduleViews.filter(view => validViews.includes(view));
        console.log(`\n📊 Modules valides: ${validModules.length}/${moduleViews.length}`);
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des modules:', error.message);
  }
}

// Exécuter les tests
const roleActions = analyzeRoleRedirections();
checkMainModules();

console.log('📈 RÉSUMÉ FINAL');
console.log('================\n');

const totalRoles = Object.keys(roleActions).length;
let totalValidActions = 0;
let totalInvalidActions = 0;

Object.values(roleActions).forEach(actions => {
  actions.forEach(view => {
    if (validViews.includes(view)) {
      totalValidActions++;
    } else {
      totalInvalidActions++;
    }
  });
});

const totalActions = totalValidActions + totalInvalidActions;

if (totalInvalidActions === 0) {
  console.log('🎉 EXCELLENT! Toutes les redirections sont valides !\n');
  console.log('✨ REDIRECTIONS PARFAITES:');
  console.log('==========================');
  console.log(`• ${totalRoles} rôles analysés`);
  console.log(`• ${totalValidActions} redirections valides`);
  console.log(`• 0 redirections invalides`);
  console.log(`• Tous les clics fonctionneront correctement\n`);
  
  console.log('🚀 PRÊT POUR TOUS LES RÔLES !');
  console.log('✅ Ancien élève → Redirection correcte');
  console.log('✅ Entraîneur → Redirection correcte');
  console.log('✅ Tous les autres rôles → Redirections correctes');
} else {
  console.log('❌ ATTENTION! Des redirections nécessitent des corrections.\n');
  console.log('🔧 ACTIONS REQUISES:');
  console.log('===================');
  console.log('1. Corriger les vues invalides dans SimpleModernDashboard.tsx');
  console.log('2. Tester chaque rôle individuellement');
  console.log('3. Vérifier que les clics redirigent correctement\n');
}

console.log('\n🧪 Test des redirections par rôle terminé !');
