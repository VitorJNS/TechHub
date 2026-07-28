import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CRMUser, 
  Client, 
  Contact, 
  Opportunity, 
  Interaction, 
  CRMTask, 
  ClientStatus, 
  OpportunityStage,
  SalesGrowthPoint
} from '../types/crm';

// Mock Avatars
const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', // Sarah Miller (Female)
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', // Alex Rivera (Male)
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', // James Wilson (Male)
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', // Elena Lopez (Female)
];

// Initial Data Generators
const INITIAL_USERS: CRMUser[] = [
  {
    id: 'u-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@saleshub.com',
    role: 'Sales Manager',
    avatarUrl: AVATARS[1],
  },
  {
    id: 'u-2',
    name: 'Sarah Miller',
    email: 'sarah.miller@saleshub.com',
    role: 'Sales Representative',
    avatarUrl: AVATARS[0],
  },
  {
    id: 'u-3',
    name: 'James Wilson',
    email: 'james.wilson@saleshub.com',
    role: 'Sales Representative',
    avatarUrl: AVATARS[2],
  }
];

const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c-1',
    name: 'Johnnathan Smith',
    company: 'Acme Dynamics Corp',
    phone: '+1 (555) 012-3456',
    email: 'j.smith@acme.com',
    industry: 'Technology',
    region: 'North America',
    tags: ['Enterprise', 'Tech'],
    status: 'ACTIVE',
    createdAt: '2023-01-15T08:00:00Z',
    lastContact: 'Oct 24, 2023',
  },
  {
    id: 'c-2',
    name: 'Alicia Wright',
    company: 'Nebula Systems',
    phone: '+1 (555) 987-6543',
    email: 'alicia@nebula.io',
    industry: 'Technology',
    region: 'LATAM',
    tags: ['SaaS', 'Fast-Growing'],
    status: 'PENDING',
    createdAt: '2023-03-10T10:30:00Z',
    lastContact: 'Oct 22, 2023',
  },
  {
    id: 'c-3',
    name: 'Marcus Bennett',
    company: 'Horizon Global',
    phone: '+44 20 7946 0958',
    email: 'm.bennett@horizon.uk',
    industry: 'Finance',
    region: 'Europe',
    tags: ['Partner', 'Enterprise'],
    status: 'ACTIVE',
    createdAt: '2023-04-22T14:15:00Z',
    lastContact: 'Oct 19, 2023',
  },
  {
    id: 'c-4',
    name: 'Sarah Chen',
    company: 'InnoTech Solutions',
    phone: '+852 2134 5678',
    email: 'schen@innotech.hk',
    industry: 'Logistics',
    region: 'APAC',
    tags: ['SaaS', 'Trial'],
    status: 'INACTIVE',
    createdAt: '2023-05-18T09:45:00Z',
    lastContact: 'Oct 15, 2023',
  },
  {
    id: 'c-5',
    name: 'David Goggins',
    company: 'Ultramarathon Logistics',
    phone: '+1 (555) 777-8888',
    email: 'david@ultramarathon.com',
    industry: 'Logistics',
    region: 'North America',
    tags: ['High-Priority'],
    status: 'ACTIVE',
    createdAt: '2023-06-01T11:00:00Z',
    lastContact: 'Oct 12, 2023',
  },
  {
    id: 'c-6',
    name: 'Elena Lopez',
    company: 'Solaris Energy',
    phone: '+34 912 345 678',
    email: 'e.lopez@solaris.es',
    industry: 'Energy',
    region: 'Europe',
    tags: ['Sustainability'],
    status: 'ACTIVE',
    createdAt: '2023-06-12T16:20:00Z',
    lastContact: 'Oct 08, 2023',
  },
];

const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'co-1',
    clientId: 'c-1',
    name: 'Robert Downey',
    position: 'Chief Operations Officer',
    phone: '+1 (555) 012-3499',
    email: 'r.downey@acme.com',
    notes: 'Primary decision maker for custom portal design.',
    createdAt: '2023-01-16T12:00:00Z',
  },
  {
    id: 'co-2',
    clientId: 'c-2',
    name: 'Wanda Maximoff',
    position: 'VP of Product',
    phone: '+1 (555) 987-6577',
    email: 'wanda@nebula.io',
    notes: 'Very interested in automation triggers.',
    createdAt: '2023-03-12T11:00:00Z',
  },
  {
    id: 'co-3',
    clientId: 'c-3',
    name: 'Peter Parker',
    position: 'Procurement Specialist',
    phone: '+44 20 7946 0911',
    email: 'p.parker@horizon.uk',
    notes: 'Requested contract drafts back in October.',
    createdAt: '2023-04-25T15:30:00Z',
  }
];

const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'op-1',
    clientId: 'c-5', // Ultramarathon Logistics
    name: 'Nexus Logistics Expansion',
    value: 85000,
    stage: 'PROPOSAL',
    probability: 70,
    expectedCloseDate: '2026-07-15',
    description: 'Expanding logistics tracking services over 10 more distribution hubs.',
    createdAt: '2026-05-10T11:00:00Z',
    updatedAt: '2026-06-15T15:00:00Z'
  },
  {
    id: 'op-2',
    clientId: 'c-3', // Horizon Global
    name: 'Skyline Global Core License',
    value: 124000,
    stage: 'DISCOVERY',
    probability: 30,
    expectedCloseDate: '2026-09-30',
    description: 'Procuring core client-license endpoints for asset manager dashboards.',
    createdAt: '2026-06-01T09:00:00Z',
    updatedAt: '2026-06-10T10:00:00Z'
  },
  {
    id: 'op-3',
    clientId: 'c-1', // Acme Dynamics Corp
    name: 'Omni Labs Automation Platform',
    value: 42500,
    stage: 'NEGOTIATION',
    probability: 85,
    expectedCloseDate: '2026-06-25',
    description: 'Custom automation hooks pipeline delivery agreement for regional portals.',
    createdAt: '2026-04-15T08:00:00Z',
    updatedAt: '2026-06-16T18:00:00Z'
  },
  {
    id: 'op-4',
    clientId: 'c-6', // Solaris Energy
    name: 'True North Partner Renewable Integration',
    value: 67000,
    stage: 'QUALIFIED',
    probability: 50,
    expectedCloseDate: '2026-08-01',
    description: 'Connecting battery storage telemetries into smart analytics dashboards.',
    createdAt: '2026-05-20T10:00:00Z',
    updatedAt: '2026-06-14T11:30:00Z'
  },
  {
    id: 'op-5',
    clientId: 'c-2', // Nebula Systems
    name: 'Nebula Analytics Bundle Upgrade',
    value: 31000,
    stage: 'WON',
    probability: 100,
    expectedCloseDate: '2026-06-10',
    description: 'Closed cloud security tracking service package.',
    createdAt: '2026-03-10T10:30:00Z',
    updatedAt: '2026-06-10T17:00:00Z'
  }
];

const INITIAL_INTERACTIONS: Interaction[] = [
  {
    id: 'int-1',
    clientId: 'c-2',
    userId: 'u-2',
    type: 'EMAIL',
    summary: 'Follow up with TechFlow Inc.',
    details: 'Sent custom dashboard pricing tiers. Email sent by Sarah Miller.',
    date: '2026-06-16T18:25:00Z',
  },
  {
    id: 'int-2',
    clientId: 'c-3',
    userId: 'u-1',
    type: 'CALL',
    summary: 'Deal Closed: Global Logistics',
    details: 'Alex Rivera finalized enterprise subscription parameters over Google Meet.',
    date: '2026-06-16T15:25:00Z',
  },
  {
    id: 'int-3',
    clientId: 'c-5',
    userId: 'u-3',
    type: 'NOTE',
    summary: 'New Lead: Aqua Systems',
    details: 'Assigned to James Wilson. Reviewing historical volumes and potential bottlenecks.',
    date: '2026-06-15T10:00:00Z',
  },
  {
    id: 'int-4',
    clientId: 'c-1',
    userId: 'u-1',
    type: 'MEETING',
    summary: 'Meeting Scheduled: Apex Corp',
    details: 'Quarterly review to align custom widget specifications next Thursday.',
    date: '2026-06-15T09:00:00Z',
  }
];

const INITIAL_TASKS: CRMTask[] = [
  {
    id: 't-1',
    title: 'Sign contract with Vertex Ltd',
    priority: 'HIGH',
    category: 'High Priority',
    dueDate: '2026-06-17',
    dueTime: '14:00',
    completed: false,
    notes: 'Awaiting signature from procurement lead.',
    assignedTo: 'u-1'
  },
  {
    id: 't-2',
    title: 'Team sync: Weekly pipeline review',
    priority: 'MEDIUM',
    category: 'Internal',
    dueDate: '2026-06-16',
    completed: true,
    notes: 'Reviewed all hot opportunities for Q2.',
    assignedTo: 'u-2'
  },
  {
    id: 't-3',
    title: 'Prepare pitch deck for Alpha Co',
    priority: 'LOW',
    category: 'Work in progress',
    dueDate: '2026-06-18',
    completed: false,
    notes: 'Need to grab engineering diagrams before finalizing slide 6.',
    assignedTo: 'u-3'
  },
  {
    id: 't-4',
    title: 'Update CRM contact list',
    priority: 'LOW',
    category: 'Routine Maintenance',
    dueDate: '2026-06-19',
    completed: false,
    notes: 'Verify missing telephone and email entries for recently imported leads.',
    assignedTo: 'u-1'
  }
];

const INITIAL_SALES_GROWTH: SalesGrowthPoint[] = [
  { month: 'Jan', revenue: 150000 },
  { month: 'Feb', revenue: 210000 },
  { month: 'Mar', revenue: 180000 },
  { month: 'Apr', revenue: 320000 },
  { month: 'May', revenue: 290000 },
  { month: 'Jun', revenue: 380000 },
  { month: 'Jul', revenue: 420000 },
  { month: 'Aug', revenue: 458230 },
];

interface CRMContextType {
  currentUser: CRMUser | null;
  users: CRMUser[];
  clients: Client[];
  contacts: Contact[];
  opportunities: Opportunity[];
  interactions: Interaction[];
  tasks: CRMTask[];
  salesGrowth: SalesGrowthPoint[];
  
  // Actions
  login: (email: string) => boolean;
  logout: () => void;
  setCurrentUserById: (id: string) => void;
  registerUser: (name: string, email: string, role: CRMUser['role']) => CRMUser;
  
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'lastContact'>) => Client;
  updateClient: (id: string, updated: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => Contact;
  updateContact: (id: string, updated: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  
  addOpportunity: (opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => Opportunity;
  updateOpportunity: (id: string, updated: Partial<Opportunity>) => void;
  deleteOpportunity: (id: string) => void;
  
  addInteraction: (clientId: string, type: Interaction['type'], summary: string, details?: string) => Interaction;
  deleteInteraction: (id: string) => void;
  
  addTask: (task: Omit<CRMTask, 'id' | 'completed'>) => CRMTask;
  toggleTaskCompleted: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updated: Partial<CRMTask>) => void;
  
  resetData: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states
  const [users, setUsers] = useState<CRMUser[]>(() => {
    const saved = localStorage.getItem('sh_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<CRMUser | null>(() => {
    const saved = localStorage.getItem('sh_current_user');
    if (saved) return JSON.parse(saved);
    const defaults = INITIAL_USERS;
    return defaults[0] || null; // fallback to Alex Rivera standard
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('sh_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('sh_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    const saved = localStorage.getItem('sh_opportunities');
    return saved ? JSON.parse(saved) : INITIAL_OPPORTUNITIES;
  });

  const [interactions, setInteractions] = useState<Interaction[]>(() => {
    const saved = localStorage.getItem('sh_interactions');
    return saved ? JSON.parse(saved) : INITIAL_INTERACTIONS;
  });

  const [tasks, setTasks] = useState<CRMTask[]>(() => {
    const saved = localStorage.getItem('sh_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [salesGrowth] = useState<SalesGrowthPoint[]>(INITIAL_SALES_GROWTH);

  // Sync state to local storage on changes
  useEffect(() => {
    localStorage.setItem('sh_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sh_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sh_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sh_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('sh_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('sh_opportunities', JSON.stringify(opportunities));
  }, [opportunities]);

  useEffect(() => {
    localStorage.setItem('sh_interactions', JSON.stringify(interactions));
  }, [interactions]);

  useEffect(() => {
    localStorage.setItem('sh_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Auth Operations
  const login = (email: string): boolean => {
    const found = users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const setCurrentUserById = (id: string) => {
    const found = users.find(u => u.id === id);
    if (found) {
      setCurrentUser(found);
    }
  };

  const registerUser = (name: string, email: string, role: CRMUser['role']): CRMUser => {
    const id = `u-${Date.now()}`;
    const avatarUrl = AVATARS[users.length % AVATARS.length];
    const newUser: CRMUser = { id, name, email, role, avatarUrl };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  // Client Operations
  const addClient = (newRaw: Omit<Client, 'id' | 'createdAt' | 'lastContact'>): Client => {
    const client: Client = {
      ...newRaw,
      id: `c-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastContact: 'Just now',
    };
    setClients(prev => [client, ...prev]);
    
    // Auto Interaction
    if (currentUser) {
      addInteraction(client.id, 'NOTE', 'Client Created', `Client ${client.name} from ${client.company} was registered into the system.`);
    }
    return client;
  };

  const updateClient = (id: string, updated: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    // Cascade-delete related contacts/opportunities
    setContacts(prev => prev.filter(co => co.clientId !== id));
    setOpportunities(prev => prev.filter(op => op.clientId !== id));
  };

  // Contact Operations
  const addContact = (newRaw: Omit<Contact, 'id' | 'createdAt'>): Contact => {
    const contact: Contact = {
      ...newRaw,
      id: `co-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setContacts(prev => [contact, ...prev]);
    
    // Update Client last contacted
    const dateFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    updateClient(newRaw.clientId, { lastContact: dateFormatted });

    // Auto Interaction
    addInteraction(newRaw.clientId, 'NOTE', `Contact ${contact.name} added`, `${contact.name} was saved as a ${contact.position}.`);
    
    return contact;
  };

  const updateContact = (id: string, updated: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  // Opportunity Operations
  const addOpportunity = (newRaw: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>): Opportunity => {
    const opportunity: Opportunity = {
      ...newRaw,
      id: `op-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOpportunities(prev => [opportunity, ...prev]);

    // Log Interaction
    addInteraction(
      newRaw.clientId, 
      'NOTE', 
      `New Opportunity: ${opportunity.name}`, 
      `Estimated opportunity value of $${opportunity.value.toLocaleString()} listed in status ${opportunity.stage}.`
    );

    return opportunity;
  };

  const updateOpportunity = (id: string, updated: Partial<Opportunity>) => {
    setOpportunities(prev => prev.map(o => {
      if (o.id === id) {
        const afterUpdate = { 
          ...o, 
          ...updated, 
          updatedAt: new Date().toISOString() 
        };
        // If stage changed, log interaction
        if (updated.stage && updated.stage !== o.stage) {
          addInteraction(
            o.clientId, 
            'NOTE', 
            `Opportunity stage updated: ${o.name}`, 
            `Moved from ${o.stage} to ${updated.stage}.`
          );
        }
        return afterUpdate;
      }
      return o;
    }));
  };

  const deleteOpportunity = (id: string) => {
    setOpportunities(prev => prev.filter(o => o.id !== id));
  };

  // Interaction Operations
  const addInteraction = (clientId: string, type: Interaction['type'], summary: string, details?: string): Interaction => {
    const interaction: Interaction = {
      id: `int-${Date.now()}`,
      clientId,
      userId: currentUser?.id || 'u-1',
      type,
      summary,
      details,
      date: new Date().toISOString(),
    };
    setInteractions(prev => [interaction, ...prev]);
    
    // Update Client last contact
    const dateFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    updateClient(clientId, { lastContact: dateFormatted });

    return interaction;
  };

  const deleteInteraction = (id: string) => {
    setInteractions(prev => prev.filter(i => i.id !== id));
  };

  // Task Operations
  const addTask = (newRaw: Omit<CRMTask, 'id' | 'completed'>): CRMTask => {
    const task: CRMTask = {
      ...newRaw,
      id: `t-${Date.now()}`,
      completed: false
    };
    setTasks(prev => [task, ...prev]);
    return task;
  };

  const toggleTaskCompleted = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTask = (id: string, updated: Partial<CRMTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
  };

  const resetData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setClients(INITIAL_CLIENTS);
    setContacts(INITIAL_CONTACTS);
    setOpportunities(INITIAL_OPPORTUNITIES);
    setInteractions(INITIAL_INTERACTIONS);
    setTasks(INITIAL_TASKS);
  };

  return (
    <CRMContext.Provider value={{
      currentUser,
      users,
      clients,
      contacts,
      opportunities,
      interactions,
      tasks,
      salesGrowth,
      login,
      logout,
      setCurrentUserById,
      registerUser,
      addClient,
      updateClient,
      deleteClient,
      addContact,
      updateContact,
      deleteContact,
      addOpportunity,
      updateOpportunity,
      deleteOpportunity,
      addInteraction,
      deleteInteraction,
      addTask,
      toggleTaskCompleted,
      deleteTask,
      updateTask,
      resetData,
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
