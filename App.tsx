import React, { useState, useEffect } from 'react';
import { QueryProvider } from './providers/QueryProvider';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { useLocalization, LocalizationProvider } from './contexts/LocalizationContext';
import ToastComponent from './components/common/Toast';
import env from './config/environment';

// Import des données mock (à supprimer progressivement)
import { mockCourses, mockJobs, mockProjects, mockGoals, mockContacts, mockDocuments, mockAllUsers, mockTimeLogs, mockLeaveRequests, mockInvoices, mockExpenses, mockRecurringInvoices, mockRecurringExpenses, mockBudgets, mockMeetings } from './constants/data';
import { Course, Job, Project, Objective, Contact, Document, User, Role, TimeLog, LeaveRequest, Invoice, Expense, AppNotification, RecurringInvoice, RecurringExpense, RecurrenceFrequency, Budget, Meeting } from './types';

import Login from './components/Login';
import Signup from './components/Signup';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Courses from './components/Courses';
import Jobs from './components/Jobs';
import AICoach from './components/AICoach';
import Settings from './components/Settings';
import Projects from './components/Projects';
import GenAILab from './components/GenAILab';
import CourseDetail from './components/CourseDetail';
import CourseManagement from './components/CourseManagement';
import Analytics from './components/Analytics';
import TalentAnalytics from './components/TalentAnalytics';
import Goals from './components/Goals';
import CRM from './components/CRM';
import KnowledgeBase from './components/KnowledgeBase';
import CreateJob from './components/CreateJob';
import UserManagement from './components/UserManagement';
import AIAgent from './components/AIAgent';
import TimeTracking from './components/TimeTracking';
import LeaveManagement from './components/LeaveManagement';
import Finance from './components/Finance';


// Composant principal de l'application
const AppContent: React.FC = () => {
  const { user, login } = useAuth();
  const { t } = useLocalization();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // Lifted State
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [objectives, setObjectives] = useState<Objective[]>(mockGoals);
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [users, setUsers] = useState<User[]>(mockAllUsers);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>(mockTimeLogs);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>(mockRecurringInvoices);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(mockRecurringExpenses);
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings);
  const [reminderDays, setReminderDays] = useState<number>(3);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);


  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  
    // --- Recurring Item Generation ---
    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newInvoices: Invoice[] = [];
        const updatedRecurringInvoices = recurringInvoices.map(ri => {
            const lastGen = new Date(ri.lastGeneratedDate);
            const nextGen = new Date(lastGen);
            if (ri.frequency === 'Monthly') nextGen.setMonth(nextGen.getMonth() + 1);
            else if (ri.frequency === 'Quarterly') nextGen.setMonth(nextGen.getMonth() + 3);
            else if (ri.frequency === 'Annually') nextGen.setFullYear(nextGen.getFullYear() + 1);

            if (today >= nextGen && (!ri.endDate || today <= new Date(ri.endDate))) {
                newInvoices.push({
                    id: Date.now() + Math.random(),
                    invoiceNumber: `INV-${Date.now().toString().slice(-5)}`,
                    clientName: ri.clientName,
                    amount: ri.amount,
                    dueDate: nextGen.toISOString().split('T')[0],
                    status: 'Sent',
                    recurringSourceId: ri.id,
                });
                return { ...ri, lastGeneratedDate: today.toISOString().split('T')[0] };
            }
            return ri;
        });

        if (newInvoices.length > 0) {
            setInvoices(prev => [...prev, ...newInvoices]);
            setRecurringInvoices(updatedRecurringInvoices);
        }

        const newExpenses: Expense[] = [];
        const updatedRecurringExpenses = recurringExpenses.map(re => {
            const lastGen = new Date(re.lastGeneratedDate);
            const nextGen = new Date(lastGen);
            if (re.frequency === 'Monthly') nextGen.setMonth(nextGen.getMonth() + 1);
            else if (re.frequency === 'Quarterly') nextGen.setMonth(nextGen.getMonth() + 3);
            else if (re.frequency === 'Annually') nextGen.setFullYear(nextGen.getFullYear() + 1);

            if (today >= nextGen && (!re.endDate || today <= new Date(re.endDate))) {
                 newExpenses.push({
                    id: Date.now() + Math.random(),
                    category: re.category,
                    description: re.description,
                    amount: re.amount,
                    date: today.toISOString().split('T')[0],
                    dueDate: nextGen.toISOString().split('T')[0],
                    status: 'Unpaid',
                    recurringSourceId: re.id,
                });
                return { ...re, lastGeneratedDate: today.toISOString().split('T')[0] };
            }
            return re;
        });

        if (newExpenses.length > 0) {
            setExpenses(prev => [...prev, ...newExpenses]);
            setRecurringExpenses(updatedRecurringExpenses);
        }

    }, []); // Run only on app load


  // --- Notification Generation ---
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newNotifications: AppNotification[] = [];

    invoices.forEach(inv => {
        if (inv.status === 'Paid') return;
        const dueDate = new Date(inv.dueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= reminderDays) {
            newNotifications.push({
                id: `inv-${inv.id}`,
                message: t('invoice_due_reminder').replace('{invoiceNumber}', inv.invoiceNumber).replace('{dueDate}', inv.dueDate),
                date: inv.dueDate,
                entityType: 'invoice',
                entityId: inv.id,
                isRead: false
            });
        }
    });

    expenses.forEach(exp => {
        if (!exp.dueDate) return;
        const dueDate = new Date(exp.dueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= reminderDays) {
            newNotifications.push({
                id: `exp-${exp.id}`,
                message: t('expense_due_reminder').replace('{description}', exp.description).replace('{dueDate}', exp.dueDate),
                date: exp.dueDate,
                entityType: 'expense',
                entityId: exp.id,
                isRead: false
            });
        }
    });

    setNotifications(newNotifications.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

  }, [invoices, expenses, reminderDays, t]);

  // --- Signup Handler ---
  const handleUserSignup = (signupData: Omit<User, 'id' | 'avatar' | 'skills'>) => {
    const newUser: User = {
      id: Date.now(),
      ...signupData,
      avatar: `https://picsum.photos/seed/${Date.now()}/100/100`,
      skills: [],
    };
    setUsers(prev => [...prev, newUser]);
    login(newUser);
  };

  if (!user) {
    if (authView === 'signup') {
        return <Signup onSignup={handleUserSignup} onSwitchToLogin={() => setAuthView('login')} allUsers={users} />;
    }
    return <Login onSwitchToSignup={() => setAuthView('signup')} />;
  }

  // --- CRUD & State Handlers ---
  
    // NOTIFICATIONS
    const handleMarkNotificationAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const handleClearAllNotifications = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    // RECURRING INVOICES
    const handleAddRecurringInvoice = (data: Omit<RecurringInvoice, 'id'>) => setRecurringInvoices(prev => [{ ...data, id: Date.now() }, ...prev]);
    const handleUpdateRecurringInvoice = (updated: RecurringInvoice) => setRecurringInvoices(prev => prev.map(i => i.id === updated.id ? updated : i));
    const handleDeleteRecurringInvoice = (id: number) => setRecurringInvoices(prev => prev.filter(i => i.id !== id));

    // RECURRING EXPENSES
    const handleAddRecurringExpense = (data: Omit<RecurringExpense, 'id'>) => setRecurringExpenses(prev => [{ ...data, id: Date.now() }, ...prev]);
    const handleUpdateRecurringExpense = (updated: RecurringExpense) => setRecurringExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
    const handleDeleteRecurringExpense = (id: number) => setRecurringExpenses(prev => prev.filter(e => e.id !== id));


  // INVOICES
    const handleAddInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
        const newInvoice: Invoice = { ...invoiceData, id: Date.now() };
        setInvoices(prev => [newInvoice, ...prev]);
    };
    const handleUpdateInvoice = (updatedInvoice: Invoice) => {
        setInvoices(prev => prev.map(i => i.id === updatedInvoice.id ? updatedInvoice : i));
    };
    const handleDeleteInvoice = (invoiceId: number) => {
        setInvoices(prev => prev.filter(i => i.id !== invoiceId));
    };

    // EXPENSES
    const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
        const newExpense: Expense = { ...expenseData, id: Date.now() };
        setExpenses(prev => [newExpense, ...prev]);
    };
    const handleUpdateExpense = (updatedExpense: Expense) => {
        setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    };
    const handleDeleteExpense = (expenseId: number) => {
        setExpenses(prev => prev.filter(e => e.id !== expenseId));
    };
    
    // BUDGETS
    const handleAddBudget = (budgetData: Omit<Budget, 'id'>) => {
        const newBudget: Budget = { ...budgetData, id: Date.now() };
        setBudgets(prev => [newBudget, ...prev]);
    };
    const handleUpdateBudget = (updatedBudget: Budget) => {
        setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
    };
    const handleDeleteBudget = (budgetId: number) => {
        const budgetToDelete = budgets.find(b => b.id === budgetId);
        if (!budgetToDelete) return;
        
        const itemIdsToDelete = new Set<string>();
        budgetToDelete.budgetLines.forEach(line => {
            line.items.forEach(item => {
                itemIdsToDelete.add(item.id);
            });
        });

        // Unlink expenses from the deleted budget items
        setExpenses(prev => prev.map(e => 
            e.budgetItemId && itemIdsToDelete.has(e.budgetItemId) 
            ? { ...e, budgetItemId: undefined } 
            : e
        ));

        setBudgets(prev => prev.filter(b => b.id !== budgetId));
    };

  // MEETINGS
  const handleAddMeeting = (meetingData: Omit<Meeting, 'id'>) => {
      const newMeeting: Meeting = { ...meetingData, id: Date.now() };
      setMeetings(prev => [newMeeting, ...prev].sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
  };
  const handleUpdateMeeting = (updatedMeeting: Meeting) => {
      setMeetings(prev => prev.map(m => m.id === updatedMeeting.id ? updatedMeeting : m).sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
  };
  const handleDeleteMeeting = (meetingId: number) => {
      setMeetings(prev => prev.filter(m => m.id !== meetingId));
  };


  // LEAVE REQUESTS
  const handleAddLeaveRequest = (requestData: Omit<LeaveRequest, 'id' | 'userId' | 'userName' | 'userAvatar' | 'status'>) => {
    if (!user) return;
    const newRequest: LeaveRequest = {
      id: Date.now(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      status: 'Pending',
      ...requestData,
    };
    setLeaveRequests(prev => [newRequest, ...prev]);
  };

  const handleUpdateLeaveRequestStatus = (requestId: number, status: 'Approved' | 'Rejected') => {
      setLeaveRequests(prev => prev.map(req => req.id === requestId ? {...req, status} : req));
  }


  // TIME LOGS
  const handleAddTimeLog = (logData: Omit<TimeLog, 'id' | 'userId'>) => {
    if (!user) return;
    const newLog: TimeLog = {
      id: Date.now(),
      userId: user.id,
      ...logData,
    };
    setTimeLogs(prev => [newLog, ...prev]);
  };


  // USERS
  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    // Also update user in project teams if they are part of any
    setProjects(prevProjects => prevProjects.map(p => ({
        ...p,
        team: p.team.map(member => member.id === updatedUser.id ? updatedUser : member)
    })));
  };

  // JOBS
  const handleAddJob = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev]);
    handleSetView('jobs');
  };
  
  // PROJECTS
  const handleAddProject = (projectData: Omit<Project, 'id' | 'tasks' | 'risks'>) => {
      const newProject: Project = {
          id: Date.now(),
          ...projectData,
          tasks: [],
          risks: [],
      };
      setProjects(prev => [newProject, ...prev]);
  };
  
  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };
  
  const handleDeleteProject = (projectId: number) => {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      // Also delete related OKRs
      setObjectives(prev => prev.filter(o => o.projectId !== projectId));
  };

  // OBJECTIVES (OKRs)
  const handleSetObjectives = (newObjectives: Objective[]) => {
      setObjectives(newObjectives);
  };
  const handleAddObjective = (objectiveData: Omit<Objective, 'id'>) => {
      const newObjective: Objective = { ...objectiveData, id: `obj-${Date.now()}` };
      setObjectives(prev => [...prev, newObjective]);
  };
  const handleUpdateObjective = (updatedObjective: Objective) => {
      setObjectives(prev => prev.map(o => o.id === updatedObjective.id ? updatedObjective : o));
  };
  const handleDeleteObjective = (objectiveId: string) => {
      setObjectives(prev => prev.filter(o => o.id !== objectiveId));
  };


  // COURSES
  const handleAddCourse = (courseData: Omit<Course, 'id' | 'progress'>) => {
      const newCourse: Course = {
          id: Date.now(),
          progress: 0,
          ...courseData,
      };
      setCourses(prev => [newCourse, ...prev]);
  };
  const handleUpdateCourse = (updatedCourse: Course) => {
      setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };
  const handleDeleteCourse = (courseId: number) => {
      setCourses(prev => prev.filter(c => c.id !== courseId));
  };


  // CONTACTS (CRM)
  const handleAddContact = (contactData: Omit<Contact, 'id'>) => {
      const newContact: Contact = { ...contactData, id: Date.now() };
      setContacts(prev => [newContact, ...prev]);
  };
  const handleUpdateContact = (updatedContact: Contact) => {
      setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
  };
  const handleDeleteContact = (contactId: number) => {
      setContacts(prev => prev.filter(c => c.id !== contactId));
  };

  
  // DOCUMENTS (Knowledge Base)
  const handleAddDocument = (newDocument: Document) => {
      setDocuments(prev => [newDocument, ...prev]);
  }

  // --- View Management ---

  const handleSetView = (view: string) => {
    setCurrentView(view);
    if (view !== 'course_detail') {
      setSelectedCourseId(null);
    }
    if(window.innerWidth < 1024) { 
        setSidebarOpen(false);
    }
  }

  const handleSelectCourse = (id: number) => {
    setSelectedCourseId(id);
    setCurrentView('course_detail');
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard setView={handleSetView} projects={projects} courses={courses} jobs={jobs} timeLogs={timeLogs} leaveRequests={leaveRequests} invoices={invoices} expenses={expenses} />;
      case 'time_tracking':
        return <TimeTracking 
                    timeLogs={timeLogs} 
                    onAddTimeLog={handleAddTimeLog} 
                    projects={projects} 
                    courses={courses}
                    meetings={meetings}
                    users={users}
                    onAddMeeting={handleAddMeeting}
                    onUpdateMeeting={handleUpdateMeeting}
                    onDeleteMeeting={handleDeleteMeeting}
                />;
      case 'projects':
        return <Projects 
                    projects={projects} 
                    users={users}
                    timeLogs={timeLogs}
                    onUpdateProject={handleUpdateProject} 
                    onAddProject={handleAddProject}
                    onDeleteProject={handleDeleteProject}
                    onAddTimeLog={handleAddTimeLog}
                />;
      case 'goals_okrs':
        return <Goals 
                    projects={projects} 
                    objectives={objectives} 
                    setObjectives={handleSetObjectives} 
                    onAddObjective={handleAddObjective}
                    onUpdateObjective={handleUpdateObjective}
                    onDeleteObjective={handleDeleteObjective}
                />;
      case 'courses':
        return <Courses courses={courses} onSelectCourse={handleSelectCourse} />;
      case 'course_detail':
        const course = courses.find(c => c.id === selectedCourseId);
        return course ? <CourseDetail course={course} onBack={() => handleSetView('courses')} timeLogs={timeLogs} onAddTimeLog={handleAddTimeLog} projects={projects} onUpdateCourse={handleUpdateCourse} /> : <Courses courses={courses} onSelectCourse={handleSelectCourse}/>;
      case 'course_management':
          return <CourseManagement 
                    courses={courses} 
                    onAddCourse={handleAddCourse}
                    onUpdateCourse={handleUpdateCourse}
                    onDeleteCourse={handleDeleteCourse}
                  />;
      case 'jobs':
        return <Jobs jobs={jobs} setJobs={setJobs} setView={handleSetView}/>;
      case 'create_job':
        return <CreateJob onAddJob={handleAddJob} onBack={() => handleSetView('jobs')} />;
      case 'user_management':
        return <UserManagement users={users} onUpdateUser={handleUpdateUser} />;
      case 'crm_sales':
        return <CRM 
                    contacts={contacts} 
                    onAddContact={handleAddContact}
                    onUpdateContact={handleUpdateContact}
                    onDeleteContact={handleDeleteContact}
                />;
      case 'knowledge_base':
        return <KnowledgeBase documents={documents} onAddDocument={handleAddDocument} />;
      case 'leave_management':
        return <LeaveManagement 
                    leaveRequests={leaveRequests}
                    onAddLeaveRequest={handleAddLeaveRequest}
                    onUpdateLeaveRequestStatus={handleUpdateLeaveRequestStatus}
                />;
      case 'finance':
        return <Finance 
                    invoices={invoices}
                    expenses={expenses}
                    recurringInvoices={recurringInvoices}
                    recurringExpenses={recurringExpenses}
                    budgets={budgets}
                    projects={projects}
                    onAddInvoice={handleAddInvoice}
                    onUpdateInvoice={handleUpdateInvoice}
                    onDeleteInvoice={handleDeleteInvoice}
                    onAddExpense={handleAddExpense}
                    onUpdateExpense={handleUpdateExpense}
                    onDeleteExpense={handleDeleteExpense}
                    onAddRecurringInvoice={handleAddRecurringInvoice}
                    onUpdateRecurringInvoice={handleUpdateRecurringInvoice}
                    onDeleteRecurringInvoice={handleDeleteRecurringInvoice}
                    onAddRecurringExpense={handleAddRecurringExpense}
                    onUpdateRecurringExpense={handleUpdateRecurringExpense}
                    onDeleteRecurringExpense={handleDeleteRecurringExpense}
                    onAddBudget={handleAddBudget}
                    onUpdateBudget={handleUpdateBudget}
                    onDeleteBudget={handleDeleteBudget}
                />;
      case 'ai_coach':
        return <AICoach />;
      case 'gen_ai_lab':
        return <GenAILab />;
      case 'analytics':
        return <Analytics setView={handleSetView} />;
      case 'talent_analytics':
        return <TalentAnalytics setView={handleSetView} />;
      case 'settings':
        return <Settings reminderDays={reminderDays} onSetReminderDays={setReminderDays} />;
      default:
        return <Dashboard setView={handleSetView} projects={projects} courses={courses} jobs={jobs} timeLogs={timeLogs} leaveRequests={leaveRequests} invoices={invoices} expenses={expenses}/>;
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentView={currentView} setView={handleSetView} isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
            setView={handleSetView}
            notifications={notifications}
            onMarkNotificationAsRead={handleMarkNotificationAsRead}
            onClearAllNotifications={handleClearAllNotifications}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            {renderView()}
          </div>
        </main>
      </div>
       {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"></div>}
       <AIAgent currentView={currentView} />
       <ToastComponent />
    </div>
  );
};

// Composant App avec tous les providers
const App: React.FC = () => {
  return (
    <QueryProvider>
      <LocalizationProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LocalizationProvider>
    </QueryProvider>
  );
};

export default App;
