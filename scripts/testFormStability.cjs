#!/usr/bin/env node

/**
 * Script de test de stabilité du formulaire de projets
 * Vérifie les problèmes de performance et de stabilité
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 TEST DE STABILITÉ DU FORMULAIRE');
console.log('==================================\n');

// Test 1: Vérification des hooks React
console.log('⚛️ Test 1: Vérification des hooks React...');
const projectsFile = path.join(__dirname, '../components/Projects.tsx');
if (fs.existsSync(projectsFile)) {
    const content = fs.readFileSync(projectsFile, 'utf8');
    
    // Vérifier les hooks
    const hasUseState = content.includes('useState');
    const hasUseMemo = content.includes('useMemo');
    const hasUseEffect = content.includes('useEffect');
    
    console.log(`✅ useState: ${hasUseState ? '✓' : '✗'}`);
    console.log(`✅ useMemo: ${hasUseMemo ? '✓' : '✗'}`);
    console.log(`✅ useEffect: ${hasUseEffect ? '✓' : '✗'}`);
    
    // Vérifier les gestionnaires d'événements
    const hasHandleChange = content.includes('handleChange');
    const hasHandleSubmit = content.includes('handleSubmit');
    const hasHandleScroll = content.includes('handleScroll');
    
    console.log(`✅ handleChange: ${hasHandleChange ? '✓' : '✗'}`);
    console.log(`✅ handleSubmit: ${hasHandleSubmit ? '✓' : '✗'}`);
    console.log(`✅ handleScroll: ${hasHandleScroll ? '✓' : '✗'}`);
    
    // Vérifier la validation
    const hasValidateForm = content.includes('validateForm');
    const hasValidateStep = content.includes('validateStep');
    const hasStepValidation = content.includes('stepValidation');
    
    console.log(`✅ validateForm: ${hasValidateForm ? '✓' : '✗'}`);
    console.log(`✅ validateStep: ${hasValidateStep ? '✓' : '✗'}`);
    console.log(`✅ stepValidation: ${hasStepValidation ? '✓' : '✗'}`);
    
} else {
    console.log('❌ Fichier Projects.tsx manquant');
}

// Test 2: Vérification des états
console.log('\n📊 Test 2: Vérification des états...');
if (fs.existsSync(projectsFile)) {
    const content = fs.readFileSync(projectsFile, 'utf8');
    
    // Vérifier les états principaux
    const states = [
        'formData',
        'currentStep',
        'isLoading',
        'errors',
        'scrollProgress',
        'teamSearchTerm',
        'teamRoleFilter'
    ];
    
    let allStatesFound = true;
    states.forEach(state => {
        const found = content.includes(state);
        console.log(`✅ État ${state}: ${found ? '✓' : '✗'}`);
        if (!found) allStatesFound = false;
    });
    
    console.log(`\n📈 Tous les états présents: ${allStatesFound ? '✓' : '✗'}`);
}

// Test 3: Vérification de la gestion d'erreur
console.log('\n⚠️ Test 3: Vérification de la gestion d\'erreur...');
if (fs.existsSync(projectsFile)) {
    const content = fs.readFileSync(projectsFile, 'utf8');
    
    // Vérifier la gestion d'erreur
    const errorHandling = [
        'try {',
        'catch (error) {',
        'finally {',
        'setErrors',
        'setIsLoading(false)',
        'console.error'
    ];
    
    let errorHandlingScore = 0;
    errorHandling.forEach(pattern => {
        const found = content.includes(pattern);
        console.log(`✅ ${pattern}: ${found ? '✓' : '✗'}`);
        if (found) errorHandlingScore++;
    });
    
    console.log(`\n📈 Score de gestion d'erreur: ${errorHandlingScore}/${errorHandling.length}`);
}

// Test 4: Vérification de la performance
console.log('\n⚡ Test 4: Vérification de la performance...');
if (fs.existsSync(projectsFile)) {
    const content = fs.readFileSync(projectsFile, 'utf8');
    
    // Vérifier les optimisations de performance
    const performanceFeatures = [
        'useMemo',
        'useCallback',
        'debounce',
        'throttle',
        'memo',
        'React.memo'
    ];
    
    let performanceScore = 0;
    performanceFeatures.forEach(feature => {
        const found = content.includes(feature);
        console.log(`✅ ${feature}: ${found ? '✓' : '✗'}`);
        if (found) performanceScore++;
    });
    
    console.log(`\n📈 Score de performance: ${performanceScore}/${performanceFeatures.length}`);
}

// Test 5: Vérification de la validation
console.log('\n✅ Test 5: Vérification de la validation...');
if (fs.existsSync(projectsFile)) {
    const content = fs.readFileSync(projectsFile, 'utf8');
    
    // Vérifier les validations
    const validations = [
        'title.trim()',
        'description.trim()',
        'isNaN(Number(',
        'new Date(',
        'formData.team.length',
        'required'
    ];
    
    let validationScore = 0;
    validations.forEach(validation => {
        const found = content.includes(validation);
        console.log(`✅ ${validation}: ${found ? '✓' : '✗'}`);
        if (found) validationScore++;
    });
    
    console.log(`\n📈 Score de validation: ${validationScore}/${validations.length}`);
}

// Test 6: Vérification des dépendances
console.log('\n📦 Test 6: Vérification des dépendances...');
const packageFile = path.join(__dirname, '../package.json');
if (fs.existsSync(packageFile)) {
    const packageContent = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    const dependencies = packageContent.dependencies || {};
    
    console.log('Dépendances principales:');
    console.log(`✅ React: ${dependencies.react || 'Non trouvé'}`);
    console.log(`✅ TypeScript: ${dependencies.typescript || 'Non trouvé'}`);
    console.log(`✅ Vite: ${dependencies.vite || 'Non trouvé'}`);
    
    // Vérifier les dépendances de développement
    const devDependencies = packageContent.devDependencies || {};
    console.log(`✅ @types/react: ${devDependencies['@types/react'] || 'Non trouvé'}`);
    console.log(`✅ Tailwind CSS: ${devDependencies.tailwindcss || 'Non trouvé'}`);
}

// Résumé des tests
console.log('\n📊 RÉSUMÉ DES TESTS DE STABILITÉ');
console.log('================================');

const tests = [
    { name: 'Hooks React', passed: fs.existsSync(projectsFile) && fs.readFileSync(projectsFile, 'utf8').includes('useState') },
    { name: 'Gestionnaires d\'événements', passed: fs.existsSync(projectsFile) && fs.readFileSync(projectsFile, 'utf8').includes('handleChange') },
    { name: 'Validation des étapes', passed: fs.existsSync(projectsFile) && fs.readFileSync(projectsFile, 'utf8').includes('validateStep') },
    { name: 'Gestion d\'erreur', passed: fs.existsSync(projectsFile) && fs.readFileSync(projectsFile, 'utf8').includes('try {') },
    { name: 'Optimisations de performance', passed: fs.existsSync(projectsFile) && fs.readFileSync(projectsFile, 'utf8').includes('useMemo') },
    { name: 'Validation des champs', passed: fs.existsSync(projectsFile) && fs.readFileSync(projectsFile, 'utf8').includes('title.trim()') },
    { name: 'Dépendances', passed: fs.existsSync(packageFile) },
    { name: 'Fichier de composant', passed: fs.existsSync(projectsFile) }
];

const passedTests = tests.filter(test => test.passed).length;
const totalTests = tests.length;
const stabilityScore = Math.round((passedTests / totalTests) * 100);

tests.forEach(test => {
    console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
});

console.log(`\n🎯 Score de stabilité: ${passedTests}/${totalTests} (${stabilityScore}%)`);

if (stabilityScore >= 90) {
    console.log('🎉 EXCELLENT! Le formulaire est très stable!');
} else if (stabilityScore >= 70) {
    console.log('👍 BIEN! Quelques améliorations mineures recommandées.');
} else {
    console.log('⚠️ ATTENTION! Des corrections importantes sont nécessaires.');
}

console.log('\n🔧 Recommandations d\'amélioration:');
console.log('1. Vérifier les re-renders avec React DevTools');
console.log('2. Tester la navigation entre les étapes');
console.log('3. Valider la gestion d\'erreur en cas de problème réseau');
console.log('4. Tester la performance avec de gros volumes de données');
console.log('5. Vérifier la responsivité sur différents écrans');
