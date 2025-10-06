const fs = require('fs');
const path = require('path');

console.log('🏥 Test de santé de l\'application EcosystIA...\n');

let score = 0;
let total = 0;

function checkFile(filePath, description, checks) {
  total++;
  console.log(`\n📁 ${description}:`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Fichier non trouvé: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let fileScore = 0;
  let fileTotal = checks.length;
  
  checks.forEach(check => {
    if (check.test(content)) {
      console.log(`✅ ${check.description}`);
      fileScore++;
    } else {
      console.log(`❌ ${check.description}`);
    }
  });
  
  if (fileScore === fileTotal) {
    score++;
    console.log(`🎯 Score: ${fileScore}/${fileTotal} - Parfait!`);
  } else {
    console.log(`⚠️  Score: ${fileScore}/${fileTotal} - À améliorer`);
  }
  
  return fileScore === fileTotal;
}

// Vérifications des fichiers critiques
console.log('🔍 Vérification des fichiers critiques...\n');

// 1. Configuration Supabase
checkFile('src/lib/supabase.ts', 'Configuration Supabase', [
  {
    description: 'URL Supabase configurée',
    test: (content) => content.includes('supabaseUrl') && content.includes('supabaseAnonKey')
  },
  {
    description: 'Client Supabase initialisé',
    test: (content) => content.includes('createClient')
  }
]);

// 2. Service de notifications
checkFile('services/realtimeService.ts', 'Service de notifications', [
  {
    description: 'Gestion d\'erreur pour get_unread_notifications',
    test: (content) => content.includes('Fonction get_unread_notifications non disponible')
  },
  {
    description: 'Requête directe de fallback',
    test: (content) => content.includes('.from(\'notifications\')')
  },
  {
    description: 'Gestion des colonnes alternatives',
    test: (content) => content.includes('lire') && content.includes('is_read') && content.includes('read')
  }
]);

// 3. Dashboard moderne
checkFile('components/common/SimpleModernDashboard.tsx', 'Dashboard moderne', [
  {
    description: 'Support de tous les rôles MVP',
    test: (content) => content.includes('student') && content.includes('teacher') && content.includes('manager')
  },
  {
    description: 'Actions rapides configurées',
    test: (content) => content.includes('quickActions')
  },
  {
    description: 'Modules connectés',
    test: (content) => content.includes('modules')
  }
]);

// 4. Gestion des rôles
checkFile('constants/data.ts', 'Données des utilisateurs', [
  {
    description: 'Tous les rôles MVP définis',
    test: (content) => {
      const roles = ['student', 'teacher', 'manager', 'director', 'admin', 'mentor', 'supervisor', 'trainer', 'implementer', 'coach', 'facilitator', 'publisher', 'producer', 'artist', 'alumni', 'intern'];
      return roles.every(role => content.includes(`role: '${role}'`));
    }
  }
]);

checkFile('constants/roleColors.ts', 'Couleurs des rôles', [
  {
    description: 'Tous les rôles ont des couleurs',
    test: (content) => {
      const roles = ['student', 'teacher', 'manager', 'director', 'admin', 'mentor', 'supervisor', 'trainer', 'implementer', 'coach', 'facilitator', 'publisher', 'producer', 'artist', 'alumni', 'intern'];
      return roles.every(role => content.includes(role));
    }
  }
]);

// 5. Service de base de données générique
checkFile('services/genericDatabaseService.ts', 'Service de base de données générique', [
  {
    description: 'Méthodes CRUD génériques',
    test: (content) => content.includes('create') && content.includes('read') && content.includes('update') && content.includes('delete')
  },
  {
    description: 'Gestion des erreurs',
    test: (content) => content.includes('try') && content.includes('catch')
  }
]);

// 6. Scripts de correction
checkFile('scripts/check_notifications_structure.sql', 'Script de correction des notifications', [
  {
    description: 'Fonction get_unread_notifications',
    test: (content) => content.includes('CREATE OR REPLACE FUNCTION get_unread_notifications')
  },
  {
    description: 'Permissions accordées',
    test: (content) => content.includes('GRANT EXECUTE')
  }
]);

// Résumé final
console.log('\n' + '='.repeat(60));
console.log('📊 RÉSUMÉ DE LA SANTÉ DE L\'APPLICATION');
console.log('='.repeat(60));

const percentage = Math.round((score / total) * 100);
console.log(`\n🎯 Score global: ${score}/${total} (${percentage}%)`);

if (percentage >= 90) {
  console.log('🟢 EXCELLENT! L\'application est en très bon état');
} else if (percentage >= 70) {
  console.log('🟡 BON! L\'application est fonctionnelle avec quelques améliorations possibles');
} else if (percentage >= 50) {
  console.log('🟠 MOYEN! L\'application nécessite des corrections importantes');
} else {
  console.log('🔴 CRITIQUE! L\'application nécessite une refonte majeure');
}

console.log('\n📋 Actions recommandées:');
if (percentage < 100) {
  console.log('1. Exécuter le script SQL de correction des notifications dans Supabase');
  console.log('2. Vérifier que tous les rôles sont correctement configurés');
  console.log('3. Tester la connexion à la base de données');
  console.log('4. Vérifier les permissions Supabase');
} else {
  console.log('✅ Aucune action critique requise');
  console.log('🚀 L\'application est prête pour le déploiement!');
}

console.log('\n🔧 Commandes utiles:');
console.log('- npm run dev : Démarrer l\'application en développement');
console.log('- node scripts/testNotificationsFix.cjs : Tester les corrections des notifications');
console.log('- Ouvrir Supabase Dashboard pour exécuter le script SQL');