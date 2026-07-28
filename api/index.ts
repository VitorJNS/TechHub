import express, { type Express, type Response } from 'express';
import dotenv from 'dotenv';
import * as store from '../src/server/neonStore';

dotenv.config();

let appPromise: Promise<Express> | null = null;

function restoreExpressPath(req: any) {
  const rawPath = req.query?.path;
  const path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;

  if (!path) return;

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  url.searchParams.delete('path');

  const query = url.searchParams.toString();
  req.url = `/api/${path}${query ? `?${query}` : ''}`;
}

function sendError(res: Response, error: any, fallback: string) {
  console.error('[CRM API Error]', error);
  res.status(500).json({
    error: 'CRM_API_FAILED',
    message: error?.message || fallback,
  });
}

async function createApiApp(): Promise<Express> {
  const app = express();
  app.use(express.json());

  app.get('/api/crm/health', async (_req, res) => {
    try {
      const state = await store.readCRMState();
      res.json({
        ok: true,
        database: store.isNeonConfigured() ? 'ready' : 'memory',
        counts: {
          users: state.users.length,
          clients: state.clients.length,
          contacts: state.contacts.length,
          opportunities: state.opportunities.length,
          interactions: state.interactions.length,
          tasks: state.tasks.length,
        },
      });
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel inicializar o banco.');
    }
  });

  app.get('/api/crm/state', async (_req, res) => {
    try {
      res.json(await store.readCRMState());
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel carregar os dados do CRM.');
    }
  });

  app.post('/api/crm/reset', async (_req, res) => {
    try {
      res.json(await store.resetCRMState());
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel resetar os dados do CRM.');
    }
  });

  app.get('/api/users', async (_req, res) => {
    try {
      res.json(await store.listUsers());
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel listar usuarios.');
    }
  });

  app.get('/api/users/current', async (_req, res) => {
    try {
      res.json(await store.getCurrentUser());
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel carregar usuario atual.');
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      res.json(await store.upsertUser(req.body, Boolean(req.body.isCurrent)));
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel salvar usuario.');
    }
  });

  app.post('/api/users/current', async (req, res) => {
    try {
      await store.setCurrentUser(req.body?.id ?? null);
      res.json({ ok: true });
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel trocar usuario atual.');
    }
  });

  app.get('/api/clients', async (_req, res) => {
    try {
      res.json(await store.listClients());
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel listar clientes.');
    }
  });

  app.post('/api/clients', async (req, res) => {
    try {
      res.json(await store.upsertClient(req.body));
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel salvar cliente.');
    }
  });

  app.patch('/api/clients/:id', async (req, res) => {
    try {
      res.json(await store.patchClient(req.params.id, req.body));
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel atualizar cliente.');
    }
  });

  app.delete('/api/clients/:id', async (req, res) => {
    try {
      await store.deleteClientById(req.params.id);
      res.json({ ok: true });
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel excluir cliente.');
    }
  });

  app.get('/api/contacts', async (_req, res) => {
    try {
      res.json(await store.listContacts());
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel listar contatos.');
    }
  });

  app.post('/api/contacts', async (req, res) => {
    try {
      res.json(await store.upsertContact(req.body));
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel salvar contato.');
    }
  });

  app.patch('/api/contacts/:id', async (req, res) => {
    try {
      res.json(await store.patchContact(req.params.id, req.body));
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel atualizar contato.');
    }
  });

  app.delete('/api/contacts/:id', async (req, res) => {
    try {
      await store.deleteContactById(req.params.id);
      res.json({ ok: true });
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel excluir contato.');
    }
  });

  app.get('/api/opportunities', async (_req, res) => {
    try {
      res.json(await store.listOpportunities());
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel listar oportunidades.');
    }
  });

  app.post('/api/opportunities', async (req, res) => {
    try {
      res.json(await store.upsertOpportunity(req.body));
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel salvar oportunidade.');
    }
  });

  app.patch('/api/opportunities/:id', async (req, res) => {
    try {
      res.json(await store.patchOpportunity(req.params.id, req.body));
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel atualizar oportunidade.');
    }
  });

  app.put('/api/opportunities/bulk', async (req, res) => {
    try {
      res.json(await store.upsertOpportunities(req.body?.opportunities ?? []));
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel reordenar oportunidades.');
    }
  });

  app.delete('/api/opportunities/:id', async (req, res) => {
    try {
      await store.deleteOpportunityById(req.params.id);
      res.json({ ok: true });
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel excluir oportunidade.');
    }
  });

  app.get('/api/interactions', async (_req, res) => {
    try {
      res.json(await store.listInteractions());
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel listar interacoes.');
    }
  });

  app.post('/api/interactions', async (req, res) => {
    try {
      res.json(await store.upsertInteraction(req.body));
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel salvar interacao.');
    }
  });

  app.delete('/api/interactions/:id', async (req, res) => {
    try {
      await store.deleteInteractionById(req.params.id);
      res.json({ ok: true });
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel excluir interacao.');
    }
  });

  app.get('/api/tasks', async (_req, res) => {
    try {
      res.json(await store.listTasks());
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel listar tarefas.');
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      res.json(await store.upsertTask(req.body));
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel salvar tarefa.');
    }
  });

  app.patch('/api/tasks/:id', async (req, res) => {
    try {
      res.json(await store.patchTask(req.params.id, req.body));
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel atualizar tarefa.');
    }
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      await store.deleteTaskById(req.params.id);
      res.json({ ok: true });
    } catch (error: any) {
      sendError(res, error, 'Nao foi possivel excluir tarefa.');
    }
  });

  app.use((_req, res) => {
    res.status(404).json({ error: 'NOT_FOUND' });
  });

  return app;
}

export default async function handler(req: any, res: any) {
  try {
    if (!appPromise) {
      appPromise = createApiApp();
    }

    restoreExpressPath(req);

    const app = await appPromise;
    return app(req, res);
  } catch (error: any) {
    console.error('[Vercel API Bootstrap Error]', error);
    appPromise = null;
    res.status(500).json({
      error: 'VERCEL_API_BOOTSTRAP_FAILED',
      message: error?.message || 'A Function da Vercel falhou ao iniciar.',
    });
  }
}
