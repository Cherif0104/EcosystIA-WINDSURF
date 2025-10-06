import React, { useState, useEffect, useMemo, useRef } from 'react';
import { projectsService } from '../services/projectsService';
import { Project, ProjectFormData } from '../types/Project';
import { useDataSync } from '../hooks/useDataSync';
import { geminiService } from '../services/geminiService';

import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { Project, Task, User, Risk, TimeLog, Course } from '../types';
import { enhanceProjectTasks, identifyRisks, generateStatusReport, summarizeTasks } from '../services/geminiService';
import LogTimeModal from './LogTimeModal';
import ConfirmationModal from './common/ConfirmationModal';
import { useProjectPermissions } from '../hooks/useProjectPermissions';
import { usePermissions } from '../hooks/usePermissions';
import { useRealtime } from '../hooks/useRealtime';
import AutoSaveIndicator from './common/AutoSaveIndicator';

// Styles modernes pour les statuts
const statusStyles = {
    'Not Started': 'bg-gray-100 text-gray-800 border-gray-200',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
    'Completed': 'bg-green-100 text-green-800 border-green-200',
    'On Hold': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Cancelled': 'bg-red-100 text-red-800 border-red-200'
};

// Styles modernes pour les priorités
const priorityStyles = {
    'High': 'border-l-orange-500',
    'Medium': 'border-l-yellow-500',
    'Low': 'border-l-green-500',
    'Critical': 'border-l-red-500'
}

const ProjectFormModal: React.FC<{
    project: Omit<Project, 'id' | 'tasks' | 'risks'> | Project | null;
    users: User[];
    onClose: () => void;
    onSave: (project: Omit<Project, 'id' | 'tasks' | 'risks'> | Project) => void;
}> = ({ project, users, onClose, onSave }) => {
    const { t } = useLocalization();
    const isEditMode = project && 'id' in project;
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    
    // États pour la sélection d'équipe
    const [teamSearchTerm, setTeamSearchTerm] = useState('');
    const [teamRoleFilter, setTeamRoleFilter] = useState('all');
    
    // États pour la navigation par étapes
    const [currentStep, setCurrentStep] = useState(1);
    const [scrollProgress, setScrollProgress] = useState(0);
    
    const [formData, setFormData] = useState({
        title: project?.title || '',
        description: project?.description || '',
        status: project?.status || 'Not Started',
        priority: project?.priority || 'Medium',
        dueDate: project?.dueDate || '',
        budget: project?.budget || '',
        currency: project?.currency || 'EUR',
        client_name: project?.client_name || '',
        team: project?.team?.map(u => u.id) || [],
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        
        // Effacer l'erreur quand l'utilisateur commence à taper
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ''}));
        }
        
        // Validation en temps réel pour certains champs
        if (name === 'budget' && value) {
            const numValue = Number(value);
            if (isNaN(numValue) || numValue < 0) {
                setErrors(prev => ({ ...prev, [name]: 'Le budget doit être un nombre positif' }));
            }
        }
        
        if (name === 'dueDate' && value) {
            const selectedDate = new Date(value);
            if (selectedDate < new Date()) {
                setErrors(prev => ({ ...prev, [name]: 'La date d\'échéance ne peut pas être dans le passé' }));
            }
        }
    };
    
    // Filtrage des membres d'équipe
    const filteredTeamMembers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = !teamSearchTerm || 
                user.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
                user.role.toLowerCase().includes(teamSearchTerm.toLowerCase());
            
            const matchesRole = teamRoleFilter === 'all' || user.role === teamRoleFilter;
            
            return matchesSearch && matchesRole;
        });
    }, [users, teamSearchTerm, teamRoleFilter]);

    // Fonction pour basculer la sélection d'un membre
    const toggleTeamMember = (userId: number) => {
        setFormData(prev => ({
            ...prev,
            team: prev.team.includes(userId)
                ? prev.team.filter(id => id !== userId)
                : [...prev.team, userId]
        }));
    };

    // Validation des étapes avec useMemo pour éviter les re-renders
    const stepValidation = useMemo(() => {
        const newErrors: {[key: number]: string[]} = {};

        // Étape 1: Informations principales
        newErrors[1] = [];
        if (!formData.title.trim()) {
            newErrors[1].push('Le titre est requis');
        }
        if (!formData.description.trim()) {
            newErrors[1].push('La description est requise');
        }

        // Étape 2: Configuration
        newErrors[2] = [];
        if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
            newErrors[2].push('La date d\'échéance ne peut pas être dans le passé');
        }

        // Étape 3: Budget et client
        newErrors[3] = [];
        if (formData.budget && (isNaN(Number(formData.budget)) || Number(formData.budget) < 0)) {
            newErrors[3].push('Le budget doit être un nombre positif');
        }

        // Étape 4: Équipe
        newErrors[4] = [];
        if (formData.team.length === 0) {
            newErrors[4].push('Au moins un membre de l\'équipe est requis');
        }

        return newErrors;
    }, [formData.title, formData.description, formData.dueDate, formData.budget, formData.team.length]);

    // Fonction de validation d'étape
    const validateStep = (step: number): boolean => {
        if (step === 1) {
            return formData.title.trim() !== '' && formData.description.trim() !== '';
        } else if (step === 2) {
            return true; // Étape de configuration, toujours valide
        } else if (step === 3) {
            return true; // Étape budget/client, optionnelle
        } else if (step === 4) {
            return formData.team.length > 0;
        }
        return true;
    };

    // Fonction de validation globale pour la soumission
    const validateForm = (): Record<string, string> => {
        const errors: Record<string, string> = {};
        
        // Validation du titre
        if (!formData.title.trim()) {
            errors.title = 'Le titre est requis';
        }
        
        // Validation de la description
        if (!formData.description.trim()) {
            errors.description = 'La description est requise';
        }
        
        // Validation de la date d'échéance
        if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
            errors.dueDate = 'La date d\'échéance ne peut pas être dans le passé';
        }
        
        // Validation du budget
        if (formData.budget && (isNaN(Number(formData.budget)) || Number(formData.budget) < 0)) {
            errors.budget = 'Le budget doit être un nombre positif';
        }
        
        // Validation de l'équipe
        if (formData.team.length === 0) {
            errors.team = 'Au moins un membre de l\'équipe est requis';
        }
        
        return errors;
    };

    const nextStep = () => {
        // Validation simple sans re-render
        let canProceed = true;
        
        if (currentStep === 1) {
            canProceed = formData.title.trim() !== '' && formData.description.trim() !== '';
        } else if (currentStep === 2) {
            canProceed = true; // Étape de configuration, toujours valide
        } else if (currentStep === 3) {
            canProceed = true; // Étape budget/client, optionnelle
        } else if (currentStep === 4) {
            canProceed = formData.team.length > 0;
        }
        
        if (canProceed && currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const canProceedToStep = (step: number): boolean => {
        if (step <= currentStep) {
            return true; // Peut toujours revenir en arrière
        }
        
        // Vérifier si l'étape précédente est valide
        if (currentStep === 1) {
            return formData.title.trim() !== '' && formData.description.trim() !== '';
        } else if (currentStep === 2) {
            return true;
        } else if (currentStep === 3) {
            return true;
        }
        
        return false;
    };

    const goToStep = (step: number) => {
        if (canProceedToStep(step)) {
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
    
    const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => Number(option.value));
        setFormData(prev => ({ ...prev, team: selectedIds }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation complète avant soumission
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setIsLoading(true);
        setErrors({});
        
        try {
            const teamMembers = users.filter(u => formData.team.includes(u.id));
            const projectData = {
                ...project,
                ...formData,
                budget: formData.budget ? Number(formData.budget) : null,
                team: teamMembers,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            await onSave(projectData as Project);
            onClose();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            setErrors({submit: 'Erreur lors de la sauvegarde du projet'});
        } finally {
            setIsLoading(false);
        }
    };

    
  // Gestionnaires d'événements unifiés et stables
  

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header moderne */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <i className="fas fa-project-diagram text-xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{isEditMode ? 'Modifier le projet' : 'Nouveau projet'}</h2>
                <p className="text-blue-100 text-sm">Gérez les détails de votre projet</p>
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
          {/* Barre de navigation par étapes interactive */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <nav className="flex space-x-8 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-2">
                {[
                  { step: 1, label: 'Informations', icon: 'fas fa-info-circle' },
                  { step: 2, label: 'Configuration', icon: 'fas fa-cog' },
                  { step: 3, label: 'Budget & Client', icon: 'fas fa-euro-sign' },
                  { step: 4, label: 'Équipe', icon: 'fas fa-users' }
                ].map(({ step, label, icon }) => (
                  <button
                    key={step}
                    onClick={() => goToStep(step)}
                    className={`flex items-center space-x-2 transition-all duration-200 ${
                      currentStep === step
                        ? 'text-blue-600 font-medium'
                        : currentStep > step
                        ? 'text-green-600 hover:text-green-700'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    disabled={step > currentStep && !canProceedToStep(step)}
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
                    {!validateStep(step) && (
                      <i className="fas fa-exclamation-triangle text-red-500 text-xs"></i>
                    )}
                  </button>
                ))}
              </nav>
              
              {/* Indicateur de progression */}
              <div className="text-sm text-gray-600">
                Étape {currentStep} sur 4
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div 
            className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-blue scrollbar-shadow scroll-container relative"
            onScroll={handleScroll}
          >
            {/* Indicateur de défilement personnalisé */}
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
            
            {/* Étape 1: Informations principales */}
            {currentStep === 1 && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-info-circle text-blue-600 text-2xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Informations du projet</h3>
                  <p className="text-gray-600">Commencez par donner un nom et une description à votre projet</p>
                </div>

                <div className="space-y-6">
                        <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre du projet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg ${
                        errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Lancement de la campagne marketing Q4"
                      required
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                        </div>

                         <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={6}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                        errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Décrivez les objectifs, les enjeux et les détails de votre projet..."
                      required
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>
                </div>

                {/* Affichage des erreurs de l'étape */}
                {stepValidation[1] && stepValidation[1].length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex">
                      <i className="fas fa-exclamation-triangle text-red-400 mr-2"></i>
                            <div>
                        <h4 className="text-sm font-medium text-red-800">Veuillez corriger les erreurs suivantes :</h4>
                        <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                          {stepValidation[1].map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Étape 2: Configuration */}
            {currentStep === 2 && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-cog text-green-600 text-2xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Configuration du projet</h3>
                  <p className="text-gray-600">Définissez le statut, la priorité et l'échéance de votre projet</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="Not Started">Non commencé</option>
                      <option value="In Progress">En cours</option>
                      <option value="Completed">Terminé</option>
                      <option value="On Hold">En attente</option>
                      <option value="Cancelled">Annulé</option>
                                </select>
                            </div>

                             <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="Low">Faible</option>
                      <option value="Medium">Moyenne</option>
                      <option value="High">Élevée</option>
                      <option value="Critical">Critique</option>
                    </select>
                            </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date d'échéance</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.dueDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
                        </div>
                </div>

                {/* Affichage des erreurs de l'étape */}
                {stepValidation[2] && stepValidation[2].length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex">
                      <i className="fas fa-exclamation-triangle text-red-400 mr-2"></i>
                        <div>
                        <h4 className="text-sm font-medium text-red-800">Veuillez corriger les erreurs suivantes :</h4>
                        <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                          {stepValidation[2].map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Étape 3: Budget et client */}
            {currentStep === 3 && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-euro-sign text-purple-600 text-2xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Budget et client</h3>
                  <p className="text-gray-600">Définissez le budget et identifiez le client du projet</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.budget ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="XOF">XOF</option>
                            </select>
                        </div>
                    {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget}</p>}
                    </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                    <input
                      type="text"
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nom du client ou de l'organisation"
                    />
                  </div>
                </div>

                {/* Affichage des erreurs de l'étape */}
                {stepValidation[3] && stepValidation[3].length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex">
                      <i className="fas fa-exclamation-triangle text-red-400 mr-2"></i>
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Veuillez corriger les erreurs suivantes :</h4>
                        <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                          {stepValidation[3].map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Étape 4: Équipe */}
            {currentStep === 4 && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-users text-orange-600 text-2xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Équipe du projet</h3>
                  <p className="text-gray-600">Sélectionnez les membres qui participeront à ce projet</p>
                </div>

                <div className="space-y-6">
                  {/* Barre de recherche d'équipe */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-search text-gray-400"></i>
                      </div>
                      <input
                        type="text"
                        placeholder="Rechercher un membre de l'équipe..."
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={teamSearchTerm}
                        onChange={(e) => setTeamSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Filtres par rôle */}
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setTeamRoleFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          teamRoleFilter === 'all' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Tous les rôles
                      </button>
                      {Array.from(new Set(users.map(u => u.role))).map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setTeamRoleFilter(role)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            teamRoleFilter === role 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Liste des membres */}
                  <div className="border border-gray-300 rounded-lg p-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-green scrollbar-shadow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredTeamMembers.map(user => (
                        <div
                          key={user.id}
                          className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                            formData.team.includes(user.id)
                              ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                              : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                          }`}
                          onClick={() => toggleTeamMember(user.id)}
                        >
                          <div className="flex-shrink-0">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-12 h-12 rounded-full ring-2 ring-white"
                            />
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {user.role}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {formData.team.includes(user.id) ? (
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <i className="fas fa-check text-white text-xs"></i>
                              </div>
                            ) : (
                              <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {filteredTeamMembers.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <i className="fas fa-users fa-3x mb-4"></i>
                        <p className="text-lg">Aucun membre trouvé</p>
                        <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                      </div>
                    )}
                  </div>

                  {/* Membres sélectionnés */}
                  {formData.team.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-700 mb-3">
                        Membres sélectionnés ({formData.team.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.team.map(userId => {
                          const user = users.find(u => u.id === userId);
                          return user ? (
                            <div
                              key={userId}
                              className="flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
                            >
                              <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full mr-2" />
                              {user.name}
                              <button
                                type="button"
                                onClick={() => toggleTeamMember(userId)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Affichage des erreurs de l'étape */}
                {stepValidation[4] && stepValidation[4].length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex">
                      <i className="fas fa-exclamation-triangle text-red-400 mr-2"></i>
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Veuillez corriger les erreurs suivantes :</h4>
                        <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                          {stepValidation[4].map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer avec navigation par étapes */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                {/* Bouton Précédent */}
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
                
                {/* Bouton Annuler */}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Annuler
                </button>
              </div>

              <div className="flex items-center space-x-4">
                {/* Indicateur de progression */}
                <div className="text-sm text-gray-500">
                  {currentStep < 4 ? `Étape ${currentStep} sur 4` : 'Dernière étape'}
                </div>

                {/* Boutons de navigation */}
                <div className="flex space-x-3">
                  {currentStep < 4 ? (
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
                          {isEditMode ? 'Mettre à jour' : 'Créer le projet'}
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
              {currentStep === 1 && "💡 Commencez par donner un nom clair et une description détaillée à votre projet"}
              {currentStep === 2 && "⚙️ Configurez le statut et la priorité selon l'état actuel du projet"}
              {currentStep === 3 && "💰 Le budget et le client sont optionnels mais recommandés pour un suivi complet"}
              {currentStep === 4 && "👥 Sélectionnez au moins un membre de l'équipe pour commencer le projet"}
            </div>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ProjectDetailModal: React.FC<{
    project: Project;
    onClose: () => void;
    onUpdateProject: (project: Project) => void;
    onDeleteProject: (projectId: number) => void;
    onAddTimeLog: (log: Omit<TimeLog, 'id' | 'userId'>) => void;
    timeLogs: TimeLog[];
}> = ({ project, onClose, onUpdateProject, onDeleteProject, onAddTimeLog, timeLogs }) => {
    const { t } = useLocalization();
    const { user: currentUser } = useAuth();
    const permissions = useProjectPermissions();
    const [currentProject, setCurrentProject] = useState(project);
    const [activeTab, setActiveTab] = useState<'tasks' | 'risks' | 'report'>('tasks');
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState('');
    const [isLogTimeModalOpen, setLogTimeModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [openAssigneeMenuForTask, setOpenAssigneeMenuForTask] = useState<string | null>(null);
    const [isNewTaskAssigneeMenuOpen, setNewTaskAssigneeMenuOpen] = useState(false);
    const [newTaskAssigneeSearch, setNewTaskAssigneeSearch] = useState('');

    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [newTaskAssigneeId, setNewTaskAssigneeId] = useState<number | ''>('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');


    useEffect(() => {
        setCurrentProject(project);
    }, [project]);

    const handleUpdateTask = (taskId: string, updatedFields: Partial<Task>) => {
        const updatedTasks = currentProject.tasks.map(task =>
            task.id === taskId ? { ...task, ...updatedFields } : task
        );
        const updatedProject = { ...currentProject, tasks: updatedTasks };
        setCurrentProject(updatedProject);
        onUpdateProject(updatedProject);
    };
    
    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newTaskText.trim()) return;
        const newTask: Task = {
            id: `task-${Date.now()}`,
            text: newTaskText,
            status: 'To Do',
            priority: newTaskPriority,
            assignee: currentProject.team.find(u => u.id === newTaskAssigneeId),
            dueDate: newTaskDueDate || undefined,
        };
        const updatedProject = { ...currentProject, tasks: [...currentProject.tasks, newTask] };
        setCurrentProject(updatedProject);
        onUpdateProject(updatedProject);
        setNewTaskText('');
        setNewTaskPriority('Medium');
        setNewTaskAssigneeId('');
        setNewTaskDueDate('');
    };

    const handleDeleteTask = (taskId: string) => {
        const updatedTasks = currentProject.tasks.filter(task => task.id !== taskId);
        const updatedProject = { ...currentProject, tasks: updatedTasks };
        setCurrentProject(updatedProject);
        onUpdateProject(updatedProject);
    };

    const handleGenerateTasks = async () => {
        setLoading(true);
        const generatedTasks = await enhanceProjectTasks(currentProject.description, currentProject.team);
        const newTasks: Task[] = generatedTasks.map((t, index) => ({
            id: `ai-${Date.now()}-${index}`,
            text: t.text,
            status: 'To Do',
            priority: t.priority,
            assignee: currentProject.team.find(u => u.id === t.assigneeId)
        }));
        const updatedProject = { ...currentProject, tasks: [...currentProject.tasks, ...newTasks] };
        setCurrentProject(updatedProject);
        onUpdateProject(updatedProject);
        setLoading(false);
    };

    const handleIdentifyRisks = async () => {
        setLoading(true);
        const generatedRisks = await identifyRisks(currentProject.description);
        const newRisks: Risk[] = generatedRisks.map((r, index) => ({
            id: `risk-${Date.now()}-${index}`,
            ...r
        }));
        const updatedProject = { ...currentProject, risks: [...(currentProject.risks || []), ...newRisks] };
        setCurrentProject(updatedProject);
        onUpdateProject(updatedProject);
        setLoading(false);
    };

    const handleGenerateReport = async () => {
        setLoading(true);
        const result = await generateStatusReport(currentProject);
        setReport(result);
        setLoading(false);
    }
    
    const handleSummarizeTasks = async () => {
        setLoading(true);
        const result = await summarizeTasks(currentProject.tasks);
        setReport(result);
        setLoading(false);
    };
    
    const handleSaveTimeLog = (logData: Omit<TimeLog, 'id' | 'userId'>) => {
        onAddTimeLog(logData);
        setLogTimeModalOpen(false);
    };

    const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
        const [searchTerm, setSearchTerm] = useState('');
        const isOpen = openAssigneeMenuForTask === task.id;

        useEffect(() => {
            if (!isOpen) {
                setSearchTerm('');
            }
        }, [isOpen]);

        const filteredTeam = currentProject.team.filter(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const getDueDateStatus = (dueDate: string | undefined) => {
            if (!dueDate) return { text: '', color: '', icon: '' };
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const due = new Date(dueDate);
            const diffTime = due.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600', icon: 'fas fa-exclamation-circle' };
            if (diffDays <= 7) return { text: 'Due Soon', color: 'text-yellow-600', icon: 'fas fa-clock' };
            return { text: '', color: 'text-gray-500', icon: 'far fa-calendar-alt' };
        };

        const dueDateStatus = getDueDateStatus(task.dueDate);

        return (
            <div className="flex items-center p-2 rounded-md hover:bg-gray-100 group">
                <input
                    type="checkbox"
                    checked={task.status === 'Done'}
                    onChange={(e) => handleUpdateTask(task.id, { status: e.target.checked ? 'Done' : 'To Do' })}
                    className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <input
                    type="text"
                    value={task.text}
                    onChange={(e) => handleUpdateTask(task.id, { text: e.target.value })}
                    className={`flex-grow mx-3 p-1 border-transparent rounded-md focus:border-gray-300 focus:bg-white ${task.status === 'Done' ? 'line-through text-gray-500' : ''}`}
                />
                 <div className={`mr-2 ${dueDateStatus.color} flex items-center text-xs`}>
                    <i className={`${dueDateStatus.icon} mr-1`}></i>
                    <span>{dueDateStatus.text}</span>
                </div>
                <input
                    type="date"
                    value={task.dueDate || ''}
                    onChange={(e) => handleUpdateTask(task.id, { dueDate: e.target.value })}
                    className="text-xs p-1 border rounded-md"
                />
                <div className="flex items-center ml-2">
                    <label className="text-xs mr-1 text-gray-500">{t('estimated_time_short')}</label>
                    <input
                        type="number"
                        value={task.estimatedTime || ''}
                        onChange={(e) => handleUpdateTask(task.id, { estimatedTime: Number(e.target.value) })}
                        className="w-12 text-xs p-1 border rounded-md"
                    />
                </div>
                <div className="flex items-center ml-2">
                    <label className="text-xs mr-1 text-gray-500">{t('logged_time_short')}</label>
                     <input
                        type="number"
                        value={task.loggedTime || ''}
                        onChange={(e) => handleUpdateTask(task.id, { loggedTime: Number(e.target.value) })}
                        className="w-12 text-xs p-1 border rounded-md"
                    />
                </div>
                <select
                    value={task.priority || 'Medium'}
                    onChange={(e) => handleUpdateTask(task.id, { priority: e.target.value as any })}
                    className="text-xs p-1 border rounded-md mx-2"
                >
                    <option value="Low">{t('low')}</option>
                    <option value="Medium">{t('medium')}</option>
                    <option value="High">{t('high')}</option>
                </select>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setOpenAssigneeMenuForTask(isOpen ? null : task.id)}
                        className="flex items-center space-x-2 cursor-pointer p-1 rounded-md hover:bg-gray-200"
                    >
                        {task.assignee ? (
                            <img src={task.assignee.avatar} alt={task.assignee.name} className="w-6 h-6 rounded-full flex-shrink-0" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0">
                                <i className="fas fa-user-plus text-xs"></i>
                            </div>
                        )}
                        <span className="text-xs text-gray-700 truncate max-w-[80px]">{task.assignee ? task.assignee.name : t('unassigned')}</span>
                        <i className={`fas fa-chevron-down text-gray-400 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
                    </button>
                    {isOpen && (
                        <div className="absolute z-10 right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="p-2">
                                <input 
                                    type="text"
                                    placeholder="Search team..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                            <div className="py-1 max-h-48 overflow-y-auto">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleUpdateTask(task.id, { assignee: undefined });
                                        setOpenAssigneeMenuForTask(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                                >
                                     <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0">
                                        <i className="fas fa-user-slash text-xs"></i>
                                    </div>
                                    <span>{t('unassigned')}</span>
                                </button>
                                {filteredTeam.map(member => (
                                    <button
                                        key={member.id}
                                        type="button"
                                        onClick={() => {
                                            handleUpdateTask(task.id, { assignee: member });
                                            setOpenAssigneeMenuForTask(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                                    >
                                        <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full" />
                                        <span className="truncate">{member.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <button onClick={() => handleDeleteTask(task.id)} className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fas fa-trash"></i>
                </button>
            </div>
        )
    };
    
    const canManage = currentUser?.role === 'manager' || currentUser?.role === 'administrator' || currentUser?.role === 'super_administrator';
    
    const selectedNewTaskAssignee = currentProject.team.find(u => u.id === newTaskAssigneeId);
    const filteredNewTaskTeam = currentProject.team.filter(member => 
        member.name.toLowerCase().includes(newTaskAssigneeSearch.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{currentProject.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">{currentProject.description}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-times fa-lg"></i>
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-grow flex overflow-hidden">
                    {/* Left: Tabs & Content */}
                    <div className="flex-grow p-6 overflow-y-auto">
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <button onClick={() => setActiveTab('tasks')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tasks' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t('tasks')}</button>
                                <button onClick={() => setActiveTab('risks')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'risks' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t('risk_management_tab')}</button>
                                <button onClick={() => setActiveTab('report')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'report' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t('generate_status_report')}</button>
                            </nav>
                        </div>
                        
                        {activeTab === 'tasks' && (
                            <div>
                                <div className="space-y-2">
                                    {currentProject.tasks.map(task => <TaskItem key={task.id} task={task} />)}
                                </div>
                                {permissions.canManageTasks && (
                                    <form onSubmit={handleAddTask} className="mt-4 p-2 border-t flex items-center gap-2 flex-wrap">
                                        <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Add a new task..." className="flex-grow p-2 border rounded-md"/>
                                        <input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className="p-2 border rounded-md text-sm"/>
                                        <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value as any)} className="p-2 border rounded-md text-sm">
                                            <option value="Low">{t('low')}</option>
                                            <option value="Medium">{t('medium')}</option>
                                            <option value="High">{t('high')}</option>
                                        </select>
                                        <div className="relative">
                                            <button type="button" onClick={() => setNewTaskAssigneeMenuOpen(!isNewTaskAssigneeMenuOpen)} className="flex items-center space-x-2 cursor-pointer p-2 border rounded-md hover:bg-gray-100 bg-white">
                                                {selectedNewTaskAssignee ? (
                                                    <img src={selectedNewTaskAssignee.avatar} alt={selectedNewTaskAssignee.name} className="w-5 h-5 rounded-full flex-shrink-0" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0">
                                                        <i className="fas fa-user-plus text-xs"></i>
                                                    </div>
                                                )}
                                                <span className="text-xs text-gray-700 truncate max-w-[80px]">{selectedNewTaskAssignee ? selectedNewTaskAssignee.name : t('unassigned')}</span>
                                                <i className={`fas fa-chevron-down text-gray-400 text-xs transition-transform ${isNewTaskAssigneeMenuOpen ? 'rotate-180' : ''}`}></i>
                                            </button>
                                            {isNewTaskAssigneeMenuOpen && (
                                                <div className="absolute z-10 bottom-full mb-2 right-0 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                                    <div className="p-2"><input type="text" placeholder="Search team..." value={newTaskAssigneeSearch} onChange={(e) => setNewTaskAssigneeSearch(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"/></div>
                                                    <div className="py-1 max-h-48 overflow-y-auto">
                                                        <button type="button" onClick={() => { setNewTaskAssigneeId(''); setNewTaskAssigneeMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3">
                                                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0"><i className="fas fa-user-slash text-xs"></i></div>
                                                            <span>{t('unassigned')}</span>
                                                        </button>
                                                        {filteredNewTaskTeam.map(member => (
                                                            <button key={member.id} type="button" onClick={() => { setNewTaskAssigneeId(member.id); setNewTaskAssigneeMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3">
                                                                <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full" /><span className="truncate">{member.name}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-emerald-700 text-sm">{t('add_skill')}</button>
                                    </form>
                                )}
                            </div>
                        )}

                        {activeTab === 'risks' && (
                             <div>
                                {currentProject.risks?.map(risk => (
                                    <div key={risk.id} className="p-4 border-b">
                                        <p className="font-semibold">{risk.description}</p>
                                        <div className="flex items-center text-sm text-gray-600 mt-1">
                                            <span>{t('likelihood')}: {t(risk.likelihood.toLowerCase())}</span>
                                            <span className="mx-2">|</span>
                                            <span>{t('impact')}: {t(risk.impact.toLowerCase())}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2"><strong>{t('mitigation_strategy')}:</strong> {risk.mitigationStrategy}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'report' && (
                            <div>
                                {loading ? (
                                    <div className="flex justify-center items-center"><i className="fas fa-spinner fa-spin text-2xl text-emerald-500"></i></div>
                                ) : report ? (
                                    <div className="prose prose-emerald max-w-none" dangerouslySetInnerHTML={{ __html: report.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></div>
                                ) : (
                                    <div className="text-center p-8 text-gray-500">
                                        <i className="fas fa-file-alt fa-3x"></i>
                                        <p className="mt-4">Generate a status report or task summary.</p>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                    {/* Right: Meta & Actions */}
                    <div className="w-80 bg-gray-50 border-l p-6 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800 mb-4">{t('project_details')}</h3>
                            <div className="space-y-3 text-sm">
                                <p><strong>{t('status')}:</strong> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[currentProject.status]}`}>{t(currentProject.status.replace(/\s+/g, '_').toLowerCase())}</span></p>
                                <p><strong>{t('due_date')}:</strong> {currentProject.dueDate}</p>
                            </div>
                            <h3 className="font-bold text-gray-800 mt-6 mb-4">{t('team_members')}</h3>
                            <div className="space-y-3">
                                {currentProject.team.map(member => (
                                    <div key={member.id} className="flex items-center space-x-3">
                                        <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p className="font-semibold text-sm">{member.name}</p>
                                            <p className="text-xs text-gray-500 capitalize">{t(member.role)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                         {/* Actions basées sur les permissions */}
                            <div className="space-y-2 border-t pt-4">
                            {activeTab === 'tasks' && permissions.canManageTasks && (
                                <button onClick={handleGenerateTasks} disabled={loading} className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-emerald-300 flex items-center justify-center text-sm">
                                    <i className="fas fa-magic mr-2"></i>{t('generate_tasks_with_ai')}
                                </button>
                            )}
                            {activeTab === 'risks' && permissions.canManageRisks && (
                                <button onClick={handleIdentifyRisks} disabled={loading} className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-emerald-300 flex items-center justify-center text-sm">
                                    <i className="fas fa-magic mr-2"></i>{t('identify_risks_with_ai')}
                                </button>
                            )}
                            {activeTab === 'report' && permissions.canGenerateReports && (
                                <>
                                    <button onClick={handleGenerateReport} disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center text-sm">
                                        <i className="fas fa-file-alt mr-2"></i>{t('generate_status_report')}
                                    </button>
                                    <button onClick={handleSummarizeTasks} disabled={loading} className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 flex items-center justify-center text-sm">
                                        <i className="fas fa-list-ul mr-2"></i>{t('summarize_tasks')}
                                    </button>
                                    </>
                                )}
                            {permissions.canLogTime && (
                                <button onClick={() => setLogTimeModalOpen(true)} className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 flex items-center justify-center text-sm">
                                    <i className="fas fa-clock mr-2"></i>{t('log_time')}
                                </button>
                            )}
                            {permissions.canDelete && (
                                <button onClick={() => setDeleteModalOpen(true)} className="w-full text-red-600 py-2 px-4 rounded-lg font-semibold hover:bg-red-100 flex items-center justify-center text-sm">
                                    <i className="fas fa-trash mr-2"></i>{t('delete_project')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {isLogTimeModalOpen && currentUser && (
                 <LogTimeModal
                    onClose={() => setLogTimeModalOpen(false)}
                    onSave={handleSaveTimeLog}
                    projects={[currentProject]}
                    courses={[]}
                    user={currentUser}
                    initialEntity={{ type: 'project', id: currentProject.id }}
                />
            )}
            {isDeleteModalOpen && (
                <ConfirmationModal 
                    title={t('delete_project')}
                    message={t('confirm_delete_message')}
                    onConfirm={() => { onDeleteProject(project.id); onClose(); }}
                    onCancel={() => setDeleteModalOpen(false)}
                />
            )}
        </div>
    );
};


interface ProjectsProps {
    projects: Project[];
    users: User[];
    timeLogs: TimeLog[];
    onUpdateProject: (project: Project) => void;
    onAddProject: (project: Omit<Project, 'id' | 'tasks' | 'risks'>) => void;
    onDeleteProject: (projectId: number) => void;
    onAddTimeLog: (log: Omit<TimeLog, 'id' | 'userId'>) => void;
}

const Projects: React.FC<ProjectsProps> = ({ projects, users, timeLogs, onUpdateProject, onAddProject, onDeleteProject, onAddTimeLog }) => {
    const { t } = useLocalization();
    const { user: currentUser } = useAuth();
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    
    // États pour les filtres
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    
    // Utilisation des hooks de permissions
    const permissions = useProjectPermissions();
    const modulePermissions = usePermissions('projects');
    // Logique de filtrage locale
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            // Filtre par recherche
            const matchesSearch = !searchTerm || 
                project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.team.some(member => member.name.toLowerCase().includes(searchTerm.toLowerCase()));
            
            // Filtre par statut
            const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
            
            // Filtre par priorité
            const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
            
            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [projects, searchTerm, filterStatus, filterPriority]);

    // Fonctions utilitaires
    const canUserAccessProject = (project: Project) => {
        if (!currentUser) return false;
        return project.team.some(member => member.id === currentUser.id) || 
               currentUser.role === 'manager' || 
               currentUser.role === 'super_admin';
    };

    const getProjectActions = (project: Project) => {
        const actions = ['view'];
        if (canUserAccessProject(project)) {
            if (permissions.canUpdate) actions.push('edit');
            if (permissions.canDelete) actions.push('delete');
        }
        return actions;
    };
    
    // Hook temps réel
    const { subscribe } = useRealtime();
    
    // Hook de synchronisation des données
    const {
        data: syncedProjects,
        createWithSync,
        updateWithSync,
        deleteWithSync,
        refreshData
    } = useDataSync(
        { table: 'projects', autoRefresh: true },
        projects,
        (newProjects) => {
            // Mettre à jour les projets dans le parent
            newProjects.forEach(project => {
                if (onUpdateProject) {
                    onUpdateProject(project as Project);
                }
            });
        }
    );

    // Vérification d'accès au module
    if (!modulePermissions.canView) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-lock text-red-600 text-2xl"></i>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Accès Refusé</h2>
                    <p className="text-gray-600 mb-4">
                        Vous n'avez pas les permissions nécessaires pour accéder au module Projets.
                    </p>
                    <p className="text-sm text-gray-500">
                        Contactez votre administrateur pour obtenir les droits d'accès.
                    </p>
                </div>
            </div>
        );
    }

    const handleSaveProject = async (projectData: Project | Omit<Project, 'id' | 'tasks' | 'risks'>) => {
        try {
        if ('id' in projectData) {
                // Mise à jour avec synchronisation
                await updateWithSync(projectData.id, projectData);
            onUpdateProject(projectData);
        } else {
                // Création avec synchronisation
                const newProject = await createWithSync(projectData);
                onAddProject(newProject);
        }
        setFormModalOpen(false);
        setEditingProject(null);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du projet:', error);
        }
    };

    const handleOpenForm = (project: Project | null = null) => {
        setEditingProject(project);
        setFormModalOpen(true);
    };

    const handleDeleteProject = async (projectId: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
            try {
                await deleteWithSync(projectId);
                onDeleteProject(projectId);
            } catch (error) {
                console.error('Erreur lors de la suppression du projet:', error);
            }
        }
    };

    const handleExportProjects = async () => {
        try {
            // Préparer les données d'export
            const exportData = filteredProjects.map(project => ({
                id: project.id,
                title: project.title,
                description: project.description,
                status: project.status,
                priority: project.priority,
                dueDate: project.dueDate,
                budget: project.budget,
                currency: project.currency,
                client_name: project.client_name,
                team: project.team.map(member => ({
                    name: member.name,
                    email: member.email,
                    role: member.role
                })),
                tasks: project.tasks?.map(task => ({
                    text: task.text,
                    status: task.status,
                    priority: task.priority,
                    assignee: task.assignee?.name || 'Non assigné',
                    estimatedTime: task.estimatedTime
                })) || [],
                created_at: project.created_at,
                updated_at: project.updated_at
            }));

            // Créer le fichier JSON
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            // Créer le fichier CSV
            const csvHeaders = 'ID,Titre,Description,Statut,Priorité,Date d\'échéance,Budget,Devise,Client,Équipe,Tâches\n';
            const csvData = exportData.map(project => {
                const teamNames = project.team.map(member => member.name).join('; ');
                const taskCount = project.tasks.length;
                return [
                    project.id,
                    `"${project.title}"`,
                    `"${project.description}"`,
                    project.status,
                    project.priority,
                    project.dueDate || '',
                    project.budget || '',
                    project.currency || '',
                    `"${project.client_name || ''}"`,
                    `"${teamNames}"`,
                    taskCount
                ].join(',');
            }).join('\n');

            // Proposer le téléchargement
            const timestamp = new Date().toISOString().split('T')[0];
            
            // Menu de sélection du format
            const format = window.prompt(
                'Choisissez le format d\'export:\n' +
                '1 - JSON (données complètes)\n' +
                '2 - CSV (tableau simple)\n' +
                'Entrez 1 ou 2:',
                '1'
            );

            if (format === '1') {
                // Export JSON
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `projets_export_${timestamp}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                alert(`✅ Export JSON réussi !\n${filteredProjects.length} projet(s) exporté(s)`);
            } else if (format === '2') {
                // Export CSV
                const csvBlob = new Blob([csvHeaders + csvData], { type: 'text/csv;charset=utf-8;' });
                const csvUrl = URL.createObjectURL(csvBlob);
                const csvLink = document.createElement('a');
                csvLink.href = csvUrl;
                csvLink.download = `projets_export_${timestamp}.csv`;
                document.body.appendChild(csvLink);
                csvLink.click();
                document.body.removeChild(csvLink);
                URL.revokeObjectURL(csvUrl);
                
                alert(`✅ Export CSV réussi !\n${filteredProjects.length} projet(s) exporté(s)`);
            }
        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            alert('❌ Erreur lors de l\'export des projets');
        }
    };

    const teamWorkload = useMemo(() => {
        const workload = new Map<number, { user: User, taskCount: number, totalHours: number }>();

        projects.forEach(project => {
            project.tasks.forEach(task => {
                if (task.assignee) {
                    const assigneeId = task.assignee.id;
                    if (!workload.has(assigneeId)) {
                        workload.set(assigneeId, {
                            user: task.assignee,
                            taskCount: 0,
                            totalHours: 0
                        });
                    }
                    const userData = workload.get(assigneeId)!;
                    userData.taskCount += 1;
                    userData.totalHours += task.estimatedTime || 0;
                }
            });
        });

        return Array.from(workload.values());
    }, [projects]);


    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('project_management_title')}</h1>
                    <p className="mt-1 text-gray-600">{t('project_management_subtitle')}</p>
                    {currentUser && (
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                                <i className="fas fa-user mr-1"></i>
                                {currentUser.name} ({currentUser.role})
                            </span>
                            <span className="flex items-center">
                                <i className="fas fa-eye mr-1"></i>
                                {filteredProjects.length} projet(s) visible(s)
                            </span>
                </div>
                    )}
                </div>
                <div className="flex space-x-2">
                    {modulePermissions.canCreate && permissions.canCreate && (
                    <button onClick={() => handleOpenForm(null)} className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700 flex items-center">
                        <i className="fas fa-plus mr-2"></i>
                        {t('new_project')}
                    </button>
                )}
                    {modulePermissions.canView && permissions.canExportData && (
                        <button 
                            onClick={handleExportProjects}
                            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
                        >
                            <i className="fas fa-download mr-2"></i>
                            Exporter
                    </button>
                )}
                </div>
            </div>
            
            {/* Filtres et recherche modernes */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Barre de recherche */}
                    <div className="flex-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="fas fa-search text-gray-400"></i>
                            </div>
                            <input
                                type="text"
                                placeholder="Rechercher un projet..."
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filtres */}
                    <div className="flex flex-wrap gap-3">
                        {/* Filtre par statut */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="Not Started">Non commencé</option>
                            <option value="In Progress">En cours</option>
                            <option value="Completed">Terminé</option>
                            <option value="On Hold">En attente</option>
                            <option value="Cancelled">Annulé</option>
                        </select>

                        {/* Filtre par priorité */}
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="all">Toutes priorités</option>
                            <option value="Low">Faible</option>
                            <option value="Medium">Moyenne</option>
                            <option value="High">Élevée</option>
                            <option value="Critical">Critique</option>
                        </select>

                        {/* Bouton de réinitialisation */}
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('all');
                                setFilterPriority('all');
                            }}
                            className="px-4 py-3 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                        >
                            <i className="fas fa-times mr-2"></i>
                            Réinitialiser
                        </button>
                    </div>
                </div>

                {/* Indicateurs de filtres actifs */}
                {(searchTerm || filterStatus !== 'all' || filterPriority !== 'all') && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-sm text-gray-600">Filtres actifs :</span>
                        {searchTerm && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Recherche: "{searchTerm}"
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </span>
                        )}
                        {filterStatus !== 'all' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Statut: {filterStatus}
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className="ml-2 text-green-600 hover:text-green-800"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </span>
                        )}
                        {filterPriority !== 'all' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Priorité: {filterPriority}
                                <button
                                    onClick={() => setFilterPriority('all')}
                                    className="ml-2 text-orange-600 hover:text-orange-800"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </div>
            
            {/* Team Workload Section - Visible seulement pour les managers et administrateurs */}
            {modulePermissions.canView && permissions.canViewAnalytics && (
            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Team Workload</h2>
                <div className="flex overflow-x-auto space-x-4 pb-4">
                    {teamWorkload.map(({ user, taskCount, totalHours }) => (
                        <div key={user.id} className="bg-white p-4 rounded-lg shadow-md flex-shrink-0 w-64">
                            <div className="flex items-center space-x-3">
                                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-bold text-sm">{user.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{t(user.role)}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-around text-center">
                                <div>
                                    <p className="font-bold text-lg text-emerald-600">{taskCount}</p>
                                    <p className="text-xs text-gray-500">Tasks</p>
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-emerald-600">{totalHours}</p>
                                    <p className="text-xs text-gray-500">Est. Hours</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            )}


            {filteredProjects.length > 0 ? (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(project => {
                        const actions = getProjectActions(project);
                        const canAccess = canUserAccessProject(project);
                        
                        const isTeamMember = currentUser && project.team.some(member => member.id === currentUser.id);
                        
                        return (
                            <div key={project.id} className={`group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden ${!canAccess ? 'opacity-50' : 'hover:border-blue-300'}`}>
                                {/* Header avec gradient */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                                <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                                {project.title}
                                            </h3>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[project.status]}`}>
                                                    {project.status === 'Not Started' && <i className="fas fa-clock mr-1"></i>}
                                                    {project.status === 'In Progress' && <i className="fas fa-play mr-1"></i>}
                                                    {project.status === 'Completed' && <i className="fas fa-check mr-1"></i>}
                                                    {project.status === 'On Hold' && <i className="fas fa-pause mr-1"></i>}
                                                    {project.status === 'Cancelled' && <i className="fas fa-times mr-1"></i>}
                                                    {project.status}
                                                </span>
                                                {project.priority && (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyles[project.priority]}`}>
                                                        {project.priority === 'Critical' && <i className="fas fa-exclamation-triangle mr-1"></i>}
                                                        {project.priority === 'High' && <i className="fas fa-arrow-up mr-1"></i>}
                                                        {project.priority === 'Medium' && <i className="fas fa-minus mr-1"></i>}
                                                        {project.priority === 'Low' && <i className="fas fa-arrow-down mr-1"></i>}
                                                        {project.priority}
                                                    </span>
                                                )}
                                </div>
                            </div>
                                        <div className="flex space-x-1 ml-3">
                                            {actions.includes('edit') && (
                                                <button 
                                                    onClick={() => handleOpenForm(project)} 
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Modifier le projet"
                                                >
                                                    <i className="fas fa-edit text-sm"></i>
                                                </button>
                                            )}
                                            {actions.includes('delete') && (
                                                <button 
                                                    onClick={() => handleDeleteProject(project.id)} 
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Supprimer le projet"
                                                >
                                                    <i className="fas fa-trash text-sm"></i>
                                                </button>
                                            )}
                                </div>
                                </div>
                            </div>

                                {/* Contenu principal */}
                                <div className="p-6">
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                        {project.description}
                                    </p>

                                    {/* Informations du projet */}
                                    <div className="space-y-3 mb-4">
                                        {project.dueDate && (
                                            <div className="flex items-center text-sm text-gray-500">
                                                <i className="fas fa-calendar-alt mr-2 text-blue-500"></i>
                                                <span>Échéance: {new Date(project.dueDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                                        )}
                                        {project.budget && (
                                            <div className="flex items-center text-sm text-gray-500">
                                                <i className="fas fa-euro-sign mr-2 text-green-500"></i>
                                                <span>Budget: {project.budget.toLocaleString()} {project.currency || 'EUR'}</span>
                                            </div>
                                        )}
                                        {project.client_name && (
                                            <div className="flex items-center text-sm text-gray-500">
                                                <i className="fas fa-building mr-2 text-purple-500"></i>
                                                <span>Client: {project.client_name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Indicateur de rôle */}
                                    {currentUser && (
                                        <div className="mb-4">
                                            {isTeamMember ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <i className="fas fa-user-check mr-1"></i>
                                                    Membre de l'équipe
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    <i className="fas fa-eye mr-1"></i>
                                                    Consultation
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Équipe */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Équipe</span>
                                            <span className="text-xs text-gray-500">{project.team.length} membre(s)</span>
                                        </div>
                                        <div className="flex -space-x-2">
                                            {project.team.slice(0, 4).map(member => (
                                                <img 
                                                    key={member.id} 
                                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white hover:ring-blue-300 transition-all cursor-pointer" 
                                                    src={member.avatar} 
                                                    alt={member.name} 
                                                    title={`${member.name} (${member.role})`}
                                                />
                                            ))}
                                            {project.team.length > 4 && (
                                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-xs font-medium text-gray-600 ring-2 ring-white">
                                                    +{project.team.length - 4}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer avec actions */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                    <div className="flex justify-between items-center">
                                        {actions.includes('view') && (
                                            <button 
                                                onClick={() => setSelectedProject(project)} 
                                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                <i className="fas fa-eye mr-2"></i>
                                                Voir détails
                                            </button>
                                        )}
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span className="flex items-center">
                                                <i className="fas fa-tasks mr-1"></i>
                                                {project.tasks?.length || 0} tâches
                                            </span>
                                            <span className="flex items-center">
                                                <i className="fas fa-clock mr-1"></i>
                                                {project.tasks?.reduce((total, task) => total + (task.estimatedTime || 0), 0) || 0}h
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 px-4 bg-white mt-8 rounded-lg shadow-md">
                    <i className="fas fa-folder-open fa-4x text-gray-400"></i>
                    <h3 className="mt-6 text-xl font-semibold text-gray-800">
                        {filteredProjects.length === 0 && projects.length > 0 
                            ? "Aucun projet accessible avec vos permissions actuelles"
                            : t('no_projects_found')
                        }
                    </h3>
                    {filteredProjects.length === 0 && projects.length > 0 && (
                        <p className="mt-2 text-gray-500">
                            Contactez votre administrateur pour obtenir l'accès aux projets.
                        </p>
                    )}
                </div>
            )}
            
            {selectedProject && (
                <ProjectDetailModal 
                    project={selectedProject} 
                    onClose={() => setSelectedProject(null)} 
                    onUpdateProject={onUpdateProject}
                    onDeleteProject={onDeleteProject}
                    onAddTimeLog={onAddTimeLog}
                    timeLogs={timeLogs}
                />
            )}

             {isFormModalOpen && (
                <ProjectFormModal 
                    project={editingProject} 
                    users={users}
                    onClose={() => { setFormModalOpen(false); setEditingProject(null); }}
                    onSave={handleSaveProject}
                />
            )}
        </div>
    );
};

export default Projects;