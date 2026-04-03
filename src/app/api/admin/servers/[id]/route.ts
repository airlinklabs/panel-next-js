import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';
import axios from 'axios';
import { daemonUrl } from '@/lib/daemon';
import { toInt, badInt } from '@/lib/rateLimit';

async function requireAdmin(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSessionFromRequest(req, res);
  if (!session.user?.isAdmin) return null;
  return session.user;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const serverId = toInt(id);
  if (isNaN(serverId)) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });

  const server = await prisma.server.findUnique({
    where: { id: serverId },
    include: { node: true, image: true, owner: true },
  });
  if (!server) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  return NextResponse.json({ server });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { name, description, nodeId, imageId, Memory, Cpu, Storage, ownerId, Suspended, StartCommand, allowStartupEdit } = body;

  if (!name || !nodeId || !imageId || !Memory || !Cpu || !Storage || !ownerId) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const serverId = toInt(id);
  const nNodeId = toInt(nodeId);
  const nImageId = toInt(imageId);
  const nOwnerId = toInt(ownerId);
  const nMemory = toInt(Memory);
  const nCpu = toInt(Cpu);
  const nStorage = toInt(Storage);

  if (badInt(serverId, nNodeId, nImageId, nOwnerId, nMemory, nCpu, nStorage)) {
    return NextResponse.json({ error: 'Invalid numeric fields.' }, { status: 400 });
  }

  const server = await prisma.server.findUnique({ where: { id: serverId }, include: { node: true, image: true } });
  if (!server) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const newSuspended = Suspended === true || Suspended === 'true';
  const suspensionChanged = server.Suspended !== newSuspended;

  await prisma.server.update({
    where: { id: serverId },
    data: {
      name,
      description: description || '',
      nodeId: nNodeId,
      imageId: nImageId,
      ownerId: nOwnerId,
      Memory: nMemory,
      Cpu: nCpu,
      Storage: nStorage,
      StartCommand: StartCommand || '',
      Suspended: newSuspended,
      allowStartupEdit: allowStartupEdit === true || allowStartupEdit === 'true',
    },
  });

  if (suspensionChanged && newSuspended) {
    try {
      await axios.post(
        `${daemonUrl(server.node.address, server.node.port)}/container/stop`,
        { id: server.UUID, stopCmd: server.image?.stop || 'stop' },
        { auth: { username: 'Airlink', password: server.node.key }, timeout: 8000 },
      );
    } catch {}
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const serverId = toInt(id);
  if (isNaN(serverId)) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });

  const server = await prisma.server.findUnique({ where: { id: serverId }, include: { node: true, image: true } });
  if (!server) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  try {
    await axios.delete(
      `${daemonUrl(server.node.address, server.node.port)}/container`,
      { data: { id: server.UUID }, auth: { username: 'Airlink', password: server.node.key }, timeout: 10000 },
    );
  } catch {}

  await prisma.server.delete({ where: { id: serverId } });
  return NextResponse.json({ success: true });
}
