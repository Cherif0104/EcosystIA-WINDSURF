// Service de logs simplifié - version temporaire
export const logService = {
  createLog: async (log: any) => {
    console.log('Log créé:', log);
    return { id: Date.now(), ...log };
  },
  
  getLogs: async () => {
    console.log('Récupération des logs');
    return [];
  },
  
  logAuth: async (user: any, action: string, details?: string) => {
    console.log('Log auth:', { user: user?.email, action, details });
  },
  
  logUserManagement: async (user: any, action: string, targetUser?: any, details?: string) => {
    console.log('Log user management:', { user: user?.email, action, details });
  },
  
  logCourse: async (user: any, action: string, courseId?: string, details?: string) => {
    console.log('Log course:', { user: user?.email, action, details });
  },
  
  logProject: async (user: any, action: string, projectId?: string, details?: string) => {
    console.log('Log project:', { user: user?.email, action, details });
  },
  
  logError: async (user: any, error: Error, module: string, details?: string) => {
    console.log('Log error:', { user: user?.email, error: error.message, module, details });
  }
};
