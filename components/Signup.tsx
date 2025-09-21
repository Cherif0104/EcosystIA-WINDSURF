import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { SignupData } from '../services/apiService';
import NexusFlowIcon from './icons/NexusFlowIcon';
import AuthAIAssistant from './AuthAIAssistant';

interface SignupProps {
  onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin }) => {
  const { signup, error: authError, clearError, isLoading } = useAuth();
  const { t } = useLocalization();
  
  const [formData, setFormData] = useState<SignupData>({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'student'
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAssistantOpen, setAssistantOpen] = useState(false);
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState('');

  // Options de rôles organisées par catégorie
  const roleCategories = {
    youth: {
      label: 'Jeunesse',
      description: 'Pour les étudiants et entrepreneurs',
      roles: [
        { value: 'student', label: 'Étudiant' },
        { value: 'entrepreneur', label: 'Entrepreneur' }
      ]
    },
    partner: {
      label: 'Partenaires',
      description: 'Pour les organisations collaboratrices',
      roles: [
        { value: 'employer', label: 'Employeur' },
        { value: 'trainer', label: 'Formateur' },
        { value: 'funder', label: 'Financeur' },
        { value: 'implementer', label: 'Implémenteur' }
      ]
    },
    contributor: {
      label: 'Contributeurs',
      description: 'Pour les experts et conseillers',
      roles: [
        { value: 'mentor', label: 'Mentor' },
        { value: 'coach', label: 'Coach' },
        { value: 'facilitator', label: 'Facilitateur' },
        { value: 'publisher', label: 'Éditeur' },
        { value: 'producer', label: 'Producteur' },
        { value: 'artist', label: 'Artiste' },
        { value: 'alumni', label: 'Ancien élève' }
      ]
    },
    staff: {
      label: 'Personnel',
      description: 'Pour l\'équipe interne',
      roles: [
        { value: 'intern', label: 'Stagiaire' },
        { value: 'supervisor', label: 'Superviseur' },
        { value: 'manager', label: 'Manager' },
        { value: 'administrator', label: 'Administrateur' }
      ]
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Effacer les erreurs lors de la saisie
    if (localError) setLocalError('');
    if (authError) clearError();
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (localError) setLocalError('');
    if (authError) clearError();
  };

  const validateForm = (): string | null => {
    if (!formData.username || !formData.email || !formData.password || !formData.first_name) {
      return t('auth.fillAllFields');
    }

    if (formData.username.length < 3) {
      return t('auth.usernameMinLength');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      return t('auth.usernameInvalidChars');
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return t('auth.emailInvalid');
    }

    if (formData.password.length < 8) {
      return t('auth.passwordMinLength8');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      return t('auth.passwordComplexity');
    }

    if (formData.password !== confirmPassword) {
      return t('auth.passwordMismatch');
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    try {
      const success = await signup(formData);
      if (!success) {
        setLocalError(authError || t('auth.signupError'));
      }
      // Si succès, la redirection sera gérée par le contexte d'authentification
    } catch (err: any) {
      setLocalError(err.message || t('auth.signupError'));
    }
  };

  const openAssistant = (prompt: string = '') => {
    setAssistantInitialPrompt(prompt);
    setAssistantOpen(true);
  };

  const handleRoleHelp = () => {
    openAssistant('Pouvez-vous m\'expliquer les différents rôles disponibles sur la plateforme ?');
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden md:flex">
          {/* Left Panel */}
          <div className="md:w-2/5 bg-emerald-600 text-white p-8 flex flex-col justify-center items-center text-center">
            <NexusFlowIcon className="w-24 h-24"/>
            <h1 className="text-2xl font-bold mt-4">{t('senegel_workflow_platform')}</h1>
            <p className="mt-2 text-emerald-100">{t('signup_subtitle')}</p>
            
            <div className="mt-6 p-4 bg-emerald-700 rounded-lg">
              <h3 className="font-semibold mb-2">🎯 Rejoignez-nous !</h3>
              <p className="text-sm text-emerald-100">
                Créez votre compte et accédez à tous les outils de collaboration et de gestion de projets.
              </p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="md:w-3/5 p-8 md:p-12 overflow-y-auto max-h-screen">
            <h2 className="text-3xl font-bold text-gray-900">{t('signup_title')}</h2>
            
            {/* Messages d'erreur */}
            {(localError || authError) && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {localError || authError}
                </div>
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {/* Prénom et Nom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    {t('auth.firstName')} *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Prénom"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    {t('auth.lastName')}
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Nom"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Nom d'utilisateur */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  {t('auth.username')} *
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Nom d'utilisateur unique"
                    required
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <i className="fas fa-user text-gray-400"></i>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  3 caractères minimum, lettres, chiffres et _ uniquement
                </p>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('auth.email')} *
                </label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="votre@email.com"
                    required
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <i className="fas fa-envelope text-gray-400"></i>
                  </div>
                </div>
              </div>

              {/* Rôle */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    {t('auth.role')} *
                  </label>
                  <button
                    type="button"
                    onClick={handleRoleHelp}
                    className="text-xs text-emerald-600 hover:text-emerald-500"
                    disabled={isLoading}
                  >
                    <i className="fas fa-question-circle mr-1"></i>
                    Aide sur les rôles
                  </button>
                </div>
                <select
                  name="role"
                  id="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  disabled={isLoading}
                >
                  {Object.entries(roleCategories).map(([categoryKey, category]) => (
                    <optgroup key={categoryKey} label={`${category.label} - ${category.description}`}>
                      {category.roles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Mot de passe */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('auth.password')} *
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Mot de passe sécurisé"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-gray-400`}></i>
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  8 caractères minimum avec majuscule, minuscule et chiffre
                </p>
              </div>

              {/* Confirmation mot de passe */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  {t('auth.confirmPassword')} *
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Répétez le mot de passe"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-gray-400`}></i>
                  </button>
                </div>
              </div>

              {/* Conditions d'utilisation */}
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 mt-1 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  required
                  disabled={isLoading}
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  J'accepte les{' '}
                  <a href="#" className="text-emerald-600 hover:text-emerald-500">
                    conditions d'utilisation
                  </a>{' '}
                  et la{' '}
                  <a href="#" className="text-emerald-600 hover:text-emerald-500">
                    politique de confidentialité
                  </a>
                </label>
              </div>

              {/* Bouton d'inscription */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      {t('auth.creating')}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus mr-2"></i>
                      {t('auth.createAccount')}
                    </>
                  )}
                </button>
              </div>

              {/* Lien vers connexion */}
              <div className="text-center pt-4">
                <span className="text-gray-600">{t('auth.hasAccount')} </span>
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="font-medium text-emerald-600 hover:text-emerald-500"
                  disabled={isLoading}
                >
                  {t('auth.login')}
                </button>
              </div>
            </form>
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

export default Signup;