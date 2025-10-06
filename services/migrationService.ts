import { geminiService } from './geminiService';
import { enhancedGeminiService } from './enhancedGeminiService';

// Service de migration pour passer progressivement à Enhanced Gemini
export const migrationService = {
  // Mode de fonctionnement : 'legacy' | 'enhanced' | 'hybrid'
  mode: 'hybrid',

  async generateResponse(prompt: string, context: string = ''): Promise<string> {
    switch (this.mode) {
      case 'enhanced':
        return enhancedGeminiService.generateResponse(prompt, context);
      
      case 'hybrid':
        // Utilise Enhanced pour les requêtes complexes, Legacy pour les simples
        if (this.isComplexQuery(prompt)) {
          return enhancedGeminiService.generateResponse(prompt, context);
        } else {
          return geminiService.generateResponse(prompt, context);
        }
      
      case 'legacy':
      default:
        return geminiService.generateResponse(prompt, context);
    }
  },

  isComplexQuery(prompt: string): boolean {
    const complexKeywords = [
      'analyser', 'analyse', 'raisonner', 'expliquer', 'comparer',
      'problème', 'solution', 'stratégie', 'plan', 'objectif',
      'recommandation', 'suggestion', 'amélioration'
    ];
    
    const lowerPrompt = prompt.toLowerCase();
    return complexKeywords.some(keyword => lowerPrompt.includes(keyword));
  },

  // Permet de basculer entre les modes
  setMode(newMode: 'legacy' | 'enhanced' | 'hybrid') {
    this.mode = newMode;
    console.log(`Mode ARVA changé vers: ${newMode}`);
  },

  // Statistiques d'utilisation
  getStats() {
    return {
      mode: this.mode,
      enhancedQueries: this.mode === 'enhanced' ? '100%' : this.mode === 'hybrid' ? '~50%' : '0%',
      legacyQueries: this.mode === 'legacy' ? '100%' : this.mode === 'hybrid' ? '~50%' : '0%'
    };
  }
};

export default migrationService;