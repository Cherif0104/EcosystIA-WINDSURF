import React, { useState, useEffect } from 'react';

interface SecurityCaptchaProps {
  onVerify: (isValid: boolean, token?: string) => void;
  type?: 'math' | 'visual' | 'hcaptcha';
  difficulty?: 'easy' | 'medium' | 'hard';
  className?: string;
}

/**
 * Composant de captcha sécurisé avec différents types
 * - Math: Captcha mathématique simple
 * - Visual: Captcha visuel (simulation)
 * - hCaptcha: Intégration avec hCaptcha (à implémenter)
 */
const SecurityCaptcha: React.FC<SecurityCaptchaProps> = ({
  onVerify,
  type = 'math',
  difficulty = 'easy',
  className = ''
}) => {
  const [mathProblem, setMathProblem] = useState<{num1: number, num2: number, operation: string, answer: number} | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    generateMathProblem();
  }, []);

  const generateMathProblem = () => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, answer: number;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 25;
        num2 = Math.floor(Math.random() * 25) + 1;
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      default:
        num1 = 1; num2 = 1; answer = 2;
    }
    
    setMathProblem({ num1, num2, operation, answer });
    setUserAnswer('');
    setError('');
  };

  const handleVerify = () => {
    if (!mathProblem) return;
    
    const userNum = parseInt(userAnswer);
    if (isNaN(userNum)) {
      setError('Veuillez entrer un nombre valide');
      return;
    }
    
    const isValid = userNum === mathProblem.answer;
    setIsVerified(isValid);
    
    if (isValid) {
      setError('');
      onVerify(true, `captcha_${Date.now()}`);
    } else {
      setAttempts(prev => prev + 1);
      setError('Réponse incorrecte. Veuillez réessayer.');
      setTimeout(() => {
        generateMathProblem();
      }, 1000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(e.target.value);
    if (error) setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  if (type === 'math') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <label className="block text-sm font-semibold text-white mb-3">
            🔒 Vérification de sécurité
          </label>
          
          {mathProblem && (
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl font-bold text-white bg-white/10 px-4 py-2 rounded-lg">
                  {mathProblem.num1}
                </span>
                <span className="text-xl text-white">{mathProblem.operation}</span>
                <span className="text-2xl font-bold text-white bg-white/10 px-4 py-2 rounded-lg">
                  {mathProblem.num2}
                </span>
                <span className="text-xl text-white">=</span>
                <input
                  type="number"
                  value={userAnswer}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="w-20 text-center text-xl font-bold bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="?"
                  disabled={isVerified}
                  autoComplete="off"
                />
              </div>
              
              {error && (
                <p className="text-red-300 text-sm text-center">{error}</p>
              )}
              
              {isVerified && (
                <div className="flex items-center justify-center space-x-2 text-emerald-300">
                  <i className="fas fa-check-circle"></i>
                  <span className="text-sm font-medium">Vérifié ✓</span>
                </div>
              )}
              
              {!isVerified && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleVerify}
                    className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                  >
                    Vérifier
                  </button>
                  <button
                    onClick={generateMathProblem}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                  >
                    <i className="fas fa-refresh"></i>
                  </button>
                </div>
              )}
              
              {attempts > 0 && (
                <p className="text-yellow-300 text-xs text-center">
                  Tentatives: {attempts}/3
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="text-xs text-blue-200 text-center">
          <i className="fas fa-shield-alt mr-1"></i>
          Cette vérification nous aide à protéger votre compte
        </div>
      </div>
    );
  }

  // Simulation d'un captcha visuel
  if (type === 'visual') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <label className="block text-sm font-semibold text-white mb-3">
            🖼️ Captcha visuel
          </label>
          
          <div className="bg-white/10 rounded-lg p-6 text-center">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {Array.from({ length: 9 }, (_, i) => (
                <div
                  key={i}
                  className={`h-12 rounded cursor-pointer transition-all ${
                    Math.random() > 0.5 
                      ? 'bg-emerald-400 hover:bg-emerald-300' 
                      : 'bg-gray-400 hover:bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <p className="text-white text-sm mb-3">
              Cliquez sur tous les carrés verts
            </p>
            
            <button
              onClick={() => onVerify(true, `visual_captcha_${Date.now()}`)}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 py-2 px-4 rounded-lg transition-colors text-sm font-medium"
            >
              Vérifier la sélection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Placeholder pour hCaptcha
  if (type === 'hcaptcha') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <label className="block text-sm font-semibold text-white mb-3">
            🤖 hCaptcha
          </label>
          
          <div className="bg-white/10 rounded-lg p-6 text-center">
            <div className="text-white text-sm mb-3">
              <i className="fas fa-robot text-2xl mb-2"></i>
              <p>Intégration hCaptcha</p>
            </div>
            
            <button
              onClick={() => onVerify(true, `hcaptcha_${Date.now()}`)}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-2 px-4 rounded-lg transition-colors text-sm font-medium"
            >
              Simuler hCaptcha
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SecurityCaptcha;
