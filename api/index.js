import serverModule from '../dist/server.cjs';

let appPromise = null;

const createApp =
  serverModule.createApp ??
  serverModule.default?.createApp;

function restoreExpressPath(req) {
  const rawPath = req.query?.path;
  const path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;

  if (!path) return;

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  url.searchParams.delete('path');

  const query = url.searchParams.toString();
  req.url = `/api/${path}${query ? `?${query}` : ''}`;
}

export default async function handler(req, res) {
  try {
    if (!createApp) {
      throw new Error('createApp nao foi exportado por dist/server.cjs.');
    }

    if (!appPromise) {
      appPromise = createApp({ serveClient: false });
    }

    restoreExpressPath(req);

    const app = await appPromise;
    return app(req, res);
  } catch (error) {
    console.error('[Vercel API Bootstrap Error]', error);
    appPromise = null;
    res.status(500).json({
      error: 'VERCEL_API_BOOTSTRAP_FAILED',
      message: error?.message || 'A Function da Vercel falhou ao iniciar.',
    });
  }
}
