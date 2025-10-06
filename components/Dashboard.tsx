import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Course, Job, Project, TimeLog, LeaveRequest, Invoice, Expense } from '../types';
import SimpleModernDashboard from './common/SimpleModernDashboard';
import { usePermissions } from '../hooks/usePermissions';

interface DashboardProps {
  setView: (view: string) => void;
  projects: Project[];
  courses: Course[];
  jobs: Job[];
  timeLogs: TimeLog[];
  leaveRequests: LeaveRequest[];
  invoices: Invoice[];
  expenses: Expense[];
}


const Dashboard: React.FC<DashboardProps> = ({ 
  setView, 
  projects, 
  courses, 
  jobs, 
  timeLogs, 
  leaveRequests,
  invoices,
  expenses
}) => {
  const { user } = useAuth();
  const modulePermissions = usePermissions('dashboard');
  
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const userLogs = timeLogs.filter(log => log.userId === user?.id);
    const todayLogs = userLogs.filter(log => log.date === today);
    const todayTime = todayLogs.reduce((sum, log) => sum + log.duration, 0);
    
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'In Progress').length,
      completedProjects: projects.filter(p => p.status === 'Completed').length,
      totalCourses: courses.length,
      completedCourses: courses.filter(c => c.progress === 100).length,
      totalJobs: jobs.length,
      todayTimeLogged: todayTime,
      pendingLeaveRequests: leaveRequests.filter(l => l.status === 'Pending').length,
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter(i => i.status === 'Paid').length,
      totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0)
    };
  }, [projects, courses, jobs, timeLogs, leaveRequests, invoices, expenses, user]);


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
            Vous n'avez pas les permissions nécessaires pour accéder au Dashboard.
          </p>
          <p className="text-sm text-gray-500">
            Contactez votre administrateur pour obtenir les droits d'accès.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SimpleModernDashboard setView={setView} stats={stats} />
  );
};

export default Dashboard;