import React, { useState, useMemo } from 'react';
import { useProjects } from '../hooks/useProjects';
import { Project, ProjectFormData } from '../types/Project';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';

// Styles modernes pour les statuts
const statusStyles = {
    'draft': 'bg-gray-100 text-gray-800 border-gray-200',
    'in_progress': 'bg-blue-100 text-blue-800 border-blue-200',
    'completed': 'bg-green-100 text-green-800 border-green-200',
    'on_hold': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'cancelled': 'bg-red-100 text-red-800 border-red-200'
};

// Styles modernes pour les priorités
const priorityStyles = {
    'low': 'border-l-green-500',
    'medium': 'border-l-yellow-500',
    'high': 'border-l-orange-500',
    'urgent': 'border-l-red-500'
};

// Données utilisateurs simulées (à remplacer par un vrai service)
const mockUsers = [
    { id: 1, name: 'Jean Dupont', email: 'jean.dupont@example.com', role: 'developer' },
    { id: 2, name: 'Marie Martin', email: 'marie.martin@example.com', role: 'designer' },
    { id: 3, name: 'Pierre Durand', email: 'pierre.durand@example.com', role: 'manager' },
    { id: 4, name: 'Sophie Bernard', email: 'sophie.bernard@example.com', role: 'developer' },
    { id: 5, name: 'Lucas Petit', email: 'lucas.petit@example.com', role: 'designer' }
];

const ProjectsWithDatabase: React.FC = () => {
    const { t } = useLocalization();
    const { user: currentUser } = useAuth();
    
    // Hook pour la gestion des projets
    const {
        projects,
        loading,
        error,
        createProject,
        updateProject,
        deleteProject,
        searchProjects,
        filterByStatus,
        filterByPriority,
        exportProjects
    } = useProjects();

    // États locaux
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');

    // Filtrage local des projets
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSearch = !searchTerm || 
                project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.team.some(member => member.name.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
            const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
            
            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [projects, searchTerm, filterStatus, filterPriority]);

    // Gestionnaires d'événements
    const handleCreateProject = () => {
        setEditingProject(null);
        setFormModalOpen(true);
    };

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setFormModalOpen(true);
    };

    const handleDeleteProject = async (projectId: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
            try {
                await deleteProject(projectId);
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    };

    const handleSaveProject = async (projectData: ProjectFormData) => {
        try {
            if (editingProject) {
                await updateProject(editingProject.id, projectData);
            } else {
                await createProject(projectData);
            }
            setFormModalOpen(false);
            setEditingProject(null);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    };

    const handleExport = async () => {
        const format = window.confirm('Exporter en CSV ? (Cliquez sur Annuler pour JSON)') ? 'csv' : 'json';
        try {
            await exportProjects(format);
        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchTerm(query);
        if (query.trim()) {
            await searchProjects(query);
        }
    };

    const handleStatusFilter = async (status: string) => {
        setFilterStatus(status);
        if (status !== 'all') {
            await filterByStatus(status);
        }
    };

    const handlePriorityFilter = async (priority: string) => {
        setFilterPriority(priority);
        if (priority !== 'all') {
            await filterByPriority(priority);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Chargement des projets...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <i className="fas fa-exclamation-triangle text-red-400"></i>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-sm text-red-600 hover:text-red-500"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header avec actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {filteredProjects.length} projet{filteredProjects.length !== 1 ? 's' : ''} trouvé{filteredProjects.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex space-x-3">
                        <button
                            onClick={handleCreateProject}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <i className="fas fa-plus mr-2"></i>
                            Nouveau projet
                        </button>
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <i className="fas fa-download mr-2"></i>
                            Exporter
                        </button>
                    </div>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Recherche */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rechercher
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Titre, description, client..."
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="fas fa-search text-gray-400"></i>
                            </div>
                        </div>
                    </div>

                    {/* Filtre par statut */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Statut
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="draft">Brouillon</option>
                            <option value="in_progress">En cours</option>
                            <option value="completed">Terminé</option>
                            <option value="on_hold">En attente</option>
                            <option value="cancelled">Annulé</option>
                        </select>
                    </div>

                    {/* Filtre par priorité */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priorité
                        </label>
                        <select
                            value={filterPriority}
                            onChange={(e) => handlePriorityFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Toutes les priorités</option>
                            <option value="low">Faible</option>
                            <option value="medium">Moyenne</option>
                            <option value="high">Élevée</option>
                            <option value="urgent">Urgente</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Liste des projets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                    <div
                        key={project.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                    >
                        {/* Header de la carte */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {project.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {project.description}
                                    </p>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                    <button
                                        onClick={() => handleEditProject(project)}
                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Modifier"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProject(project.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                        title="Supprimer"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Contenu de la carte */}
                        <div className="p-6">
                            {/* Statut et priorité */}
                            <div className="flex items-center justify-between mb-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[project.status]}`}>
                                    {project.status.replace('_', ' ')}
                                </span>
                                <div className={`w-4 h-4 rounded-full border-l-4 ${priorityStyles[project.priority]}`}></div>
                            </div>

                            {/* Informations du projet */}
                            <div className="space-y-2 text-sm text-gray-600">
                                {project.due_date && (
                                    <div className="flex items-center">
                                        <i className="fas fa-calendar-alt mr-2"></i>
                                        <span>Échéance: {new Date(project.due_date).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                )}
                                {project.budget && (
                                    <div className="flex items-center">
                                        <i className="fas fa-euro-sign mr-2"></i>
                                        <span>Budget: {project.budget.toLocaleString()} {project.currency}</span>
                                    </div>
                                )}
                                {project.client_name && (
                                    <div className="flex items-center">
                                        <i className="fas fa-building mr-2"></i>
                                        <span>Client: {project.client_name}</span>
                                    </div>
                                )}
                            </div>

                            {/* Équipe */}
                            {project.team && project.team.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex items-center mb-2">
                                        <i className="fas fa-users mr-2 text-gray-400"></i>
                                        <span className="text-sm font-medium text-gray-700">Équipe</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {project.team.slice(0, 3).map((member, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                                            >
                                                {member.name}
                                            </span>
                                        ))}
                                        {project.team.length > 3 && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                                +{project.team.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Message si aucun projet */}
            {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                    <i className="fas fa-folder-open text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
                    <p className="text-gray-500 mb-4">
                        {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                            ? 'Aucun projet ne correspond à vos critères de recherche.'
                            : 'Commencez par créer votre premier projet.'}
                    </p>
                    {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && (
                        <button
                            onClick={handleCreateProject}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <i className="fas fa-plus mr-2"></i>
                            Créer un projet
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjectsWithDatabase;
