import { supabase } from '../src/lib/supabase.js';
import { User } from '../types';

// Service de monitoring et performance pour SENEGEL
class SupabaseMonitoringService {
  private metrics = {
    requests: 0,
    errors: 0,
    averageResponseTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    lastError: null as string | null,
    lastErrorTime: null as Date | null
  };

  private performanceObserver: PerformanceObserver | null = null;

  constructor() {
    this.initializePerformanceMonitoring();
  }

  // Initialisation du monitoring des performances
  private initializePerformanceMonitoring(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('supabase')) {
            this.recordPerformanceMetric(entry);
          }
        }
      });
      
      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
    }
  }

  // Enregistrement des métriques de performance
  private recordPerformanceMetric(entry: PerformanceEntry): void {
    this.metrics.requests++;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.requests - 1) + entry.duration) / this.metrics.requests;
  }

  // Enregistrement d'une erreur
  recordError(error: string): void {
    this.metrics.errors++;
    this.metrics.lastError = error;
    this.metrics.lastErrorTime = new Date();
    
    // Log dans Supabase
    this.logErrorToSupabase(error);
  }

  // Enregistrement d'un hit de cache
  recordCacheHit(): void {
    this.metrics.cacheHits++;
  }

  // Enregistrement d'un miss de cache
  recordCacheMiss(): void {
    this.metrics.cacheMisses++;
  }

  // Log d'erreur dans Supabase
  private async logErrorToSupabase(error: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('system_logs')
        .insert({
          user_id: user?.id || null,
          user_email: user?.email || 'system',
          user_role: user?.user_metadata?.role || 'system',
          module: 'monitoring',
          action: 'error',
          severity: 'error',
          details: error,
          ip_address: await this.getClientIP()
        });
    } catch (logError) {
      console.error('Failed to log error to Supabase:', logError);
    }
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

  // Obtenir les métriques actuelles
  getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }

  // Obtenir les métriques de performance
  getPerformanceMetrics(): {
    requests: number;
    errors: number;
    errorRate: number;
    averageResponseTime: number;
    cacheHitRate: number;
    uptime: number;
  } {
    const errorRate = this.metrics.requests > 0 ? (this.metrics.errors / this.metrics.requests) * 100 : 0;
    const cacheHitRate = (this.metrics.cacheHits + this.metrics.cacheMisses) > 0 
      ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100 
      : 0;

    return {
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      errorRate: Math.round(errorRate * 100) / 100,
      averageResponseTime: Math.round(this.metrics.averageResponseTime * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      uptime: this.getUptime()
    };
  }

  // Obtenir le temps de fonctionnement
  private getUptime(): number {
    return Date.now() - (window.performance?.timeOrigin || Date.now());
  }

  // Vérifier la santé de Supabase
  async checkSupabaseHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    error?: string;
  }> {
    const startTime = performance.now();
    
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('count')
        .limit(1);

      const responseTime = performance.now() - startTime;

      if (error) {
        this.recordError(`Supabase health check failed: ${error.message}`);
        return {
          status: 'unhealthy',
          responseTime,
          error: error.message
        };
      }

      if (responseTime > 5000) {
        return {
          status: 'degraded',
          responseTime
        };
      }

      return {
        status: 'healthy',
        responseTime
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.recordError(`Supabase health check error: ${error}`);
      return {
        status: 'unhealthy',
        responseTime,
        error: String(error)
      };
    }
  }

  // Monitoring des requêtes en temps réel
  async monitorRealtimeQueries(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Écouter les changements dans les logs système
      supabase
        .channel('system_logs_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'system_logs' 
          }, 
          (payload) => {
            console.log('System logs change detected:', payload);
            this.recordPerformanceMetric({
              name: 'realtime_query',
              duration: 0,
              startTime: performance.now(),
              entryType: 'measure'
            });
          }
        )
        .subscribe();
    } catch (error) {
      this.recordError(`Realtime monitoring error: ${error}`);
    }
  }

  // Générer un rapport de performance
  async generatePerformanceReport(): Promise<{
    summary: string;
    recommendations: string[];
    metrics: any;
  }> {
    const metrics = this.getPerformanceMetrics();
    const health = await this.checkSupabaseHealth();
    
    let summary = `Rapport de performance EcosystIA - ${new Date().toLocaleDateString('fr-FR')}\n\n`;
    summary += `📊 Métriques générales:\n`;
    summary += `- Requêtes totales: ${metrics.requests}\n`;
    summary += `- Erreurs: ${metrics.errors}\n`;
    summary += `- Taux d'erreur: ${metrics.errorRate}%\n`;
    summary += `- Temps de réponse moyen: ${metrics.averageResponseTime}ms\n`;
    summary += `- Taux de hit cache: ${metrics.cacheHitRate}%\n`;
    summary += `- Statut Supabase: ${health.status}\n`;
    summary += `- Temps de réponse Supabase: ${health.responseTime}ms\n\n`;

    const recommendations: string[] = [];

    if (metrics.errorRate > 5) {
      recommendations.push('🚨 Taux d\'erreur élevé - Vérifiez la connectivité et les requêtes');
    }

    if (metrics.averageResponseTime > 2000) {
      recommendations.push('⏱️ Temps de réponse lent - Optimisez les requêtes et activez le cache');
    }

    if (metrics.cacheHitRate < 50) {
      recommendations.push('💾 Taux de hit cache faible - Améliorez la stratégie de cache');
    }

    if (health.status !== 'healthy') {
      recommendations.push('🔧 Problème de connectivité Supabase - Vérifiez la configuration');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Performance optimale - Aucune action requise');
    }

    return {
      summary,
      recommendations,
      metrics: {
        ...metrics,
        health
      }
    };
  }

  // Nettoyage des métriques
  resetMetrics(): void {
    this.metrics = {
      requests: 0,
      errors: 0,
      averageResponseTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      lastError: null,
      lastErrorTime: null
    };
  }

  // Nettoyage des ressources
  cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

export default new SupabaseMonitoringService();
