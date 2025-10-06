import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyACERIXIaYEfghB6mFmQIwyGVlOXHRkOtU';

if (!API_KEY) {
  console.warn('Gemini API key not found. Please set the VITE_GEMINI_API_KEY environment variable.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Contexte EcosystIA pour l'IA
const ECOSYSTIA_CONTEXT = `
ECOSYSTIA est la plateforme de gestion intelligente développée pour SENEGEL (Senegalese Next Generation of Leaders).

MISSION SENEGEL: SENEGEL recruits, trains, and places youth, women leaders, and SMEs to ignite an ecosystem of transparency, skills, and citizenship.

PROGRAMMES PRINCIPAUX SENEGEL:
- Advisory Council of 400 Impact Experts (Conseil d'experts de la diaspora)
- Training for Professional Integration and Enterprise Creation Facilitators
- COYA Platform (Creating Opportunities for Youth in Africa)
- Cooperative of Habitat (1000 parcelles à Khinine, Keur Moussa)
- Trade Prospection Missions to USA and Europe
- International Study Field

SERVICES SENEGEL:
- Concierge Services
- Music Production
- Real Estate Projects
- International Education

ÉQUIPE SENEGEL: Pape Samb (CEO), Amadou Dia LY (Co-Founder), Mariame D. GUINDO, Adama Mandaw SENE, etc.

CONTACT SENEGEL: Liberte 5, No 5486B, 4eme #10, Dakar, Senegal - +221 77 853 33 99 - contact@senegel.org

ECOSYSTIA: Plateforme de travail intelligente avec IA intégrée, gestion de projets, suivi des objectifs, CRM, formation, finance, et support multilingue (FR, WO, EN, AR) avec devise FCFA. Développée par IMPULCIA AFRIQUE pour SENEGEL.
`;

// Fonction de fallback intelligente
function generateFallbackResponse(prompt: string, context: string = ''): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Réponses contextuelles pour SENEGEL
  if (lowerPrompt.includes('senegel') || lowerPrompt.includes('sénégal')) {
    return `SENEGEL (Senegalese Next Generation of Leaders) est une organisation dédiée au développement du Sénégal.

**Mission :** SENEGEL recruits, trains, and places youth, women leaders, and SMEs to ignite an ecosystem of transparency, skills, and citizenship.

**Programmes principaux :**
• Advisory Council of 400 Impact Experts
• Training for Professional Integration and Enterprise Creation Facilitators
• COYA Platform (Creating Opportunities for Youth in Africa)
• Cooperative of Habitat (1000 parcelles à Khinine, Keur Moussa)
• Trade Prospection Missions to USA and Europe
• International Study Field

**Contact :** Liberte 5, No 5486B, 4eme #10, Dakar, Senegal - +221 77 853 33 99 - contact@senegel.org

Comment puis-je vous aider avec SENEGEL aujourd'hui ?`;
  }
  
  // Réponses pour EcosystIA
  if (lowerPrompt.includes('ecosystia') || lowerPrompt.includes('fonctionnalités') || lowerPrompt.includes('comment utiliser')) {
    return `EcosystIA est la plateforme intelligente de SENEGEL avec de nombreuses fonctionnalités :

**📊 Dashboard** - Vue d'ensemble de vos activités et métriques clés
**📋 Projets** - Gestion et coordination de vos projets SENEGEL
**🎯 Objectifs** - Définition et suivi de vos OKRs
**💰 Finance** - Gestion financière avec devise FCFA
**📚 Formations** - Gestion des cours et développement des compétences
**⏰ Suivi du temps** - Tracking des activités et projets
**🏖️ Congés** - Gestion des demandes de congés
**📖 Base de connaissances** - Documentation et ressources
**🔧 Outils** - Calculatrices, convertisseurs, générateurs
**🤖 ARVA** - Assistant IA contextuel (c'est moi !)

Naviguez entre les modules pour découvrir toutes les fonctionnalités. Je peux vous aider avec des questions spécifiques sur chaque module !`;
  }
  
  // Réponses pour les projets
  if (lowerPrompt.includes('projet') || lowerPrompt.includes('gestion')) {
    return `Pour la gestion de projets dans EcosystIA :

**Créer un projet :**
1. Allez dans le module "Projets"
2. Cliquez sur "Nouveau Projet"
3. Remplissez les informations (nom, description, échéance)
4. Assignez une équipe et des tâches

**Suivi des projets :**
• Dashboard avec progression en temps réel
• Timeline des échéances
• Gestion des risques
• Rapports de statut automatiques

**Fonctionnalités avancées :**
• Intégration avec le suivi du temps
• Notifications automatiques
• Collaboration en équipe
• Génération de rapports

Besoin d'aide avec un aspect spécifique de la gestion de projets ?`;
  }
  
  // Réponses pour les objectifs
  if (lowerPrompt.includes('objectif') || lowerPrompt.includes('okr') || lowerPrompt.includes('goal')) {
    return `Pour la gestion des objectifs et OKRs :

**Objectifs SMART :**
• **S**pécifique - Défini clairement
• **M**esurable - Avec des métriques quantifiables
• **A**tteignable - Réaliste et faisable
• **R**elevant - Aligné avec la stratégie
• **T**emporel - Avec une échéance définie

**Structure OKR :**
• **Objectif** : Ce que vous voulez accomplir
• **Résultats Clés** : Comment mesurer le succès (2-5 KR par objectif)

**Conseils :**
• Définissez des objectifs ambitieux mais réalistes
• Suivez la progression régulièrement
• Ajustez si nécessaire
• Célébrez les réussites

Voulez-vous de l'aide pour créer vos premiers OKRs ?`;
  }
  
  // Réponses pour la finance
  if (lowerPrompt.includes('finance') || lowerPrompt.includes('facture') || lowerPrompt.includes('budget') || lowerPrompt.includes('fcfa')) {
    return `Pour la gestion financière avec FCFA :

**💳 Devise FCFA :**
• Franc CFA Ouest-Africain (XOF)
• Utilisé au Sénégal et dans la région
• Formatage automatique dans EcosystIA

**📋 Facturation :**
• Création de factures professionnelles
• Numérotation automatique
• Gestion des clients
• Suivi des paiements

**💰 Budget :**
• Planification budgétaire
• Suivi des dépenses
• Alertes de dépassement
• Rapports financiers

**📊 Rapports :**
• État des comptes
• Analyse des revenus/dépenses
• Projections financières

Besoin d'aide avec un aspect spécifique de la finance ?`;
  }
  
  // Réponses par défaut
  return `Bonjour ! Je suis ARVA, votre assistant intelligent SENEGEL.

Je peux vous aider avec :
• **SENEGEL** - Informations sur l'organisation
• **EcosystIA** - Fonctionnalités de la plateforme
• **Projets** - Gestion et coordination
• **Objectifs** - OKRs et suivi
• **Finance** - Gestion FCFA
• **Formations** - Cours et compétences
• **Et bien plus !**

Posez-moi une question spécifique ou utilisez les boutons d'action rapide ci-dessous ! 🚀`;
}

export const geminiService = {
  async generateResponse(prompt: string, context: string = ''): Promise<string> {
    // Solution de fallback temporaire
    return generateFallbackResponse(prompt, context);
    
    if (!genAI) {
      return generateFallbackResponse(prompt, context);
    }
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const fullPrompt = `
${ECOSYSTIA_CONTEXT}

Contexte utilisateur: ${context}

Question/Requête: ${prompt}

Répondez en français, de manière professionnelle et utile, en vous basant sur les informations EcosystIA et SENEGEL. 
Si la question concerne des fonctionnalités techniques d'EcosystIA, expliquez clairement.
Si c'est sur SENEGEL, donnez des informations précises et encouragez l'engagement.
Soyez concis mais informatif.
`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erreur Gemini API:', error);
      return generateFallbackResponse(prompt, context);
    }
  },

  async generateContent(type: 'email' | 'report' | 'proposal' | 'training', data: any): Promise<string> {
    if (!genAI) {
      return "Service IA temporairement indisponible.";
    }
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      let prompt = '';
      
      switch (type) {
        case 'email':
          prompt = `Génère un email professionnel en français pour SENEGEL:
Destinataire: ${data.recipient}
Sujet: ${data.subject}
Contexte: ${data.context}
Tone: Professionnel et engageant`;
          break;
          
        case 'report':
          prompt = `Génère un rapport professionnel en français pour SENEGEL:
Type: ${data.type}
Période: ${data.period}
Données: ${JSON.stringify(data.data)}
Format: Rapport structuré avec sections claires`;
          break;
          
        case 'proposal':
          prompt = `Génère une proposition commerciale en français pour SENEGEL:
Client: ${data.client}
Projet: ${data.project}
Budget estimé: ${data.budget} FCFA
Durée: ${data.duration}
Format: Proposition professionnelle et convaincante`;
          break;
          
        case 'training':
          prompt = `Génère un contenu de formation en français pour SENEGEL:
Sujet: ${data.subject}
Niveau: ${data.level}
Durée: ${data.duration}
Objectifs: ${data.objectives}
Format: Programme de formation structuré`;
          break;
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erreur Gemini API:', error);
      return "Erreur lors de la génération du contenu.";
    }
  },

  async analyzeData(data: any[], type: 'performance' | 'trends' | 'insights'): Promise<string> {
    if (!genAI) {
      return "Service d'analyse temporairement indisponible.";
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
Analyse ces données pour SENEGEL/EcosystIA:
Type d'analyse: ${type}
Données: ${JSON.stringify(data)}

Fournis une analyse en français avec:
- Résumé exécutif
- Points clés
- Recommandations
- Actions suggérées

Contexte SENEGEL: Focus sur le développement des jeunes, la formation, et l'impact social.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erreur Gemini API:', error);
      return "Erreur lors de l'analyse des données.";
    }
  },

  async translateText(text: string, targetLanguage: 'fr' | 'wo' | 'en' | 'ar'): Promise<string> {
    if (!genAI) {
      return text; // Retourner le texte original si l'IA n'est pas disponible
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const languageNames = {
        'fr': 'français',
        'wo': 'wolof',
        'en': 'anglais',
        'ar': 'arabe'
      };

      const prompt = `
Traduis ce texte en ${languageNames[targetLanguage]}:
Texte: "${text}"

Contexte: Communication professionnelle pour SENEGEL (organisation de développement sénégalais).
Si c'est du Wolof, utilise l'écriture latine standard.
Si c'est de l'arabe, utilise l'écriture arabe standard.
Garde le ton professionnel et adapte le contexte culturel sénégalais si nécessaire.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erreur Gemini API:', error);
      return text; // Retourner le texte original en cas d'erreur
    }
  },

  async generateInsights(userData: any): Promise<string> {
    if (!genAI) {
      return "Service d'insights temporairement indisponible.";
    }
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
Analyse les données utilisateur suivantes et génère des insights personnalisés pour SENEGEL:

Données utilisateur: ${JSON.stringify(userData)}

Génère des insights en français qui incluent:
- Analyse des performances
- Recommandations d'amélioration
- Opportunités d'apprentissage
- Objectifs suggérés
- Ressources SENEGEL pertinentes

Contexte: Utilisateur d'EcosystIA travaillant avec ou pour SENEGEL.
Focus sur le développement personnel/professionnel et l'impact social.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erreur Gemini API:', error);
      return "Erreur lors de la génération d'insights.";
    }
  }
};

// Fonctions manquantes pour compatibilité
export const runAIAgent = async (prompt: string, context: any = {}) => {
  return geminiService.generateResponse(prompt, JSON.stringify(context));
};

export const runAuthAIAssistant = async (prompt: string, userData: any = {}) => {
  return geminiService.generateResponse(prompt, `Utilisateur: ${JSON.stringify(userData)}`);
};

export const draftSalesEmail = async (clientData: any) => {
  return geminiService.generateContent('email', {
    recipient: clientData.name,
    subject: `Proposition commerciale - ${clientData.project}`,
    context: `Client: ${JSON.stringify(clientData)}`
  });
};

export const identifyRisks = async (projectData: any) => {
  return geminiService.analyzeData([projectData], 'insights');
};

export const generateStatusReport = async (projectData: any) => {
  return geminiService.generateContent('report', {
    type: 'Rapport de statut projet',
    period: 'Actuel',
    data: projectData
  });
};

export const enhanceProjectTasks = async (tasks: any[]) => {
  return geminiService.analyzeData(tasks, 'performance');
};

export const summarizeTasks = async (tasks: any[]) => {
  return geminiService.analyzeData(tasks, 'insights');
};

// Fonctions manquantes pour les composants
export const runAICoach = async (prompt: string, context: any = {}) => {
  return geminiService.generateResponse(prompt, `Coaching context: ${JSON.stringify(context)}`);
};

export const generateImage = async (prompt: string) => {
  if (!genAI) {
    return "Service de génération d'images temporairement indisponible.";
    }
    
    try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Génère une description d'image pour: ${prompt}`);
    const response = await result.response;
    return response.text();
    } catch (error) {
    console.error('Erreur génération image:', error);
    return "Erreur lors de la génération d'image.";
  }
};

export const editImage = async (imageData: any, instructions: string) => {
  if (!genAI) {
    return "Service d'édition d'images temporairement indisponible.";
    }

    try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Instructions d'édition: ${instructions}. Image: ${JSON.stringify(imageData)}`);
    const response = await result.response;
    return response.text();
    } catch (error) {
    console.error('Erreur édition image:', error);
    return "Erreur lors de l'édition d'image.";
  }
};

export const generateOKRs = async (context: any) => {
  return geminiService.generateContent('training', {
    subject: 'Génération d\'OKRs',
    level: 'Professionnel',
    duration: '1 heure',
    objectives: `Créer des OKRs pour: ${JSON.stringify(context)}`
  });
};

export const summarizeAndCreateDoc = async (content: string, type: string) => {
  return geminiService.generateContent('report', {
    type: `Document ${type}`,
    period: 'Actuel',
    data: { content, type }
  });
};

export default geminiService;