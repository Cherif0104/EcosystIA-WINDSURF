import React, { useState, useEffect, useMemo } from 'react';
import { databaseService } from '../services/databaseService';
import { genericDatabaseService } from '../services/genericDatabaseService';
import { useDataSync } from '../hooks/useDataSync';
import { geminiService } from '../services/geminiService';

import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { Contact } from '../types';
import { draftSalesEmail, geminiService } from '../services/geminiService';
import ConfirmationModal from './common/ConfirmationModal';

const statusStyles = {
    'Lead': 'bg-blue-100 text-blue-800',
    'Contacted': 'bg-yellow-100 text-yellow-800',
    'Prospect': 'bg-purple-100 text-purple-800',
    'Customer': 'bg-green-100 text-green-800',
};

// Sous-module : Analyse des ventes IA
const SalesAnalyticsCard: React.FC<{
    contacts: Contact[];
}> = ({ contacts }) => {
    const { t } = useLocalization();
    const [analytics, setAnalytics] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const generateAnalytics = async () => {
            setLoading(true);
            const salesData = {
                totalContacts: contacts.length,
                leads: contacts.filter(c => c.status === 'Lead').length,
                contacted: contacts.filter(c => c.status === 'Contacted').length,
                prospects: contacts.filter(c => c.status === 'Prospect').length,
                customers: contacts.filter(c => c.status === 'Customer').length,
                conversionRate: contacts.length > 0 ? (contacts.filter(c => c.status === 'Customer').length / contacts.length) * 100 : 0
            };

            const aiAnalytics = await geminiService.analyzeData([salesData], 'insights');
            setAnalytics(aiAnalytics);
            setLoading(false);
        };

        generateAnalytics();
    }, [contacts]);

    const metrics = useMemo(() => {
        const totalContacts = contacts.length;
        const customers = contacts.filter(c => c.status === 'Customer').length;
        const conversionRate = totalContacts > 0 ? (customers / totalContacts) * 100 : 0;
        
        return {
            totalContacts,
            customers,
            conversionRate: Math.round(conversionRate),
            leads: contacts.filter(c => c.status === 'Lead').length,
            prospects: contacts.filter(c => c.status === 'Prospect').length
        };
    }, [contacts]);

    
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
      const result = await genericDatabaseService.create('crm', data);
      console.log('Creation reussie:', result);
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur creation:', error);
    }
  };
  
  const handleEdit = async (id: number, data: any) => {
    try {
      const result = await genericDatabaseService.update('crm', id, data);
      console.log('Modification reussie:', result);
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur modification:', error);
    }
  };
  
  const handleDelete = async (id: number) => {
    try {
      const result = await genericDatabaseService.delete('crm', id);
      console.log('Suppression reussie:', result);
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };
  
  const handleExport = async () => {
    try {
      const data = await genericDatabaseService.getAll('crm');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'crm_export.json';
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
      await databaseService.bulkCreate('crm', data);
      console.log('Import reussi');
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur import:', error);
    }
  };
  
  const handleApprove = async (id: number) => {
    try {
      const result = await databaseService.update('crm', id, { status: 'approved' });
      console.log('Approbation reussie:', result);
    } catch (error) {
      console.error('Erreur approbation:', error);
    }
  };
  
  const handleReject = async (id: number) => {
    try {
      const result = await databaseService.update('crm', id, { status: 'rejected' });
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
      const result = await databaseService.createOrUpdate('crm', data);
      console.log('Sauvegarde reussie:', result);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };
  
  const handleAdd = async (data: any) => {
    try {
      const result = await databaseService.create('crm', data);
      console.log('Ajout reussi:', result);
    } catch (error) {
      console.error('Erreur ajout:', error);
    }
  };
  
  const handleRemove = async (id: number) => {
    try {
      const result = await databaseService.delete('crm', id);
      console.log('Suppression reussie:', result);
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">📊 Analyse des Ventes SENEGEL</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{metrics.totalContacts}</div>
                    <div className="text-sm text-gray-500">Total Contacts</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{metrics.customers}</div>
                    <div className="text-sm text-gray-500">Clients</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{metrics.conversionRate}%</div>
                    <div className="text-sm text-gray-500">Taux de conversion</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{metrics.leads}</div>
                    <div className="text-sm text-gray-500">Leads actifs</div>
                </div>
            </div>
            {loading ? (
                <div className="flex justify-center items-center py-4">
                    <i className="fas fa-spinner fa-spin text-xl text-emerald-500"></i>
                </div>
            ) : analytics ? (
                <div className="prose prose-sm max-w-none">
                    <p className="text-gray-600 whitespace-pre-line">{analytics}</p>
                </div>
            ) : null}
        </div>
    );
};

// Sous-module : Recommandations de prospection
const ProspectingRecommendationsCard: React.FC<{
    contacts: Contact[];
}> = ({ contacts }) => {
    const { t } = useLocalization();
    const [recommendations, setRecommendations] = useState<string[]>([]);

    useEffect(() => {
        const generateRecommendations = () => {
            const newRecommendations: string[] = [];
            
            // Analyse des leads stagnants
            const staleLeads = contacts.filter(c => c.status === 'Lead').length;
            if (staleLeads > 3) {
                newRecommendations.push(`🎯 ${staleLeads} leads stagnants - Relancez avec des emails personnalisés`);
            }

            // Analyse du taux de conversion
            const conversionRate = contacts.length > 0 ? (contacts.filter(c => c.status === 'Customer').length / contacts.length) * 100 : 0;
            if (conversionRate < 20) {
                newRecommendations.push(`📈 Taux de conversion faible (${Math.round(conversionRate)}%) - Améliorez la qualification des leads`);
            }

            // Analyse des prospects
            const prospects = contacts.filter(c => c.status === 'Prospect').length;
            if (prospects > 5) {
                newRecommendations.push(`💼 ${prospects} prospects en attente - Planifiez des appels de suivi`);
            }

            // Analyse des clients
            const customers = contacts.filter(c => c.status === 'Customer').length;
            if (customers > 0) {
                newRecommendations.push(`🤝 ${customers} client(s) - Développez les ventes croisées`);
            }

            setRecommendations(newRecommendations);
        };

        generateRecommendations();
    }, [contacts]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">💡 Recommandations Prospection</h3>
            <div className="space-y-3">
                {recommendations.length > 0 ? (
                    recommendations.map((rec, index) => (
                        <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                            <p className="text-sm text-gray-700">{rec}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4">
                        <i className="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
                        <p className="text-sm text-gray-500">Pipeline optimisé</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sous-module : Pipeline visuel
const PipelineVisualizationCard: React.FC<{
    contacts: Contact[];
}> = ({ contacts }) => {
    const { t } = useLocalization();
    
    const pipelineData = useMemo(() => {
        const statuses: Contact['status'][] = ['Lead', 'Contacted', 'Prospect', 'Customer'];
        return statuses.map(status => ({
            status,
            count: contacts.filter(c => c.status === status).length,
            percentage: contacts.length > 0 ? (contacts.filter(c => c.status === status).length / contacts.length) * 100 : 0
        }));
    }, [contacts]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">📈 Pipeline SENEGEL</h3>
            <div className="space-y-4">
                {pipelineData.map(({ status, count, percentage }) => (
                    <div key={status} className="flex items-center space-x-4">
                        <div className="w-20 text-sm font-medium text-gray-600">
                            {t(status.toLowerCase())}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div 
                                className={`h-4 rounded-full ${statusStyles[status]}`}
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                        <div className="w-12 text-sm text-gray-600 text-right">
                            {count}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ContactFormModal: React.FC<{
    contact: Contact | null;
    onClose: () => void;
    onSave: (contact: Contact | Omit<Contact, 'id'>) => void;
}> = ({ contact, onClose, onSave }) => {
    const { t } = useLocalization();
    const isEditMode = contact !== null;
    const [formData, setFormData] = useState({
        name: contact?.name || '',
        company: contact?.company || '',
        status: contact?.status || 'Lead',
        avatar: contact?.avatar || `https://picsum.photos/seed/${Date.now()}/100/100`,
        officePhone: contact?.officePhone || '',
        mobilePhone: contact?.mobilePhone || '',
        whatsappNumber: contact?.whatsappNumber || '',
        workEmail: contact?.workEmail || '',
        personalEmail: contact?.personalEmail || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...(isEditMode && { id: contact.id }),
            ...formData
        };
        onSave(dataToSave as Contact);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b"><h2 className="text-xl font-bold">{isEditMode ? t('edit_contact') : t('create_contact')}</h2></div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('contact_name')}</label>
                                <input name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('contact_company')}</label>
                                <input name="company" value={formData.company} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required/>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('work_email')}</label>
                                <input type="email" name="workEmail" value={formData.workEmail} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('personal_email')}</label>
                                <input type="email" name="personalEmail" value={formData.personalEmail} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('office_phone')}</label>
                                <input type="tel" name="officePhone" value={formData.officePhone} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('mobile_phone')}</label>
                                <input type="tel" name="mobilePhone" value={formData.mobilePhone} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('whatsapp_number')}</label>
                            <input type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('contact_status')}</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                <option value="Lead">{t('lead')}</option>
                                <option value="Contacted">{t('contacted')}</option>
                                <option value="Prospect">{t('prospect')}</option>
                                <option value="Customer">{t('customer')}</option>
                            </select>
                        </div>
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


const EmailDraftModal: React.FC<{ contact: Contact; onClose: () => void; emailBody: string; isLoading: boolean }> = ({ contact, onClose, emailBody, isLoading }) => {
    const { t } = useLocalization();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">Draft Email to {contact.name}</h2>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                         <div className="flex justify-center items-center min-h-[200px]">
                            <i className="fas fa-spinner fa-spin text-3xl text-emerald-500"></i>
                        </div>
                    ) : (
                        <textarea
                            className="w-full h-64 p-3 border rounded-md font-mono text-sm"
                            defaultValue={emailBody}
                        />
                    )}
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300">Close</button>
                    <button onClick={onClose} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700">Send Email</button>
                </div>
            </div>
        </div>
    );
};

interface CRMProps {
    contacts: Contact[];
    onAddContact: (contact: Omit<Contact, 'id'>) => void;
    onUpdateContact: (contact: Contact) => void;
    onDeleteContact: (contactId: number) => void;
}

const CRM: React.FC<CRMProps> = ({ contacts, onAddContact, onUpdateContact, onDeleteContact }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const [view, setView] = useState<'list' | 'pipeline'>('list');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [emailBody, setEmailBody] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact|null>(null);
    const [deletingContactId, setDeletingContactId] = useState<number|null>(null);

    const canManage = user?.role === 'administrator' || user?.role === 'manager';
    
    // Hook de synchronisation des données
    const {
        data: syncedContacts,
        createWithSync,
        updateWithSync,
        deleteWithSync,
        refreshData
    } = useDataSync(
        { table: 'contacts', autoRefresh: true },
        contacts,
        (newContacts) => {
            // Mettre à jour les contacts dans le parent
            newContacts.forEach(contact => {
                if (onUpdateContact) {
                    onUpdateContact(contact as Contact);
                }
            });
        }
    );
    
    const pipelineStatuses: Contact['status'][] = ['Lead', 'Contacted', 'Prospect', 'Customer'];

    const handleDraftEmail = async (contact: Contact) => {
        if (!user) return;
        setSelectedContact(contact);
        setIsLoading(true);
        const body = await draftSalesEmail(contact, user);
        setEmailBody(body);
        setIsLoading(false);
    };

    const handleCloseModal = () => {
        setSelectedContact(null);
        setEmailBody('');
    };
    
    const handleSaveContact = async (contactData: Contact | Omit<Contact, 'id'>) => {
        try {
            if ('id' in contactData) {
                // Mise à jour avec synchronisation
                await updateWithSync(contactData.id, contactData);
                onUpdateContact(contactData);
            } else {
                // Création avec synchronisation
                const newContact = await createWithSync(contactData);
                onAddContact(newContact);
            }
            setFormModalOpen(false);
            setEditingContact(null);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du contact:', error);
        }
    };

    const handleEdit = (contact: Contact) => {
        setEditingContact(contact);
        setFormModalOpen(true);
    };
    
    const handleDelete = async (contactId: number) => {
        try {
            await deleteWithSync(contactId);
            onDeleteContact(contactId);
            setDeletingContactId(null);
        } catch (error) {
            console.error('Erreur lors de la suppression du contact:', error);
        }
    }
    
    // Drag and Drop handlers
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, contactId: number) => {
        e.dataTransfer.setData("contactId", contactId.toString());
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: Contact['status']) => {
        e.preventDefault();
        const contactId = Number(e.dataTransfer.getData("contactId"));
        const contactToMove = contacts.find(c => c.id === contactId);
        if (contactToMove && contactToMove.status !== newStatus) {
            onUpdateContact({ ...contactToMove, status: newStatus });
        }
        e.currentTarget.classList.remove('bg-emerald-100');
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-emerald-100');
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('bg-emerald-100');
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('crm_title')}</h1>
                    <p className="mt-1 text-gray-600">Gestion des relations clients SENEGEL</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="p-1 bg-gray-200 rounded-lg">
                        <button onClick={() => setView('list')} className={`px-3 py-1 text-sm font-semibold rounded-md ${view === 'list' ? 'bg-white shadow' : 'text-gray-600'}`}>{t('list_view')}</button>
                        <button onClick={() => setView('pipeline')} className={`px-3 py-1 text-sm font-semibold rounded-md ${view === 'pipeline' ? 'bg-white shadow' : 'text-gray-600'}`}>{t('pipeline_view')}</button>
                    </div>
                    {canManage && (
                        <button onClick={() => setFormModalOpen(true)} className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700 flex items-center">
                           <i className="fas fa-plus mr-2"></i> {t('create_contact')}
                        </button>
                    )}
                </div>
            </div>

            {/* Sous-modules SENEGEL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <SalesAnalyticsCard contacts={contacts} />
                <ProspectingRecommendationsCard contacts={contacts} />
            </div>

            {/* Pipeline visuel */}
            <div className="mb-8">
                <PipelineVisualizationCard contacts={contacts} />
            </div>
            
            {view === 'list' && (
                <div className="mt-8 bg-white rounded-lg shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('contact_name')}</th>
                                    <th scope="col" className="px-6 py-3">{t('contact_company')}</th>
                                    <th scope="col" className="px-6 py-3">{t('contact_status')}</th>
                                    <th scope="col" className="px-6 py-3 text-right">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contacts.map(contact => (
                                    <tr key={contact.id} className="bg-white border-b hover:bg-gray-50">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center">
                                            <img src={contact.avatar} alt={contact.name} className="w-8 h-8 rounded-full mr-3"/>
                                            {contact.name}
                                        </th>
                                        <td className="px-6 py-4">{contact.company}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${statusStyles[contact.status]}`}>{t(contact.status.toLowerCase())}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleDraftEmail(contact)} className="font-medium text-emerald-600 hover:text-emerald-800" title={t('draft_email_with_ai')}><i className="fas fa-magic"></i></button>
                                             {canManage && (
                                                <>
                                                    <button onClick={() => handleEdit(contact)} className="font-medium text-blue-600 hover:text-blue-800">{t('edit')}</button>
                                                    <button onClick={() => setDeletingContactId(contact.id)} className="font-medium text-red-600 hover:text-red-800">{t('delete')}</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'pipeline' && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pipelineStatuses.map(status => (
                        <div 
                            key={status} 
                            className="bg-gray-100 rounded-lg p-3 transition-colors"
                            onDrop={(e) => handleDrop(e, status)}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            <h3 className={`font-semibold text-sm uppercase p-2 ${statusStyles[status]} bg-opacity-40`}>{t(status.toLowerCase())}</h3>
                            <div className="mt-4 space-y-3 min-h-[100px]">
                                {contacts.filter(c => c.status === status).map(contact => (
                                    <div 
                                        key={contact.id} 
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, contact.id)}
                                        className="bg-white p-3 rounded-md shadow cursor-grab"
                                    >
                                        <p className="font-bold text-sm text-gray-800">{contact.name}</p>
                                        <p className="text-xs text-gray-500">{contact.company}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedContact && <EmailDraftModal contact={selectedContact} onClose={handleCloseModal} emailBody={emailBody} isLoading={isLoading} />}
            {isFormModalOpen && <ContactFormModal contact={editingContact} onClose={() => {setFormModalOpen(false); setEditingContact(null);}} onSave={handleSaveContact} />}
            {deletingContactId !== null && <ConfirmationModal title={t('delete_contact')} message={t('confirm_delete_message')} onConfirm={() => handleDelete(deletingContactId)} onCancel={() => setDeletingContactId(null)} />}
        </div>
    );
};

export default CRM;