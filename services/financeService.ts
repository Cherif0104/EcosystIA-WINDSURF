/**
 * Service Finance pour EcosystIA
 * Intégration complète avec l'API Finance Django
 */

import apiClient, { apiUtils } from './api';

export interface Invoice {
  id: number;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  client_address?: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Partially Paid' | 'Cancelled';
  status_display: string;
  issue_date: string;
  due_date: string;
  paid_date?: string;
  paid_amount: number;
  remaining_amount: number;
  is_overdue: boolean;
  days_overdue: number;
  payment_percentage: number;
  description?: string;
  notes?: string;
  terms_conditions?: string;
  created_by: User;
  payments?: Payment[];
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  category: 'Office Supplies' | 'Software' | 'Marketing' | 'Travel' | 'Utilities' | 'Equipment' | 'Training' | 'Other';
  category_display: string;
  description: string;
  amount: number;
  currency: string;
  status: 'Paid' | 'Unpaid' | 'Partially Paid';
  status_display: string;
  date: string;
  due_date?: string;
  paid_date?: string;
  vendor?: string;
  reference_number?: string;
  is_overdue: boolean;
  budget_impact?: any;
  created_by: User;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  payment_type: 'Invoice Payment' | 'Expense Payment' | 'Refund' | 'Transfer' | 'Other';
  payment_type_display: string;
  method: 'Cash' | 'Bank Transfer' | 'Credit Card' | 'Mobile Money' | 'Cheque' | 'Other';
  method_display: string;
  amount: number;
  currency: string;
  reference_number?: string;
  description?: string;
  payment_date: string;
  created_by: User;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: number;
  title: string;
  type: 'Project' | 'Office' | 'Department' | 'General';
  type_display: string;
  amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  description?: string;
  project?: number;
  total_spent: number;
  utilization_percentage: number;
  created_by: User;
  budget_lines?: BudgetLine[];
  created_at: string;
  updated_at: string;
}

export interface BudgetLine {
  id: number;
  title: string;
  order: number;
  items: BudgetItem[];
  total_amount: number;
  total_spent: number;
  total_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetItem {
  id: number;
  description: string;
  amount: number;
  order: number;
  spent_amount: number;
  remaining_amount: number;
  utilization_percentage: number;
  created_at: string;
  updated_at: string;
}

export const financeService = {
  /**
   * Factures
   */
  invoices: {
    async list(params?: {
      page?: number;
      page_size?: number;
      search?: string;
      status?: string;
      client_name?: string;
      amount_min?: number;
      amount_max?: number;
      due_date_from?: string;
      due_date_to?: string;
      is_overdue?: boolean;
    }): Promise<{ results: Invoice[]; count: number }> {
      try {
        const response = await apiClient.get('/finance/invoices/', { 
          params: apiUtils.getFilterParams(params || {})
        });
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async get(id: number): Promise<Invoice> {
      try {
        const response = await apiClient.get<Invoice>(`/finance/invoices/${id}/`);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async create(invoiceData: {
      client_name: string;
      client_email?: string;
      client_address?: string;
      amount: number;
      tax_amount?: number;
      total_amount: number;
      currency?: string;
      status?: string;
      issue_date: string;
      due_date: string;
      description?: string;
      terms_conditions?: string;
    }): Promise<Invoice> {
      try {
        const response = await apiClient.post<Invoice>('/finance/invoices/', invoiceData);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async update(id: number, invoiceData: Partial<Invoice>): Promise<Invoice> {
      try {
        const response = await apiClient.patch<Invoice>(`/finance/invoices/${id}/`, invoiceData);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async delete(id: number): Promise<void> {
      try {
        await apiClient.delete(`/finance/invoices/${id}/`);
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async recordPayment(invoiceId: number, paymentData: {
      amount: number;
      method?: string;
      payment_date?: string;
      reference_number?: string;
    }): Promise<{
      message: string;
      payment: Payment;
      invoice_status: string;
      remaining_amount: number;
    }> {
      try {
        const response = await apiClient.post(`/finance/invoices/${invoiceId}/payment/`, paymentData);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async generatePDF(invoiceId: number): Promise<{ 
      message: string; 
      download_url: string; 
      invoice_number: string 
    }> {
      try {
        const response = await apiClient.get(`/finance/invoices/${invoiceId}/pdf/`);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async sendReminder(invoiceId: number): Promise<{ 
      message: string; 
      sent_to: string; 
      invoice_number: string 
    }> {
      try {
        const response = await apiClient.post(`/finance/invoices/${invoiceId}/reminder/`);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },
  },

  /**
   * Dépenses
   */
  expenses: {
    async list(params?: {
      page?: number;
      page_size?: number;
      search?: string;
      category?: string;
      status?: string;
      vendor?: string;
      amount_min?: number;
      amount_max?: number;
      date_from?: string;
      date_to?: string;
      is_overdue?: boolean;
    }): Promise<{ results: Expense[]; count: number }> {
      try {
        const response = await apiClient.get('/finance/expenses/', { 
          params: apiUtils.getFilterParams(params || {})
        });
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async create(expenseData: {
      category: string;
      description: string;
      amount: number;
      currency?: string;
      status?: string;
      date: string;
      due_date?: string;
      vendor?: string;
      reference_number?: string;
      budget_item_id?: number;
    }): Promise<Expense> {
      try {
        const response = await apiClient.post<Expense>('/finance/expenses/', expenseData);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async markAsPaid(expenseId: number, paymentData: {
      method?: string;
      payment_date?: string;
      reference_number?: string;
    }): Promise<{
      message: string;
      payment: Payment;
      expense_status: string;
    }> {
      try {
        const response = await apiClient.post(`/finance/expenses/${expenseId}/payment/`, paymentData);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },
  },

  /**
   * Budgets
   */
  budgets: {
    async list(): Promise<Budget[]> {
      try {
        const response = await apiClient.get<Budget[]>('/finance/budgets/');
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },

    async create(budgetData: {
      title: string;
      type: string;
      amount: number;
      currency?: string;
      start_date: string;
      end_date: string;
      description?: string;
      project_id?: number;
    }): Promise<Budget> {
      try {
        const response = await apiClient.post<Budget>('/finance/budgets/', budgetData);
        return response.data;
      } catch (error) {
        throw new Error(apiUtils.handleError(error));
      }
    },
  },

  /**
   * Calculer les taxes
   */
  async calculateTax(amount: number, taxId?: number): Promise<{
    amount: number;
    tax_rate: number;
    tax_amount: number;
    total_amount: number;
    tax_name: string;
  }> {
    try {
      const response = await apiClient.post('/finance/calculate-tax/', {
        amount,
        tax_id: taxId
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Statistiques financières
   */
  async getStats(year?: number): Promise<{
    total_revenue: number;
    paid_invoices_amount: number;
    pending_invoices_amount: number;
    overdue_invoices_amount: number;
    total_expenses: number;
    paid_expenses_amount: number;
    pending_expenses_amount: number;
    net_profit: number;
    profit_margin: number;
    total_budgets: number;
    budget_utilization: number;
    total_cash: number;
    invoices_count: number;
    expenses_count: number;
    overdue_invoices_count: number;
  }> {
    try {
      const response = await apiClient.get('/finance/stats/', {
        params: year ? { year } : {}
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Dashboard financier
   */
  async getDashboardData(): Promise<{
    recent_invoices: Invoice[];
    recent_expenses: Expense[];
    overdue_invoices: Invoice[];
    upcoming_expenses: Expense[];
    stats: any;
    monthly_revenue: Array<{ month: string; revenue: number }>;
    monthly_expenses: Array<{ month: string; expenses: number }>;
    expense_by_category: Array<{ category: string; total: number }>;
  }> {
    try {
      const response = await apiClient.get('/finance/dashboard/');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },

  /**
   * Rapport de flux de trésorerie
   */
  async getCashFlowReport(months: number = 6): Promise<{
    period_months: number;
    cash_flow: Array<{
      month: string;
      inflows: number;
      outflows: number;
      net_flow: number;
    }>;
    total_inflows: number;
    total_outflows: number;
    net_cash_flow: number;
  }> {
    try {
      const response = await apiClient.get('/finance/cash-flow/', {
        params: { months }
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.handleError(error));
    }
  },
};

export default financeService;
