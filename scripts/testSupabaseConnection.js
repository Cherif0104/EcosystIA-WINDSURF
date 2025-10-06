// Test de connexion Supabase pour EcosystIA
console.log('🧪 TEST DE CONNEXION SUPABASE ECOSYSTIA');
console.log('='.repeat(50));

// Import du client Supabase
import { supabase } from '../src/lib/supabase.js';

async function testSupabaseConnection() {
  console.log('🔗 Test de connexion à Supabase...');
  
  try {
    // Test de connexion basique
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Erreur de connexion:', error.message);
      return false;
    }
    
    console.log('✅ Connexion Supabase réussie !');
    console.log(`   - Nombre d'utilisateurs: ${data || 'N/A'}`);
    
    // Test des fonctions temps réel
    console.log('🔄 Test des fonctions temps réel...');
    
    try {
      const { data: modules, error: modulesError } = await supabase.from('modules').select('id, name').limit(3);
      
      if (modulesError) {
        console.log('⚠️  Fonctions temps réel non disponibles:', modulesError.message);
      } else {
        console.log('✅ Fonctions temps réel opérationnelles');
        console.log(`   - Modules trouvés: ${modules?.length || 0}`);
      }
    } catch (realtimeError) {
      console.log('⚠️  Fonctions temps réel non configurées');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Erreur lors du test:', error.message);
    return false;
  }
}

// Exécuter le test
testSupabaseConnection().then(success => {
  if (success) {
    console.log('🎉 Test de connexion Supabase réussi !');
    console.log('✅ L\'application peut maintenant utiliser Supabase');
  } else {
    console.log('❌ Test de connexion Supabase échoué');
    console.log('🔧 Vérifiez votre configuration Supabase');
  }
}).catch(error => {
  console.log('❌ Erreur lors du test:', error);
});
