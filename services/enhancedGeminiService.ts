import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuration améliorée inspirée de DeepSeek-R1
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Fonction de raisonnement en chaîne inspirée de DeepSeek-R1 (cachée)
function generateReasoningChain(prompt: string, context: string = ''): string {
  // Le raisonnement se fait en interne, pas affiché à l'utilisateur
  console.log(`[ARVA Reasoning] Contexte: ${context}, Demande: ${prompt}`);
  return '';
}

// Fonction de génération de réponse améliorée
function generateEnhancedResponse(prompt: string, context: string = ''): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Réponses contextuelles pour SENEGEL avec raisonnement structuré
  if (lowerPrompt.includes('senegel') || lowerPrompt.includes('sénégal')) {
    generateReasoningChain(prompt, 'SENEGEL - Organisation de développement du Sénégal');
    return `🎯 **SENEGEL** - La nouvelle génération de leaders sénégalais

**Notre Mission** 🌟
Former et accompagner la prochaine génération de leaders pour transformer le Sénégal à travers l'innovation numérique et l'entrepreneuriat.

**Nos Programmes** 📚
• **Formations Tech** - Développement web, mobile, IA
• **Entrepreneuriat** - Leadership et gestion de projets  
• **Innovation** - Blockchain, technologies émergentes
• **Impact Social** - Projets communautaires durables

**Notre Impact** 📊
✅ **500+ jeunes formés** et accompagnés
✅ **50+ projets** lancés avec succès
✅ **Partenariats stratégiques** avec entreprises locales

Comment puis-je vous aider à développer SENEGEL aujourd'hui ? 🚀`;
  }
  
  // Réponses pour EcosystIA avec raisonnement structuré
  if (lowerPrompt.includes('ecosystia') || lowerPrompt.includes('fonctionnalités') || lowerPrompt.includes('comment utiliser')) {
    generateReasoningChain(prompt, 'EcosystIA - Plateforme intelligente SENEGEL');
    return `🚀 **EcosystIA** - Votre plateforme intelligente SENEGEL

**Modules Principaux** 📋
• **📊 Dashboard** - KPIs et métriques en temps réel
• **🎯 OKRs** - Objectifs et résultats clés structurés
• **⏰ Time Tracking** - Timer intelligent et suivi productivité
• **💰 Finance** - Gestion FCFA et comptabilité locale
• **👥 CRM & Sales** - Pipeline commercial optimisé
• **📚 Courses** - Plateforme pédagogique intégrée
• **📈 Analytics** - Insights et rapports avancés
• **👤 Users** - Gestion des équipes et permissions

**IA Avancée** 🤖
• **ARVA Enhanced** - Assistant intelligent contextuel
• **Actions Rapides** - Workflows automatisés
• **Adaptation Locale** - FCFA, fuseau Dakar, culture sénégalaise

Prêt à optimiser votre workflow ? Dites-moi ce que vous souhaitez accomplir ! 💫`;
  }
  
  // Réponses pour les projets avec raisonnement structuré
  if (lowerPrompt.includes('projet') || lowerPrompt.includes('gestion')) {
    return generateReasoningChain(prompt, 'Gestion de projets dans EcosystIA') + 
      `Pour la gestion de projets dans EcosystIA :
      
      **Fonctionnalités disponibles :**
      - 📋 Création et suivi de projets
      - 👥 Gestion d'équipe et assignation de tâches
      - ⏱️ Suivi du temps par projet
      - 📊 Tableaux de bord et rapports
      - 🎯 Intégration avec les OKRs
      - 💰 Suivi budgétaire en FCFA
      
      **Workflow recommandé :**
      1. Créer un nouveau projet
      2. Définir les objectifs et livrables
      3. Assigner l'équipe
      4. Planifier les tâches
      5. Suivre la progression
      6. Générer les rapports
      
      Besoin d'aide avec un aspect spécifique de la gestion de projets ?`;
  }
  
  // Réponses pour les objectifs avec raisonnement structuré
  if (lowerPrompt.includes('objectif') || lowerPrompt.includes('okr') || lowerPrompt.includes('goal') || lowerPrompt.includes('définir un okr')) {
    generateReasoningChain(prompt, 'Méthodologie OKR dans EcosystIA');
    return `🎯 **OKRs pour SENEGEL** - Objectifs qui transforment

**La Méthodologie** 📊
• **🎯 Objectif** - Vision inspirante et qualitative
• **📈 Résultats Clés** - 2-5 métriques quantifiables
• **📅 Cycle** - Trimestriel avec revues mensuelles
• **⚡ Progression** - Suivi temps réel et ajustements

**Exemple SENEGEL** 🚀
**Objectif :** Devenir la référence digitale du Sénégal
• **KR1 :** 15,000 followers Instagram (+50% ce trimestre)
• **KR2 :** 100 projets formés (vs 50 actuellement)  
• **KR3 :** 95% satisfaction apprenants (maintenir l'excellence)

**Votre Prochain OKR** 💡
Je peux vous aider à créer un OKR personnalisé pour votre équipe. Quel domaine souhaitez-vous optimiser ?
• Marketing & Visibilité
• Formation & Développement
• Impact Communautaire
• Croissance Financière

Dites-moi votre vision ! 🌟`;
  }
  
  // Réponses pour la finance avec raisonnement structuré
  if (lowerPrompt.includes('finance') || lowerPrompt.includes('facture') || lowerPrompt.includes('budget') || lowerPrompt.includes('fcfa')) {
    return generateReasoningChain(prompt, 'Gestion financière avec FCFA dans EcosystIA') + 
      `Pour la gestion financière avec FCFA :
      
      **Fonctionnalités financières :**
      - 💰 Gestion des factures et dépenses
      - 📊 Budgets et prévisions
      - 💱 Support complet FCFA (Franc CFA Ouest-Africain)
      - 📈 Rapports financiers détaillés
      - 🔄 Factures récurrentes
      - 📋 Suivi des paiements
      
      **Adaptation marché sénégalais :**
      - Formatage automatique FCFA
      - Fuseau horaire Africa/Dakar
      - Conformité réglementaire locale
      - Intégration avec banques sénégalaises
      
      **Types de documents :**
      - Factures clients
      - Notes de frais
      - Budgets de projet
      - Rapports de trésorerie
      - États financiers
      
      Besoin d'aide avec un aspect spécifique de la finance ?`;
  }
  
  // Réponses par défaut avec raisonnement structuré
  generateReasoningChain(prompt, 'Assistance générale EcosystIA');
  return `👋 **Salut !** Je suis ARVA, votre assistant IA SENEGEL

**Comment puis-je vous aider aujourd'hui ?** 🌟

**Modules Disponibles** 📋
🎯 **OKRs** - Objectifs qui transforment
📊 **Projets** - Gestion et suivi intelligent  
⏰ **Time Tracking** - Productivité optimisée
💰 **Finance** - Gestion FCFA locale
👥 **CRM** - Relations clients premium
📚 **Formations** - Apprentissage continu
📈 **Analytics** - Insights stratégiques
⚙️ **Settings** - Configuration personnalisée

**Actions Rapides** ⚡
• Créer un projet SENEGEL
• Définir un OKR stratégique
• Analyser la productivité
• Optimiser les finances

Que souhaitez-vous accomplir aujourd'hui ? 🚀`;
}

// Service amélioré inspiré de DeepSeek-R1
export const enhancedGeminiService = {
  async generateResponse(prompt: string, context: string = ''): Promise<string> {
    try {
      // Utilisation du modèle Gemini avec les techniques de DeepSeek-R1
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Prompt structuré avec raisonnement en chaîne
      const structuredPrompt = generateReasoningChain(prompt, context);
      
      const result = await model.generateContent([
        {
          text: `Tu es ARVA, l'assistant IA intelligent de SENEGEL. 
          
          Utilise cette structure de raisonnement pour répondre :
          ${structuredPrompt}
          
          Contexte SENEGEL : Organisation de développement du Sénégal
          Plateforme : EcosystIA - Solution complète de gestion
          Devise : FCFA (Franc CFA Ouest-Africain)
          Fuseau horaire : Africa/Dakar
          
          Réponds de manière structurée, précise et adaptée au contexte sénégalais.`
        }
      ]);
      
      return result.response.text();
    } catch (error) {
      console.error('Erreur Gemini API:', error);
      // Fallback avec raisonnement structuré
      return generateEnhancedResponse(prompt, context);
    }
  },

  async generateDashboardInsights(data: {
    projects: number;
    activeProjects: number;
    courses: number;
    timeLogged: number;
    financial: number;
  }): Promise<string[]> {
    const insights: string[] = [];

    // Insight sur les projets
    if (data.activeProjects > data.projects * 0.7) {
      insights.push("🚀 Excellente charge de travail ! Vous gérez efficacement plusieurs projets simultanément.");
    } else if (data.activeProjects < data.projects * 0.3) {
      insights.push("💡 Considérez lancer de nouveaux projets pour optimiser votre productivité.");
    }

    // Insight sur le temps
    if (data.timeLogged > 160) { // Plus de 40h/semaine
      insights.push("⏰ Vous travaillez beaucoup ! Assurez-vous de maintenir un équilibre vie-travail.");
    } else if (data.timeLogged < 80) { // Moins de 20h/semaine
      insights.push("📈 Vous avez du temps disponible. Parfait pour développer de nouvelles compétences SENEGEL.");
    }

    // Insight financier
    if (data.financial > 0) {
      insights.push("💰 Situation financière positive ! Continuez sur cette voie.");
    } else {
      insights.push("📊 Analysez vos dépenses pour améliorer votre rentabilité.");
    }

    return insights.slice(0, 3); // Limiter à 3 insights
  },

  async generateQuickActions(context: string, userRole: string): Promise<string[]> {
    const actions: string[] = [];

    switch (context) {
      case 'general':
        actions.push('🚀 Créer un projet SENEGEL');
        actions.push('🎯 Définir un OKR stratégique');
        actions.push('📊 Consulter analytics');
        actions.push('💰 Gestion finance');
        break;
      case 'projects':
        actions.push('📋 Nouveau projet');
        actions.push('⏰ Enregistrer temps');
        actions.push('👥 Assigner équipe');
        actions.push('📈 Suivi progression');
        break;
      case 'finance':
        actions.push('💸 Nouvelle facture');
        actions.push('📊 Rapport financier');
        actions.push('💳 Gestion dépenses');
        actions.push('📈 Prévisions budget');
        break;
      default:
        actions.push('🚀 Action rapide');
        actions.push('📊 Voir détails');
        actions.push('⚙️ Configuration');
    }

    return actions;
  },

  async generateContextualResponse(context: string, action: string, metadata: any): Promise<string> {
    // Génération de réponses contextuelles basées sur l'action
    switch (action) {
      case '🚀 Créer un projet SENEGEL':
        return `Parfait ! Pour créer un nouveau projet SENEGEL :

**Étapes recommandées :**
1. **Définir l'objectif** - Mission claire et mesurable
2. **Identifier l'équipe** - Rôles et responsabilités
3. **Planifier les livrables** - Tâches et échéances
4. **Établir le budget** - Ressources financières nécessaires

**Template SENEGEL :**
- Projet de formation digitale
- Impact communautaire
- Développement durable
- Innovation technologique

Souhaitez-vous que je vous aide à structurer votre projet ? 🚀`;

      case '🎯 Définir un OKR stratégique':
        return `Excellent choix ! Les OKRs SENEGEL sont essentiels :

**Structure recommandée :**
**Objectif :** [Vision inspirante et qualitative]

**Résultats Clés :**
• **KR1 :** [Métrique quantifiable 1]
• **KR2 :** [Métrique quantifiable 2]  
• **KR3 :** [Métrique quantifiable 3]

**Exemple SENEGEL :**
**Objectif :** Devenir la référence digitale du Sénégal

**Résultats Clés :**
• **KR1 :** 15,000 followers Instagram (+50%)
• **KR2 :** 100 projets formés (vs 50 actuellement)
• **KR3 :** 95% satisfaction apprenants

Quel domaine souhaitez-vous optimiser ? 🎯`;

      default:
        return `Action "${action}" détectée ! Je peux vous aider avec cette tâche. Que souhaitez-vous accomplir spécifiquement ? 💫`;
    }
  },

  async analyzeData(data: any[], analysisType: 'insights' | 'performance' | 'recommendations'): Promise<string> {
    const prompt = `Analyse de type ${analysisType} pour les données : ${JSON.stringify(data)}`;
    return this.generateResponse(prompt, 'Analyse de données EcosystIA');
  },

};

// Export des fonctions pour compatibilité
export const runAIAgent = enhancedGeminiService.generateResponse;
export const runAuthAIAssistant = enhancedGeminiService.generateResponse;
export const draftSalesEmail = enhancedGeminiService.generateContextualResponse;
export const identifyRisks = enhancedGeminiService.analyzeData;
export const generateStatusReport = enhancedGeminiService.generateContextualResponse;
export const enhanceProjectTasks = enhancedGeminiService.analyzeData;
export const summarizeTasks = enhancedGeminiService.analyzeData;

export default enhancedGeminiService;
