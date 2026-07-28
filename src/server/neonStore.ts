import pg from 'pg';
import {
  CRMState,
  INITIAL_CRM_STATE,
  INITIAL_TASKS,
  INITIAL_USERS,
} from '../data/initialData';
import { Client, Contact, CRMTask, CRMUser, Interaction, Opportunity } from '../types/crm';

const { Pool } = pg;

const connectionString =
  process.env.DB_CONNECTION ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=require')
        ? undefined
        : { rejectUnauthorized: false },
    })
  : null;

let initialized = false;
let memoryState: CRMState = cloneState(INITIAL_CRM_STATE);

export function isNeonConfigured() {
  return Boolean(pool);
}

function cloneState(state: CRMState): CRMState {
  return JSON.parse(JSON.stringify(state));
}

function normalizeState(state: Partial<CRMState>): CRMState {
  return {
    users: state.users ?? INITIAL_CRM_STATE.users,
    currentUser: state.currentUser ?? state.users?.[0] ?? INITIAL_CRM_STATE.currentUser,
    clients: state.clients ?? INITIAL_CRM_STATE.clients,
    contacts: state.contacts ?? INITIAL_CRM_STATE.contacts,
    opportunities: state.opportunities ?? INITIAL_CRM_STATE.opportunities,
    interactions: state.interactions ?? INITIAL_CRM_STATE.interactions,
    tasks: state.tasks ?? INITIAL_CRM_STATE.tasks,
  };
}

async function ensureInitialized() {
  if (!pool) {
    throw new Error('DB_CONNECTION, DATABASE_URL ou POSTGRES_URL nao configurada.');
  }

  if (initialized) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS crm_state (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      avatar_url TEXT NOT NULL,
      is_current BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      industry TEXT NOT NULL,
      region TEXT NOT NULL,
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_contact TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      value NUMERIC NOT NULL,
      stage TEXT NOT NULL,
      stage_order NUMERIC,
      probability NUMERIC NOT NULL,
      expected_close_date TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS interactions (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      type TEXT NOT NULL,
      summary TEXT NOT NULL,
      details TEXT,
      date TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      priority TEXT NOT NULL,
      category TEXT NOT NULL,
      due_date TEXT NOT NULL,
      due_time TEXT,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      notes TEXT,
      assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE IF EXISTS opportunities
    ADD COLUMN IF NOT EXISTS stage_order NUMERIC
  `);

  await pool.query(`
    ALTER TABLE IF EXISTS users
    ADD COLUMN IF NOT EXISTS is_current BOOLEAN NOT NULL DEFAULT FALSE
  `);

  await pool.query(
    `
    INSERT INTO crm_state (id, data)
    VALUES ('default', $1::jsonb)
    ON CONFLICT (id) DO NOTHING;
    `,
    [JSON.stringify(INITIAL_CRM_STATE)]
  );

  const count = await pool.query<{ count: string }>('SELECT COUNT(*) FROM users');
  initialized = true;

  if (Number(count.rows[0]?.count ?? 0) === 0) {
    const legacy = await pool.query<{ data: Partial<CRMState> }>(
      "SELECT data FROM crm_state WHERE id = 'default'"
    );
    await seedState(normalizeState(legacy.rows[0]?.data ?? INITIAL_CRM_STATE));
  }
}

async function seedState(state: CRMState) {
  await clearTables();
  await Promise.all(state.users.map((user) => upsertUser(user)));
  await setCurrentUser(state.currentUser?.id ?? state.users[0]?.id ?? INITIAL_USERS[0].id);
  await Promise.all(state.clients.map(upsertClient));
  await Promise.all(state.contacts.map(upsertContact));
  await Promise.all(state.opportunities.map(upsertOpportunity));
  await Promise.all(state.interactions.map(upsertInteraction));
  await Promise.all(state.tasks.map(upsertTask));
}

async function clearTables() {
  await pool!.query(
    'TRUNCATE interactions, tasks, opportunities, contacts, clients, users RESTART IDENTITY CASCADE'
  );
}

function mapUser(row: any): CRMUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatar_url,
  };
}

function mapClient(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    phone: row.phone,
    email: row.email,
    industry: row.industry,
    region: row.region,
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: row.status,
    createdAt: row.created_at,
    lastContact: row.last_contact,
  };
}

function mapContact(row: any): Contact {
  return {
    id: row.id,
    clientId: row.client_id,
    name: row.name,
    position: row.position,
    phone: row.phone,
    email: row.email,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function mapOpportunity(row: any): Opportunity {
  return {
    id: row.id,
    clientId: row.client_id,
    name: row.name,
    value: Number(row.value),
    stage: row.stage,
    stageOrder: row.stage_order === null ? undefined : Number(row.stage_order),
    probability: Number(row.probability),
    expectedCloseDate: row.expected_close_date,
    description: row.description ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapInteraction(row: any): Interaction {
  return {
    id: row.id,
    clientId: row.client_id,
    userId: row.user_id ?? INITIAL_USERS[0].id,
    type: row.type,
    summary: row.summary,
    details: row.details ?? undefined,
    date: row.date,
  };
}

function mapTask(row: any): CRMTask {
  return {
    id: row.id,
    title: row.title,
    priority: row.priority,
    category: row.category,
    dueDate: row.due_date,
    dueTime: row.due_time ?? undefined,
    completed: row.completed,
    notes: row.notes ?? undefined,
    assignedTo: row.assigned_to ?? undefined,
  };
}

export async function readCRMState(): Promise<CRMState> {
  if (!pool) return cloneState(memoryState);

  await ensureInitialized();
  const [users, clients, contacts, opportunities, interactions, tasks] = await Promise.all([
    listUsers(),
    listClients(),
    listContacts(),
    listOpportunities(),
    listInteractions(),
    listTasks(),
  ]);
  const currentUser =
    users.find((user) => user.id === usersCurrentIdCache) ??
    users[0] ??
    INITIAL_CRM_STATE.currentUser;
  return { users, currentUser, clients, contacts, opportunities, interactions, tasks };
}

let usersCurrentIdCache = INITIAL_USERS[0].id;

export async function resetCRMState(): Promise<CRMState> {
  if (!pool) {
    memoryState = cloneState(INITIAL_CRM_STATE);
    usersCurrentIdCache = INITIAL_USERS[0].id;
    return cloneState(memoryState);
  }

  await ensureInitialized();
  await seedState(INITIAL_CRM_STATE);
  usersCurrentIdCache = INITIAL_USERS[0].id;
  return readCRMState();
}

export async function listUsers() {
  if (!pool) return [...memoryState.users];

  await ensureInitialized();
  const result = await pool!.query(
    'SELECT * FROM users ORDER BY created_at ASC, id ASC'
  );
  const current = result.rows.find((row) => row.is_current);
  if (current) usersCurrentIdCache = current.id;
  return result.rows.map(mapUser);
}

export async function getCurrentUser() {
  if (!pool) return memoryState.currentUser ? { ...memoryState.currentUser } : null;

  await ensureInitialized();
  const result = await pool!.query('SELECT * FROM users WHERE is_current = TRUE LIMIT 1');
  if (result.rows[0]) {
    usersCurrentIdCache = result.rows[0].id;
    return mapUser(result.rows[0]);
  }
  const users = await listUsers();
  return users[0] ?? null;
}

export async function upsertUser(user: CRMUser, isCurrent = false) {
  if (!pool) {
    if (isCurrent) {
      usersCurrentIdCache = user.id;
      memoryState.currentUser = user;
    }
    const index = memoryState.users.findIndex((item) => item.id === user.id);
    if (index >= 0) {
      memoryState.users[index] = user;
    } else {
      memoryState.users.push(user);
    }
    return { ...user };
  }

  await ensureInitialized();
  if (isCurrent) {
    await pool!.query('UPDATE users SET is_current = FALSE');
    usersCurrentIdCache = user.id;
  }
  const result = await pool!.query(
    `
      INSERT INTO users (id, name, email, role, avatar_url, is_current, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (id) DO UPDATE
      SET name = EXCLUDED.name,
          email = EXCLUDED.email,
          role = EXCLUDED.role,
          avatar_url = EXCLUDED.avatar_url,
          is_current = users.is_current OR EXCLUDED.is_current,
          updated_at = NOW()
      RETURNING *
    `,
    [user.id, user.name, user.email, user.role, user.avatarUrl, isCurrent]
  );
  return mapUser(result.rows[0]);
}

export async function setCurrentUser(id: string | null) {
  if (!pool) {
    memoryState.currentUser = id
      ? memoryState.users.find((user) => user.id === id) ?? null
      : null;
    if (id) usersCurrentIdCache = id;
    return;
  }

  await ensureInitialized();
  await pool!.query('UPDATE users SET is_current = FALSE');
  if (id) {
    await pool!.query('UPDATE users SET is_current = TRUE WHERE id = $1', [id]);
    usersCurrentIdCache = id;
  }
}

export async function listClients() {
  if (!pool) return [...memoryState.clients];

  await ensureInitialized();
  const result = await pool!.query('SELECT * FROM clients ORDER BY created_at DESC, id DESC');
  return result.rows.map(mapClient);
}

export async function upsertClient(client: Client) {
  if (!pool) {
    const index = memoryState.clients.findIndex((item) => item.id === client.id);
    if (index >= 0) {
      memoryState.clients[index] = client;
    } else {
      memoryState.clients.unshift(client);
    }
    return { ...client };
  }

  await ensureInitialized();
  const result = await pool!.query(
    `
      INSERT INTO clients (id, name, company, phone, email, industry, region, tags, status, created_at, last_contact, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, NOW())
      ON CONFLICT (id) DO UPDATE
      SET name = EXCLUDED.name,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          industry = EXCLUDED.industry,
          region = EXCLUDED.region,
          tags = EXCLUDED.tags,
          status = EXCLUDED.status,
          created_at = EXCLUDED.created_at,
          last_contact = EXCLUDED.last_contact,
          updated_at = NOW()
      RETURNING *
    `,
    [
      client.id,
      client.name,
      client.company,
      client.phone,
      client.email,
      client.industry,
      client.region,
      JSON.stringify(client.tags),
      client.status,
      client.createdAt,
      client.lastContact,
    ]
  );
  return mapClient(result.rows[0]);
}

export async function patchClient(id: string, updated: Partial<Client>) {
  const clients = await listClients();
  const current = clients.find((client) => client.id === id);
  if (!current) throw new Error('Cliente nao encontrado.');
  return upsertClient({ ...current, ...updated });
}

export async function deleteClientById(id: string) {
  if (!pool) {
    memoryState.clients = memoryState.clients.filter((client) => client.id !== id);
    memoryState.contacts = memoryState.contacts.filter((contact) => contact.clientId !== id);
    memoryState.opportunities = memoryState.opportunities.filter((opportunity) => opportunity.clientId !== id);
    memoryState.interactions = memoryState.interactions.filter((interaction) => interaction.clientId !== id);
    return;
  }

  await ensureInitialized();
  await pool!.query('DELETE FROM clients WHERE id = $1', [id]);
}

export async function listContacts() {
  if (!pool) return [...memoryState.contacts];

  await ensureInitialized();
  const result = await pool!.query('SELECT * FROM contacts ORDER BY created_at DESC, id DESC');
  return result.rows.map(mapContact);
}

export async function upsertContact(contact: Contact) {
  if (!pool) {
    const index = memoryState.contacts.findIndex((item) => item.id === contact.id);
    if (index >= 0) {
      memoryState.contacts[index] = contact;
    } else {
      memoryState.contacts.unshift(contact);
    }
    return { ...contact };
  }

  await ensureInitialized();
  const result = await pool!.query(
    `
      INSERT INTO contacts (id, client_id, name, position, phone, email, notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (id) DO UPDATE
      SET client_id = EXCLUDED.client_id,
          name = EXCLUDED.name,
          position = EXCLUDED.position,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          notes = EXCLUDED.notes,
          created_at = EXCLUDED.created_at,
          updated_at = NOW()
      RETURNING *
    `,
    [
      contact.id,
      contact.clientId,
      contact.name,
      contact.position,
      contact.phone,
      contact.email,
      contact.notes ?? null,
      contact.createdAt,
    ]
  );
  return mapContact(result.rows[0]);
}

export async function patchContact(id: string, updated: Partial<Contact>) {
  const contacts = await listContacts();
  const current = contacts.find((contact) => contact.id === id);
  if (!current) throw new Error('Contato nao encontrado.');
  return upsertContact({ ...current, ...updated });
}

export async function deleteContactById(id: string) {
  if (!pool) {
    memoryState.contacts = memoryState.contacts.filter((contact) => contact.id !== id);
    return;
  }

  await ensureInitialized();
  await pool!.query('DELETE FROM contacts WHERE id = $1', [id]);
}

export async function listOpportunities() {
  if (!pool) return [...memoryState.opportunities];

  await ensureInitialized();
  const result = await pool!.query(
    'SELECT * FROM opportunities ORDER BY stage_order ASC NULLS LAST, created_at DESC, id DESC'
  );
  return result.rows.map(mapOpportunity);
}

export async function upsertOpportunity(opportunity: Opportunity) {
  if (!pool) {
    const index = memoryState.opportunities.findIndex((item) => item.id === opportunity.id);
    if (index >= 0) {
      memoryState.opportunities[index] = opportunity;
    } else {
      memoryState.opportunities.unshift(opportunity);
    }
    return { ...opportunity };
  }

  await ensureInitialized();
  const result = await pool!.query(
    `
      INSERT INTO opportunities (
        id, client_id, name, value, stage, stage_order, probability,
        expected_close_date, description, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE
      SET client_id = EXCLUDED.client_id,
          name = EXCLUDED.name,
          value = EXCLUDED.value,
          stage = EXCLUDED.stage,
          stage_order = EXCLUDED.stage_order,
          probability = EXCLUDED.probability,
          expected_close_date = EXCLUDED.expected_close_date,
          description = EXCLUDED.description,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at
      RETURNING *
    `,
    [
      opportunity.id,
      opportunity.clientId,
      opportunity.name,
      opportunity.value,
      opportunity.stage,
      opportunity.stageOrder ?? null,
      opportunity.probability,
      opportunity.expectedCloseDate,
      opportunity.description ?? null,
      opportunity.createdAt,
      opportunity.updatedAt,
    ]
  );
  return mapOpportunity(result.rows[0]);
}

export async function patchOpportunity(id: string, updated: Partial<Opportunity>) {
  const opportunities = await listOpportunities();
  const current = opportunities.find((opportunity) => opportunity.id === id);
  if (!current) throw new Error('Oportunidade nao encontrada.');
  return upsertOpportunity({ ...current, ...updated });
}

export async function upsertOpportunities(opportunities: Opportunity[]) {
  const saved: Opportunity[] = [];
  for (const opportunity of opportunities) {
    saved.push(await upsertOpportunity(opportunity));
  }
  return saved;
}

export async function deleteOpportunityById(id: string) {
  if (!pool) {
    memoryState.opportunities = memoryState.opportunities.filter((opportunity) => opportunity.id !== id);
    return;
  }

  await ensureInitialized();
  await pool!.query('DELETE FROM opportunities WHERE id = $1', [id]);
}

export async function listInteractions() {
  if (!pool) return [...memoryState.interactions];

  await ensureInitialized();
  const result = await pool!.query('SELECT * FROM interactions ORDER BY date DESC, id DESC');
  return result.rows.map(mapInteraction);
}

export async function upsertInteraction(interaction: Interaction) {
  if (!pool) {
    const index = memoryState.interactions.findIndex((item) => item.id === interaction.id);
    if (index >= 0) {
      memoryState.interactions[index] = interaction;
    } else {
      memoryState.interactions.unshift(interaction);
    }
    return { ...interaction };
  }

  await ensureInitialized();
  const result = await pool!.query(
    `
      INSERT INTO interactions (id, client_id, user_id, type, summary, details, date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE
      SET client_id = EXCLUDED.client_id,
          user_id = EXCLUDED.user_id,
          type = EXCLUDED.type,
          summary = EXCLUDED.summary,
          details = EXCLUDED.details,
          date = EXCLUDED.date
      RETURNING *
    `,
    [
      interaction.id,
      interaction.clientId,
      interaction.userId,
      interaction.type,
      interaction.summary,
      interaction.details ?? null,
      interaction.date,
    ]
  );
  return mapInteraction(result.rows[0]);
}

export async function deleteInteractionById(id: string) {
  if (!pool) {
    memoryState.interactions = memoryState.interactions.filter((interaction) => interaction.id !== id);
    return;
  }

  await ensureInitialized();
  await pool!.query('DELETE FROM interactions WHERE id = $1', [id]);
}

export async function listTasks() {
  if (!pool) return [...memoryState.tasks];

  await ensureInitialized();
  const result = await pool!.query('SELECT * FROM tasks ORDER BY due_date ASC, id DESC');
  return result.rows.map(mapTask);
}

export async function upsertTask(task: CRMTask) {
  if (!pool) {
    const index = memoryState.tasks.findIndex((item) => item.id === task.id);
    if (index >= 0) {
      memoryState.tasks[index] = task;
    } else {
      memoryState.tasks.unshift(task);
    }
    return { ...task };
  }

  await ensureInitialized();
  const result = await pool!.query(
    `
      INSERT INTO tasks (id, title, priority, category, due_date, due_time, completed, notes, assigned_to, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (id) DO UPDATE
      SET title = EXCLUDED.title,
          priority = EXCLUDED.priority,
          category = EXCLUDED.category,
          due_date = EXCLUDED.due_date,
          due_time = EXCLUDED.due_time,
          completed = EXCLUDED.completed,
          notes = EXCLUDED.notes,
          assigned_to = EXCLUDED.assigned_to,
          updated_at = NOW()
      RETURNING *
    `,
    [
      task.id,
      task.title,
      task.priority,
      task.category,
      task.dueDate,
      task.dueTime ?? null,
      task.completed,
      task.notes ?? null,
      task.assignedTo ?? null,
    ]
  );
  return mapTask(result.rows[0]);
}

export async function patchTask(id: string, updated: Partial<CRMTask>) {
  const tasks = await listTasks();
  const current = tasks.find((task) => task.id === id) ?? INITIAL_TASKS.find((task) => task.id === id);
  if (!current) throw new Error('Tarefa nao encontrada.');
  return upsertTask({ ...current, ...updated });
}

export async function deleteTaskById(id: string) {
  if (!pool) {
    memoryState.tasks = memoryState.tasks.filter((task) => task.id !== id);
    return;
  }

  await ensureInitialized();
  await pool!.query('DELETE FROM tasks WHERE id = $1', [id]);
}
