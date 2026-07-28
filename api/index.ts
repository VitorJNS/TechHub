import { createApp } from '../server';

let appPromise: ReturnType<typeof createApp> | null = null;

function restoreExpressPath(req: any) {
  const rawPath = req.query?.path;
  const path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;

  if (!path) return;

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  url.searchParams.delete('path');

  const query = url.searchParams.toString();
  req.url = `/api/${path}${query ? `?${query}` : ''}`;
}

export default async function handler(req: any, res: any) {
  if (!appPromise) {
    appPromise = createApp({ serveClient: false });
  }

  restoreExpressPath(req);

  const app = await appPromise;
  return app(req, res);
}
