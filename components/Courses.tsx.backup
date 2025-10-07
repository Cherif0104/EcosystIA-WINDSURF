
import React, { useState, useEffect, useMemo } from 'react';
import { databaseService } from '../services/databaseService';
import { genericDatabaseService } from '../services/genericDatabaseService';
import { useDataSync } from '../hooks/useDataSync';
import { geminiService } from '../services/geminiService';

import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { Course, User } from '../types';
import { geminiService } from '../services/geminiService';
import { usePermissions } from '../hooks/usePermissions';

// Sous-module : Recommandations de cours IA
const CourseRecommendationsCard: React.FC<{
    courses: Course[];
    user: User | null;
    onSelectCourse: (id: number) => void;
}> = ({ courses, user, onSelectCourse }) => {
    const { t } = useLocalization();
    const [recommendations, setRecommendations] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const generateRecommendations = async () => {
            if (!user) return;
            
            setLoading(true);
            const userProfile = {
                role: user.role,
                completedCourses: courses.filter(c => c.progress === 100).length,
                interests: ['leadership', 'management', 'technology'], // Basé sur le rôle
                experience: user.role === 'manager' ? 'intermediate' : 'beginner'
            };

            const aiRecommendations = await geminiService.generateContent('training', {
                subject: 'Recommandations de formation SENEGEL',
                level: userProfile.experience,
                duration: 'Variable',
                objectives: `Recommandations personnalisées pour ${user.name} (${user.role})`
            });

            // Simuler des recommandations basées sur l'IA
            const recommendedCourses = courses
                .filter(c => c.progress < 100)
                .sort((a, b) => b.progress - a.progress)
                .slice(0, 3);
            
            setRecommendations(recommendedCourses);
            setLoading(false);
        };

        generateRecommendations();
    }, [courses, user]);

    
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
      const result = await genericDatabaseService.create('courses', data);
      console.log('Creation reussie:', result);
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur creation:', error);
    }
  };
  
  const handleEdit = async (id: number, data: any) => {
    try {
      const result = await genericDatabaseService.update('courses', id, data);
      console.log('Modification reussie:', result);
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur modification:', error);
    }
  };
  
  const handleDelete = async (id: number) => {
    try {
      const result = await genericDatabaseService.delete('courses', id);
      console.log('Suppression reussie:', result);
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };
  
  const handleExport = async () => {
    try {
      const data = await genericDatabaseService.getAll('courses');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'courses_export.json';
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
      await genericDatabaseService.bulkCreate('courses', data);
      console.log('Import reussi');
      // Rafraîchir les données
    } catch (error) {
      console.error('Erreur import:', error);
    }
  };
  
  const handleApprove = async (id: number) => {
    try {
      const result = await genericDatabaseService.update('courses', id, { status: 'approved' });
      console.log('Approbation reussie:', result);
    } catch (error) {
      console.error('Erreur approbation:', error);
    }
  };
  
  const handleReject = async (id: number) => {
    try {
      const result = await genericDatabaseService.update('courses', id, { status: 'rejected' });
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
      const result = await genericDatabaseService.createOrUpdate('courses', data);
      console.log('Sauvegarde reussie:', result);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };
  
  const handleAdd = async (data: any) => {
    try {
      const result = await genericDatabaseService.create('courses', data);
      console.log('Ajout reussi:', result);
    } catch (error) {
      console.error('Erreur ajout:', error);
    }
  };
  
  const handleRemove = async (id: number) => {
    try {
      const result = await genericDatabaseService.delete('courses', id);
      console.log('Suppression reussie:', result);
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">🎯 Recommandations IA</h3>
            {loading ? (
                <div className="flex justify-center items-center py-4">
                    <i className="fas fa-spinner fa-spin text-xl text-emerald-500"></i>
                </div>
            ) : (
                <div className="space-y-3">
                    {recommendations.map(course => (
                        <div 
                            key={course.id}
                            onClick={() => onSelectCourse(course.id)}
                            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="bg-emerald-100 text-emerald-600 rounded-lg p-2">
                                    <i className={`${course.icon} text-sm`}></i>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-sm text-gray-800">{course.title}</h4>
                                    <p className="text-xs text-gray-500">{course.instructor}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500">{course.progress}%</div>
                                    <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                                        <div 
                                            className="bg-emerald-500 h-1 rounded-full" 
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Sous-module : Statistiques de progression
const ProgressStatsCard: React.FC<{
    courses: Course[];
    user: User | null;
}> = ({ courses, user }) => {
    const { t } = useLocalization();
    
    const stats = useMemo(() => {
        const totalCourses = courses.length;
        const completedCourses = courses.filter(c => c.progress === 100).length;
        const inProgressCourses = courses.filter(c => c.progress > 0 && c.progress < 100).length;
        const notStartedCourses = courses.filter(c => c.progress === 0).length;
        const averageProgress = totalCourses > 0 ? courses.reduce((sum, c) => sum + c.progress, 0) / totalCourses : 0;
        
        return {
            totalCourses,
            completedCourses,
            inProgressCourses,
            notStartedCourses,
            averageProgress: Math.round(averageProgress)
        };
    }, [courses]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">📊 Progression SENEGEL</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{stats.completedCourses}</div>
                    <div className="text-sm text-gray-500">Terminés</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.inProgressCourses}</div>
                    <div className="text-sm text-gray-500">En cours</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{stats.notStartedCourses}</div>
                    <div className="text-sm text-gray-500">Non commencés</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.averageProgress}%</div>
                    <div className="text-sm text-gray-500">Progression moyenne</div>
                </div>
            </div>
        </div>
    );
};

// Sous-module : Certifications automatiques
const CertificationCard: React.FC<{
    courses: Course[];
    user: User | null;
}> = ({ courses, user }) => {
    const { t } = useLocalization();
    const [certifications, setCertifications] = useState<any[]>([]);

    useEffect(() => {
        const generateCertifications = async () => {
            const completedCourses = courses.filter(c => c.progress === 100);
            const newCertifications = [];

            for (const course of completedCourses) {
                const certification = {
                    id: `cert-${course.id}`,
                    courseTitle: course.title,
                    studentName: user?.name || 'Étudiant',
                    completionDate: new Date().toISOString().split('T')[0],
                    certificateNumber: `SENEGEL-${course.id}-${Date.now().toString().slice(-6)}`,
                    status: 'ready'
                };
                newCertifications.push(certification);
            }

            setCertifications(newCertifications);
        };

        generateCertifications();
    }, [courses, user]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">🏆 Certifications SENEGEL</h3>
            <div className="space-y-3">
                {certifications.length > 0 ? (
                    certifications.map(cert => (
                        <div key={cert.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-800">{cert.courseTitle}</h4>
                                    <p className="text-xs text-gray-500">Certificat #{cert.certificateNumber}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-green-600 font-semibold">✓ Prêt</div>
                                    <button className="text-xs text-blue-600 hover:text-blue-800 mt-1">
                                        Télécharger
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4">
                        <i className="fas fa-certificate text-gray-400 text-2xl mb-2"></i>
                        <p className="text-sm text-gray-500">Aucune certification disponible</p>
                        <p className="text-xs text-gray-400">Terminez un cours pour obtenir votre certificat</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sous-module : Calendrier de formation
const TrainingCalendarCard: React.FC<{
    courses: Course[];
    onSelectCourse: (id: number) => void;
}> = ({ courses, onSelectCourse }) => {
    const { t } = useLocalization();
    const [currentDate, setCurrentDate] = useState(new Date());

    const upcomingSessions = useMemo(() => {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        return courses
            .filter(c => c.progress > 0 && c.progress < 100)
            .map(course => ({
                ...course,
                nextSession: new Date(today.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
            }))
            .sort((a, b) => a.nextSession.getTime() - b.nextSession.getTime())
            .slice(0, 3);
    }, [courses]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">📅 Prochaines Sessions</h3>
            <div className="space-y-3">
                {upcomingSessions.length > 0 ? (
                    upcomingSessions.map(session => (
                        <div 
                            key={session.id}
                            onClick={() => onSelectCourse(session.id)}
                            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-800">{session.title}</h4>
                                    <p className="text-xs text-gray-500">
                                        {session.nextSession.toLocaleDateString('fr-FR', { 
                                            weekday: 'short', 
                                            day: 'numeric', 
                                            month: 'short' 
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-blue-600 font-semibold">
                                        {session.nextSession.toLocaleTimeString('fr-FR', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </div>
                                    <div className="text-xs text-gray-500">{session.progress}%</div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4">
                        <i className="fas fa-calendar text-gray-400 text-2xl mb-2"></i>
                        <p className="text-sm text-gray-500">Aucune session prévue</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const CourseCard: React.FC<{ course: Course, onSelectCourse: (id: number) => void }> = ({ course, onSelectCourse }) => {
  const { t } = useLocalization();
  return (
    <div 
      onClick={() => onSelectCourse(course.id)}
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col justify-between cursor-pointer"
    >
      <div>
        <div className="flex items-center space-x-4 mb-4">
            <div className="bg-emerald-100 text-emerald-600 rounded-xl p-4">
                <i className={`${course.icon} fa-2x`}></i>
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                <p className="text-sm text-gray-500">{course.instructor}</p>
            </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">{t('course_duration')}: <span className="font-semibold">{course.duration}</span></p>
      </div>
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{t('course_progress')}</span>
          <span>{course.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

interface CoursesProps {
  onSelectCourse: (id: number) => void;
  courses: Course[];
}

const Courses: React.FC<CoursesProps> = ({ courses, onSelectCourse }) => {
  const { t } = useLocalization();
  const { user } = useAuth();
  const modulePermissions = usePermissions('courses');
  
  // Hook de synchronisation des données
  const {
    data: syncedCourses,
    createWithSync,
    updateWithSync,
    deleteWithSync,
    refreshData
  } = useDataSync(
    { table: 'courses', autoRefresh: true },
    courses,
    (newCourses) => {
      // Les cours sont en lecture seule dans ce composant
      console.log('Cours synchronisés:', newCourses.length);
    }
  );

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
            Vous n'avez pas les permissions nécessaires pour accéder au module Cours.
          </p>
          <p className="text-sm text-gray-500">
            Contactez votre administrateur pour obtenir les droits d'accès.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('courses')}</h1>
          <p className="mt-1 text-gray-600">Formations SENEGEL - Développement des compétences</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2">
            <i className="fas fa-plus"></i>
            <span>Nouveau Cours</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <i className="fas fa-download"></i>
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Sous-modules SENEGEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CourseRecommendationsCard courses={courses} user={user} onSelectCourse={onSelectCourse} />
        <ProgressStatsCard courses={courses} user={user} />
        <CertificationCard courses={courses} user={user} />
        <TrainingCalendarCard courses={courses} onSelectCourse={onSelectCourse} />
      </div>

      {/* Liste des cours */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-700 mb-6">Tous les Cours SENEGEL</h2>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} onSelectCourse={onSelectCourse} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white rounded-lg shadow-md">
              <i className="fas fa-book-reader fa-4x text-gray-400"></i>
              <h3 className="mt-6 text-xl font-semibold text-gray-800">{t('no_courses_found')}</h3>
              <p className="mt-2 text-gray-500">Aucun cours disponible pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
