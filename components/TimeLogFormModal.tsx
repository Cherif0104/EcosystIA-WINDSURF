import React, { useState, useMemo } from 'react';
import { TimeLog, Project, Course, Meeting, User } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';

interface TimeLogFormModalProps {
  timeLog: TimeLog | null;
  projects: Project[];
  courses: Course[];
  meetings: Meeting[];
  users: User[];
  onClose: () => void;
  onSave: (log: TimeLog | Omit<TimeLog, 'id' | 'userId'>) => void;
}

const TimeLogFormModal: React.FC<TimeLogFormModalProps> = ({
  timeLog,
  projects,
  courses,
  meetings,
  users,
  onClose,
  onSave
}) => {
  const { t } = useLocalization();
  const { user: currentUser } = useAuth();
  const isEditMode = timeLog !== null;
  
  // États du formulaire
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    description: timeLog?.description || '',
    type: timeLog?.projectId ? 'project' : timeLog?.courseId ? 'course' : timeLog?.meetingId ? 'meeting' : 'other',
    projectId: timeLog?.projectId || null,
    courseId: timeLog?.courseId || null,
    meetingId: timeLog?.meetingId || null,
    startDate: timeLog ? new Date(timeLog.startTime).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    startTime: timeLog ? new Date(timeLog.startTime).toTimeString().slice(0, 5) : '09:00',
    endDate: timeLog ? new Date(timeLog.endTime).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    endTime: timeLog ? new Date(timeLog.endTime).toTimeString().slice(0, 5) : '17:00',
    status: timeLog?.status || 'active',
    notes: timeLog?.notes || ''
  });

  // Validation par étapes
  const stepValidation = useMemo(() => {
    const validation: Record<number, string[]> = {};
    
    // Étape 1: Description et type
    validation[1] = [];
    if (!formData.description.trim()) {
      validation[1].push('La description est requise');
    }
    
    // Étape 2: Contexte (projet, cours, réunion)
    validation[2] = [];
    if (formData.type === 'project' && !formData.projectId) {
      validation[2].push('Veuillez sélectionner un projet');
    }
    if (formData.type === 'course' && !formData.courseId) {
      validation[2].push('Veuillez sélectionner un cours');
    }
    if (formData.type === 'meeting' && !formData.meetingId) {
      validation[2].push('Veuillez sélectionner une réunion');
    }
    
    // Étape 3: Dates et heures
    validation[3] = [];
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    if (startDateTime >= endDateTime) {
      validation[3].push('L\'heure de fin doit être après l\'heure de début');
    }
    
    const duration = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
    if (duration <= 0) {
      validation[3].push('La durée doit être supérieure à 0');
    }
    if (duration > 24) {
      validation[3].push('La durée ne peut pas dépasser 24 heures');
    }
    
    return validation;
  }, [formData]);

  // Fonction de validation d'étape
  const validateStep = (step: number): boolean => {
    return stepValidation[step].length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || validateStep(currentStep)) {
      setCurrentStep(step);
    }
  };

  // Gestion du défilement
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight - target.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    setScrollProgress(progress);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Validation en temps réel
    if (name === 'startTime' || name === 'endTime' || name === 'startDate' || name === 'endDate') {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      if (startDateTime >= endDateTime) {
        setErrors(prev => ({ ...prev, [name]: 'L\'heure de fin doit être après l\'heure de début' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation complète
    const allErrors: string[] = [];
    Object.values(stepValidation).forEach(stepErrors => {
      allErrors.push(...stepErrors);
    });
    
    if (allErrors.length > 0) {
      setErrors({ submit: allErrors.join(', ') });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      const duration = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
      
      const logData = {
        ...timeLog,
        description: formData.description,
        projectId: formData.type === 'project' ? formData.projectId : null,
        courseId: formData.type === 'course' ? formData.courseId : null,
        meetingId: formData.type === 'meeting' ? formData.meetingId : null,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        duration: Math.round(duration * 100) / 100,
        status: formData.status,
        notes: formData.notes,
        userId: currentUser?.id || 1,
        created_at: timeLog?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await onSave(logData as TimeLog);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde du log de temps' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header moderne */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{isEditMode ? 'Modifier le log' : 'Nouveau log de temps'}</h2>
                <p className="text-blue-100 text-sm">Enregistrez votre temps de travail</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Barre de navigation par étapes */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <nav className="flex space-x-8 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-2">
                {[
                  { step: 1, label: 'Description', icon: 'fas fa-edit' },
                  { step: 2, label: 'Contexte', icon: 'fas fa-project-diagram' },
                  { step: 3, label: 'Horaires', icon: 'fas fa-clock' }
                ].map(({ step, label, icon }) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => goToStep(step)}
                    className={`flex items-center space-x-2 transition-all duration-200 ${
                      currentStep === step
                        ? 'text-blue-600 font-medium'
                        : currentStep > step
                        ? 'text-green-600 hover:text-green-700'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    disabled={step > currentStep && !validateStep(currentStep)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      currentStep === step
                        ? 'bg-blue-600 text-white'
                        : currentStep > step
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {currentStep > step ? (
                        <i className="fas fa-check text-xs"></i>
                      ) : (
                        step
                      )}
                    </div>
                    <span className="text-sm">{label}</span>
                    {stepValidation[step] && stepValidation[step].length > 0 && (
                      <i className="fas fa-exclamation-triangle text-red-500 text-xs"></i>
                    )}
                  </button>
                ))}
              </nav>
              
              <div className="text-sm text-gray-600">
                Étape {currentStep} sur 3
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div 
            className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-blue scrollbar-shadow scroll-container relative"
            onScroll={handleScroll}
          >
            {/* Indicateur de défilement */}
            <div className="scroll-indicator"></div>
            
            {/* Barre de progression de défilement */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-150 ease-out"
                style={{ width: `${scrollProgress}%` }}
              ></div>
            </div>

            {/* Bouton de retour en haut */}
            {scrollProgress > 20 && (
              <button
                type="button"
                onClick={() => {
                  const container = document.querySelector('.scroll-container') as HTMLElement;
                  container?.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="fixed bottom-20 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 z-40 flex items-center justify-center group"
                title="Retour en haut"
              >
                <i className="fas fa-arrow-up group-hover:animate-bounce"></i>
              </button>
            )}
            
            {/* Étape 1: Description */}
            {currentStep === 1 && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-edit text-blue-600 text-2xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Description du travail</h3>
                  <p className="text-gray-600">Décrivez ce que vous avez accompli</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Développement de la fonctionnalité de connexion, réunion avec l'équipe, formation sur React..."
                      required
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'activité
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="project">Projet</option>
                      <option value="course">Cours/Formation</option>
                      <option value="meeting">Réunion</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2: Contexte */}
            {currentStep === 2 && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-project-diagram text-green-600 text-2xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Contexte du travail</h3>
                  <p className="text-gray-600">Associez ce temps à un projet, cours ou réunion</p>
                </div>

                <div className="space-y-6">
                  {formData.type === 'project' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Projet <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="projectId"
                        value={formData.projectId || ''}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.projectId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        required
                      >
                        <option value="">Sélectionner un projet</option>
                        {projects.map(project => (
                          <option key={project.id} value={project.id}>
                            {project.title}
                          </option>
                        ))}
                      </select>
                      {errors.projectId && <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>}
                    </div>
                  )}

                  {formData.type === 'course' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cours <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="courseId"
                        value={formData.courseId || ''}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.courseId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        required
                      >
                        <option value="">Sélectionner un cours</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                      {errors.courseId && <p className="mt-1 text-sm text-red-600">{errors.courseId}</p>}
                    </div>
                  )}

                  {formData.type === 'meeting' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Réunion <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="meetingId"
                        value={formData.meetingId || ''}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.meetingId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        required
                      >
                        <option value="">Sélectionner une réunion</option>
                        {meetings.map(meeting => (
                          <option key={meeting.id} value={meeting.id}>
                            {meeting.title}
                          </option>
                        ))}
                      </select>
                      {errors.meetingId && <p className="mt-1 text-sm text-red-600">{errors.meetingId}</p>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Étape 3: Horaires */}
            {currentStep === 3 && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-clock text-purple-600 text-2xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Horaires de travail</h3>
                  <p className="text-gray-600">Définissez les heures de début et de fin</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure de début <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.startTime ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure de fin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.endTime ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Calcul automatique de la durée */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <i className="fas fa-calculator text-blue-600 mr-2"></i>
                    <span className="text-sm font-medium text-blue-900">
                      Durée calculée: {
                        (() => {
                          const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
                          const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
                          const duration = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
                          return duration > 0 ? `${Math.round(duration * 100) / 100}h` : '0h';
                        })()
                      }
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes supplémentaires
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ajoutez des détails sur votre travail..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer avec navigation */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors flex items-center"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Précédent
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Annuler
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {currentStep < 3 ? `Étape ${currentStep} sur 3` : 'Dernière étape'}
                </div>

                <div className="flex space-x-3">
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center"
                    >
                      Suivant
                      <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check mr-2"></i>
                          {isEditMode ? 'Mettre à jour' : 'Enregistrer le log'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Messages d'erreur globaux */}
            {errors.submit && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Aide contextuelle */}
            <div className="mt-3 text-xs text-gray-500 text-center">
              {currentStep === 1 && "💡 Décrivez clairement ce que vous avez accompli"}
              {currentStep === 2 && "🔗 Associez votre temps à un projet, cours ou réunion spécifique"}
              {currentStep === 3 && "⏰ Définissez précisément vos heures de début et de fin"}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeLogFormModal;
