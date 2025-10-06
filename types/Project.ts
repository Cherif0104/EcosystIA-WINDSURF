export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  budget?: number;
  currency?: string;
  client_name?: string;
  team: Array<{
    id: number;
    name: string;
    role: string;
  }>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  budget: string;
  currency: string;
  client_name: string;
  team: number[];
}

export interface ProjectStats {
  status: string;
  count: number;
  avg_budget: number;
  first_created: string;
  last_created: string;
}
