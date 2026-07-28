export type ClientStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE';

export interface CRMUser {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Sales Manager' | 'Sales Representative';
  avatarUrl: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  industry: string;
  region: string;
  tags: string[];
  status: ClientStatus;
  createdAt: string;
  lastContact: string;
}

export interface Contact {
  id: string;
  clientId: string; // Refers to Client
  name: string;
  position: string;
  phone: string;
  email: string;
  notes?: string;
  createdAt: string;
}

export type OpportunityStage = 'DISCOVERY' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

export interface Opportunity {
  id: string;
  clientId: string; // Refers to Client
  name: string;
  value: number;
  stage: OpportunityStage;
  probability: number; // 0 to 100
  expectedCloseDate: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Interaction {
  id: string;
  clientId: string; // Refers to Client
  userId: string; // Refers to CRMUser who logged it
  type: 'EMAIL' | 'CALL' | 'MEETING' | 'NOTE';
  summary: string;
  details?: string;
  date: string;
}

export interface CRMTask {
  id: string;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  dueDate: string; // e.g. "2026-06-17"
  dueTime?: string; // e.g. "14:00"
  completed: boolean;
  notes?: string;
  assignedTo?: string; // CRMUser ID
}

export interface SalesGrowthPoint {
  month: string;
  revenue: number;
}
