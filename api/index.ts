let appPromise: Promise<any> | null = null;

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
  try {
    if (!appPromise) {
      appPromise = import('../server').then(({ createApp }) =>
        createApp({ serveClient: false })
      );
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
      stack:
        process.env.NODE_ENV === 'production'
          ? undefined
          : error?.stack,
    });
  }
}
