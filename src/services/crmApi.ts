import { CRMState } from '../data/initialData';
import { Client, Contact, CRMTask, CRMUser, Interaction, Opportunity } from '../types/crm';

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `API respondeu ${response.status}`;
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      // Keep the status-based fallback.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

const post = <T>(url: string, body?: unknown) =>
  apiRequest<T>(url, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const patch = <T>(url: string, body: unknown) =>
  apiRequest<T>(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

const put = <T>(url: string, body: unknown) =>
  apiRequest<T>(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

const del = (url: string) => apiRequest<{ ok: true }>(url, { method: 'DELETE' });

export const crmApi = {
  getUsers: () => apiRequest<CRMUser[]>('/api/users'),
  getCurrentUser: () => apiRequest<CRMUser | null>('/api/users/current'),
  saveUser: (user: CRMUser) => post<CRMUser>('/api/users', user),
  setCurrentUser: (id: string | null) => post<{ ok: true }>('/api/users/current', { id }),

  getClients: () => apiRequest<Client[]>('/api/clients'),
  saveClient: (client: Client) => post<Client>('/api/clients', client),
  updateClient: (id: string, updated: Partial<Client>) => patch<Client>(`/api/clients/${id}`, updated),
  deleteClient: (id: string) => del(`/api/clients/${id}`),

  getContacts: () => apiRequest<Contact[]>('/api/contacts'),
  saveContact: (contact: Contact) => post<Contact>('/api/contacts', contact),
  updateContact: (id: string, updated: Partial<Contact>) => patch<Contact>(`/api/contacts/${id}`, updated),
  deleteContact: (id: string) => del(`/api/contacts/${id}`),

  getOpportunities: () => apiRequest<Opportunity[]>('/api/opportunities'),
  saveOpportunity: (opportunity: Opportunity) => post<Opportunity>('/api/opportunities', opportunity),
  updateOpportunity: (id: string, updated: Partial<Opportunity>) =>
    patch<Opportunity>(`/api/opportunities/${id}`, updated),
  saveOpportunitiesBulk: (opportunities: Opportunity[]) =>
    put<Opportunity[]>('/api/opportunities/bulk', { opportunities }),
  deleteOpportunity: (id: string) => del(`/api/opportunities/${id}`),

  getInteractions: () => apiRequest<Interaction[]>('/api/interactions'),
  saveInteraction: (interaction: Interaction) => post<Interaction>('/api/interactions', interaction),
  deleteInteraction: (id: string) => del(`/api/interactions/${id}`),

  getTasks: () => apiRequest<CRMTask[]>('/api/tasks'),
  saveTask: (task: CRMTask) => post<CRMTask>('/api/tasks', task),
  updateTask: (id: string, updated: Partial<CRMTask>) => patch<CRMTask>(`/api/tasks/${id}`, updated),
  deleteTask: (id: string) => del(`/api/tasks/${id}`),

  resetData: () => post<CRMState>('/api/crm/reset'),

  async loadAll(): Promise<CRMState> {
    const [users, currentUser, clients, contacts, opportunities, interactions, tasks] =
      await Promise.all([
        this.getUsers(),
        this.getCurrentUser(),
        this.getClients(),
        this.getContacts(),
        this.getOpportunities(),
        this.getInteractions(),
        this.getTasks(),
      ]);

    return { users, currentUser, clients, contacts, opportunities, interactions, tasks };
  },
};
