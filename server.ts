import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer, WebSocket } from 'ws';
import { getIronSession } from 'iron-session';
import { IncomingMessage, ServerResponse } from 'http';
import { installDaemonRequestInterceptor, daemonSchemeSync, daemonScheme } from './src/lib/daemon';

installDaemonRequestInterceptor();

// Prime the scheme cache at startup so daemonSchemeSync() is never stale on first use
import('./src/lib/daemon').then(m => m.daemonScheme()).catch(() => {});

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'change-this-secret-to-something-32-chars-long',
  cookieName: 'airlink_session',
  cookieOptions: {
    secure: !dev,
    httpOnly: true,
  },
};

async function getSessionUser(req: IncomingMessage) {
  try {
    const fakeRes = { setHeader: () => {}, getHeader: () => undefined } as unknown as ServerResponse;
    const session = await getIronSession<{ user?: { id: number; isAdmin: boolean } }>(
      req as Parameters<typeof getIronSession>[0],
      fakeRes,
      sessionOptions,
    );
    return session.user ?? null;
  } catch {
    return null;
  }
}

async function proxyConsole(
  clientWs: WebSocket,
  daemonWsUrl: string,
  nodeKey: string,
) {
  const daemonWs = new WebSocket(daemonWsUrl);

  daemonWs.on('open', () => {
    daemonWs.send(JSON.stringify({ event: 'auth', args: [nodeKey] }));
  });

  daemonWs.on('message', (data) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(data);
    }
  });

  daemonWs.on('error', () => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send('\x1b[31;1mThis instance is unavailable!\x1b[0m');
    }
  });

  daemonWs.on('close', () => {
    if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
  });

  clientWs.on('message', (data) => {
    if (daemonWs.readyState === WebSocket.OPEN) daemonWs.send(data);
  });

  clientWs.on('close', () => {
    if (daemonWs.readyState !== WebSocket.CLOSED) daemonWs.close();
  });
}

async function proxyStatus(
  clientWs: WebSocket,
  daemonWsUrl: string,
  nodeKey: string,
) {
  const daemonWs = new WebSocket(daemonWsUrl);

  daemonWs.on('open', () => {
    daemonWs.send(JSON.stringify({ event: 'auth', args: [nodeKey] }));
  });

  daemonWs.on('message', (data) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(data);
    }
  });

  daemonWs.on('error', () => {
    if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
  });

  daemonWs.on('close', () => {
    if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
  });

  clientWs.on('close', () => {
    if (daemonWs.readyState !== WebSocket.CLOSED) daemonWs.close();
  });
}

async function startServer() {
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  await app.prepare();

  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', async (req, socket, head) => {
    const url = req.url || '';

    const consoleMatch = url.match(/^\/api\/server\/([^/]+)\/console/);
    const statusMatch = url.match(/^\/api\/server\/([^/]+)\/status/);
    const eventsMatch = url.match(/^\/api\/server\/([^/]+)\/events/);

    if (!consoleMatch && !statusMatch && !eventsMatch) {
      socket.destroy();
      return;
    }

    const serverUUID = (consoleMatch || statusMatch || eventsMatch)![1];

    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, async (clientWs) => {
      try {
        const { default: prisma } = await import('./src/lib/prisma');
        const server = await prisma.server.findUnique({
          where: { UUID: serverUUID },
          include: { node: true },
        });

        if (!server) {
          clientWs.send(JSON.stringify({ error: 'Server not found' }));
          clientWs.close();
          return;
        }

        if (server.ownerId !== sessionUser.id && !sessionUser.isAdmin) {
          clientWs.send(JSON.stringify({ error: 'Forbidden' }));
          clientWs.close();
          return;
        }

        const httpScheme = await daemonScheme();
        const wsScheme = httpScheme === 'https' ? 'wss' : 'ws';

        if (consoleMatch) {
          const daemonWsUrl = `${wsScheme}://${server.node.address}:${server.node.port}/container/${serverUUID}`;
          await proxyConsole(clientWs, daemonWsUrl, server.node.key);
        } else if (eventsMatch) {
          const daemonWsUrl = `${wsScheme}://${server.node.address}:${server.node.port}/containerevents/${serverUUID}`;
          await proxyStatus(clientWs, daemonWsUrl, server.node.key);
        } else {
          const daemonWsUrl = `${wsScheme}://${server.node.address}:${server.node.port}/containerstatus/${serverUUID}`;
          await proxyStatus(clientWs, daemonWsUrl, server.node.key);
        }
      } catch (err) {
        console.error('[WS] Error setting up proxy:', err);
        clientWs.close();
      }
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}

startServer().catch(console.error);
