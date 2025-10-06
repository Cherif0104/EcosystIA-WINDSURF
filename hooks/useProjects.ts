import { useState, useEffect, useCallback } from 'react';
import { projectsService } from '../services/projectsService';
import { Project } from '../types/Project';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger tous les projets
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Essayer de charger depuis Supabase
      try {
        const data = await projectsService.getAllProjects();
        setProjects(data);
        console.log('✅ Projets chargés depuis Supabase:', data.length);
      } catch (dbError) {
        console.warn('⚠️ Erreur de connexion à la base de données, utilisation des données de démonstration');
        
        // Données de démonstration en cas d'erreur de base de données
        const demoProjects = [
          {
            id: '1',
            title: 'Site Web E-commerce',
            description: 'Développement d\'un site e-commerce moderne avec panier et paiement',
            status: 'in_progress' as const,
            priority: 'high' as const,
            due_date: '2024-02-15',
            budget: 15000,
            currency: 'EUR',
            client_name: 'TechCorp',
            team: [
              { id: 1, name: 'Jean Dupont', role: 'developer' },
              { id: 2, name: 'Marie Martin', role: 'designer' }
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Application Mobile',
            description: 'Création d\'une application mobile cross-platform',
            status: 'draft' as const,
            priority: 'medium' as const,
            due_date: '2024-03-01',
            budget: 25000,
            currency: 'EUR',
            client_name: 'StartupXYZ',
            team: [
              { id: 3, name: 'Pierre Durand', role: 'developer' }
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Refonte UI/UX',
            description: 'Amélioration de l\'interface utilisateur existante',
            status: 'completed' as const,
            priority: 'low' as const,
            due_date: '2024-01-30',
            budget: 8000,
            currency: 'EUR',
            client_name: 'DesignStudio',
            team: [
              { id: 4, name: 'Sophie Bernard', role: 'designer' },
              { id: 5, name: 'Lucas Petit', role: 'developer' }
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        setProjects(demoProjects);
        console.log('✅ Projets de démonstration chargés:', demoProjects.length);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des projets:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer un nouveau projet
  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      
      // Essayer de créer dans Supabase
      try {
        const newProject = await projectsService.createProject(projectData);
        setProjects(prev => [newProject, ...prev]);
        console.log('✅ Projet créé dans Supabase:', newProject);
        return newProject;
      } catch (dbError) {
        console.warn('⚠️ Erreur de connexion à la base de données, création locale');
        
        // Créer localement en cas d'erreur de base de données
        const newProject: Project = {
          ...projectData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setProjects(prev => [newProject, ...prev]);
        console.log('✅ Projet créé localement:', newProject);
        return newProject;
      }
    } catch (err) {
      console.error('❌ Erreur lors de la création du projet:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      throw err;
    }
  }, []);

  // Mettre à jour un projet
  const updateProject = useCallback(async (id: string, projectData: Partial<Project>) => {
    try {
      setError(null);
      const updatedProject = await projectsService.updateProject(id, projectData);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      console.log('✅ Projet mis à jour:', updatedProject);
      return updatedProject;
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour du projet:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    }
  }, []);

  // Supprimer un projet
  const deleteProject = useCallback(async (id: string) => {
    try {
      setError(null);
      await projectsService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      console.log('✅ Projet supprimé:', id);
      return true;
    } catch (err) {
      console.error('❌ Erreur lors de la suppression du projet:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    }
  }, []);

  // Rechercher des projets
  const searchProjects = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsService.searchProjects(query);
      setProjects(data);
      console.log('✅ Recherche effectuée:', data.length, 'résultats');
    } catch (err) {
      console.error('❌ Erreur lors de la recherche:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrer par statut
  const filterByStatus = useCallback(async (status: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsService.getProjectsByStatus(status);
      setProjects(data);
      console.log('✅ Filtrage par statut:', status, data.length, 'résultats');
    } catch (err) {
      console.error('❌ Erreur lors du filtrage par statut:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du filtrage');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrer par priorité
  const filterByPriority = useCallback(async (priority: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsService.getProjectsByPriority(priority);
      setProjects(data);
      console.log('✅ Filtrage par priorité:', priority, data.length, 'résultats');
    } catch (err) {
      console.error('❌ Erreur lors du filtrage par priorité:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du filtrage');
    } finally {
      setLoading(false);
    }
  }, []);

  // Exporter les projets
  const exportProjects = useCallback(async (format: 'json' | 'csv' = 'json') => {
    try {
      setError(null);
      const data = await projectsService.exportProjects(format);
      
      // Créer et télécharger le fichier
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `projects_export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ Export réussi:', format);
      return true;
    } catch (err) {
      console.error('❌ Erreur lors de l\'export:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export');
      throw err;
    }
  }, []);

  // Charger les projets au montage du composant
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // S'abonner aux changements en temps réel
  useEffect(() => {
    const subscription = projectsService.subscribeToProjects((updatedProjects) => {
      console.log('🔄 Synchronisation en temps réel:', updatedProjects.length, 'projets');
      setProjects(updatedProjects);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    projects,
    loading,
    error,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    searchProjects,
    filterByStatus,
    filterByPriority,
    exportProjects
  };
};
