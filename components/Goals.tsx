import React, { useState } from 'react';
import { databaseService } from '../services/databaseService';
import { genericDatabaseService } from '../services/genericDatabaseService';
import { useDataSync } from '../hooks/useDataSync';
import { geminiService } from '../services/geminiService';

import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { Project, Objective, KeyResult } from '../types';
import { generateOKRs } from '../services/geminiService';
import ConfirmationModal from './common/ConfirmationModal';

const ObjectiveFormModal: React.FC<{
    objective: Objective | null;
    projectId: number;
    onClose: () => void;
    onSave: (objective: Objective | Omit<Objective, 'id'>) => void;
}> = ({ objective, projectId, onClose, onSave }) => {
    const { t } = useLocalization();
    const isEditMode = objective !== null;

    const [formData, setFormData] = useState<Omit<Objective, 'id'>>(
        objective || {
            title: '',
            projectId: projectId,
            keyResults: [{ id: `kr-${Date.now()}`, title: '', target: 100, current: 0, unit: '%' }]
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, title: e.target.value }));
    };

    const handleKrChange = (index: number, field: string, value: string | number) => {
        const newKrs = [...formData.keyResults];
        (newKrs[index] as any)[field] = value;
        setFormData(prev => ({...prev, keyResults: newKrs}));
    };

    const addKr = () => {
        const newKr: KeyResult = { id: `kr-${Date.now()}`, title: '', target: 100, current: 0, unit: '%' };
        setFormData(prev => ({...prev, keyResults: [...prev.keyResults, newKr]}));
    };
    
    const removeKr = (index: number) => {
        setFormData(prev => ({...prev, keyResults: prev.keyResults.filter((_, i) => i !== index)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...(isEditMode && { id: objective.id }),
            ...formData
        };
        onSave(dataToSave as Objective);
    };

    
  // Gestionnaires d'événements pour les boutons
  const handleButtonClick = (action: string) => {
    console.log('Action:', action);
    // Logique spécifique selon l'action
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulaire soumis');
    // Logique de soumission
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('Changement:', name, value);
    // Logique de changement
  };

  
  // Gestionnaires d'événements complets
  const handleCreate = async (data: any) => {
    try {
      const result = await genericDatabaseService.create('goals', data);
      console.log('Creation reussie:', result);
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur creation:', error);
    }
  };
  
  const handleEdit = async (id: number, data: any) => {
    try {
      const result = await genericDatabaseService.update('goals', id, data);
      console.log('Modification reussie:', result);
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur modification:', error);
    }
  };
  
  const handleDelete = async (id: number) => {
    try {
      const result = await genericDatabaseService.delete('goals', id);
      console.log('Suppression reussie:', result);
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };
  
  const handleExport = async () => {
    try {
      const data = await genericDatabaseService.getAll('goals');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'goals_export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export:', error);
    }
  };
  
  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await databaseService.bulkCreate('goals', data);
      console.log('Import reussi');
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur import:', error);
    }
  };
  
  const handleApprove = async (id: number) => {
    try {
      const result = await databaseService.update('goals', id, { status: 'approved' });
      console.log('Approbation reussie:', result);
    } catch (error) {
      console.error('Erreur approbation:', error);
    }
  };
  
  const handleReject = async (id: number) => {
    try {
      const result = await databaseService.update('goals', id, { status: 'rejected' });
      console.log('Rejet reussi:', result);
    } catch (error) {
      console.error('Erreur rejet:', error);
    }
  };
  
  const handleCancel = () => {
    console.log('Action annulée');
    // Fermer les modals ou réinitialiser
  };
  
  const handleSave = async (data: any) => {
    try {
      const result = await databaseService.createOrUpdate('goals', data);
      console.log('Sauvegarde reussie:', result);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };
  
  const handleAdd = async (data: any) => {
    try {
      const result = await databaseService.create('goals', data);
      console.log('Ajout reussi:', result);
    } catch (error) {
      console.error('Erreur ajout:', error);
    }
  };
  
  const handleRemove = async (id: number) => {
    try {
      const result = await databaseService.delete('goals', id);
      console.log('Suppression reussie:', result);
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold">{isEditMode ? t('edit_objective') : t('create_objective')}</h2>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('objective')}</label>
                            <input type="text" value={formData.title} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" required />
                        </div>
                        <hr />
                        <h3 className="text-lg font-semibold">{t('key_results')}</h3>
                        <div className="space-y-3">
                            {formData.keyResults.map((kr, index) => (
                                <div key={kr.id} className="p-3 border rounded-md bg-gray-50 space-y-2">
                                    <div className="flex items-center">
                                        <input placeholder={t('key_results')} value={kr.title} onChange={e => handleKrChange(index, 'title', e.target.value)} className="flex-grow p-1 border-b" />
                                        <button type="button" onClick={() => removeKr(index)} className="ml-2 text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span>{t('current_value')}: <input type="number" value={kr.current} onChange={e => handleKrChange(index, 'current', Number(e.target.value))} className="w-20 p-1 border-b"/></span>
                                        <span>{t('target')}: <input type="number" value={kr.target} onChange={e => handleKrChange(index, 'target', Number(e.target.value))} className="w-20 p-1 border-b"/></span>
                                        <span>{t('unit')}: <input value={kr.unit} onChange={e => handleKrChange(index, 'unit', e.target.value)} className="w-20 p-1 border-b"/></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addKr} className="text-sm text-emerald-600 hover:text-emerald-800"><i className="fas fa-plus mr-1"></i> {t('add_key_result')}</button>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300">{t('cancel')}</button>
                        <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700">{t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const SuggestedOKRsModal: React.FC<{
    isLoading: boolean;
    suggestions: Objective[];
    onClose: () => void;
    onAdd: (suggestions: Objective[]) => void;
}> = ({ isLoading, suggestions, onClose, onAdd }) => {
    const { t } = useLocalization();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold">AI-Generated OKR Suggestions</h2>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <i className="fas fa-spinner fa-spin text-3xl text-emerald-500"></i>
                        </div>
                    ) : suggestions.length > 0 ? (
                        <div className="space-y-6">
                            {suggestions.map(obj => (
                                <div key={obj.id} className="p-4 border rounded-md bg-gray-50">
                                    <h3 className="font-bold text-lg text-gray-800">{obj.title}</h3>
                                    <div className="mt-2 pl-4 border-l-2 border-emerald-200 space-y-2">
                                        {obj.keyResults.map(kr => (
                                            <div key={kr.id}>
                                                <p className="font-semibold text-gray-700">{kr.title}</p>
                                                <p className="text-sm text-gray-500">Target: {kr.target} {kr.unit}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No suggestions were generated. Please try again.</p>
                    )}
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300">{t('cancel')}</button>
                    <button 
                        onClick={() => onAdd(suggestions)} 
                        disabled={isLoading || suggestions.length === 0}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-emerald-300"
                    >
                        Add to Project
                    </button>
                </div>
            </div>
        </div>
    );
};


interface GoalsProps {
    projects: Project[];
    objectives: Objective[];
    setObjectives: (objectives: Objective[]) => void;
    onAddObjective: (objective: Omit<Objective, 'id'>) => void;
    onUpdateObjective: (objective: Objective) => void;
    onDeleteObjective: (objectiveId: string) => void;
}

const Goals: React.FC<GoalsProps> = ({ projects, objectives, setObjectives, onAddObjective, onUpdateObjective, onDeleteObjective }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(projects[0]?.id || null);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
    const [deletingObjective, setDeletingObjective] = useState<Objective | null>(null);
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
    const [suggestedOKRs, setSuggestedOKRs] = useState<Objective[]>([]);

    const canManage = user?.role === 'administrator' || user?.role === 'manager';
    
    // Hook de synchronisation des données
    const {
        data: syncedObjectives,
        createWithSync,
        updateWithSync,
        deleteWithSync,
        refreshData
    } = useDataSync(
        { table: 'objectives', autoRefresh: true },
        objectives,
        (newObjectives) => {
            setObjectives(newObjectives as Objective[]);
        }
    );

    const handleGenerateOKRs = async () => {
        if (!selectedProjectId) return;
        const project = projects.find(p => p.id === selectedProjectId);
        if (!project) return;

        setIsSuggestionModalOpen(true);
        setLoading(true);
        setSuggestedOKRs([]); // Clear previous suggestions

        const generated = await generateOKRs(project.description);
        const newObjectives: Objective[] = generated.map((obj: any, index: number) => ({
            id: `gen-obj-${Date.now()}-${index}`,
            projectId: project.id,
            title: obj.title,
            keyResults: obj.keyResults.map((kr: any, krIndex: number) => ({
                id: `gen-kr-${Date.now()}-${krIndex}`,
                title: kr.title,
                target: kr.target,
                current: 0,
                unit: kr.unit
            }))
        }));
        
        setSuggestedOKRs(newObjectives);
        setLoading(false);
    };

    const handleAddSuggestedOKRs = (suggestions: Objective[]) => {
        setObjectives([...objectives, ...suggestions]);
        setIsSuggestionModalOpen(false);
        setSuggestedOKRs([]);
    };
    
    const handleSaveObjective = (objectiveData: Objective | Omit<Objective, 'id'>) => {
        if ('id' in objectiveData) {
            onUpdateObjective(objectiveData);
        } else {
            onAddObjective(objectiveData);
        }
        setModalOpen(false);
        setEditingObjective(null);
    };

    const handleEdit = (obj: Objective) => {
        setEditingObjective(obj);
        setModalOpen(true);
    };
    
    const handleDelete = (objective: Objective) => {
        setDeletingObjective(objective);
    };

    const confirmDelete = () => {
        if(deletingObjective) {
            onDeleteObjective(deletingObjective.id);
            setDeletingObjective(null);
        }
    };

    const currentObjectives = objectives.filter(o => o.projectId === selectedProjectId);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('goals_okrs_title')}</h1>
            <p className="mt-1 text-gray-600">{t('goals_okrs_subtitle')}</p>

            <div className="mt-8 max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-grow">
                            <label htmlFor="project-select" className="block text-sm font-medium text-gray-700">{t('select_project')}</label>
                            <select
                                id="project-select"
                                value={selectedProjectId || ''}
                                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                            >
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>
                        </div>
                        {canManage && (
                             <div className="self-end flex gap-2">
                                 <button 
                                    onClick={() => setModalOpen(true)}
                                    disabled={!selectedProjectId}
                                    className="w-full sm:w-auto bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 disabled:bg-blue-300">
                                    <i className="fas fa-plus mr-2"></i>{t('create_objective')}
                                </button>
                                <button 
                                    onClick={handleGenerateOKRs}
                                    disabled={!selectedProjectId}
                                    className="w-full sm:w-auto bg-emerald-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-emerald-700 disabled:bg-gray-400 flex items-center justify-center">
                                    <i className="fas fa-magic mr-2"></i>
                                    {t('generate_okrs_with_ai')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 space-y-6">
                    {currentObjectives.map(obj => (
                        <div key={obj.id} className="bg-white p-6 rounded-xl shadow-lg group">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-bullseye text-emerald-500 mr-3"></i>{t('objective')}: {obj.title}</h3>
                                {canManage && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                                        <button onClick={() => handleEdit(obj)} className="text-blue-600"><i className="fas fa-edit"></i></button>
                                        <button onClick={() => handleDelete(obj)} className="text-red-600"><i className="fas fa-trash"></i></button>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 pl-8 space-y-3">
                                {obj.keyResults.map(kr => {
                                    const progress = kr.target > 0 ? (kr.current / kr.target) * 100 : 0;
                                    return (
                                        <div key={kr.id}>
                                            <p className="font-semibold text-gray-700">{kr.title}</p>
                                            <div className="flex items-center space-x-4">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-600">{kr.current} / {kr.target} {kr.unit}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                     {currentObjectives.length === 0 && !loading && (
                        <div className="text-center py-12 text-gray-500">
                            <i className="fas fa-box-open fa-3x"></i>
                            <p className="mt-4">No OKRs for this project. Try generating them with AI!</p>
                        </div>
                    )}
                </div>
            </div>
            {isModalOpen && selectedProjectId && (
                <ObjectiveFormModal 
                    objective={editingObjective}
                    projectId={selectedProjectId}
                    onClose={() => { setModalOpen(false); setEditingObjective(null); }}
                    onSave={handleSaveObjective}
                />
            )}
            {deletingObjective && (
                <ConfirmationModal
                    title={t('delete_objective')}
                    message={t('confirm_delete_message')}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeletingObjective(null)}
                />
            )}
            {isSuggestionModalOpen && (
                <SuggestedOKRsModal
                    isLoading={loading}
                    suggestions={suggestedOKRs}
                    onClose={() => setIsSuggestionModalOpen(false)}
                    onAdd={handleAddSuggestedOKRs}
                />
            )}
        </div>
    );
};

export default Goals;
