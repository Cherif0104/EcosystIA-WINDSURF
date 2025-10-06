
import React, { useState } from 'react';
import { databaseService } from '../services/databaseService';
import { genericDatabaseService } from '../services/genericDatabaseService';
import { useDataSync } from '../hooks/useDataSync';
import { geminiService } from '../services/geminiService';

import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { Document } from '../types';
import { summarizeAndCreateDoc } from '../services/geminiService';

interface KnowledgeBaseProps {
    documents: Document[];
    onAddDocument: (doc: Document) => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ documents, onAddDocument }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Hook de synchronisation des données
    const {
        data: syncedDocuments,
        createWithSync,
        updateWithSync,
        deleteWithSync,
        refreshData
    } = useDataSync(
        { table: 'documents', autoRefresh: true },
        documents,
        (newDocuments) => {
            // Mettre à jour les documents dans le parent
            newDocuments.forEach(doc => {
                if (onAddDocument) {
                    onAddDocument(doc as Document);
                }
            });
        }
    );

    const handleSummarize = async () => {
        if (!inputText.trim() || !user) return;
        setLoading(true);
        const result = await summarizeAndCreateDoc(inputText);
        if (result) {
            const newDoc: Document = {
                id: Date.now(),
                title: result.title,
                content: result.content,
                createdAt: new Date().toISOString().split('T')[0],
                createdBy: user.name,
            };
            onAddDocument(newDoc);
            setInputText('');
        }
        setLoading(false);
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
      const result = await databaseService.create('knowledgebase', data);
      console.log('Creation reussie:', result);
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur creation:', error);
    }
  };
  
  const handleEdit = async (id: number, data: any) => {
    try {
      const result = await databaseService.update('knowledgebase', id, data);
      console.log('Modification reussie:', result);
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur modification:', error);
    }
  };
  
  const handleDelete = async (id: number) => {
    try {
      const result = await databaseService.delete('knowledgebase', id);
      console.log('Suppression reussie:', result);
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };
  
  const handleExport = async () => {
    try {
      const data = await databaseService.getAll('knowledgebase');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'knowledgebase_export.json';
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
      await databaseService.bulkCreate('knowledgebase', data);
      console.log('Import reussi');
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur import:', error);
    }
  };
  
  const handleApprove = async (id: number) => {
    try {
      const result = await databaseService.update('knowledgebase', id, { status: 'approved' });
      console.log('Approbation reussie:', result);
    } catch (error) {
      console.error('Erreur approbation:', error);
    }
  };
  
  const handleReject = async (id: number) => {
    try {
      const result = await databaseService.update('knowledgebase', id, { status: 'rejected' });
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
      const result = await genericDatabaseService.createOrUpdate('knowledgebase', data);
      console.log('Sauvegarde reussie:', result);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };
  
  const handleAdd = async (data: any) => {
    try {
      const result = await genericDatabaseService.create('knowledgebase', data);
      console.log('Ajout reussi:', result);
    } catch (error) {
      console.error('Erreur ajout:', error);
    }
  };
  
  const handleRemove = async (id: number) => {
    try {
      const result = await genericDatabaseService.delete('knowledgebase', id);
      console.log('Suppression reussie:', result);
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('knowledge_base_title')}</h1>
            <p className="mt-1 text-gray-600">{t('knowledge_base_subtitle')}</p>

            <div className="mt-8 max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('create_doc_from_text')}</h2>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t('paste_text_here')}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    rows={8}
                    disabled={loading}
                />
                <button
                    onClick={handleSummarize}
                    disabled={loading || !inputText.trim()}
                    className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-md font-semibold hover:bg-emerald-700 disabled:bg-emerald-300 transition-colors flex items-center justify-center"
                >
                    {loading ? (
                        <><i className="fas fa-spinner fa-spin mr-2"></i>{t('generating')}</>
                    ) : (
                        <><i className="fas fa-file-invoice mr-2"></i>{t('summarize_and_create')}</>
                    )}
                </button>
            </div>

            <div className="mt-12">
                 <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('all_documents')}</h2>
                 <div className="space-y-6">
                    {documents.map(doc => (
                        <div key={doc.id} className="bg-white p-6 rounded-xl shadow-lg">
                            <h3 className="text-lg font-bold text-gray-900">{doc.title}</h3>
                            <p className="text-xs text-gray-500 mt-1 mb-3">By {doc.createdBy} on {doc.createdAt}</p>
                            <p className="text-gray-700 text-sm leading-relaxed">{doc.content}</p>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default KnowledgeBase;
