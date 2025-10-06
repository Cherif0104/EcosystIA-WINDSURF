import { supabase } from '../src/lib/supabase.js';
import { User, Role } from '../types';

// Service de sécurité avancé pour SENEGEL
class SupabaseSecurityService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 heures

  private loginAttempts = new Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }>();
  private activeSessions = new Map<string, { userId: string; lastActivity: Date; ip: string }>();

  // Vérification des tentatives de connexion
  async checkLoginAttempts(email: string, ip: string): Promise<{
    allowed: boolean;
    remainingAttempts: number;
    lockoutTime?: Date;
  }> {
    const key = `${email}_${ip}`;
    const attempt = this.loginAttempts.get(key);

    if (!attempt) {
      return { allowed: true, remainingAttempts: this.MAX_LOGIN_ATTEMPTS };
    }

    // Vérifier si l'utilisateur est verrouillé
    if (attempt.lockedUntil && attempt.lockedUntil > new Date()) {
      return {
        allowed: false,
        remainingAttempts: 0,
        lockoutTime: attempt.lockedUntil
      };
    }

    // Réinitialiser si le verrouillage a expiré
    if (attempt.lockedUntil && attempt.lockedUntil <= new Date()) {
      this.loginAttempts.delete(key);
      return { allowed: true, remainingAttempts: this.MAX_LOGIN_ATTEMPTS };
    }

    return {
      allowed: attempt.count < this.MAX_LOGIN_ATTEMPTS,
      remainingAttempts: Math.max(0, this.MAX_LOGIN_ATTEMPTS - attempt.count)
    };
  }

  // Enregistrement d'une tentative de connexion
  async recordLoginAttempt(email: string, ip: string, success: boolean): Promise<void> {
    const key = `${email}_${ip}`;
    const attempt = this.loginAttempts.get(key) || { count: 0, lastAttempt: new Date() };

    if (success) {
      // Réinitialiser les tentatives en cas de succès
      this.loginAttempts.delete(key);
      return;
    }

    attempt.count++;
    attempt.lastAttempt = new Date();

    // Verrouiller après le nombre maximum de tentatives
    if (attempt.count >= this.MAX_LOGIN_ATTEMPTS) {
      attempt.lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
    }

    this.loginAttempts.set(key, attempt);

    // Log de sécurité
    await this.logSecurityEvent('failed_login', {
      email,
      ip,
      attempts: attempt.count,
      locked: attempt.count >= this.MAX_LOGIN_ATTEMPTS
    });
  }

  // Vérification de la session
  async validateSession(sessionId: string, ip: string): Promise<{
    valid: boolean;
    userId?: string;
    reason?: string;
  }> {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }

    // Vérifier l'IP
    if (session.ip !== ip) {
      await this.logSecurityEvent('session_ip_mismatch', {
        sessionId,
        expectedIp: session.ip,
        actualIp: ip,
        userId: session.userId
      });
      return { valid: false, reason: 'IP mismatch' };
    }

    // Vérifier le timeout de session
    const now = new Date();
    const sessionAge = now.getTime() - session.lastActivity.getTime();

    if (sessionAge > this.SESSION_TIMEOUT) {
      this.activeSessions.delete(sessionId);
      await this.logSecurityEvent('session_timeout', {
        sessionId,
        userId: session.userId,
        sessionAge
      });
      return { valid: false, reason: 'Session expired' };
    }

    // Mettre à jour la dernière activité
    session.lastActivity = now;
    this.activeSessions.set(sessionId, session);

    return { valid: true, userId: session.userId };
  }

  // Création d'une session sécurisée
  async createSecureSession(userId: string, ip: string): Promise<string> {
    const sessionId = this.generateSecureSessionId();
    
    this.activeSessions.set(sessionId, {
      userId,
      lastActivity: new Date(),
      ip
    });

    await this.logSecurityEvent('session_created', {
      sessionId,
      userId,
      ip
    });

    return sessionId;
  }

  // Suppression d'une session
  async destroySession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    
    if (session) {
      await this.logSecurityEvent('session_destroyed', {
        sessionId,
        userId: session.userId
      });
    }

    this.activeSessions.delete(sessionId);
  }

  // Vérification des permissions
  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('role, permissions')
        .eq('id', userId)
        .single();

      if (!user) return false;

      // Vérifier les permissions basées sur le rôle
      const rolePermissions = this.getRolePermissions(user.role as Role);
      
      if (rolePermissions.includes('*')) return true; // Super admin
      
      const resourcePermission = `${resource}:${action}`;
      return rolePermissions.includes(resourcePermission);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  // Obtenir les permissions par rôle
  private getRolePermissions(role: Role): string[] {
    const permissions: Record<Role, string[]> = {
      'super_administrator': ['*'],
      'administrator': [
        'users:read', 'users:write', 'users:delete',
        'projects:read', 'projects:write', 'projects:delete',
        'courses:read', 'courses:write', 'courses:delete',
        'crm:read', 'crm:write', 'crm:delete',
        'finance:read', 'finance:write', 'finance:delete',
        'analytics:read'
      ],
      'manager': [
        'users:read',
        'projects:read', 'projects:write',
        'courses:read', 'courses:write',
        'crm:read', 'crm:write',
        'finance:read', 'finance:write',
        'analytics:read'
      ],
      'employee': [
        'projects:read',
        'courses:read', 'courses:write',
        'crm:read',
        'finance:read'
      ],
      'student': [
        'courses:read',
        'profile:read', 'profile:write'
      ]
    };

    return permissions[role] || [];
  }

  // Log d'événement de sécurité
  private async logSecurityEvent(event: string, details: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('system_logs')
        .insert({
          user_id: user?.id || null,
          user_email: user?.email || 'system',
          user_role: user?.user_metadata?.role || 'system',
          module: 'security',
          action: event,
          severity: this.getSecuritySeverity(event),
          details: JSON.stringify(details),
          ip_address: await this.getClientIP()
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Obtenir la sévérité d'un événement de sécurité
  private getSecuritySeverity(event: string): 'info' | 'warning' | 'error' | 'critical' {
    const criticalEvents = ['failed_login', 'session_ip_mismatch', 'unauthorized_access'];
    const errorEvents = ['session_timeout', 'permission_denied'];
    const warningEvents = ['session_created', 'session_destroyed'];

    if (criticalEvents.includes(event)) return 'critical';
    if (errorEvents.includes(event)) return 'error';
    if (warningEvents.includes(event)) return 'warning';
    return 'info';
  }

  // Obtenir l'IP du client
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  // Génération d'un ID de session sécurisé
  private generateSecureSessionId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Audit des sessions actives
  async auditActiveSessions(): Promise<{
    totalSessions: number;
    expiredSessions: number;
    suspiciousSessions: number;
  }> {
    const now = new Date();
    let expiredSessions = 0;
    let suspiciousSessions = 0;

    for (const [sessionId, session] of this.activeSessions.entries()) {
      const sessionAge = now.getTime() - session.lastActivity.getTime();
      
      if (sessionAge > this.SESSION_TIMEOUT) {
        expiredSessions++;
        this.activeSessions.delete(sessionId);
      } else if (sessionAge > this.SESSION_TIMEOUT * 0.8) {
        suspiciousSessions++;
      }
    }

    return {
      totalSessions: this.activeSessions.size,
      expiredSessions,
      suspiciousSessions
    };
  }

  // Nettoyage des sessions expirées
  async cleanupExpiredSessions(): Promise<number> {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.activeSessions.entries()) {
      const sessionAge = now.getTime() - session.lastActivity.getTime();
      
      if (sessionAge > this.SESSION_TIMEOUT) {
        this.activeSessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      await this.logSecurityEvent('session_cleanup', {
        cleanedCount,
        remainingSessions: this.activeSessions.size
      });
    }

    return cleanedCount;
  }

  // Obtenir les statistiques de sécurité
  getSecurityStats(): {
    activeSessions: number;
    failedLoginAttempts: number;
    lockedAccounts: number;
  } {
    const activeSessions = this.activeSessions.size;
    const failedLoginAttempts = Array.from(this.loginAttempts.values())
      .reduce((sum, attempt) => sum + attempt.count, 0);
    const lockedAccounts = Array.from(this.loginAttempts.values())
      .filter(attempt => attempt.lockedUntil && attempt.lockedUntil > new Date()).length;

    return {
      activeSessions,
      failedLoginAttempts,
      lockedAccounts
    };
  }
}

export default new SupabaseSecurityService();
