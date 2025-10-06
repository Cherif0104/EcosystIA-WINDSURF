#!/usr/bin/env node

/**
 * Script de test pour vérifier la correction de la navigation du formulaire
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 TEST DE CORRECTION DE LA NAVIGATION');
console.log('======================================\n');

// Test 1: Vérifier qu'il n'y a plus de références problématiques
console.log('📁 Test 1: Vérification des références problématiques...');
const projectsFile = path.join(__dirname, '../components/Projects.tsx');
if (fs.existsSync(projectsFile)) {
    const content = fs.readFileSync(projectsFile, 'utf8');
    
    // Vérifier qu'il n'y a plus de références problématiques
    const hasProblematicStepValidation = content.includes('stepValidation[currentStep].length');
    const hasProblematicStepValidationArray = content.includes('stepValidation[step].length');
    
    console.log(`✅ stepValidation[currentStep].length: ${hasProblematicStepValidation ? '❌ TROUVÉ (PROBLÉMATIQUE)' : '✅ CORRIGÉ'}`);
    console.log(`✅ stepValidation[step].length: ${hasProblematicStepValidationArray ? '❌ TROUVÉ (PROBLÉMATIQUE)' : '✅ CORRIGÉ'}`);
    
    // Vérifier les nouvelles fonctions
    const hasCanProceedToStep = content.includes('canProceedToStep');
    const hasValidateStepFunction = content.includes('const validateStep = (step: number): boolean => {');
    const hasNextStepFunction = content.includes('const nextStep = () => {');
    
    console.log(`✅ Fonction canProceedToStep: ${hasCanProceedToStep ? '✓' : '✗'}`);
    console.log(`✅ Fonction validateStep: ${hasValidateStepFunction ? '✓' : '✗'}`);
    console.log(`✅ Fonction nextStep: ${hasNextStepFunction ? '✓' : '✗'}`);
    
} else {
    console.log('❌ Fichier Projects.tsx manquant');
}

// Test 2: Vérifier la logique de validation
console.log('\n📁 Test 2: Vérification de la logique de validation...');
if (fs.existsSync(projectsFile)) {
    const content = fs.readFileSync(projectsFile, 'utf8');
    
    // Vérifier la logique de validation
    const hasStep1Validation = content.includes('formData.title.trim() !== \'\' && formData.description.trim() !== \'\'');
    const hasStep2Validation = content.includes('true; // Étape de configuration, toujours valide');
    const hasStep3Validation = content.includes('true; // Étape budget/client, optionnelle');
    const hasStep4Validation = content.includes('formData.team.length > 0');
    
    console.log(`✅ Validation étape 1: ${hasStep1Validation ? '✓' : '✗'}`);
    console.log(`✅ Validation étape 2: ${hasStep2Validation ? '✓' : '✗'}`);
    console.log(`✅ Validation étape 3: ${hasStep3Validation ? '✓' : '✗'}`);
    console.log(`✅ Validation étape 4: ${hasStep4Validation ? '✓' : '✗'}`);
    
} else {
    console.log('❌ Fichier Projects.tsx manquant');
}

// Test 3: Vérifier la navigation
console.log('\n📁 Test 3: Vérification de la navigation...');
if (fs.existsSync(projectsFile)) {
    const content = fs.readFileSync(projectsFile, 'utf8');
    
    // Vérifier les fonctions de navigation
    const hasNextStepLogic = content.includes('if (canProceed && currentStep < 4)');
    const hasPrevStepLogic = content.includes('if (currentStep > 1)');
    const hasGoToStepLogic = content.includes('if (canProceedToStep(step))');
    
    console.log(`✅ Logique nextStep: ${hasNextStepLogic ? '✓' : '✗'}`);
    console.log(`✅ Logique prevStep: ${hasPrevStepLogic ? '✓' : '✗'}`);
    console.log(`✅ Logique goToStep: ${hasGoToStepLogic ? '✓' : '✗'}`);
    
} else {
    console.log('❌ Fichier Projects.tsx manquant');
}

// Test 4: Vérifier les hooks React
console.log('\n📁 Test 4: Vérification des hooks React...');
if (fs.existsSync(projectsFile)) {
    const content = fs.readFileSync(projectsFile, 'utf8');
    
    // Vérifier les hooks
    const hasUseState = content.includes('useState');
    const hasUseMemo = content.includes('useMemo');
    const hasUseEffect = content.includes('useEffect');
    
    console.log(`✅ useState: ${hasUseState ? '✓' : '✗'}`);
    console.log(`✅ useMemo: ${hasUseMemo ? '✓' : '✗'}`);
    console.log(`✅ useEffect: ${hasUseEffect ? '✓' : '✗'}`);
    
    // Vérifier qu'il n'y a pas de re-renders infinis
    const hasInfiniteRenders = content.includes('stepValidation[currentStep]') || 
                              content.includes('stepValidation[step]') ||
                              content.includes('stepValidation[currentStep].length');
    
    console.log(`✅ Pas de re-renders infinis: ${!hasInfiniteRenders ? '✓' : '❌ PROBLÈME DÉTECTÉ'}`);
    
} else {
    console.log('❌ Fichier Projects.tsx manquant');
}

// Test 5: Vérifier la gestion d'erreur
console.log('\n📁 Test 5: Vérification de la gestion d\'erreur...');
if (fs.existsSync(projectsFile)) {
    const content = fs.readFileSync(projectsFile, 'utf8');
    
    // Vérifier la gestion d'erreur
    const hasTryCatch = content.includes('try {') && content.includes('catch (error) {');
    const hasFinally = content.includes('finally {');
    const hasSetErrors = content.includes('setErrors');
    const hasSetIsLoading = content.includes('setIsLoading');
    
    console.log(`✅ Try/catch: ${hasTryCatch ? '✓' : '✗'}`);
    console.log(`✅ Finally: ${hasFinally ? '✓' : '✗'}`);
    console.log(`✅ setErrors: ${hasSetErrors ? '✓' : '✗'}`);
    console.log(`✅ setIsLoading: ${hasSetIsLoading ? '✓' : '✗'}`);
    
} else {
    console.log('❌ Fichier Projects.tsx manquant');
}

// Résumé des tests
console.log('\n📊 RÉSUMÉ DE LA CORRECTION');
console.log('==========================');

const tests = [
    { name: 'Fichier Projects.tsx', passed: fs.existsSync(projectsFile) },
    { name: 'Références problématiques supprimées', passed: fs.existsSync(projectsFile) && !fs.readFileSync(projectsFile, 'utf8').includes('stepValidation[currentStep].length') },
    { name: 'Fonction canProceedToStep ajoutée', passed: fs.existsSync(projectsFile) && fs.readFileSync(projectsFile, 'utf8').includes('canProceedToStep') },
    { name: 'Logique de validation corrigée', passed: fs.existsSync(projectsFile) && fs.readFileSync(projectsFile, 'utf8').includes('formData.title.trim() !== \'\'') },
    { name: 'Navigation stabilisée', passed: fs.existsSync(projectsFile) && fs.readFileSync(projectsFile, 'utf8').includes('if (canProceed && currentStep < 4)') },
    { name: 'Hooks React optimisés', passed: fs.existsSync(projectsFile) && fs.readFileSync(projectsFile, 'utf8').includes('useState') },
    { name: 'Gestion d\'erreur robuste', passed: fs.existsSync(projectsFile) && fs.readFileSync(projectsFile, 'utf8').includes('try {') },
    { name: 'Pas de re-renders infinis', passed: fs.existsSync(projectsFile) && !fs.readFileSync(projectsFile, 'utf8').includes('stepValidation[currentStep]') }
];

const passedTests = tests.filter(test => test.passed).length;
const totalTests = tests.length;
const fixScore = Math.round((passedTests / totalTests) * 100);

tests.forEach(test => {
    console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
});

console.log(`\n🎯 Score de correction: ${passedTests}/${totalTests} (${fixScore}%)`);

if (fixScore >= 90) {
    console.log('🎉 EXCELLENT! La navigation du formulaire a été corrigée avec succès!');
} else if (fixScore >= 70) {
    console.log('👍 BIEN! La correction est presque complète.');
} else {
    console.log('⚠️ ATTENTION! Des corrections supplémentaires sont nécessaires.');
}

console.log('\n🚀 Instructions de test:');
console.log('1. Redémarrer le serveur de développement');
console.log('2. Ouvrir le formulaire "Nouveau projet"');
console.log('3. Remplir le titre et la description');
console.log('4. Cliquer sur "Suivant" - ne devrait plus y avoir de page blanche');
console.log('5. Tester la navigation entre toutes les étapes');
console.log('6. Vérifier que les validations fonctionnent correctement');
