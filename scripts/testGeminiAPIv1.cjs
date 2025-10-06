const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyACERIXIaYEfghB6mFmQIwyGVlOXHRkOtU';

async function testGeminiAPIv1() {
    console.log('🤖 Test de l\'API Gemini v1 pour ARVA');
    
    if (!API_KEY) {
        console.error('❌ Clé API Gemini manquante');
        return;
    }

    try {
        console.log('🔑 Clé API trouvée:', API_KEY.substring(0, 10) + '...');
        
        const genAI = new GoogleGenerativeAI(API_KEY);
        
        // Test avec différents modèles
        const models = ['gemini-pro', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
        
        for (const modelName of models) {
            try {
                console.log(`📡 Test du modèle: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                
                const result = await model.generateContent("Bonjour, peux-tu me répondre en français ?");
                const response = await result.response;
                const text = response.text();
                
                console.log(`✅ Modèle ${modelName} fonctionne !`);
                console.log('📝 Réponse:', text.substring(0, 100) + '...');
                console.log('\n🎉 API Gemini fonctionne correctement !');
                return;
                
            } catch (modelError) {
                console.log(`❌ Modèle ${modelName} échoué:`, modelError.message.split('\n')[0]);
            }
        }
        
        console.log('\n❌ Aucun modèle ne fonctionne');
        
    } catch (error) {
        console.error('❌ Erreur générale API Gemini:', error.message);
    }
}

testGeminiAPIv1();
