import React, { useState } from 'react';
import { databaseService } from '../services/databaseService';
import { geminiService } from '../services/geminiService';

import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { User, Role } from '../types';

const UserEditModal: React.FC<{
    user: User;
    onClose: () => void;
    onSave: (userId: number, newRole: Role) => void;
}> = ({ user, onClose, onSave }) => {
    const { t } = useLocalization();
    const [selectedRole, setSelectedRole] = useState<Role>(user.role);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(user.id, selectedRole);
    }
    
    
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
      const result = await databaseService.create('usermanagement', data);
      console.log('Creation reussie:', result);
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur creation:', error);
    }
  };
  
  const handleEdit = async (id: number, data: any) => {
    try {
      const result = await databaseService.update('usermanagement', id, data);
      console.log('Modification reussie:', result);
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur modification:', error);
    }
  };
  
  const handleDelete = async (id: number) => {
    try {
      const result = await databaseService.delete('usermanagement', id);
      console.log('Suppression reussie:', result);
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };
  
  const handleExport = async () => {
    try {
      const data = await databaseService.getAll('usermanagement');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'usermanagement_export.json';
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
      await databaseService.bulkCreate('usermanagement', data);
      console.log('Import reussi');
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur import:', error);
    }
  };
  
  const handleApprove = async (id: number) => {
    try {
      const result = await databaseService.update('usermanagement', id, { status: 'approved' });
      console.log('Approbation reussie:', result);
    } catch (error) {
      console.error('Erreur approbation:', error);
    }
  };
  
  const handleReject = async (id: number) => {
    try {
      const result = await databaseService.update('usermanagement', id, { status: 'rejected' });
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
      const result = await databaseService.createOrUpdate('usermanagement', data);
      console.log('Sauvegarde reussie:', result);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };
  
  const handleAdd = async (data: any) => {
    try {
      const result = await databaseService.create('usermanagement', data);
      console.log('Ajout reussi:', result);
    } catch (error) {
      console.error('Erreur ajout:', error);
    }
  };
  
  const handleRemove = async (id: number) => {
    try {
      const result = await databaseService.delete('usermanagement', id);
      console.log('Suppression reussie:', result);
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold">{t('assign_role')} for {user.name}</h2>
                    </div>
                    <div className="p-6">
                        <label htmlFor="role-select" className="block text-sm font-medium text-gray-700">{t('user_role')}</label>
                        <select
                            id="role-select"
                            value={selectedRole}
                            onChange={e => setSelectedRole(e.target.value as Role)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        >
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
                                <option value="supervisor">{t('supervisor')}</option>
                                <option value="manager">{t('manager')}</option>
                                <option value="administrator">{t('administrator')}</option>
                            </optgroup>
                            <optgroup label={t('super_admin_category')}>
                                <option value="super_administrator">{t('super_administrator')}</option>
                            </optgroup>
                        </select>
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


interface UserManagementProps {
    users: User[];
    onUpdateUser: (user: User) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onUpdateUser }) => {
    const { t } = useLocalization();
    const { user: currentUser } = useAuth();
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleEdit = (userToEdit: User) => {
        setSelectedUser(userToEdit);
        setModalOpen(true);
    };
    
    const handleSaveRole = (userId: number, newRole: Role) => {
        const userToUpdate = users.find(u => u.id === userId);
        if(userToUpdate) {
            onUpdateUser({...userToUpdate, role: newRole});
        }
        setModalOpen(false);
        setSelectedUser(null);
    };

    if (currentUser?.role !== 'super_administrator') {
        return <div>Access Denied</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('user_management')}</h1>
            <p className="mt-1 text-gray-600">{t('user_management_subtitle')}</p>

            <div className="mt-8 bg-white rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('name')}</th>
                                <th scope="col" className="px-6 py-3">{t('email')}</th>
                                <th scope="col" className="px-6 py-3">{t('role')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center">
                                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-3"/>
                                        {user.name}
                                    </th>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4 capitalize">{t(user.role)}</td>
                                    <td className="px-6 py-4 text-right space-x-4">
                                        <button onClick={() => handleEdit(user)} className="font-medium text-blue-600 hover:text-blue-800">{t('edit')}</button>
                                        <button onClick={() => alert('Deactivation feature is not yet implemented.')} className="font-medium text-red-600 hover:text-red-800">{t('deactivate')}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && selectedUser && (
                <UserEditModal 
                    user={selectedUser}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSaveRole}
                />
            )}
        </div>
    );
};

export default UserManagement;