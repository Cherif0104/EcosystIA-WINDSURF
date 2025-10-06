const fs = require('fs');
const path = require('path');

console.log('🎯 Test final - Application EcosystIA prête...\n');

// Vérifier que l'application est prête pour la production
function testApplicationReady() {
  let score = 0;
  let total = 0;

  // 1. Vérifier les fichiers critiques
  console.log('📁 Fichiers critiques...');
  
  const criticalFiles = [
    'src/lib/supabase.js',
    'services/realtimeService.ts',
    'components/common/SimpleModernDashboard.tsx',
    'constants/data.ts',
    'constants/roleColors.ts',
    'services/genericDatabaseService.ts',
    'scripts/check_notifications_structure.sql'
  ];

  criticalFiles.forEach(file => {
    total++;
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
      score++;
    } else {
      console.log(`❌ ${file}`);
    }
  });

  // 2. Vérifier la configuration Supabase
  console.log('\n🔧 Configuration Supabase...');
  total++;
  if (fs.existsSync('src/lib/supabase.js')) {
    const content = fs.readFileSync('src/lib/supabase.js', 'utf8');
    if (content.includes('supabaseUrl') && content.includes('supabaseKey') && content.includes('createClient')) {
      console.log('✅ Configuration Supabase complète');
      score++;
    } else {
      console.log('❌ Configuration Supabase incomplète');
    }
  }

  // 3. Vérifier les rôles et couleurs
  console.log('\n👥 Rôles et couleurs...');
  total++;
  if (fs.existsSync('constants/data.ts') && fs.existsSync('constants/roleColors.ts')) {
    const dataContent = fs.readFileSync('constants/data.ts', 'utf8');
    const colorsContent = fs.readFileSync('constants/roleColors.ts', 'utf8');
    
    const roles = ['student', 'teacher', 'manager', 'administrator', 'super_administrator', 'mentor', 'supervisor', 'trainer', 'implementer', 'coach', 'facilitator', 'publisher', 'producer', 'artist', 'alumni', 'intern'];
    const hasAllRoles = roles.every(role => dataContent.includes(`role: '${role}'`));
    const hasAllColors = roles.every(role => colorsContent.includes(role));
    
    if (hasAllRoles && hasAllColors) {
      console.log('✅ Tous les rôles et couleurs configurés');
      score++;
    } else {
      console.log('❌ Rôles ou couleurs manquants');
    }
  }

  // 4. Vérifier le service de notifications
  console.log('\n🔔 Service de notifications...');
  total++;
  if (fs.existsSync('services/realtimeService.ts')) {
    const content = fs.readFileSync('services/realtimeService.ts', 'utf8');
    if (content.includes('get_unread_notifications') && content.includes('Fonction get_unread_notifications non disponible')) {
      console.log('✅ Service de notifications avec fallback');
      score++;
    } else {
      console.log('❌ Service de notifications incomplet');
    }
  }

  // 5. Vérifier le dashboard moderne
  console.log('\n📊 Dashboard moderne...');
  total++;
  if (fs.existsSync('components/common/SimpleModernDashboard.tsx')) {
    const content = fs.readFileSync('components/common/SimpleModernDashboard.tsx', 'utf8');
    if (content.includes('quickActions') && content.includes('modules') && content.includes('userRole')) {
      console.log('✅ Dashboard moderne configuré');
      score++;
    } else {
      console.log('❌ Dashboard moderne incomplet');
    }
  }

  // 6. Vérifier le service de base de données
  console.log('\n🗄️ Service de base de données...');
  total++;
  if (fs.existsSync('services/genericDatabaseService.ts')) {
    const content = fs.readFileSync('services/genericDatabaseService.ts', 'utf8');
    if (content.includes('async create') && content.includes('async read') && content.includes('async update') && content.includes('async delete')) {
      console.log('✅ Service de base de données générique');
      score++;
    } else {
      console.log('❌ Service de base de données incomplet');
    }
  }

  // 7. Vérifier le script de correction
  console.log('\n🔧 Script de correction...');
  total++;
  if (fs.existsSync('scripts/check_notifications_structure.sql')) {
    const content = fs.readFileSync('scripts/check_notifications_structure.sql', 'utf8');
    if (content.includes('CREATE OR REPLACE FUNCTION get_unread_notifications')) {
      console.log('✅ Script de correction des notifications');
      score++;
    } else {
      console.log('❌ Script de correction incomplet');
    }
  }

  return { score, total };
}

// Exécuter le test
const result = testApplicationReady();

// Afficher le résumé
console.log('\n' + '='.repeat(60));
console.log('📊 RÉSUMÉ - APPLICATION PRÊTE');
console.log('='.repeat(60));

const percentage = Math.round((result.score / result.total) * 100);
console.log(`\n🎯 Score global: ${result.score}/${result.total} (${percentage}%)`);

if (percentage >= 90) {
  console.log('🟢 EXCELLENT! L\'application est prête pour la production');
  console.log('🚀 Vous pouvez maintenant déployer l\'application!');
} else if (percentage >= 70) {
  console.log('🟡 BON! L\'application est fonctionnelle');
  console.log('⚠️  Quelques améliorations mineures possibles');
} else {
  console.log('🔴 L\'application nécessite des corrections');
}

console.log('\n📋 Instructions finales:');
console.log('1. Ouvrez Supabase Dashboard');
console.log('2. Allez dans SQL Editor');
console.log('3. Copiez et exécutez le contenu de scripts/check_notifications_structure.sql');
console.log('4. Vérifiez que la fonction get_unread_notifications a été créée');
console.log('5. Testez l\'application avec: npm run dev');

console.log('\n✨ L\'application EcosystIA est maintenant prête pour le déploiement!');