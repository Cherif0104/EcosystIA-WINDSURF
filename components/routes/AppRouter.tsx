import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// =====================================================
// LAZY LOADING DES COMPOSANTS POUR LE CODE-SPLITTING
// =====================================================

// Composants principaux avec lazy loading
const Dashboard = lazy(() => import('../Dashboard'));
const Projects = lazy(() => import('../Projects'));
const Courses = lazy(() => import('../Courses'));
const Jobs = lazy(() => import('../Jobs'));
const Goals = lazy(() => import('../Goals'));
const CRM = lazy(() => import('../CRM'));
const TimeTrackingModern = lazy(() => import('../TimeTrackingModern'));
const LeaveManagement = lazy(() => import('../LeaveManagement'));
const Finance = lazy(() => import('../Finance'));
const KnowledgeBase = lazy(() => import('../KnowledgeBase'));
const Development = lazy(() => import('../Development'));
const Tools = lazy(() => import('../Tools'));
const AICoach = lazy(() => import('../AICoach'));
const GenAILab = lazy(() => import('../GenAILab'));
const Analytics = lazy(() => import('../Analytics'));
const UserManagement = lazy(() => import('../UserManagement'));
const Settings = lazy(() => import('../Settings'));
const SuperAdmin = lazy(() => import('../SuperAdmin'));

// Composants de gestion des cours
const CourseDetail = lazy(() => import('../CourseDetail'));
const CourseManagement = lazy(() => import('../CourseManagement'));

// Composants de gestion des emplois
const CreateJob = lazy(() => import('../CreateJob'));

// Composants d'analytics
const TalentAnalytics = lazy(() => import('../TalentAnalytics'));

// =====================================================
// COMPOSANT DE CHARGEMENT
// =====================================================

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">EcosystIA</h2>
      <p className="text-gray-600">Chargement du module...</p>
    </div>
  </div>
);

// =====================================================
// COMPOSANT D'ERREUR POUR LE LAZY LOADING
// =====================================================

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Erreur de chargement du module:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">Impossible de charger ce module</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// =====================================================
// ROUTEUR PRINCIPAL
// =====================================================

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Route par défaut - Redirection vers le dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Routes principales des modules */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/goals-okrs" element={<Goals />} />
            <Route path="/crm-sales" element={<CRM />} />
            <Route path="/time-tracking" element={<TimeTrackingModern />} />
            <Route path="/leave-management" element={<LeaveManagement />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/development" element={<Development />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/ai-coach" element={<AICoach />} />
            <Route path="/gen-ai-lab" element={<GenAILab />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/super-admin" element={<SuperAdmin />} />

            {/* Routes de gestion des cours */}
            <Route path="/course-detail/:id" element={<CourseDetail />} />
            <Route path="/course-management" element={<CourseManagement />} />

            {/* Routes de gestion des emplois */}
            <Route path="/create-job" element={<CreateJob />} />

            {/* Routes d'analytics */}
            <Route path="/talent-analytics" element={<TalentAnalytics />} />

            {/* Route de fallback pour les URLs non trouvées */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-question-circle text-gray-600 text-2xl"></i>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Page non trouvée</h2>
                  <p className="text-gray-600 mb-4">La page que vous recherchez n'existe pas</p>
                  <button
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retour
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppRouter;
