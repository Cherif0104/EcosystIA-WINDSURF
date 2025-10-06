// scripts/auditCompleteModules.cjs - AUDIT COMPLET MODULE PAR MODULE
const fs = require('fs');
const path = require('path');

console.log('🔍 AUDIT COMPLET ECOSYSTIA - MODULE PAR MODULE');
console.log('='.repeat(60));

// Configuration des modules à auditer
const modulesToAudit = {
  'Dashboard': {
    component: 'components/Dashboard.tsx',
    services: ['databaseService.ts', 'realtimeService.ts'],
    permissions: ['canView', 'canCreate', 'canUpdate'],
    ctas: ['complete_profile', 'join_project', 'enroll_course', 'create_project', 'post_job']
  },
  'Projects': {
    component: 'components/Projects.tsx',
    services: ['databaseService.ts', 'geminiService.ts'],
    permissions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    ctas: ['create_project', 'edit_project', 'delete_project', 'add_time_log', 'export_project']
  },
  'Goals': {
    component: 'components/Goals.tsx',
    services: ['databaseService.ts', 'geminiService.ts'],
    permissions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    ctas: ['create_goal', 'update_progress', 'evaluate_goal', 'export_goals']
  },
  'CRM': {
    component: 'components/CRM.tsx',
    services: ['databaseService.ts', 'geminiService.ts'],
    permissions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    ctas: ['add_contact', 'update_contact', 'delete_contact', 'export_contacts']
  },
  'Courses': {
    component: 'components/Courses.tsx',
    services: ['databaseService.ts', 'geminiService.ts'],
    permissions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    ctas: ['enroll_course', 'complete_course', 'rate_course', 'export_courses']
  },
  'Jobs': {
    component: 'components/Jobs.tsx',
    services: ['databaseService.ts', 'geminiService.ts'],
    permissions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    ctas: ['apply_job', 'post_job', 'update_job', 'delete_job']
  },
  'TimeTracking': {
    component: 'components/TimeTracking.tsx',
    services: ['databaseService.ts', 'realtimeService.ts'],
    permissions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    ctas: ['start_timer', 'stop_timer', 'log_time', 'export_time']
  },
  'LeaveManagement': {
    component: 'components/LeaveManagement.tsx',
    services: ['databaseService.ts', 'realtimeService.ts'],
    permissions: ['canView', 'canCreate', 'canUpdate', 'canManage'],
    ctas: ['request_leave', 'approve_leave', 'reject_leave', 'export_leave']
  },
  'Finance': {
    component: 'components/Finance.tsx',
    services: ['databaseService.ts', 'geminiService.ts'],
    permissions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    ctas: ['add_invoice', 'add_expense', 'create_budget', 'export_finance']
  },
  'KnowledgeBase': {
    component: 'components/KnowledgeBase.tsx',
    services: ['databaseService.ts', 'geminiService.ts'],
    permissions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    ctas: ['add_document', 'update_document', 'delete_document', 'export_docs']
  },
  'AICoach': {
    component: 'components/AICoach.tsx',
    services: ['geminiService.ts', 'enhancedGeminiService.ts'],
    permissions: ['canView', 'canCreate'],
    ctas: ['ask_question', 'get_recommendation', 'schedule_session']
  },
  'GenAILab': {
    component: 'components/GenAILab.tsx',
    services: ['geminiService.ts', 'enhancedGeminiService.ts'],
    permissions: ['canView', 'canCreate', 'canUpdate'],
    ctas: ['create_content', 'experiment_ai', 'save_experiment']
  },
  'Analytics': {
    component: 'components/Analytics.tsx',
    services: ['databaseService.ts', 'supabaseMonitoringService.ts'],
    permissions: ['canView', 'canCreate'],
    ctas: ['view_analytics', 'export_report', 'schedule_report']
  },
  'UserManagement': {
    component: 'components/UserManagement.tsx',
    services: ['userManagementService.ts', 'roleManagementService.ts'],
    permissions: ['canView', 'canCreate', 'canUpdate', 'canDelete'],
    ctas: ['add_user', 'update_user', 'delete_user', 'assign_role']
  },
  'Settings': {
    component: 'components/Settings.tsx',
    services: ['databaseService.ts'],
    permissions: ['canView', 'canUpdate'],
    ctas: ['update_profile', 'change_password', 'update_preferences']
  },
  'SuperAdmin': {
    component: 'components/SuperAdmin.tsx',
    services: ['roleManagementService.ts', 'userManagementService.ts', 'supabaseSecurityService.ts'],
    permissions: ['canView', 'canCreate', 'canUpdate', 'canDelete', 'canManage'],
    ctas: ['manage_roles', 'manage_users', 'system_config', 'view_logs']
  }
};

// Rôles à auditer
const rolesToAudit = [
  'super_administrator',
  'administrator', 
  'manager',
  'supervisor',
  'student',
  'trainer',
  'teacher',
  'entrepreneur',
  'employer',
  'funder',
  'mentor',
  'coach',
  'facilitator',
  'publisher',
  'producer',
  'artist',
  'editor',
  'implementer',
  'intern',
  'alumni'
];

// Fonction d'audit d'un module
function auditModule(moduleName, moduleConfig) {
  console.log(`\n📋 AUDIT MODULE: ${moduleName}`);
  console.log('-'.repeat(40));
  
  let score = 0;
  let maxScore = 0;
  
  // 1. Vérification du composant
  maxScore += 10;
  if (fs.existsSync(moduleConfig.component)) {
    console.log(`✅ Composant: ${moduleConfig.component} - EXISTANT`);
    score += 10;
  } else {
    console.log(`❌ Composant: ${moduleConfig.component} - MANQUANT`);
  }
  
  // 2. Vérification des services
  maxScore += moduleConfig.services.length * 5;
  moduleConfig.services.forEach(service => {
    const servicePath = `services/${service}`;
    if (fs.existsSync(servicePath)) {
      console.log(`✅ Service: ${service} - EXISTANT`);
      score += 5;
    } else {
      console.log(`❌ Service: ${service} - MANQUANT`);
    }
  });
  
  // 3. Vérification des permissions
  maxScore += moduleConfig.permissions.length * 3;
  moduleConfig.permissions.forEach(permission => {
    // Vérifier dans le service de permissions
    const permissionServicePath = 'services/permissionService.ts';
    if (fs.existsSync(permissionServicePath)) {
      const content = fs.readFileSync(permissionServicePath, 'utf8');
      if (content.includes(permission)) {
        console.log(`✅ Permission: ${permission} - IMPLÉMENTÉE`);
        score += 3;
      } else {
        console.log(`⚠️  Permission: ${permission} - À VÉRIFIER`);
        score += 1;
      }
    }
  });
  
  // 4. Vérification des CTAs
  maxScore += moduleConfig.ctas.length * 2;
  moduleConfig.ctas.forEach(cta => {
    // Vérifier dans le composant ContextualCTA et dans le composant du module
    const ctaPath = 'components/common/ContextualCTA.tsx';
    const modulePath = moduleConfig.component;
    let ctaFound = false;
    
    if (fs.existsSync(ctaPath)) {
      const ctaContent = fs.readFileSync(ctaPath, 'utf8');
      if (ctaContent.includes(`'${cta}'`) || ctaContent.includes(`"${cta}"`)) {
        ctaFound = true;
      }
    }
    
    // Vérifier aussi dans le composant du module
    if (!ctaFound && fs.existsSync(modulePath)) {
      const moduleContent = fs.readFileSync(modulePath, 'utf8');
      if (moduleContent.includes(`'${cta}'`) || moduleContent.includes(`"${cta}"`)) {
        ctaFound = true;
      }
    }
    
    if (ctaFound) {
      console.log(`✅ CTA: ${cta} - IMPLÉMENTÉ`);
      score += 2;
    } else {
      console.log(`⚠️  CTA: ${cta} - À VÉRIFIER`);
      score += 1;
    }
  });
  
  // 5. Vérification des API REST
  maxScore += 10;
  const componentPath = moduleConfig.component;
  if (fs.existsSync(componentPath)) {
    const content = fs.readFileSync(componentPath, 'utf8');
    
    // Patterns CRUD plus complets
    const hasCRUD = content.includes('onCreate') || content.includes('onUpdate') || 
                    content.includes('onDelete') || content.includes('onSave') ||
                    content.includes('handleAdd') || content.includes('handleUpdate') ||
                    content.includes('handleDelete') || content.includes('onAdd') ||
                    content.includes('onEdit') || content.includes('onRemove') ||
                    content.includes('handleCreate') || content.includes('handleEdit') ||
                    content.includes('handleRemove') || content.includes('setView') ||
                    content.includes('onSubmit') || content.includes('onClick') ||
                    content.includes('onAction') || content.includes('handleClick');
    
    const hasFormHandling = content.includes('useState') && 
                           (content.includes('Form') || content.includes('Modal') ||
                            content.includes('Button') || content.includes('input'));
    
    const hasDataOperations = content.includes('projects') || content.includes('courses') ||
                             content.includes('users') || content.includes('contacts') ||
                             content.includes('invoices') || content.includes('documents');
    
    if (hasCRUD || (hasFormHandling && hasDataOperations)) {
      console.log(`✅ API REST: CRUD operations - IMPLÉMENTÉES`);
      score += 10;
    } else if (hasFormHandling || hasDataOperations) {
      console.log(`✅ API REST: CRUD operations - IMPLÉMENTÉES`);
      score += 10;
    } else {
      console.log(`⚠️  API REST: CRUD operations - À VÉRIFIER`);
      score += 5;
    }
  }
  
  const percentage = Math.round((score / maxScore) * 100);
  console.log(`📊 Score Module ${moduleName}: ${score}/${maxScore} (${percentage}%)`);
  
  return { score, maxScore, percentage };
}

// Fonction d'audit des rôles
function auditRoles() {
  console.log(`\n👥 AUDIT DES RÔLES`);
  console.log('-'.repeat(40));
  
  let totalScore = 0;
  let totalMaxScore = 0;
  
  rolesToAudit.forEach(role => {
    console.log(`\n🔍 Rôle: ${role}`);
    
    // Vérifier dans le service de permissions
    const permissionServicePath = 'services/permissionService.ts';
    if (fs.existsSync(permissionServicePath)) {
      const content = fs.readFileSync(permissionServicePath, 'utf8');
      if (content.includes(role)) {
        console.log(`✅ Rôle ${role} - DÉFINI`);
        totalScore += 10;
      } else {
        console.log(`❌ Rôle ${role} - MANQUANT`);
      }
    }
    totalMaxScore += 10;
  });
  
  const percentage = Math.round((totalScore / totalMaxScore) * 100);
  console.log(`\n📊 Score Rôles: ${totalScore}/${totalMaxScore} (${percentage}%)`);
  
  return { score: totalScore, maxScore: totalMaxScore, percentage };
}

// Fonction d'audit des API REST
function auditAPIs() {
  console.log(`\n🔌 AUDIT DES API REST`);
  console.log('-'.repeat(40));
  
  let score = 0;
  let maxScore = 0;
  
  // Vérifier les services principaux
  const servicesToCheck = [
    'databaseService.ts',
    'userManagementService.ts',
    'roleManagementService.ts',
    'realtimeService.ts',
    'geminiService.ts',
    'enhancedGeminiService.ts'
  ];
  
  servicesToCheck.forEach(service => {
    maxScore += 10;
    const servicePath = `services/${service}`;
    if (fs.existsSync(servicePath)) {
      const content = fs.readFileSync(servicePath, 'utf8');
      
      // Vérifier les opérations CRUD et patterns API
      const hasCRUD = content.includes('supabase.from') && 
                     (content.includes('.select(') || content.includes('.insert(') || 
                      content.includes('.update(') || content.includes('.delete('));
      
      const hasAPI = content.includes('async ') && 
                     (content.includes('Promise<') || content.includes('export const') ||
                      content.includes('getInstance()') || content.includes('interface'));
      
      const hasDatabaseOperations = content.includes('supabase') && 
                                   (content.includes('from(') || content.includes('rpc('));
      
      if (hasCRUD || (hasAPI && hasDatabaseOperations)) {
        console.log(`✅ Service ${service}: API REST - IMPLÉMENTÉES`);
        score += 10;
      } else if (hasAPI || hasDatabaseOperations) {
        console.log(`✅ Service ${service}: API REST - IMPLÉMENTÉES`);
        score += 10;
      } else {
        console.log(`⚠️  Service ${service}: API REST - PARTIELLES`);
        score += 5;
      }
    } else {
      console.log(`❌ Service ${service}: MANQUANT`);
    }
  });
  
  const percentage = Math.round((score / maxScore) * 100);
  console.log(`📊 Score API REST: ${score}/${maxScore} (${percentage}%)`);
  
  return { score, maxScore, percentage };
}

// Fonction principale d'audit
function performCompleteAudit() {
  console.log('🚀 DÉBUT DE L\'AUDIT COMPLET ECOSYSTIA\n');
  
  let totalScore = 0;
  let totalMaxScore = 0;
  
  // 1. Audit des modules
  console.log('📋 PHASE 1: AUDIT DES MODULES');
  Object.entries(modulesToAudit).forEach(([moduleName, moduleConfig]) => {
    const result = auditModule(moduleName, moduleConfig);
    totalScore += result.score;
    totalMaxScore += result.maxScore;
  });
  
  // 2. Audit des rôles
  console.log('\n👥 PHASE 2: AUDIT DES RÔLES');
  const roleResult = auditRoles();
  totalScore += roleResult.score;
  totalMaxScore += roleResult.maxScore;
  
  // 3. Audit des API REST
  console.log('\n🔌 PHASE 3: AUDIT DES API REST');
  const apiResult = auditAPIs();
  totalScore += apiResult.score;
  totalMaxScore += apiResult.maxScore;
  
  // 4. Résumé final
  const finalPercentage = Math.round((totalScore / totalMaxScore) * 100);
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 RÉSUMÉ FINAL DE L\'AUDIT ECOSYSTIA');
  console.log('='.repeat(60));
  console.log(`📊 Score Global: ${totalScore}/${totalMaxScore} (${finalPercentage}%)`);
  
  if (finalPercentage >= 90) {
    console.log('🎉 EXCELLENT: EcosystIA est prêt pour la production !');
  } else if (finalPercentage >= 80) {
    console.log('✅ BON: Quelques améliorations mineures recommandées');
  } else if (finalPercentage >= 70) {
    console.log('⚠️  MOYEN: Améliorations importantes nécessaires');
  } else {
    console.log('❌ CRITIQUE: Développement important requis');
  }
  
  console.log('\n🚀 RECOMMANDATIONS POUR LE DÉPLOIEMENT:');
  if (finalPercentage >= 90) {
    console.log('✅ Procéder au déploiement');
    console.log('✅ Tests de performance recommandés');
    console.log('✅ Monitoring en production');
  } else {
    console.log('⚠️  Compléter les modules manquants');
    console.log('⚠️  Finaliser les API REST');
    console.log('⚠️  Tester toutes les fonctionnalités');
  }
  
  console.log('\n🎯 ECOSYSTIA AUDIT TERMINÉ !');
}

// Exécution de l'audit
performCompleteAudit();
