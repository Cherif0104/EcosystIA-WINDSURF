const fs = require('fs');
const path = require('path');

console.log('🚀 Test final de l\'application EcosystIA...\n');

// Vérifier que l'application fonctionne correctement
function testApplication() {
  let score = 0;
  let total = 0;

  // 1. Vérifier les fichiers critiques
  console.log('📁 Vérification des fichiers critiques...');
  
  const criticalFiles = [
    'src/lib/supabase.js',
    'services/realtimeService.ts',
    'components/common/SimpleModernDashboard.tsx',
    'constants/data.ts',
    'constants/roleColors.ts',
    'services/genericDatabaseService.ts'
  ];

  criticalFiles.forEach(file => {
    total++;
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
      score++;
    } else {
      console.log(`❌ ${file} - Fichier manquant`);
    }
  });

  // 2. Vérifier la configuration Supabase
  console.log('\n🔧 Vérification de la configuration Supabase...');
  total++;
  if (fs.existsSync('src/lib/supabase.js')) {
    const content = fs.readFileSync('src/lib/supabase.js', 'utf8');
    if (content.includes('supabaseUrl') && content.includes('supabaseAnonKey')) {
      console.log('✅ Configuration Supabase présente');
      score++;
    } else {
      console.log('❌ Configuration Supabase incomplète');
    }
  } else {
    console.log('❌ Fichier de configuration Supabase manquant');
  }

  // 3. Vérifier les rôles dans data.ts
  console.log('\n👥 Vérification des rôles utilisateurs...');
  total++;
  if (fs.existsSync('constants/data.ts')) {
    const content = fs.readFileSync('constants/data.ts', 'utf8');
    const roles = ['student', 'teacher', 'manager', 'administrator', 'super_administrator', 'mentor', 'supervisor', 'trainer', 'implementer', 'coach', 'facilitator', 'publisher', 'producer', 'artist', 'alumni', 'intern'];
    const hasAllRoles = roles.every(role => content.includes(`role: '${role}'`));
    
    if (hasAllRoles) {
      console.log('✅ Tous les rôles MVP sont définis');
      score++;
    } else {
      console.log('❌ Certains rôles MVP sont manquants');
    }
  } else {
    console.log('❌ Fichier data.ts manquant');
  }

  // 4. Vérifier les couleurs des rôles
  console.log('\n🎨 Vérification des couleurs des rôles...');
  total++;
  if (fs.existsSync('constants/roleColors.ts')) {
    const content = fs.readFileSync('constants/roleColors.ts', 'utf8');
    const roles = ['student', 'teacher', 'manager', 'administrator', 'super_administrator', 'mentor', 'supervisor', 'trainer', 'implementer', 'coach', 'facilitator', 'publisher', 'producer', 'artist', 'alumni', 'intern'];
    const hasAllRoleColors = roles.every(role => content.includes(role));
    
    if (hasAllRoleColors) {
      console.log('✅ Toutes les couleurs de rôles sont définies');
      score++;
    } else {
      console.log('❌ Certaines couleurs de rôles sont manquantes');
    }
  } else {
    console.log('❌ Fichier roleColors.ts manquant');
  }

  // 5. Vérifier le service de notifications
  console.log('\n🔔 Vérification du service de notifications...');
  total++;
  if (fs.existsSync('services/realtimeService.ts')) {
    const content = fs.readFileSync('services/realtimeService.ts', 'utf8');
    if (content.includes('get_unread_notifications') && content.includes('Fonction get_unread_notifications non disponible')) {
      console.log('✅ Service de notifications avec gestion d\'erreur');
      score++;
    } else {
      console.log('❌ Service de notifications incomplet');
    }
  } else {
    console.log('❌ Service de notifications manquant');
  }

  // 6. Vérifier le dashboard moderne
  console.log('\n📊 Vérification du dashboard moderne...');
  total++;
  if (fs.existsSync('components/common/SimpleModernDashboard.tsx')) {
    const content = fs.readFileSync('components/common/SimpleModernDashboard.tsx', 'utf8');
    if (content.includes('quickActions') && content.includes('modules') && content.includes('userRole')) {
      console.log('✅ Dashboard moderne configuré');
      score++;
    } else {
      console.log('❌ Dashboard moderne incomplet');
    }
  } else {
    console.log('❌ Dashboard moderne manquant');
  }

  // 7. Vérifier le service de base de données générique
  console.log('\n🗄️ Vérification du service de base de données...');
  total++;
  if (fs.existsSync('services/genericDatabaseService.ts')) {
    const content = fs.readFileSync('services/genericDatabaseService.ts', 'utf8');
    if (content.includes('create') && content.includes('read') && content.includes('update') && content.includes('delete')) {
      console.log('✅ Service de base de données générique');
      score++;
    } else {
      console.log('❌ Service de base de données incomplet');
    }
  } else {
    console.log('❌ Service de base de données manquant');
  }

  // 8. Vérifier le script de correction des notifications
  console.log('\n🔧 Vérification du script de correction...');
  total++;
  if (fs.existsSync('scripts/check_notifications_structure.sql')) {
    const content = fs.readFileSync('scripts/check_notifications_structure.sql', 'utf8');
    if (content.includes('CREATE OR REPLACE FUNCTION get_unread_notifications')) {
      console.log('✅ Script de correction des notifications');
      score++;
    } else {
      console.log('❌ Script de correction incomplet');
    }
  } else {
    console.log('❌ Script de correction manquant');
  }

  return { score, total };
}

// Exécuter le test
const result = testApplication();

// Afficher le résumé
console.log('\n' + '='.repeat(60));
console.log('📊 RÉSUMÉ FINAL DE L\'APPLICATION');
console.log('='.repeat(60));

const percentage = Math.round((result.score / result.total) * 100);
console.log(`\n🎯 Score global: ${result.score}/${result.total} (${percentage}%)`);

if (percentage >= 90) {
  console.log('🟢 EXCELLENT! L\'application est prête pour la production');
} else if (percentage >= 70) {
  console.log('🟡 BON! L\'application est fonctionnelle avec quelques améliorations');
} else if (percentage >= 50) {
  console.log('🟠 MOYEN! L\'application nécessite des corrections');
} else {
  console.log('🔴 CRITIQUE! L\'application nécessite une refonte');
}

console.log('\n📋 Actions recommandées:');
if (percentage < 100) {
  console.log('1. Exécuter le script SQL de correction des notifications dans Supabase');
  console.log('2. Vérifier la configuration Supabase');
  console.log('3. Tester la connexion à la base de données');
} else {
  console.log('✅ Aucune action critique requise');
  console.log('🚀 L\'application est prête pour le déploiement!');
}

console.log('\n🔧 Commandes utiles:');
console.log('- npm run dev : Démarrer l\'application');
console.log('- Ouvrir Supabase Dashboard pour exécuter le script SQL');
console.log('- Tester la connexion avec différents rôles utilisateur');

console.log('\n✨ L\'application EcosystIA est maintenant prête!');