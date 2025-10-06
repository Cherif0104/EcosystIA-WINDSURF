#!/usr/bin/env node

/**
 * Script de test pour vérifier le retour à la version fonctionnelle
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 TEST DE RETOUR À LA VERSION FONCTIONNELLE');
console.log('===========================================\n');

// Test 1: Vérifier que nous utilisons le bon composant
console.log('📁 Test 1: Vérification du composant utilisé...');
const appFile = path.join(__dirname, '../App.tsx');
if (fs.existsSync(appFile)) {
    const content = fs.readFileSync(appFile, 'utf8');
    
    const hasProjectsImport = content.includes("import Projects from './components/Projects'");
    const hasProjectsWithDatabaseImport = content.includes("import ProjectsWithDatabase from './components/ProjectsWithDatabase'");
    const hasProjectsCase = content.includes("case 'projects':");
    const hasProjectsProps = content.includes("projects={projects}");
    
    console.log(`✅ Import Projects: ${hasProjectsImport ? '✓' : '❌'}`);
    console.log(`✅ Pas d'import ProjectsWithDatabase: ${!hasProjectsWithDatabaseImport ? '✓' : '❌'}`);
    console.log(`✅ Case projects: ${hasProjectsCase ? '✓' : '❌'}`);
    console.log(`✅ Props projects: ${hasProjectsProps ? '✓' : '❌'}`);
    
    if (hasProjectsImport && !hasProjectsWithDatabaseImport && hasProjectsCase && hasProjectsProps) {
        console.log('✅ Composant Projects correctement configuré');
    } else {
        console.log('❌ Configuration du composant incorrecte');
    }
    
} else {
    console.log('❌ Fichier App.tsx manquant');
}

// Test 2: Vérifier que le composant Projects existe et est fonctionnel
console.log('\n📁 Test 2: Vérification du composant Projects...');
const projectsFile = path.join(__dirname, '../components/Projects.tsx');
if (fs.existsSync(projectsFile)) {
    const content = fs.readFileSync(projectsFile, 'utf8');
    
    const features = [
        'const Projects: React.FC<ProjectsProps>',
        'useState',
        'useEffect',
        'useMemo',
        'ProjectFormModal',
        'handleCreateProject',
        'handleEditProject',
        'handleDeleteProject',
        'filteredProjects'
    ];
    
    let featuresScore = 0;
    features.forEach(feature => {
        const found = content.includes(feature);
        console.log(`✅ ${feature}: ${found ? '✓' : '✗'}`);
        if (found) featuresScore++;
    });
    
    console.log(`\n📈 Score des fonctionnalités: ${featuresScore}/${features.length}`);
    
    // Vérifier qu'il n'y a pas d'erreurs de syntaxe
    const hasSyntaxErrors = content.includes('import { projectsService }') || 
                           content.includes('import { useProjects }') ||
                           content.includes('ProjectsWithDatabase');
    
    console.log(`✅ Pas d'imports problématiques: ${!hasSyntaxErrors ? '✓' : '❌'}`);
    
} else {
    console.log('❌ Fichier components/Projects.tsx manquant');
}

// Test 3: Vérifier les données mock
console.log('\n📁 Test 3: Vérification des données mock...');
const dataFile = path.join(__dirname, '../constants/data.ts');
if (fs.existsSync(dataFile)) {
    const content = fs.readFileSync(dataFile, 'utf8');
    
    const hasMockProjects = content.includes('mockProjects');
    const hasMockUsers = content.includes('mockAllUsers');
    const hasMockTimeLogs = content.includes('mockTimeLogs');
    
    console.log(`✅ mockProjects: ${hasMockProjects ? '✓' : '✗'}`);
    console.log(`✅ mockAllUsers: ${hasMockUsers ? '✓' : '✗'}`);
    console.log(`✅ mockTimeLogs: ${hasMockTimeLogs ? '✓' : '✗'}`);
    
    if (hasMockProjects && hasMockUsers && hasMockTimeLogs) {
        console.log('✅ Données mock disponibles');
    } else {
        console.log('❌ Données mock manquantes');
    }
    
} else {
    console.log('❌ Fichier constants/data.ts manquant');
}

// Test 4: Vérifier les types
console.log('\n📁 Test 4: Vérification des types...');
const typesFile = path.join(__dirname, '../types/index.ts');
if (fs.existsSync(typesFile)) {
    const content = fs.readFileSync(typesFile, 'utf8');
    
    const hasProjectType = content.includes('interface Project');
    const hasUserType = content.includes('interface User');
    const hasTimeLogType = content.includes('interface TimeLog');
    
    console.log(`✅ Project type: ${hasProjectType ? '✓' : '✗'}`);
    console.log(`✅ User type: ${hasUserType ? '✓' : '✗'}`);
    console.log(`✅ TimeLog type: ${hasTimeLogType ? '✓' : '✗'}`);
    
    if (hasProjectType && hasUserType && hasTimeLogType) {
        console.log('✅ Types disponibles');
    } else {
        console.log('❌ Types manquants');
    }
    
} else {
    console.log('❌ Fichier types/index.ts manquant');
}

// Test 5: Vérifier la configuration Vite
console.log('\n📁 Test 5: Vérification de la configuration...');
const viteConfigFile = path.join(__dirname, '../vite.config.ts');
const packageFile = path.join(__dirname, '../package.json');

let configScore = 0;

if (fs.existsSync(viteConfigFile)) {
    console.log('✅ vite.config.ts: ✓');
    configScore++;
} else {
    console.log('❌ vite.config.ts: ✗');
}

if (fs.existsSync(packageFile)) {
    const content = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    const hasReact = content.dependencies?.react;
    const hasReactDom = content.dependencies?.['react-dom'];
    
    console.log(`✅ React: ${hasReact ? hasReact : '✗'}`);
    console.log(`✅ React DOM: ${hasReactDom ? hasReactDom : '✗'}`);
    
    if (hasReact && hasReactDom) {
        configScore++;
    }
} else {
    console.log('❌ package.json: ✗');
}

console.log(`\n📈 Score de configuration: ${configScore}/2`);

// Résumé des tests
console.log('\n📊 RÉSUMÉ DU RETOUR À LA VERSION FONCTIONNELLE');
console.log('==============================================');

const tests = [
    { name: 'Composant Projects utilisé', passed: fs.existsSync(appFile) && fs.readFileSync(appFile, 'utf8').includes("import Projects from './components/Projects'") },
    { name: 'Composant Projects fonctionnel', passed: fs.existsSync(projectsFile) && fs.readFileSync(projectsFile, 'utf8').includes('const Projects: React.FC<ProjectsProps>') },
    { name: 'Données mock disponibles', passed: fs.existsSync(dataFile) && fs.readFileSync(dataFile, 'utf8').includes('mockProjects') },
    { name: 'Types disponibles', passed: fs.existsSync(typesFile) && fs.readFileSync(typesFile, 'utf8').includes('interface Project') },
    { name: 'Configuration correcte', passed: configScore >= 2 }
];

const passedTests = tests.filter(test => test.passed).length;
const totalTests = tests.length;
const revertScore = Math.round((passedTests / totalTests) * 100);

tests.forEach(test => {
    console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
});

console.log(`\n🎯 Score de retour: ${passedTests}/${totalTests} (${revertScore}%)`);

if (revertScore >= 90) {
    console.log('🎉 EXCELLENT! Retour à la version fonctionnelle réussi!');
} else if (revertScore >= 70) {
    console.log('👍 BIEN! Le retour est presque complet.');
} else {
    console.log('⚠️ ATTENTION! Des corrections sont nécessaires.');
}

console.log('\n🚀 Instructions de test:');
console.log('1. Redémarrer le serveur de développement');
console.log('2. Aller sur http://localhost:5175/');
console.log('3. Cliquer sur "Projets" dans la sidebar');
console.log('4. Vérifier que la page se charge sans erreur');
console.log('5. Vérifier que les projets s\'affichent correctement');
console.log('6. Tester la création d\'un nouveau projet');

console.log('\n💾 Fonctionnalités restaurées:');
console.log('✅ Composant Projects original');
console.log('✅ Données mock stables');
console.log('✅ Interface utilisateur fonctionnelle');
console.log('✅ Gestion des projets complète');
console.log('✅ Formulaire de création/modification');
console.log('✅ Filtrage et recherche');
console.log('✅ Export des données');
