/**
 * Service Time Tracking pour EcosystIA
 * Intégration complète avec l'API Time Tracking Django
 */

import apiClient, { apiUtils } from './api';

export interface TimeLog {
  id: number;
  user: User;
  entity_type: 'project' | 'course' | 'task' | 'meeting' | 'other';
  entity_type_display: string;
  entity_id: string;
  entity_title: string;
  date: string;
  duration: number; // en minutes
  hours_decimal: number;
  description: string;
  billable_amount: number;
  is_today: boolean;
  is_current_week: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeSession {
  id: number;
  user: User;
  entity_type: 'project' | 'course' | 'task' | 'meeting' | 'other';
  entity_type_display: string;
  entity_id: string;
  entity_title: string;
  start_time: string;
  end_time?: string;
  description?: string;
  is_active: boolean;
  is_billable: boolean;
  duration_minutes: number;
  duration_hours: number;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  duration: number;
  organizer: User;
  attendees: User[];
  location?: string;
  meeting_url?: string;
  agenda?: string;
  project?: number;
  project_title?: string;
  created_at: string;
  updated_at: string;
}

export interface TimeStats {
  today_hours: number;
  today_logs_count: number;
  week_hours: number;
  week_logs_count: number;
  month_hours: number;
  month_logs_count: number;
  time_by_entity: Array<{
    entity_type: string;
    entity_title: string;
    total_minutes: number;
    total_hours: number;
    logs_count: number;
  }>;
  active_sessions_count: number;
  meetings_today: number;
  meetings_week: number;
  pending_time_offs: number;
  approved_time_offs_this_month: number;
}

export const timeTrackingService = {
  /**
   * Logs de temps
   */
  logs: {
    async list(params?: {
      page?: number;
      page_size?: number;
      entity_type?: string;
      entity_id?: string;
      date_from?: string;
      date_to?: string;
      this_week?: boolean;
      this_month?: boolean;
      today?: boolean;
    }): Promise<{ results: TimeLog[]; count: number }> {
      try {
        const response = await apiClient.get('/time-tracking/logs/', { 
          params: apiUtils.getFilterParams(params || {})
        });
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async create(logData: {
      entity_type: string;
      entity_id: string;
      entity_title: string;
      date: string;
      duration: number;
      description: string;
    }): Promise<TimeLog> {
      try {
        const response = await apiClient.post<TimeLog>('/time-tracking/logs/', logData);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async update(id: number, logData: Partial<TimeLog>): Promise<TimeLog> {
      try {
        const response = await apiClient.patch<TimeLog>(`/time-tracking/logs/${id}/`, logData);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async delete(id: number): Promise<void> {
      try {
        await apiClient.delete(`/time-tracking/logs/${id}/`);
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async bulkCreate(timeLogs: Array<{
      entity_type: string;
      entity_id: string;
      entity_title: string;
      date: string;
      duration: number;
      description: string;
    }>): Promise<{
      message: string;
      created_count: number;
      errors: string[];
      created_logs: TimeLog[];
    }> {
      try {
        const response = await apiClient.post('/time-tracking/logs/bulk/', {
          time_logs: timeLogs
        });
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },
  },

  /**
   * Timer / Sessions actives
   */
  timer: {
    async getActiveSession(): Promise<{ active_session?: TimeSession; message: string }> {
      try {
        const response = await apiClient.get('/time-tracking/timer/');
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async startSession(sessionData: {
      entity_type: string;
      entity_id: string;
      entity_title: string;
      description?: string;
      is_billable?: boolean;
    }): Promise<{
      message: string;
      session: TimeSession;
    }> {
      try {
        const response = await apiClient.post('/time-tracking/timer/', sessionData);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async stopSession(description?: string): Promise<{
      message: string;
      time_log: TimeLog;
      duration_minutes: number;
    }> {
      try {
        const response = await apiClient.patch('/time-tracking/timer/', {
          description
        });
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async performAction(action: 'start' | 'stop' | 'pause' | 'resume', data?: {
      entity_type?: string;
      entity_id?: string;
      entity_title?: string;
      description?: string;
      is_billable?: boolean;
    }): Promise<{
      message: string;
      session?: TimeSession;
      time_log?: TimeLog;
      total_minutes?: number;
    }> {
      try {
        const response = await apiClient.post('/time-tracking/timer/action/', {
          action,
          ...data
        });
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },
  },

  /**
   * Réunions
   */
  meetings: {
    async list(params?: {
      today?: boolean;
      this_week?: boolean;
      upcoming?: boolean;
      organizer?: number;
      project?: number;
    }): Promise<Meeting[]> {
      try {
        const response = await apiClient.get<Meeting[]>('/time-tracking/meetings/', {
          params: apiUtils.getFilterParams(params || {})
        });
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async create(meetingData: {
      title: string;
      description?: string;
      start_time: string;
      end_time: string;
      attendee_ids?: number[];
      location?: string;
      meeting_url?: string;
      agenda?: string;
      project?: number;
    }): Promise<Meeting> {
      try {
        const response = await apiClient.post<Meeting>('/time-tracking/meetings/', meetingData);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async update(id: number, meetingData: Partial<Meeting>): Promise<Meeting> {
      try {
        const response = await apiClient.patch<Meeting>(`/time-tracking/meetings/${id}/`, meetingData);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },
  },

  /**
   * Rapports
   */
  reports: {
    async getWeeklyReport(weekStart?: string): Promise<{
      week_start: string;
      week_end: string;
      total_hours: number;
      daily_breakdown: Array<{
        date: string;
        weekday: string;
        hours: number;
        logs_count: number;
      }>;
      entity_breakdown: Array<{
        entity_type: string;
        entity_title: string;
        total_hours: number;
        logs_count: number;
      }>;
      billable_hours: number;
      non_billable_hours: number;
    }> {
      try {
        const response = await apiClient.get('/time-tracking/reports/weekly/', {
          params: weekStart ? { week_start: weekStart } : {}
        });
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async getMonthlyReport(year?: number, month?: number): Promise<{
      month: string;
      year: number;
      total_hours: number;
      working_days: number;
      average_daily_hours: number;
      weekly_breakdown: Array<{
        week_start: string;
        week_end: string;
        hours: number;
        logs_count: number;
      }>;
      project_breakdown: Array<{
        entity_title: string;
        total_hours: number;
        logs_count: number;
      }>;
      overtime_hours: number;
      time_off_days: number;
    }> {
      try {
        const response = await apiClient.get('/time-tracking/reports/monthly/', {
          params: { year, month }
        });
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },
  },

  /**
   * Statistiques
   */
  async getStats(): Promise<TimeStats> {
    try {
      const response = await apiClient.get<TimeStats>('/time-tracking/stats/');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Dashboard
   */
  async getDashboardData(): Promise<{
    active_session?: TimeSession;
    recent_logs: TimeLog[];
    today_meetings: Meeting[];
    upcoming_meetings: Meeting[];
    pending_time_offs: any[];
  }> {
    try {
      const response = await apiClient.get('/time-tracking/dashboard/');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Vue d'équipe (managers)
   */
  async getTeamOverview(): Promise<{
    team_stats: Array<{
      user: {
        id: number;
        full_name: string;
        avatar?: string;
        role: string;
      };
      week_hours: number;
      has_active_session: boolean;
      last_activity?: string;
    }>;
    week_start: string;
    total_team_hours: number;
    active_members: number;
  }> {
    try {
      const response = await apiClient.get('/time-tracking/team-overview/');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },
};

export default timeTrackingService;
