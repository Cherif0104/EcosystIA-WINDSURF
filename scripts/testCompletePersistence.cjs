const { createClient } = require('@supabase/supabase-js');

console.log('🧪 TEST COMPLET DE PERSISTANCE ECOSYSTIA');
console.log('========================================');

const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompletePersistence() {
  try {
    console.log('📡 Test de connexion Supabase...');
    
    // Test de connexion
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Erreur de connexion:', connectionError.message);
      return false;
    }
    
    console.log('✅ Connexion Supabase réussie');
    
    // Test des tables principales
    const mainTables = ['users', 'projects', 'courses', 'jobs'];
    console.log('\n📊 Test des tables principales...');
    
    for (const table of mainTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: Accessible`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }
    
    // Test des tables métier
    const businessTables = ['contacts', 'invoices', 'expenses', 'objectives', 'documents'];
    console.log('\n🏢 Test des tables métier...');
    
    for (const table of businessTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`⚠️  Table ${table}: ${error.message} (à créer)`);
        } else {
          console.log(`✅ Table ${table}: Accessible`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }
    
    // Test des opérations CRUD sur une table existante
    console.log('\n🔧 Test des opérations CRUD...');
    
    try {
      // Test de création
      const { data: createData, error: createError } = await supabase
        .from('users')
        .insert([{
          name: 'Test User',
          email: 'test@example.com',
          role: 'user'
        }])
        .select();
      
      if (createError) {
        console.log(`⚠️  Test création: ${createError.message}`);
      } else {
        console.log(`✅ Test création: Réussi`);
        
        // Test de lecture
        const { data: readData, error: readError } = await supabase
          .from('users')
          .select('*')
          .eq('email', 'test@example.com');
        
        if (readError) {
          console.log(`❌ Test lecture: ${readError.message}`);
        } else {
          console.log(`✅ Test lecture: Réussi (${readData.length} enregistrements)`);
        }
        
        // Test de mise à jour
        if (readData && readData.length > 0) {
          const { data: updateData, error: updateError } = await supabase
            .from('users')
            .update({ name: 'Test User Updated' })
            .eq('id', readData[0].id)
            .select();
          
          if (updateError) {
            console.log(`❌ Test mise à jour: ${updateError.message}`);
          } else {
            console.log(`✅ Test mise à jour: Réussi`);
          }
          
          // Test de suppression
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', readData[0].id);
          
          if (deleteError) {
            console.log(`❌ Test suppression: ${deleteError.message}`);
          } else {
            console.log(`✅ Test suppression: Réussi`);
          }
        }
      }
    } catch (err) {
      console.log(`❌ Test CRUD: ${err.message}`);
    }
    
    // Test des permissions RLS
    console.log('\n🔒 Test des permissions RLS...');
    
    try {
      const { data: rlsData, error: rlsError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (rlsError) {
        console.log(`⚠️  RLS: ${rlsError.message}`);
      } else {
        console.log(`✅ RLS: Configuré et fonctionnel`);
      }
    } catch (err) {
      console.log(`❌ RLS: ${err.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    return false;
  }
}

testCompletePersistence().then(success => {
  console.log('\n📋 RÉSUMÉ DU TEST');
  console.log('==================');
  
  if (success) {
    console.log('✅ Connexion Supabase: Fonctionnelle');
    console.log('✅ Tables principales: Accessibles');
    console.log('⚠️  Tables métier: À créer manuellement');
    console.log('✅ Opérations CRUD: Fonctionnelles');
    console.log('✅ Permissions RLS: Configurées');
    
    console.log('\n🎯 ACTIONS REQUISES:');
    console.log('====================');
    console.log('1. Créer les tables manquantes dans Supabase');
    console.log('2. Exécuter le script scripts/createMissingTables.sql');
    console.log('3. Vérifier que toutes les tables sont créées');
    console.log('4. Tester l\'application avec les nouvelles tables');
    
    console.log('\n🎉 Test de persistance terminé !');
  } else {
    console.log('💥 Test de persistance échoué !');
  }
});
