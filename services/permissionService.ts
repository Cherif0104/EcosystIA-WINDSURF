import { Role } from '../types';

export interface ModulePermission {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManage: boolean;
}

export interface RoleModulePermissions {
  [role: string]: {
    [module: string]: ModulePermission;
  };
}

class PermissionService {
  private permissions: RoleModulePermissions = {};
  private readonly STORAGE_KEY = 'ecosystia_permissions';

  constructor() {
    this.loadPermissions();
    if (Object.keys(this.permissions).length === 0) {
      this.initializeDefaultPermissions();
    }
  }

  private initializeDefaultPermissions() {
    const modules = [
      'dashboard', 'projects', 'goals', 'courses', 'jobs', 'time_tracking',
      'leave_management', 'finance', 'crm_sales', 'knowledge_base',
      'development', 'tools', 'ai_coach', 'gen_ai_lab', 'analytics',
      'user_management', 'settings', 'super_admin'
    ];

    const roles: Role[] = [
      'super_administrator', 'administrator', 'manager', 'supervisor',
      'student', 'trainer', 'teacher', 'entrepreneur', 'employer',
      'funder', 'mentor', 'coach', 'facilitator', 'publisher',
      'producer', 'artist', 'editor', 'implementer', 'intern', 'alumni'
    ];

    roles.forEach(role => {
      this.permissions[role] = {};
      modules.forEach(module => {
        this.permissions[role][module] = this.getDefaultPermissions(role, module);
      });
    });

    this.savePermissions();
  }

  private getDefaultPermissions(role: Role, module: string): ModulePermission {
    // Super Admin a tout
    if (role === 'super_administrator') {
      return { canView: true, canCreate: true, canUpdate: true, canDelete: true, canManage: true };
    }

    // Admin a presque tout sauf super_admin
    if (role === 'administrator') {
      if (module === 'super_admin') {
        return { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false };
      }
      return { canView: true, canCreate: true, canUpdate: true, canDelete: true, canManage: true };
    }

    // Permissions par rôle et module
    const roleModulePermissions: { [key: string]: { [key: string]: ModulePermission } } = {
      manager: {
        dashboard: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        projects: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        goals: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        courses: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        jobs: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        time_tracking: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        leave_management: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: true },
        finance: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        crm_sales: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        knowledge_base: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        development: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        tools: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        ai_coach: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        gen_ai_lab: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        analytics: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        user_management: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        settings: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: false },
        super_admin: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false }
      },
      student: {
        dashboard: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        projects: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        goals: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        courses: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        jobs: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        time_tracking: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: false },
        leave_management: { canView: true, canCreate: true, canUpdate: false, canDelete: false, canManage: false },
        finance: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        crm_sales: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        knowledge_base: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        development: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        tools: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        ai_coach: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        gen_ai_lab: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        analytics: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        user_management: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        settings: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: false },
        super_admin: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false }
      },
      mentor: {
        dashboard: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        projects: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        goals: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        courses: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        jobs: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        time_tracking: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: false },
        leave_management: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        finance: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        crm_sales: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        knowledge_base: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        development: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        tools: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        ai_coach: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        gen_ai_lab: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        analytics: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        user_management: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        settings: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: false },
        super_admin: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false }
      },
      supervisor: {
        dashboard: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        projects: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        goals: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        courses: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        jobs: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        time_tracking: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        leave_management: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        finance: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        crm_sales: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        knowledge_base: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        development: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        tools: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        ai_coach: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        gen_ai_lab: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        analytics: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        user_management: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        settings: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: false },
        super_admin: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false }
      },
      trainer: {
        dashboard: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        projects: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        goals: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        courses: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        jobs: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        time_tracking: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: false },
        leave_management: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        finance: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        crm_sales: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        knowledge_base: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        development: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        tools: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        ai_coach: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        gen_ai_lab: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        analytics: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        user_management: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        settings: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: false },
        super_admin: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false }
      },
      teacher: {
        dashboard: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        projects: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        goals: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        courses: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        jobs: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        time_tracking: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: false },
        leave_management: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        finance: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        crm_sales: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        knowledge_base: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        development: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        tools: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        ai_coach: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        gen_ai_lab: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        analytics: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        user_management: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        settings: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: false },
        super_admin: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false }
      },
      entrepreneur: {
        dashboard: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        projects: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        goals: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        courses: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        jobs: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        time_tracking: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: false },
        leave_management: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: false },
        finance: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        crm_sales: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        knowledge_base: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        development: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        tools: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        ai_coach: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        gen_ai_lab: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        analytics: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        user_management: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        settings: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: false },
        super_admin: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false }
      },
      employer: {
        dashboard: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        projects: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        goals: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        courses: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        jobs: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        time_tracking: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        leave_management: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        finance: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        crm_sales: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        knowledge_base: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        development: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        tools: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        ai_coach: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        gen_ai_lab: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        analytics: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        user_management: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        settings: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: false },
        super_admin: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false }
      },
      funder: {
        dashboard: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        projects: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        goals: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        courses: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        jobs: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        time_tracking: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        leave_management: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        finance: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        crm_sales: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        knowledge_base: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        development: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        tools: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        ai_coach: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        gen_ai_lab: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        analytics: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        user_management: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        settings: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: false },
        super_admin: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false }
      },
      coach: {
        dashboard: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        projects: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        goals: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        courses: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        jobs: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        time_tracking: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: false },
        leave_management: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        finance: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        crm_sales: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        knowledge_base: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        development: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        tools: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        ai_coach: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        gen_ai_lab: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        analytics: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        user_management: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        settings: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: false },
        super_admin: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false }
      },
      facilitator: {
        dashboard: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        projects: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        goals: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        courses: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        jobs: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        time_tracking: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: false },
        leave_management: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        finance: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        crm_sales: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        knowledge_base: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        development: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        tools: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        ai_coach: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        gen_ai_lab: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        analytics: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        user_management: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        settings: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: false },
        super_admin: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false }
      },
      publisher: {
        dashboard: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        projects: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        goals: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        courses: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        jobs: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        time_tracking: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: false },
        leave_management: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        finance: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        crm_sales: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        knowledge_base: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        development: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        tools: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        ai_coach: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        gen_ai_lab: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        analytics: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        user_management: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        settings: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: false },
        super_admin: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false }
      },
      producer: {
        dashboard: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        projects: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        goals: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        courses: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        jobs: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        time_tracking: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: false },
        leave_management: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        finance: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        crm_sales: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        knowledge_base: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        development: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        tools: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        ai_coach: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        gen_ai_lab: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        analytics: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        user_management: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        settings: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: false },
        super_admin: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false }
      },
      artist: {
        dashboard: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        projects: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        goals: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        courses: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        jobs: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        time_tracking: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: false },
        leave_management: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        finance: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        crm_sales: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        knowledge_base: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        development: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        tools: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        ai_coach: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        gen_ai_lab: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        analytics: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        user_management: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        settings: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: false },
        super_admin: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false }
      },
      editor: {
        dashboard: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        projects: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        goals: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        courses: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        jobs: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        time_tracking: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: false },
        leave_management: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        finance: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        crm_sales: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        knowledge_base: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        development: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        tools: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        ai_coach: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        gen_ai_lab: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        analytics: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        user_management: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        settings: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: false },
        super_admin: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false }
      },
      implementer: {
        dashboard: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        projects: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        goals: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        courses: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        jobs: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        time_tracking: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: false },
        leave_management: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        finance: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        crm_sales: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        knowledge_base: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: true },
        development: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        tools: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        ai_coach: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        gen_ai_lab: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        analytics: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        user_management: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        settings: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: false },
        super_admin: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false }
      },
      intern: {
        dashboard: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        projects: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        goals: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        courses: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        jobs: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        time_tracking: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canManage: false },
        leave_management: { canView: true, canCreate: true, canUpdate: false, canDelete: false, canManage: false },
        finance: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        crm_sales: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        knowledge_base: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        development: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        tools: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        ai_coach: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        gen_ai_lab: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        analytics: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        user_management: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        settings: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: false },
        super_admin: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false }
      },
      alumni: {
        dashboard: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        projects: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        goals: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        courses: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        jobs: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        time_tracking: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        leave_management: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        finance: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        crm_sales: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        knowledge_base: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        development: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        tools: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        ai_coach: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        gen_ai_lab: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        analytics: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        user_management: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false },
        settings: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canManage: false },
        super_admin: { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false }
      }
      // Ajouter d'autres rôles selon les besoins
    };

    return roleModulePermissions[role]?.[module] || 
           { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false };
  }

  public getPermissions(role: Role, module: string): ModulePermission {
    return this.permissions[role]?.[module] || 
           { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false };
  }

  public setPermission(role: Role, module: string, permission: keyof ModulePermission, value: boolean) {
    if (!this.permissions[role]) {
      this.permissions[role] = {};
    }
    if (!this.permissions[role][module]) {
      this.permissions[role][module] = { canView: false, canCreate: false, canUpdate: false, canDelete: false, canManage: false };
    }
    
    this.permissions[role][module][permission] = value;
    this.savePermissions();
  }

  public setAllPermissions(role: Role, module: string, value: boolean) {
    if (!this.permissions[role]) {
      this.permissions[role] = {};
    }
    
    this.permissions[role][module] = {
      canView: value,
      canCreate: value,
      canUpdate: value,
      canDelete: value,
      canManage: value
    };
    this.savePermissions();
  }

  public getAllPermissions(): RoleModulePermissions {
    return this.permissions;
  }

  public canAccess(role: Role, module: string, action: keyof ModulePermission): boolean {
    return this.getPermissions(role, module)[action];
  }

  private savePermissions() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.permissions));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des permissions:', error);
    }
  }

  private loadPermissions() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.permissions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des permissions:', error);
      this.permissions = {};
    }
  }

  public resetToDefaults() {
    this.permissions = {};
    this.initializeDefaultPermissions();
  }

  public exportPermissions() {
    return JSON.stringify(this.permissions, null, 2);
  }

  public importPermissions(permissionsJson: string) {
    try {
      this.permissions = JSON.parse(permissionsJson);
      this.savePermissions();
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import des permissions:', error);
      return false;
    }
  }
}

export const permissionService = new PermissionService();
