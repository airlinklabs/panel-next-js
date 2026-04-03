import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';
import axios from 'axios';
import { daemonUrl } from '@/lib/daemon';

type ServerRow = Awaited<ReturnType<typeof prisma.server.findMany<{
  include: { node: true; owner: true; image: true }
}>>>[number];

async function fetchServerStats(server: ServerRow, base: string, auth: { username: string; password: string }) {
  try {
    const statusRes = await axios.get(`${base}/container/status`, {
      params: { id: server.UUID },
      auth,
      timeout: 2000,
    });

    const running = statusRes.data?.running === true;
    let ramUsage = '0', cpuUsage = '0', ramUsed = '0MB';

    if (running) {
      try {
        const statsRes = await axios.get(`${base}/container/stats`, {
          params: { id: server.UUID },
          auth,
          timeout: 2000,
        });
        ramUsage = statsRes.data?.memory?.percentage ?? '0';
        cpuUsage = statsRes.data?.cpu?.percentage ?? '0';
        const bytes = statsRes.data?.memory?.usage ?? 0;
        const mb = bytes / (1024 * 1024);
        ramUsed = mb >= 1024 ? `${(mb / 1024).toFixed(1)}GB` : `${mb.toFixed(0)}MB`;
      } catch {}
    }

    return { ...server, status: running ? 'running' : 'stopped', ramUsage, cpuUsage, ramUsed };
  } catch {
    return { ...server, status: 'unknown', ramUsage: '0', cpuUsage: '0', ramUsed: '0MB' };
  }
}

export async function GET(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSessionFromRequest(req, res);
  if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const servers = await prisma.server.findMany({
    where: session.user.isAdmin ? {} : { ownerId: session.user.id },
    include: { node: true, owner: true, image: true },
  });

  // Group servers by node to avoid redundant node-online checks
  const byNode = new Map<number, ServerRow[]>();
  for (const server of servers) {
    const list = byNode.get(server.nodeId) ?? [];
    list.push(server);
    byNode.set(server.nodeId, list);
  }

  // Check each node online once, then fetch all server stats on that node in parallel
  const results = await Promise.all(
    Array.from(byNode.entries()).map(async ([, nodeServers]) => {
      const { node } = nodeServers[0];
      const base = daemonUrl(node.address, node.port);
      const auth = { username: 'Airlink', password: node.key };

      let nodeOnline = false;
      try {
        await axios.get(base, { auth, timeout: 2000 });
        nodeOnline = true;
      } catch {}

      if (!nodeOnline) {
        return nodeServers.map(s => ({
          ...s,
          status: 'unknown',
          ramUsage: '0',
          cpuUsage: '0',
          ramUsed: '0MB',
        }));
      }

      // All servers on this node fetched in parallel
      return Promise.all(nodeServers.map(s => fetchServerStats(s, base, auth)));
    })
  );

  return NextResponse.json({ servers: results.flat() });
}
