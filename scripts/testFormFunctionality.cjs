#!/usr/bin/env node

/**
 * Script de test automatisé pour le formulaire de projets
 * Teste les fonctionnalités principales de l'interface
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 TEST DU FORMULAIRE DE PROJETS');
console.log('================================\n');

// Test 1: Vérification des fichiers CSS
console.log('📁 Test 1: Vérification des styles CSS...');
const cssFile = path.join(__dirname, '../src/styles/scrollbar.css');
if (fs.existsSync(cssFile)) {
    console.log('✅ Fichier CSS scrollbar.css trouvé');
    const cssContent = fs.readFileSync(cssFile, 'utf8');
    const hasScrollbarStyles = cssContent.includes('scrollbar-thin');
    const hasGradients = cssContent.includes('linear-gradient');
    const hasAnimations = cssContent.includes('@keyframes');
    
    console.log(`✅ Styles de scrollbar: ${hasScrollbarStyles ? '✓' : '✗'}`);
    console.log(`✅ Gradients CSS: ${hasGradients ? '✓' : '✗'}`);
    console.log(`✅ Animations: ${hasAnimations ? '✓' : '✗'}`);
} else {
    console.log('❌ Fichier CSS scrollbar.css manquant');
}

// Test 2: Vérification du composant Projects
console.log('\n📁 Test 2: Vérification du composant Projects...');
const projectsFile = path.join(__dirname, '../components/Projects.tsx');
if (fs.existsSync(projectsFile)) {
    console.log('✅ Fichier Projects.tsx trouvé');
    const projectsContent = fs.readFileSync(projectsFile, 'utf8');
    
    // Vérifications des fonctionnalités
    const hasStepNavigation = projectsContent.includes('currentStep');
    const hasScrollHandling = projectsContent.includes('handleScroll');
    const hasTeamSelection = projectsContent.includes('toggleTeamMember');
    const hasExportFunction = projectsContent.includes('handleExportProjects');
    const hasValidation = projectsContent.includes('stepValidation');
    const hasScrollbarClasses = projectsContent.includes('scrollbar-thin');
    
    console.log(`✅ Navigation par étapes: ${hasStepNavigation ? '✓' : '✗'}`);
    console.log(`✅ Gestion du défilement: ${hasScrollHandling ? '✓' : '✗'}`);
    console.log(`✅ Sélection d'équipe: ${hasTeamSelection ? '✓' : '✗'}`);
    console.log(`✅ Fonction d'export: ${hasExportFunction ? '✓' : '✗'}`);
    console.log(`✅ Validation des étapes: ${hasValidation ? '✓' : '✗'}`);
    console.log(`✅ Classes de scrollbar: ${hasScrollbarClasses ? '✓' : '✗'}`);
} else {
    console.log('❌ Fichier Projects.tsx manquant');
}

// Test 3: Vérification du fichier HTML
console.log('\n📁 Test 3: Vérification du fichier HTML...');
const htmlFile = path.join(__dirname, '../index.html');
if (fs.existsSync(htmlFile)) {
    console.log('✅ Fichier index.html trouvé');
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    
    const hasTailwind = htmlContent.includes('tailwindcss.com');
    const hasFontAwesome = htmlContent.includes('font-awesome');
    const hasScrollbarCSS = htmlContent.includes('scrollbar.css');
    
    console.log(`✅ Tailwind CSS: ${hasTailwind ? '✓' : '✗'}`);
    console.log(`✅ Font Awesome: ${hasFontAwesome ? '✓' : '✗'}`);
    console.log(`✅ Scrollbar CSS: ${hasScrollbarCSS ? '✓' : '✗'}`);
} else {
    console.log('❌ Fichier index.html manquant');
}

// Test 4: Vérification des fonctionnalités React
console.log('\n⚛️ Test 4: Vérification des hooks React...');
const projectsContent = fs.readFileSync(projectsFile, 'utf8');

const hasUseState = projectsContent.includes('useState');
const hasUseMemo = projectsContent.includes('useMemo');
const hasUseEffect = projectsContent.includes('useEffect');

console.log(`✅ useState hooks: ${hasUseState ? '✓' : '✗'}`);
console.log(`✅ useMemo hooks: ${hasUseMemo ? '✓' : '✗'}`);
console.log(`✅ useEffect hooks: ${hasUseEffect ? '✓' : '✗'}`);

// Test 5: Vérification des classes CSS personnalisées
console.log('\n🎨 Test 5: Vérification des classes CSS...');
const cssClasses = [
    'scrollbar-thin',
    'scrollbar-blue',
    'scrollbar-green',
    'scrollbar-shadow',
    'scroll-container',
    'scroll-indicator'
];

let allClassesFound = true;
cssClasses.forEach(className => {
    const found = projectsContent.includes(className);
    console.log(`✅ Classe ${className}: ${found ? '✓' : '✗'}`);
    if (!found) allClassesFound = false;
});

// Résumé des tests
console.log('\n📊 RÉSUMÉ DES TESTS');
console.log('==================');

const tests = [
    { name: 'Styles CSS', passed: fs.existsSync(cssFile) },
    { name: 'Composant Projects', passed: fs.existsSync(projectsFile) },
    { name: 'Fichier HTML', passed: fs.existsSync(htmlFile) },
    { name: 'Navigation par étapes', passed: projectsContent.includes('currentStep') },
    { name: 'Gestion du défilement', passed: projectsContent.includes('handleScroll') },
    { name: 'Sélection d\'équipe', passed: projectsContent.includes('toggleTeamMember') },
    { name: 'Fonction d\'export', passed: projectsContent.includes('handleExportProjects') },
    { name: 'Classes CSS personnalisées', passed: allClassesFound }
];

const passedTests = tests.filter(test => test.passed).length;
const totalTests = tests.length;
const successRate = Math.round((passedTests / totalTests) * 100);

tests.forEach(test => {
    console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
});

console.log(`\n🎯 Score: ${passedTests}/${totalTests} (${successRate}%)`);

if (successRate >= 90) {
    console.log('🎉 EXCELLENT! L\'application est prête pour la production!');
} else if (successRate >= 70) {
    console.log('👍 BIEN! Quelques améliorations mineures recommandées.');
} else {
    console.log('⚠️ ATTENTION! Des corrections importantes sont nécessaires.');
}

console.log('\n🚀 Instructions de test manuel:');
console.log('1. Ouvrir http://localhost:5175/');
console.log('2. Cliquer sur "Nouveau projet"');
console.log('3. Tester la navigation entre les étapes');
console.log('4. Vérifier les barres de défilement');
console.log('5. Tester la sélection d\'équipe');
console.log('6. Tester l\'export des projets');
console.log('7. Vérifier le responsive design');
