import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Header from '../Header';

// =====================================================
// COMPOSANT DE LAYOUT PRINCIPAL
// =====================================================

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Fonction pour obtenir la vue actuelle basée sur l'URL
  const getCurrentView = () => {
    const path = location.pathname;
    
    // Mapping des routes vers les vues
    const routeToViewMap: Record<string, string> = {
      '/dashboard': 'dashboard',
      '/projects': 'projects',
      '/courses': 'courses',
      '/jobs': 'jobs',
      '/goals-okrs': 'goals_okrs',
      '/crm-sales': 'crm_sales',
      '/time-tracking': 'time_tracking',
      '/leave-management': 'leave_management',
      '/finance': 'finance',
      '/knowledge-base': 'knowledge_base',
      '/development': 'development',
      '/tools': 'tools',
      '/ai-coach': 'ai_coach',
      '/gen-ai-lab': 'gen_ai_lab',
      '/analytics': 'analytics',
      '/user-management': 'user_management',
      '/settings': 'settings',
      '/super-admin': 'super_admin',
      '/course-detail': 'course_detail',
      '/course-management': 'course_management',
      '/create-job': 'create_job',
      '/talent-analytics': 'talent_analytics'
    };

    return routeToViewMap[path] || 'dashboard';
  };

  // Fonction pour gérer la navigation (pour compatibilité avec l'ancien système)
  const handleSetView = (view: string) => {
    const viewToRouteMap: Record<string, string> = {
      'dashboard': '/dashboard',
      'projects': '/projects',
      'courses': '/courses',
      'jobs': '/jobs',
      'goals_okrs': '/goals-okrs',
      'crm_sales': '/crm-sales',
      'time_tracking': '/time-tracking',
      'leave_management': '/leave-management',
      'finance': '/finance',
      'knowledge_base': '/knowledge-base',
      'development': '/development',
      'tools': '/tools',
      'ai_coach': '/ai-coach',
      'gen_ai_lab': '/gen-ai-lab',
      'analytics': '/analytics',
      'user_management': '/user-management',
      'settings': '/settings',
      'super_admin': '/super-admin',
      'course_detail': '/course-detail',
      'course_management': '/course-management',
      'create_job': '/create-job',
      'talent_analytics': '/talent-analytics'
    };

    const route = viewToRouteMap[view];
    if (route) {
      window.location.href = route;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        currentView={getCurrentView()} 
        setView={handleSetView} 
        isOpen={isSidebarOpen} 
      />
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          setView={handleSetView}
        />
        
        {/* Contenu principal avec scroll */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* Overlay pour mobile */}
      {isSidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
        />
      )}
    </div>
  );
};

export default AppLayout;
