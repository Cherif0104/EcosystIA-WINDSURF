const fs = require('fs');
const path = require('path');

console.log('🔍 Test des corrections des notifications...\n');

// Vérifier que le service realtimeService.ts a été corrigé
const realtimeServicePath = 'services/realtimeService.ts';
if (fs.existsSync(realtimeServicePath)) {
  const content = fs.readFileSync(realtimeServicePath, 'utf8');
  
  // Vérifier la présence de la gestion d'erreur pour get_unread_notifications
  if (content.includes('Fonction get_unread_notifications non disponible, utilisation de la requête directe')) {
    console.log('✅ realtimeService.ts : Gestion d\'erreur pour get_unread_notifications présente');
  } else {
    console.log('❌ realtimeService.ts : Gestion d\'erreur pour get_unread_notifications manquante');
  }
  
  // Vérifier la présence de la requête directe de fallback
  if (content.includes('SELECT * FROM notifications WHERE user_id = $1')) {
    console.log('✅ realtimeService.ts : Requête directe de fallback présente');
  } else {
    console.log('❌ realtimeService.ts : Requête directe de fallback manquante');
  }
  
  // Vérifier la gestion des colonnes alternatives (lire, is_read, read)
  if (content.includes('lire') && content.includes('is_read') && content.includes('read')) {
    console.log('✅ realtimeService.ts : Gestion des colonnes alternatives présente');
  } else {
    console.log('❌ realtimeService.ts : Gestion des colonnes alternatives manquante');
  }
} else {
  console.log('❌ realtimeService.ts : Fichier non trouvé');
}

// Vérifier que le script SQL de correction existe
const sqlScriptPath = 'scripts/check_notifications_structure.sql';
if (fs.existsSync(sqlScriptPath)) {
  console.log('✅ Script SQL de correction des notifications créé');
  
  const sqlContent = fs.readFileSync(sqlScriptPath, 'utf8');
  
  // Vérifier la présence de la fonction get_unread_notifications
  if (sqlContent.includes('CREATE OR REPLACE FUNCTION get_unread_notifications')) {
    console.log('✅ Script SQL : Fonction get_unread_notifications incluse');
  } else {
    console.log('❌ Script SQL : Fonction get_unread_notifications manquante');
  }
  
  // Vérifier la présence des permissions
  if (sqlContent.includes('GRANT EXECUTE ON FUNCTION get_unread_notifications')) {
    console.log('✅ Script SQL : Permissions accordées');
  } else {
    console.log('❌ Script SQL : Permissions manquantes');
  }
} else {
  console.log('❌ Script SQL de correction des notifications : Fichier non trouvé');
}

console.log('\n📋 Instructions pour corriger les erreurs de notifications :');
console.log('1. Ouvrez Supabase Dashboard');
console.log('2. Allez dans SQL Editor');
console.log('3. Copiez le contenu du fichier scripts/check_notifications_structure.sql');
console.log('4. Collez et exécutez le script');
console.log('5. Vérifiez que la fonction get_unread_notifications a été créée');

console.log('\n🎯 Résultat attendu :');
console.log('- Les erreurs 404 pour get_unread_notifications disparaîtront');
console.log('- Les notifications non lues s\'afficheront correctement');
console.log('- L\'application fonctionnera sans erreurs de console');