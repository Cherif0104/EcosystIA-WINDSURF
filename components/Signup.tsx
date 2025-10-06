import React, { useState } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import NexusFlowIcon from './icons/NexusFlowIcon';
import { Role, User } from '../types';
import AuthAIAssistant from './AuthAIAssistant';


const PasswordStrengthMeter: React.FC<{ password?: string }> = ({ password = '' }) => {
    const { t } = useLocalization();

    const calculateStrength = () => {
        let score = 0;
        if (password.length > 7) score++;
        if (password.length > 10) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return Math.floor(score / 1.25); // Scale score to 0-4
    };

    const strength = calculateStrength();
    const strengthLabels = [t('strength_weak'), t('strength_weak'), t('strength_medium'), t('strength_strong'), t('strength_very_strong')];
    const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-600'];

    return (
        <div>
            <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-gray-600">{t('password_strength')}</span>
                <span className={`font-semibold ${strength > 1 ? 'text-gray-800' : 'text-gray-500'}`}>{strengthLabels[strength]}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                    className={`h-1.5 rounded-full ${strengthColors[strength]} transition-all duration-300`} 
                    style={{ width: `${(strength / 4) * 100}%`}}
                ></div>
            </div>
        </div>
    );
};


interface SignupProps {
  onSignup: (signupData: Omit<User, 'id' | 'avatar' | 'skills'>) => void;
  onSwitchToLogin: () => void;
  allUsers: User[];
}

const Signup: React.FC<SignupProps> = ({ onSignup, onSwitchToLogin, allUsers }) => {
  const { t } = useLocalization();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [isAssistantOpen, setAssistantOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError(t('passwords_do_not_match'));
      return;
    }

    if (allUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setEmailError(t('email_in_use'));
      return;
    }
    
    onSignup({ name, email, phone, location, role });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden md:flex">
          {/* Left Panel */}
           <div className="md:w-1/2 bg-emerald-600 text-white p-12 flex flex-col justify-center items-center text-center">
            <NexusFlowIcon className="w-28 h-28"/>
            <h1 className="text-3xl font-bold mt-4">{t('ecosystia_platform')}</h1>
            <p className="mt-2 text-emerald-100">{t('signup_subtitle')}</p>
          </div>

          {/* Right Panel */}
          <div className="md:w-1/2 p-8 md:p-12">
             <h2 className="text-3xl font-bold text-gray-900">{t('signup_title')}</h2>
             <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('full_name')}</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('email')}</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                  {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('password')}</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('confirm_password')}</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
              </div>
              {password && <PasswordStrengthMeter password={password} />}
              {passwordError && <p className="text-red-500 text-xs mt-1 text-center">{passwordError}</p>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('role')}</label>
                <select value={role} onChange={e => setRole(e.target.value as Role)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <optgroup label={t('youth')}>
                      <option value="student">{t('student')}</option>
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
                    </optgroup>
                </select>
              </div>
              
              <div>
                <button type="submit" className="group relative w-full flex justify-center py-3 px-4 mt-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
                  {t('signup_button')}
                </button>
              </div>
            </form>
             <div className="mt-6 text-center">
              <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }} className="text-sm text-emerald-600 hover:underline font-medium">
                {t('login_prompt')}
              </a>
            </div>
          </div>
        </div>
      </div>
      <button 
        onClick={() => setAssistantOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white w-auto h-12 px-4 rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <i className="fas fa-question-circle mr-2"></i> {t('need_help')}
      </button>

      {isAssistantOpen && (
        <AuthAIAssistant 
          onClose={() => setAssistantOpen(false)}
          context="signup"
        />
      )}
    </>
  );
};

export default Signup;