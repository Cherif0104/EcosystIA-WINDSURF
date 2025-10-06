import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { mockUsers } from '../constants/data';
import NexusFlowIcon from './icons/NexusFlowIcon';
import { Role } from '../types';
import AuthAIAssistant from './AuthAIAssistant';

interface LoginProps {
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup }) => {
  const [selectedRole, setSelectedRole] = useState<Role>('manager');
  const { login } = useAuth();
  const { t } = useLocalization();
  const [isAssistantOpen, setAssistantOpen] = useState(false);
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const userToLogin = Object.values(mockUsers).find(u => u.role === selectedRole) || mockUsers.student;
    console.log('🔐 Tentative de connexion avec le rôle:', selectedRole);
    console.log('👤 Utilisateur trouvé:', userToLogin);
    login(userToLogin);
  };

  const openAssistant = (prompt: string = '') => {
    setAssistantInitialPrompt(prompt);
    setAssistantOpen(true);
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden md:flex">
          {/* Left Panel */}
          <div className="md:w-1/2 bg-emerald-600 text-white p-12 flex flex-col justify-center items-center text-center">
            <NexusFlowIcon className="w-28 h-28"/>
            <h1 className="text-3xl font-bold mt-4">{t('ecosystia_platform')}</h1>
            <p className="mt-2 text-emerald-100">{t('login_subtitle')}</p>
          </div>

          {/* Right Panel */}
          <div className="md:w-1/2 p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900">{t('login_title')}</h2>
             <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  {t('loginAs')}
                </label>
                <select
                  id="role"
                  name="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as Role)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                >
                  <optgroup label={t('youth')}>
                    <option value="student">{t('student')}</option>
                    <option value="teacher">{t('teacher')}</option>
                    <option value="entrepreneur">{t('entrepreneur')}</option>
                  </optgroup>
                  <optgroup label={t('partner')}>
                    <option value="employer">{t('employer')}</option>
                    <option value="trainer">{t('trainer')}</option>
                    <option value="funder">{t('funder')}</option>
                    <option value="implementer">{t('implementer')}</option>
                  </optgroup>
                  <optgroup label={t('contributor_category')}>
                    <option value="mentor">{t('mentor')}</option>
                    <option value="coach">{t('coach')}</option>
                    <option value="facilitator">{t('facilitator')}</option>
                    <option value="publisher">{t('publisher')}</option>
                    <option value="editor">{t('editor')}</option>
                    <option value="producer">{t('producer')}</option>
                    <option value="artist">{t('artist')}</option>
                    <option value="alumni">{t('alumni')}</option>
                  </optgroup>
                  <optgroup label={t('staff_category')}>
                    <option value="intern">{t('intern')}</option>
                    <option value="supervisor">{t('supervisor')}</option>
                    <option value="manager">{t('manager')}</option>
                    <option value="administrator">{t('administrator')}</option>
                  </optgroup>
                  <optgroup label={t('super_admin_category')}>
                    <option value="super_administrator">{t('super_administrator')}</option>
                  </optgroup>
                </select>
              </div>

              <div className="text-right text-sm">
                <a href="#" onClick={(e) => { e.preventDefault(); openAssistant(t('auth_ai_prompt_password')); }} className="font-medium text-emerald-600 hover:text-emerald-500">
                  {t('forgot_password')}
                </a>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                >
                  {t('login')}
                </button>
              </div>
            </form>
            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or</span>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToSignup(); }} className="text-sm text-emerald-600 hover:underline font-medium">
                        {t('signup_prompt')}
                    </a>
                </div>
            </div>
          </div>
        </div>
      </div>
      <button 
        onClick={() => openAssistant()}
        className="fixed bottom-6 right-6 bg-blue-600 text-white w-auto h-12 px-4 rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <i className="fas fa-question-circle mr-2"></i> {t('need_help')}
      </button>

      {isAssistantOpen && (
        <AuthAIAssistant 
          onClose={() => setAssistantOpen(false)}
          context="login"
          initialPrompt={assistantInitialPrompt}
        />
      )}
    </>
  );
};

export default Login;