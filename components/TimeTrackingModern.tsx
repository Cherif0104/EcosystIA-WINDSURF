import React, { useState, useMemo, useCallback } from 'react';
import { TimeLog, Project, Course, Meeting, User } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';

// Styles modernes pour les statuts
const statusStyles = {
  'active': 'bg-green-100 text-green-800 border-green-200',
  'completed': 'bg-blue-100 text-blue-800 border-blue-200',
  'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'cancelled': 'bg-red-100 text-red-800 border-red-200'
};

// Styles modernes pour les types
const typeStyles = {
  'project': 'border-l-blue-500',
  'course': 'border-l-green-500',
  'meeting': 'border-l-purple-500',
  'other': 'border-l-gray-500'
};

interface TimeTrackingModernProps {
  timeLogs: TimeLog[];
  projects: Project[];
  courses: Course[];
  meetings: Meeting[];
  users: User[];
  onAddTimeLog: (log: Omit<TimeLog, 'id' | 'userId'>) => void;
  onUpdateTimeLog: (id: number, log: Partial<TimeLog>) => void;
  onDeleteTimeLog: (id: number) => void;
}

const TimeTrackingModern: React.FC<TimeTrackingModernProps> = ({
  timeLogs,
  projects,
  courses,
  meetings,
  users,
  onAddTimeLog,
  onUpdateTimeLog,
  onDeleteTimeLog
}) => {
  const { t } = useLocalization();
  const { user: currentUser } = useAuth();
  
  // États locaux
  const [selectedLog, setSelectedLog] = useState<TimeLog | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filtrage des logs de temps
  const filteredTimeLogs = useMemo(() => {
    return timeLogs.filter(log => {
      const matchesSearch = !searchTerm || 
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.projectId && projects.find(p => p.id === log.projectId)?.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.courseId && courses.find(c => c.id === log.courseId)?.title.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filterType === 'all' || 
        (filterType === 'project' && log.projectId) ||
        (filterType === 'course' && log.courseId) ||
        (filterType === 'meeting' && log.meetingId) ||
        (filterType === 'other' && !log.projectId && !log.courseId && !log.meetingId);
      
      const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
      
      const matchesDate = !filterDate || 
        new Date(log.startTime).toDateString() === new Date(filterDate).toDateString();
      
      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [timeLogs, projects, courses, searchTerm, filterType, filterStatus, filterDate]);

  // Statistiques
  const stats = useMemo(() => {
    const totalHours = timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const todayHours = timeLogs
      .filter(log => new Date(log.startTime).toDateString() === new Date().toDateString())
      .reduce((sum, log) => sum + (log.duration || 0), 0);
    const thisWeekHours = timeLogs
      .filter(log => {
        const logDate = new Date(log.startTime);
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        return logDate >= weekStart;
      })
      .reduce((sum, log) => sum + (log.duration || 0), 0);
    
    return {
      totalHours: Math.round(totalHours * 100) / 100,
      todayHours: Math.round(todayHours * 100) / 100,
      thisWeekHours: Math.round(thisWeekHours * 100) / 100,
      totalLogs: timeLogs.length
    };
  }, [timeLogs]);

  // Gestionnaires d'événements
  const handleCreateLog = () => {
    setEditingLog(null);
    setFormModalOpen(true);
  };

  const handleEditLog = (log: TimeLog) => {
    setEditingLog(log);
    setFormModalOpen(true);
  };

  const handleDeleteLog = async (logId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce log de temps ?')) {
      try {
        onDeleteTimeLog(logId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleExportLogs = async () => {
    const format = window.confirm('Exporter en CSV ? (Cliquez sur Annuler pour JSON)') ? 'csv' : 'json';
    
    try {
      let data;
      if (format === 'json') {
        data = JSON.stringify(filteredTimeLogs, null, 2);
      } else {
        // Conversion CSV
        const headers = ['Date', 'Début', 'Fin', 'Durée', 'Type', 'Description', 'Projet', 'Cours'];
        const csvRows = [headers.join(',')];
        
        filteredTimeLogs.forEach(log => {
          const row = [
            new Date(log.startTime).toLocaleDateString('fr-FR'),
            new Date(log.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            new Date(log.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            `${log.duration || 0}h`,
            log.projectId ? 'Projet' : log.courseId ? 'Cours' : log.meetingId ? 'Réunion' : 'Autre',
            `"${log.description}"`,
            log.projectId ? `"${projects.find(p => p.id === log.projectId)?.title || ''}"` : '',
            log.courseId ? `"${courses.find(c => c.id === log.courseId)?.title || ''}"` : ''
          ];
          csvRows.push(row.join(','));
        });
        
        data = csvRows.join('\n');
      }
      
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `time_logs_export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ Export réussi:', format);
    } catch (error) {
      console.error('❌ Erreur lors de l\'export:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des logs de temps...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Suivi du Temps</h1>
            <p className="mt-1 text-sm text-gray-500">
              {filteredTimeLogs.length} log{filteredTimeLogs.length !== 1 ? 's' : ''} trouvé{filteredTimeLogs.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={handleCreateLog}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fas fa-plus mr-2"></i>
              Nouveau log
            </button>
            <button
              onClick={handleExportLogs}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fas fa-download mr-2"></i>
              Exporter
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-clock text-2xl"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-100">Total</p>
                <p className="text-2xl font-bold">{stats.totalHours}h</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-calendar-day text-2xl"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-100">Aujourd'hui</p>
                <p className="text-2xl font-bold">{stats.todayHours}h</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-calendar-week text-2xl"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-100">Cette semaine</p>
                <p className="text-2xl font-bold">{stats.thisWeekHours}h</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-list text-2xl"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-100">Total logs</p>
                <p className="text-2xl font-bold">{stats.totalLogs}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Description, projet, cours..."
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
            </div>
          </div>

          {/* Filtre par type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="project">Projets</option>
              <option value="course">Cours</option>
              <option value="meeting">Réunions</option>
              <option value="other">Autres</option>
            </select>
          </div>

          {/* Filtre par statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="completed">Terminé</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          {/* Filtre par date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Liste des logs de temps */}
      <div className="space-y-4">
        {filteredTimeLogs.map((log) => (
          <div
            key={log.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-4 h-4 rounded-full border-l-4 ${
                      log.projectId ? typeStyles.project :
                      log.courseId ? typeStyles.course :
                      log.meetingId ? typeStyles.meeting :
                      typeStyles.other
                    }`}></div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {log.description}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[log.status]}`}>
                      {log.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <i className="fas fa-calendar-alt mr-2"></i>
                      <span>{new Date(log.startTime).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-clock mr-2"></i>
                      <span>
                        {new Date(log.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(log.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-hourglass-half mr-2"></i>
                      <span className="font-medium text-gray-900">{log.duration || 0}h</span>
                    </div>
                  </div>

                  {/* Informations contextuelles */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {log.projectId && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        <i className="fas fa-project-diagram mr-1"></i>
                        {projects.find(p => p.id === log.projectId)?.title || 'Projet inconnu'}
                      </span>
                    )}
                    {log.courseId && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        <i className="fas fa-graduation-cap mr-1"></i>
                        {courses.find(c => c.id === log.courseId)?.title || 'Cours inconnu'}
                      </span>
                    )}
                    {log.meetingId && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        <i className="fas fa-users mr-1"></i>
                        {meetings.find(m => m.id === log.meetingId)?.title || 'Réunion inconnue'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEditLog(log)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Modifier"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message si aucun log */}
      {filteredTimeLogs.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-clock text-4xl text-gray-400 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun log de temps trouvé</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterDate
              ? 'Aucun log ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre premier log de temps.'}
          </p>
          {!searchTerm && filterType === 'all' && filterStatus === 'all' && !filterDate && (
            <button
              onClick={handleCreateLog}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fas fa-plus mr-2"></i>
              Créer un log
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeTrackingModern;
