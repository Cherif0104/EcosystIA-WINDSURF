const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyACERIXIaYEfghB6mFmQIwyGVlOXHRkOtU';

async function testGeminiAPI() {
    console.log('🤖 Test de l\'API Gemini pour ARVA');
    
    if (!API_KEY) {
        console.error('❌ Clé API Gemini manquante');
        return;
    }

    try {
        console.log('🔑 Clé API trouvée:', API_KEY.substring(0, 10) + '...');
        
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        console.log('📡 Test de connexion à Gemini...');
        
        const result = await model.generateContent("Bonjour, peux-tu me répondre en français ?");
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ Réponse Gemini reçue:');
        console.log('📝 Contenu:', text.substring(0, 100) + '...');
        
        console.log('\n🎉 API Gemini fonctionne correctement !');
        
    } catch (error) {
        console.error('❌ Erreur API Gemini:', error.message);
        
        if (error.message.includes('API_KEY_INVALID')) {
            console.log('💡 Solution: Vérifiez que la clé API est valide');
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
            console.log('💡 Solution: Quota API dépassé, attendez ou utilisez une autre clé');
        } else if (error.message.includes('PERMISSION_DENIED')) {
            console.log('💡 Solution: Permissions insuffisantes pour cette clé API');
        } else {
            console.log('💡 Solution: Vérifiez votre connexion internet et la validité de la clé');
        }
    }
}

testGeminiAPI();
