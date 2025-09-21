/**
 * Service CRM pour EcosystIA
 * Intégration complète avec l'API CRM Django
 */

import apiClient, { apiUtils } from './api';

export interface Contact {
  id: number;
  name: string;
  work_email: string;
  personal_email?: string;
  company: string;
  job_title?: string;
  status: 'Lead' | 'Contacted' | 'Prospect' | 'Customer' | 'Lost';
  status_display: string;
  source: 'Website' | 'Referral' | 'Social Media' | 'Email' | 'Phone' | 'Event' | 'Other';
  source_display: string;
  office_phone?: string;
  mobile_phone?: string;
  whatsapp_number?: string;
  address?: string;
  city?: string;
  country: string;
  avatar?: string;
  notes?: string;
  tags: string[];
  assigned_to?: User;
  created_by: User;
  interactions_count: number;
  deals_count: number;
  last_interaction?: any;
  days_since_last_contact?: number;
  created_at: string;
  updated_at: string;
  last_contact_date?: string;
}

export interface ContactInteraction {
  id: number;
  user: User;
  contact_name: string;
  type: 'Call' | 'Email' | 'Meeting' | 'WhatsApp' | 'LinkedIn' | 'Other';
  type_display: string;
  result: 'Positive' | 'Neutral' | 'Negative' | 'No Response';
  result_display: string;
  subject?: string;
  description: string;
  follow_up_date?: string;
  follow_up_notes?: string;
  duration?: number;
  created_at: string;
}

export interface Deal {
  id: number;
  name: string;
  description?: string;
  contact: string;
  contact_id?: number;
  user: User;
  stage: 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  stage_display: string;
  value: number;
  currency: string;
  probability: number;
  expected_value: number;
  expected_close_date?: string;
  actual_close_date?: string;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export const crmService = {
  /**
   * Contacts
   */
  contacts: {
    async list(params?: {
      page?: number;
      page_size?: number;
      search?: string;
      status?: string;
      source?: string;
      assigned_to?: number;
      company?: string;
      city?: string;
      has_phone?: boolean;
      no_contact_days?: number;
    }): Promise<{ results: Contact[]; count: number }> {
      try {
        const response = await apiClient.get('/crm/contacts/', { 
          params: apiUtils.getFilterParams(params || {})
        });
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async get(id: number): Promise<Contact> {
      try {
        const response = await apiClient.get<Contact>(`/crm/contacts/${id}/`);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async create(contactData: {
      name: string;
      work_email: string;
      company: string;
      job_title?: string;
      status?: string;
      source?: string;
      office_phone?: string;
      mobile_phone?: string;
      city?: string;
      country?: string;
      notes?: string;
      tags?: string[];
      assigned_to_id?: number;
    }): Promise<Contact> {
      try {
        const response = await apiClient.post<Contact>('/crm/contacts/', contactData);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async update(id: number, contactData: Partial<Contact>): Promise<Contact> {
      try {
        const response = await apiClient.patch<Contact>(`/crm/contacts/${id}/`, contactData);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async delete(id: number): Promise<void> {
      try {
        await apiClient.delete(`/crm/contacts/${id}/`);
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async import(file: File): Promise<{ 
      message: string; 
      imported_count: number; 
      errors: string[] 
    }> {
      try {
        const response = await apiUtils.uploadFile('/crm/contacts/import/', file);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async export(filters?: any): Promise<void> {
      try {
        const response = await apiClient.post('/crm/contacts/export/', {
          format: 'csv',
          filters
        }, {
          responseType: 'blob'
        });
        
        await apiUtils.downloadFile(
          URL.createObjectURL(response.data),
          `contacts_${new Date().toISOString().split('T')[0]}.csv`
        );
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async bulkAction(contactIds: number[], action: string, value?: any): Promise<{
      message: string;
      updated_count: number;
    }> {
      try {
        const response = await apiClient.post('/crm/contacts/bulk-action/', {
          contact_ids: contactIds,
          action,
          ...value
        });
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },
  },

  /**
   * Interactions
   */
  interactions: {
    async list(contactId: number): Promise<ContactInteraction[]> {
      try {
        const response = await apiClient.get<ContactInteraction[]>(`/crm/contacts/${contactId}/interactions/`);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async create(contactId: number, interactionData: {
      type: string;
      result: string;
      subject?: string;
      description: string;
      follow_up_date?: string;
      follow_up_notes?: string;
      duration?: number;
    }): Promise<ContactInteraction> {
      try {
        const response = await apiClient.post<ContactInteraction>(`/crm/contacts/${contactId}/interactions/`, interactionData);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async update(id: number, interactionData: Partial<ContactInteraction>): Promise<ContactInteraction> {
      try {
        const response = await apiClient.patch<ContactInteraction>(`/crm/interactions/${id}/`, interactionData);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },
  },

  /**
   * Opportunités (Deals)
   */
  deals: {
    async list(params?: {
      stage?: string;
      contact?: number;
      value_min?: number;
      value_max?: number;
      is_overdue?: boolean;
    }): Promise<Deal[]> {
      try {
        const response = await apiClient.get<Deal[]>('/crm/deals/', {
          params: apiUtils.getFilterParams(params || {})
        });
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async create(contactId: number, dealData: {
      name: string;
      description?: string;
      stage: string;
      value: number;
      currency?: string;
      probability: number;
      expected_close_date?: string;
    }): Promise<Deal> {
      try {
        const response = await apiClient.post<Deal>(`/crm/contacts/${contactId}/deals/`, dealData);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async update(id: number, dealData: Partial<Deal>): Promise<Deal> {
      try {
        const response = await apiClient.patch<Deal>(`/crm/deals/${id}/`, dealData);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },
  },

  /**
   * Statistiques CRM
   */
  async getStats(): Promise<{
    total_contacts: number;
    leads_count: number;
    prospects_count: number;
    customers_count: number;
    lost_count: number;
    total_interactions: number;
    total_deals: number;
    total_deal_value: number;
    won_deals_count: number;
    won_deals_value: number;
    avg_deal_value: number;
    conversion_rate: number;
    contacts_by_source: Record<string, number>;
    deals_by_stage: Record<string, number>;
  }> {
    try {
      const response = await apiClient.get('/crm/contacts/stats/');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Dashboard CRM
   */
  async getDashboardData(): Promise<{
    recent_contacts: Contact[];
    recent_interactions: ContactInteraction[];
    urgent_deals: Deal[];
    follow_up_contacts: Contact[];
  }> {
    try {
      const response = await apiClient.get('/crm/dashboard/');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },
};

export default crmService;
