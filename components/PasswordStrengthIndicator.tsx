import React, { useState, useEffect } from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
  showSuggestions?: boolean;
  className?: string;
}

interface PasswordStrength {
  score: number; // 0-5
  label: string;
  color: string;
  suggestions: string[];
}

/**
 * Composant d'indicateur de force du mot de passe avec suggestions
 */
const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showSuggestions = true,
  className = ''
}) => {
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Très faible',
    color: 'bg-red-500',
    suggestions: []
  });

  useEffect(() => {
    if (password) {
      const newStrength = calculatePasswordStrength(password);
      setStrength(newStrength);
    } else {
      setStrength({
        score: 0,
        label: 'Très faible',
        color: 'bg-red-500',
        suggestions: []
      });
    }
  }, [password]);

  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    const suggestions: string[] = [];
    let score = 0;

    // Longueur
    if (pwd.length >= 12) {
      score += 2;
    } else if (pwd.length >= 8) {
      score += 1;
      if (pwd.length < 12) {
        suggestions.push('Utilisez au moins 12 caractères');
      }
    } else {
      suggestions.push('Utilisez au moins 8 caractères');
    }

    // Majuscules
    if (/[A-Z]/.test(pwd)) {
      score += 1;
    } else {
      suggestions.push('Ajoutez des lettres majuscules (A-Z)');
    }

    // Minuscules
    if (/[a-z]/.test(pwd)) {
      score += 1;
    } else {
      suggestions.push('Ajoutez des lettres minuscules (a-z)');
    }

    // Chiffres
    if (/[0-9]/.test(pwd)) {
      score += 1;
    } else {
      suggestions.push('Ajoutez des chiffres (0-9)');
    }

    // Caractères spéciaux
    if (/[^A-Za-z0-9]/.test(pwd)) {
      score += 1;
    } else {
      suggestions.push('Ajoutez des caractères spéciaux (!@#$%^&*)');
    }

    // Vérification des mots de passe communs
    const commonPasswords = [
      'password', '123456', 'qwerty', 'admin', 'letmein',
      'welcome', 'monkey', 'dragon', 'master', 'hello'
    ];
    
    if (commonPasswords.some(common => pwd.toLowerCase().includes(common))) {
      score = Math.max(0, score - 2);
      suggestions.push('Évitez les mots de passe courants');
    }

    // Vérification des séquences
    const sequences = ['123', 'abc', 'qwe', 'asd', 'zxc'];
    if (sequences.some(seq => pwd.toLowerCase().includes(seq))) {
      score = Math.max(0, score - 1);
      suggestions.push('Évitez les séquences simples');
    }

    // Répétition de caractères
    if (/(.)\1{2,}/.test(pwd)) {
      score = Math.max(0, score - 1);
      suggestions.push('Évitez la répétition de caractères');
    }

    // Déterminer le label et la couleur
    let label: string;
    let color: string;

    if (score <= 1) {
      label = 'Très faible';
      color = 'bg-red-500';
    } else if (score <= 2) {
      label = 'Faible';
      color = 'bg-orange-500';
    } else if (score <= 3) {
      label = 'Moyen';
      color = 'bg-yellow-500';
    } else if (score <= 4) {
      label = 'Bon';
      color = 'bg-blue-500';
    } else {
      label = 'Excellent';
      color = 'bg-emerald-500';
    }

    return {
      score: Math.min(5, score),
      label,
      color,
      suggestions: suggestions.slice(0, 3) // Limiter à 3 suggestions
    };
  };

  const getScoreWidth = () => {
    return `${(strength.score / 5) * 100}%`;
  };

  const getScoreColor = () => {
    const colors = {
      0: 'bg-red-500',
      1: 'bg-red-500',
      2: 'bg-orange-500',
      3: 'bg-yellow-500',
      4: 'bg-blue-500',
      5: 'bg-emerald-500'
    };
    return colors[strength.score as keyof typeof colors] || 'bg-red-500';
  };

  if (!password) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Barre de progression */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-white">Force du mot de passe</span>
          <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
            strength.score <= 2 ? 'bg-red-500/20 text-red-300' :
            strength.score <= 3 ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-emerald-500/20 text-emerald-300'
          }`}>
            {strength.label}
          </span>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getScoreColor()}`}
            style={{ width: getScoreWidth() }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-blue-200">
          <span>Très faible</span>
          <span>Excellent</span>
        </div>
      </div>

      {/* Suggestions d'amélioration */}
      {showSuggestions && strength.suggestions.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <div className="flex items-start space-x-2">
            <i className="fas fa-lightbulb text-yellow-400 mt-0.5"></i>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-300 mb-2">
                Suggestions d'amélioration :
              </p>
              <ul className="space-y-1">
                {strength.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-xs text-blue-200 flex items-start space-x-2">
                    <i className="fas fa-arrow-right text-blue-400 mt-0.5"></i>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Indicateurs de critères */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className={`flex items-center space-x-2 ${password.length >= 8 ? 'text-emerald-300' : 'text-red-300'}`}>
          <i className={`fas ${password.length >= 8 ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
          <span>8+ caractères</span>
        </div>
        
        <div className={`flex items-center space-x-2 ${/[A-Z]/.test(password) ? 'text-emerald-300' : 'text-red-300'}`}>
          <i className={`fas ${/[A-Z]/.test(password) ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
          <span>Majuscule</span>
        </div>
        
        <div className={`flex items-center space-x-2 ${/[a-z]/.test(password) ? 'text-emerald-300' : 'text-red-300'}`}>
          <i className={`fas ${/[a-z]/.test(password) ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
          <span>Minuscule</span>
        </div>
        
        <div className={`flex items-center space-x-2 ${/[0-9]/.test(password) ? 'text-emerald-300' : 'text-red-300'}`}>
          <i className={`fas ${/[0-9]/.test(password) ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
          <span>Chiffre</span>
        </div>
        
        <div className={`flex items-center space-x-2 ${/[^A-Za-z0-9]/.test(password) ? 'text-emerald-300' : 'text-red-300'}`}>
          <i className={`fas ${/[^A-Za-z0-9]/.test(password) ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
          <span>Spécial</span>
        </div>
        
        <div className={`flex items-center space-x-2 ${password.length >= 12 ? 'text-emerald-300' : 'text-yellow-300'}`}>
          <i className={`fas ${password.length >= 12 ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span>12+ caractères</span>
        </div>
      </div>

      {/* Message de sécurité */}
      {strength.score >= 4 && (
        <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <i className="fas fa-shield-alt text-emerald-400"></i>
            <span className="text-sm text-emerald-300 font-medium">
              Mot de passe sécurisé ✓
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
