import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useLocalization } from './contexts/LocalizationContext';

// Import des composants MVP SENEGEL
import Login from './components/Login';
import Signup from './components/Signup';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EnhancedARVA from './components/EnhancedARVA';

// Types MVP SENEGEL
interface MVPUser {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  permissions: string[];
}

interface MVPProject {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  assignedTo: string[];
  createdAt: string;
  updatedAt: string;
}

interface MVPTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

// Données mock pour MVP SENEGEL
const mockMVPProjects: MVPProject[] = [
  {
    id: '1',
    name: 'Formation Digitale SENEGEL',
    description: 'Projet de formation en compétences numériques',
    status: 'active',
    assignedTo: ['admin@senegel.com'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: '2',
    name: 'Développement Plateforme',
    description: 'Développement de la plateforme EcosystIA',
    status: 'active',
    assignedTo: ['admin@senegel.com'],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-25'
  }
];

const mockMVPTasks: MVPTask[] = [
  {
    id: '1',
    projectId: '1',
    title: 'Conception UI/UX',
    description: 'Créer les maquettes de l\'interface utilisateur',
    status: 'completed',
    assignedTo: 'admin@senegel.com',
    dueDate: '2024-01-30',
    priority: 'high'
  },
  {
    id: '2',
    projectId: '1',
    title: 'Développement Frontend',
    description: 'Implémenter l\'interface utilisateur',
    status: 'in_progress',
    assignedTo: 'admin@senegel.com',
    dueDate: '2024-02-15',
    priority: 'high'
  }
];

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const { t } = useLocalization();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // État MVP SENEGEL
  const [projects, setProjects] = useState<MVPProject[]>(mockMVPProjects);
  const [tasks, setTasks] = useState<MVPTask[]>(mockMVPTasks);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Gestion de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        {authView === 'login' ? (
          <Login onSwitchToSignup={() => setAuthView('signup')} />
        ) : (
          <Signup onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  // Rendu principal MVP SENEGEL
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header MVP SENEGEL */}
      <Header 
        user={user}
        onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        notifications={notifications}
        onNotificationClick={(id) => {
          setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
          );
        }}
      />

      <div className="flex">
        {/* Sidebar MVP SENEGEL */}
        <Sidebar 
          isOpen={isSidebarOpen}
          currentView={currentView}
          onViewChange={setCurrentView}
          userRole={user.role}
        />

        {/* Contenu principal MVP SENEGEL */}
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <div className="p-6">
            {currentView === 'dashboard' && (
              <Dashboard 
                user={user}
                projects={projects}
                tasks={tasks}
                onProjectUpdate={setProjects}
                onTaskUpdate={setTasks}
              />
            )}
            
            {currentView === 'projects' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                  Projets SENEGEL
                </h1>
                <div className="grid gap-4">
                  {projects.map(project => (
                    <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                      <p className="text-gray-600 mb-2">{project.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          project.status === 'active' ? 'bg-green-100 text-green-800' :
                          project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status === 'active' ? 'Actif' :
                           project.status === 'completed' ? 'Terminé' : 'En attente'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(project.updatedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentView === 'tasks' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                  Tâches SENEGEL
                </h1>
                <div className="grid gap-4">
                  {tasks.map(task => (
                    <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                      <p className="text-gray-600 mb-2">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status === 'completed' ? 'Terminé' :
                           task.status === 'in_progress' ? 'En cours' : 'À faire'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority === 'high' ? 'Priorité haute' :
                           task.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentView === 'profile' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                  Profil Utilisateur
                </h1>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rôle</label>
                    <p className="mt-1 text-sm text-gray-900">{user.role}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ARVA Assistant MVP SENEGEL */}
      <EnhancedARVA />
    </div>
  );
};

export default App;
