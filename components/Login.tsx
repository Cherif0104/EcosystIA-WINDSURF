import React, { useState } from 'react';
import { FaRocket, FaShieldAlt, FaExclamationTriangle, FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner, FaArrowRight, FaRobot, FaCode } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { LoginCredentials } from '../services/apiService';
import NexusFlowIcon from './icons/NexusFlowIcon';
import AuthAIAssistant from './AuthAIAssistant';

interface LoginProps {
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup }) => {
  const { login, error: authError, clearError, isLoading } = useAuth();
  const { t } = useLocalization();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isAssistantOpen, setAssistantOpen] = useState(false);
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Effacer les erreurs lors de la saisie
    if (localError) setLocalError('');
    if (authError) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    // Validation basique
    if (!formData.username || !formData.password) {
      setLocalError(t('auth.fillAllFields'));
      return;
    }

    if (formData.username.length < 3) {
      setLocalError(t('auth.usernameMinLength'));
      return;
    }

    if (formData.password.length < 6) {
      setLocalError(t('auth.passwordMinLength'));
      return;
    }

    try {
      // Note: La logique de `login` dans AuthContext devra gérer `rememberMe`
      // par exemple en utilisant localStorage vs sessionStorage.
      const success = await login(formData, rememberMe);
      if (!success) {
        setLocalError(authError || t('auth.loginError'));
      }
      // Si succès, la redirection sera gérée par le contexte d'authentification
    } catch (err: any) {
      setLocalError(err.message || t('auth.loginError'));
    }
  };

  const openAssistant = (prompt: string = '') => {
    setAssistantInitialPrompt(prompt);
    setAssistantOpen(true);
  };

  const handleForgotPassword = () => {
    openAssistant('Comment puis-je réinitialiser mon mot de passe ?');
  };

  const handleRoleHelp = () => {
    openAssistant('Pouvez-vous m\'expliquer les différents rôles disponibles ?');
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-40 left-40 w-60 h-60 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="w-full max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Panel - Branding */}
            <div className="text-center lg:text-left text-white space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl shadow-2xl mb-6">
                  <NexusFlowIcon className="w-16 h-16 text-white"/>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-emerald-100 to-blue-100 bg-clip-text text-transparent leading-tight">
                  {t('senegel_workflow_platform')}
                </h1>
                <p className="text-xl text-blue-100 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  {t('login_subtitle')}
                </p>
              </div>
              
              {/* Feature Cards */}
              <div className="grid sm:grid-cols-2 gap-4 mt-12">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                      <FaRocket className="text-white" />
                    </div>
                    <h3 className="font-semibold">Nouvelle Version</h3>
                  </div>
                  <p className="text-sm text-blue-100">Backend Django intégré</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <FaShieldAlt className="text-white" />
                    </div>
                    <h3 className="font-semibold">Sécurisé</h3>
                  </div>
                  <p className="text-sm text-blue-100">Authentification JWT</p>
                </div>
              </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full max-w-md mx-auto">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">{t('login_title')}</h2>
                  <p className="text-blue-100">Connectez-vous à votre compte</p>
                </div>
                
                {/* Messages d'erreur */}
                {(localError || authError) && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center">
                      <FaExclamationTriangle className="mr-3 text-red-300" />
                      <p className="text-red-100 font-medium">{localError || authError}</p>
                    </div>
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Nom d'utilisateur */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-semibold text-white mb-3">
                      {t('auth.username')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaUser className="text-blue-300" />
                      </div>
                      <input
                        type="text"
                        name="username"
                        id="username"
                        autoComplete="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 text-white placeholder-blue-200 backdrop-blur-sm"
                        placeholder={t('auth.usernamePlaceholder')}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-white mb-3">
                      {t('auth.password')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="text-blue-300" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        id="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 text-white placeholder-blue-200 backdrop-blur-sm"
                        placeholder={t('auth.passwordPlaceholder')}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-emerald-300 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                        disabled={isLoading}
                      >
                        {showPassword ? <FaEyeSlash className="text-blue-300" /> : <FaEye className="text-blue-300" />}
                      </button>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-5 w-5 text-emerald-400 focus:ring-emerald-400 border-white/30 rounded-lg bg-white/10"
                      />
                      <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-white">
                        {t('auth.rememberMe')}
                      </label>
                    </div>

                    <div className="text-sm">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
                      >
                        {t('auth.forgotPassword')}
                      </button>
                    </div>
                  </div>

                  {/* Bouton de connexion */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-600 hover:from-emerald-600 hover:via-emerald-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25"
                    >
                      {isLoading ? (
                        <>
                          <FaSpinner className="animate-spin mr-3" />
                          {t('auth.connecting')}
                        </>
                      ) : (
                        <>
                          <FaArrowRight className="mr-3 group-hover:translate-x-1 transition-transform" />
                          {t('auth.login')}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Lien vers inscription */}
                  <div className="text-center pt-6">
                    <span className="text-blue-200">{t('auth.noAccount')} </span>
                    <button
                      type="button"
                      onClick={onSwitchToSignup}
                      className="font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
                      disabled={isLoading}
                    >
                      {t('auth.signup')}
                    </button>
                  </div>

                  {/* Aide IA */}
                  <div className="text-center pt-6 border-t border-white/20">
                    <button
                      type="button"
                      onClick={handleRoleHelp}
                      className="inline-flex items-center text-sm text-blue-200 hover:text-emerald-300 transition-colors group"
                      disabled={isLoading}
                    >
                      <FaRobot className="mr-2 group-hover:animate-bounce" />
                      {t('auth.needHelp')}
                    </button>
                  </div>
                </form>

                {/* Mode développement */}
                {import.meta.env.DEV && (
                  <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-400/30 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center mb-3">
                      <FaCode className="text-yellow-300 mr-2" />
                      <h4 className="font-semibold text-yellow-200">Mode Développement</h4>
                    </div>
                    <p className="text-sm text-yellow-100 leading-relaxed">
                      Utilisez vos identifiants Django ou créez un nouveau compte.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assistant IA */}
      {isAssistantOpen && (
        <AuthAIAssistant
          isOpen={isAssistantOpen}
          onClose={() => setAssistantOpen(false)}
          initialPrompt={assistantInitialPrompt}
        />
      )}
    </>
  );
};

export default Login;
