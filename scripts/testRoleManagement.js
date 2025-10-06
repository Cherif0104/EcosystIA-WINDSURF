import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRoleManagement() {
  console.log('🧪 TEST DU SYSTÈME DE GESTION DES RÔLES\n');
  console.log('='.repeat(60));

  try {
    // 1. Test de connexion
    console.log('1️⃣ Test de connexion...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log(authError ? '❌ Erreur auth:' + authError.message : '✅ Connexion OK');

    // 2. Test des tables de gestion des rôles
    console.log('\n2️⃣ Test des tables de gestion des rôles...');
    
    // Test custom_roles
    const { data: roles, error: rolesError } = await supabase
      .from('custom_roles')
      .select('*')
      .limit(5);
    
    if (rolesError) {
      console.log('❌ Erreur custom_roles:', rolesError.message);
    } else {
      console.log(`✅ Table custom_roles OK (${roles?.length || 0} rôles)`);
      if (roles && roles.length > 0) {
        console.log('📋 Rôles trouvés:');
        roles.forEach(role => {
          console.log(`   • ${role.display_name} (${role.name}) - ${role.is_system_role ? 'Système' : 'Personnalisé'}`);
        });
      }
    }

    // Test permissions
    const { data: permissions, error: permissionsError } = await supabase
      .from('permissions')
      .select('*')
      .limit(10);
    
    if (permissionsError) {
      console.log('❌ Erreur permissions:', permissionsError.message);
    } else {
      console.log(`✅ Table permissions OK (${permissions?.length || 0} permissions)`);
      if (permissions && permissions.length > 0) {
        console.log('📋 Permissions trouvées:');
        permissions.forEach(permission => {
          console.log(`   • ${permission.display_name} (${permission.module}.${permission.action})`);
        });
      }
    }

    // Test role_permissions
    const { data: rolePermissions, error: rolePermissionsError } = await supabase
      .from('role_permissions')
      .select('*')
      .limit(5);
    
    if (rolePermissionsError) {
      console.log('❌ Erreur role_permissions:', rolePermissionsError.message);
    } else {
      console.log(`✅ Table role_permissions OK (${rolePermissions?.length || 0} liaisons)`);
    }

    // Test user_groups
    const { data: userGroups, error: userGroupsError } = await supabase
      .from('user_groups')
      .select('*')
      .limit(5);
    
    if (userGroupsError) {
      console.log('❌ Erreur user_groups:', userGroupsError.message);
    } else {
      console.log(`✅ Table user_groups OK (${userGroups?.length || 0} groupes)`);
    }

    // 3. Test des statistiques
    console.log('\n3️⃣ Test des statistiques...');
    
    const { data: allRoles, error: statsError } = await supabase
      .from('custom_roles')
      .select('is_system_role, is_active');

    if (statsError) {
      console.log('❌ Erreur statistiques:', statsError.message);
    } else {
      const stats = {
        total: allRoles?.length || 0,
        system: allRoles?.filter(r => r.is_system_role).length || 0,
        custom: allRoles?.filter(r => !r.is_system_role).length || 0,
        active: allRoles?.filter(r => r.is_active).length || 0,
        inactive: allRoles?.filter(r => !r.is_active).length || 0,
      };
      
      console.log('✅ Statistiques des rôles:');
      console.log(`   Total: ${stats.total}`);
      console.log(`   Système: ${stats.system}`);
      console.log(`   Personnalisés: ${stats.custom}`);
      console.log(`   Actifs: ${stats.active}`);
      console.log(`   Inactifs: ${stats.inactive}`);
    }

    // 4. Test des permissions par module
    console.log('\n4️⃣ Test des permissions par module...');
    
    const { data: modulePermissions, error: moduleError } = await supabase
      .from('permissions')
      .select('module')
      .not('module', 'is', null);

    if (moduleError) {
      console.log('❌ Erreur modules:', moduleError.message);
    } else {
      const modules = [...new Set(modulePermissions?.map(p => p.module))];
      console.log(`✅ Modules trouvés: ${modules.length}`);
      modules.forEach(module => {
        const count = modulePermissions?.filter(p => p.module === module).length || 0;
        console.log(`   • ${module}: ${count} permissions`);
      });
    }

    // 5. Test de création d'un rôle personnalisé (simulation)
    console.log('\n5️⃣ Test de création de rôle personnalisé...');
    
    const testRole = {
      name: 'test_role_' + Date.now(),
      display_name: 'Rôle de Test',
      description: 'Rôle créé pour les tests',
      is_system_role: false,
      is_active: true
    };

    const { data: newRole, error: createError } = await supabase
      .from('custom_roles')
      .insert([testRole])
      .select()
      .single();

    if (createError) {
      console.log('❌ Erreur création rôle:', createError.message);
    } else {
      console.log('✅ Rôle créé avec succès:', newRole.display_name);
      
      // Nettoyer le rôle de test
      const { error: deleteError } = await supabase
        .from('custom_roles')
        .delete()
        .eq('id', newRole.id);
      
      if (deleteError) {
        console.log('⚠️  Erreur suppression rôle de test:', deleteError.message);
      } else {
        console.log('✅ Rôle de test supprimé');
      }
    }

    // 6. Résumé final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DU TEST:');
    console.log('='.repeat(60));
    
    const results = {
      connection: !authError || authError.message === 'Auth session missing!',
      customRoles: !rolesError,
      permissions: !permissionsError,
      rolePermissions: !rolePermissionsError,
      userGroups: !userGroupsError,
      statistics: !statsError,
      modules: !moduleError,
      createRole: !createError
    };

    console.log(`✅ Connexion: ${results.connection ? 'OK' : '❌'}`);
    console.log(`✅ Custom Roles: ${results.customRoles ? 'OK' : '❌'}`);
    console.log(`✅ Permissions: ${results.permissions ? 'OK' : '❌'}`);
    console.log(`✅ Role Permissions: ${results.rolePermissions ? 'OK' : '❌'}`);
    console.log(`✅ User Groups: ${results.userGroups ? 'OK' : '❌'}`);
    console.log(`✅ Statistiques: ${results.statistics ? 'OK' : '❌'}`);
    console.log(`✅ Modules: ${results.modules ? 'OK' : '❌'}`);
    console.log(`✅ Création Rôle: ${results.createRole ? 'OK' : '❌'}`);

    const allPassed = Object.values(results).every(Boolean);
    
    if (allPassed) {
      console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !');
      console.log('✅ Le système de gestion des rôles est opérationnel');
      console.log('🚀 Vous pouvez maintenant utiliser la gestion des rôles dans l\'application');
    } else {
      console.log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ');
      console.log('📋 Vérifiez les erreurs ci-dessus');
      console.log('💡 Assurez-vous que les tables ont été créées dans Supabase');
    }

    console.log('\n🌐 URL de l\'application: http://localhost:5173/');
    console.log('👤 Compte admin: admin@senegal.com');

  } catch (error) {
    console.error('\n💥 Erreur générale:', error.message);
  }
}

testRoleManagement();
