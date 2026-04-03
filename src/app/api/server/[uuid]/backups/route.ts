import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';
import axios from 'axios';
import { daemonUrl } from '@/lib/daemon';

async function getServerAndUser(req: NextRequest, uuid: string) {
  const res = NextResponse.next();
  const session = await getSessionFromRequest(req, res);
  if (!session.user) return { error: 'Unauthorized', status: 401 };

  const server = await prisma.server.findUnique({
    where: { UUID: uuid },
    include: { node: true, backups: true },
  });
  if (!server) return { error: 'Not found.', status: 404 };
  if (server.ownerId !== session.user.id && !session.user.isAdmin) return { error: 'Forbidden.', status: 403 };

  return { server };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const result = await getServerAndUser(req, uuid);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const backups = await prisma.backup.findMany({
    where: { serverId: uuid },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ backups });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const result = await getServerAndUser(req, uuid);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const { server } = result;
  const body = await req.json().catch(() => ({}));
  const { action, backupId } = body;

  const base = daemonUrl(server.node.address, server.node.port);
  const auth = { username: 'Airlink', password: server.node.key };

  if (action === 'create') {
    const backupName = `backup-${Date.now()}`;
    try {
      const { data } = await axios.post(
        `${base}/container/backup`,
        { id: uuid, name: backupName },
        { auth, timeout: 30000 }
      );

      await prisma.backup.create({
        data: {
          UUID: data.backup.uuid,
          name: backupName,
          serverId: uuid,
          filePath: data.backup.filePath,
          size: data.backup.size ? BigInt(data.backup.size) : null,
        },
      });

      return NextResponse.json({ success: true });
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error || err.message : 'Backup failed';
      return NextResponse.json({ error: msg }, { status: 502 });
    }
  }

  if (action === 'restore' && backupId) {
    const backup = await prisma.backup.findUnique({ where: { UUID: backupId } });
    if (!backup) return NextResponse.json({ error: 'Backup not found.' }, { status: 404 });

    try {
      await axios.post(
        `${base}/container/restore`,
        { id: uuid, backupPath: backup.filePath },
        { auth, timeout: 300000 }
      );
      return NextResponse.json({ success: true });
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error || err.message : 'Restore failed';
      return NextResponse.json({ error: msg }, { status: 502 });
    }
  }

  if (action === 'delete' && backupId) {
    const backup = await prisma.backup.findUnique({ where: { UUID: backupId } });
    if (!backup) return NextResponse.json({ error: 'Backup not found.' }, { status: 404 });

    try {
      await axios.delete(`${base}/container/backup`, {
        data: { backupPath: backup.filePath },
        auth,
        timeout: 10000,
      });
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error || err.message : 'Failed to delete backup file from node';
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    await prisma.backup.delete({ where: { UUID: backupId } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
